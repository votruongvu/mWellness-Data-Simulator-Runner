package com.mwellnessmobilerunner

import android.app.Activity
import android.content.Intent
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.metadata.Metadata
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.WritableMap
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.time.Instant

/**
 * MR-C-004 — Android Health Connect guarded writer POC (internal/dev).
 *
 * Native side of the shared TS `HealthKitBridge` seam (resolved on Android by
 * `resolveHealthBridge`). Safety mirrors the iOS `MwrHealthKit` module:
 *  - NO fake native success: a write is `succeeded` ONLY when `insertRecords`
 *    completes without throwing; an exception → `failed` with the message.
 *  - No write without permission: a concept whose WRITE permission is not granted
 *    → `skipped_permission` (re-checked here; the TS five-gate chain already gates it).
 *  - No unsupported write: a concept outside the minimal set (`stepCount`) →
 *    `skipped_unsupported`.
 *  - No fabricated values: value/time/idempotency come from the JS payload (the F8
 *    contract); an incomplete/invalid sample → `skipped_invalid_payload`.
 *  - Idempotency via `Metadata.clientRecordId` = backend `idempotency_key`.
 */
class MwrHealthConnectModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

  private val scope = CoroutineScope(Dispatchers.IO)
  private var pendingPromise: Promise? = null
  private var pendingTokens: List<String> = emptyList()

  init {
    reactContext.addActivityEventListener(this)
  }

  override fun getName(): String = "MwrHealthConnect"

  private fun available(): Boolean =
      HealthConnectClient.getSdkStatus(reactContext) == HealthConnectClient.SDK_AVAILABLE

  private fun client(): HealthConnectClient = HealthConnectClient.getOrCreate(reactContext)

  /** Concept token → Health Connect WRITE permission, or null if unsupported. */
  private fun writePermissionForConcept(concept: String?): String? =
      when (concept) {
        "stepCount" -> HealthPermission.getWritePermission(StepsRecord::class)
        else -> null
      }

  @ReactMethod
  fun isHealthDataAvailable(promise: Promise) {
    promise.resolve(available())
  }

  @ReactMethod
  fun getShareStatus(tokens: ReadableArray, promise: Promise) {
    if (!available()) {
      val out = Arguments.createArray()
      for (i in 0 until tokens.size()) {
        val m = Arguments.createMap()
        m.putString("token", tokens.getString(i))
        m.putString("raw", "unavailable")
        out.pushMap(m)
      }
      promise.resolve(out)
      return
    }
    scope.launch {
      try {
        val granted = client().permissionController.getGrantedPermissions()
        val out = Arguments.createArray()
        for (i in 0 until tokens.size()) {
          val t = tokens.getString(i) ?: continue
          val perm = writePermissionForConcept(t)
          val raw =
              when {
                perm == null -> "unavailable"
                granted.contains(perm) -> "granted"
                else -> "not_granted"
              }
          val m = Arguments.createMap()
          m.putString("token", t)
          m.putString("raw", raw)
          out.pushMap(m)
        }
        promise.resolve(out)
      } catch (e: Exception) {
        promise.reject("HC_STATUS_ERROR", e.message, e)
      }
    }
  }

  @ReactMethod
  fun requestShareAuthorization(tokens: ReadableArray, promise: Promise) {
    if (!available()) {
      resolveOutcome(promise, "unavailable", emptyList())
      return
    }
    val activity = currentActivity
    if (activity == null) {
      resolveOutcome(promise, "error", emptyList(), "no current activity")
      return
    }
    val tokenList = (0 until tokens.size()).mapNotNull { tokens.getString(it) }
    val perms = tokenList.mapNotNull { writePermissionForConcept(it) }.toSet()
    pendingPromise = promise
    pendingTokens = tokenList
    try {
      val contract = PermissionController.createRequestPermissionResultContract()
      val intent = contract.createIntent(activity, perms)
      activity.startActivityForResult(intent, REQUEST_CODE)
    } catch (e: Exception) {
      pendingPromise = null
      resolveOutcome(promise, "error", emptyList(), e.message)
    }
  }

  @ReactMethod
  fun writeQuantitySamples(samples: ReadableArray, promise: Promise) {
    if (!available()) {
      // Fail closed: report each as failed; NEVER success.
      val out = Arguments.createArray()
      for (i in 0 until samples.size()) {
        val s = samples.getMap(i)
        out.pushMap(result(s?.getString("operationId") ?: "", "failed", "Health Connect unavailable"))
      }
      promise.resolve(out)
      return
    }
    scope.launch {
      try {
        val granted = client().permissionController.getGrantedPermissions()
        val out = Arguments.createArray()
        for (i in 0 until samples.size()) {
          val s = samples.getMap(i)
          val opId = s?.getString("operationId") ?: ""
          val concept = s?.getString("concept")
          val perm = writePermissionForConcept(concept)
          if (perm == null) {
            out.pushMap(result(opId, "skipped_unsupported", "metric not supported by the native writer"))
            continue
          }
          if (!granted.contains(perm)) {
            out.pushMap(result(opId, "skipped_permission", "write permission not granted for this type"))
            continue
          }
          val value =
              if (s != null && s.hasKey("value") && s.getType("value") == ReadableType.Number) s.getDouble("value")
              else Double.NaN
          val startIso = s?.getString("startTimeIso")
          val endIso = s?.getString("endTimeIso")
          val idem = s?.getString("idempotencyKey")
          if (value.isNaN() || startIso == null || endIso == null) {
            out.pushMap(result(opId, "skipped_invalid_payload", "incomplete sample (value/time)"))
            continue
          }
          val count = value.toLong()
          if (count <= 0L) {
            out.pushMap(result(opId, "skipped_invalid_payload", "non-positive step count"))
            continue
          }
          try {
            val start = Instant.parse(startIso)
            val end = Instant.parse(endIso)
            val meta = Metadata(clientRecordId = idem, clientRecordVersion = 1L)
            val record =
                StepsRecord(
                    startTime = start,
                    startZoneOffset = null,
                    endTime = end,
                    endZoneOffset = null,
                    count = count,
                    metadata = meta,
                )
            client().insertRecords(listOf(record))
            // Success ONLY when insertRecords did not throw.
            out.pushMap(result(opId, "succeeded", null))
          } catch (e: Exception) {
            out.pushMap(result(opId, "failed", e.message ?: "Health Connect insert failed"))
          }
        }
        promise.resolve(out)
      } catch (e: Exception) {
        promise.reject("HC_WRITE_ERROR", e.message, e)
      }
    }
  }

  override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
    if (requestCode != REQUEST_CODE) return
    val promise = pendingPromise ?: return
    pendingPromise = null
    val tokenList = pendingTokens
    scope.launch {
      try {
        val granted = client().permissionController.getGrantedPermissions()
        val per =
            tokenList.map { t ->
              val perm = writePermissionForConcept(t)
              val raw =
                  when {
                    perm == null -> "unavailable"
                    granted.contains(perm) -> "granted"
                    else -> "denied"
                  }
              Pair(t, raw)
            }
        resolveOutcome(promise, "resolved", per)
      } catch (e: Exception) {
        resolveOutcome(promise, "error", emptyList(), e.message)
      }
    }
  }

  override fun onNewIntent(intent: Intent?) {}

  private fun result(opId: String, status: String, message: String?): WritableMap {
    val m = Arguments.createMap()
    m.putString("operationId", opId)
    m.putString("status", status)
    if (message != null) m.putString("message", message)
    return m
  }

  private fun resolveOutcome(
      promise: Promise,
      outcome: String,
      perConcept: List<Pair<String, String>>,
      message: String? = null,
  ) {
    val map = Arguments.createMap()
    map.putString("outcome", outcome)
    val arr = Arguments.createArray()
    for (p in perConcept) {
      val pm = Arguments.createMap()
      pm.putString("token", p.first)
      pm.putString("raw", p.second)
      arr.pushMap(pm)
    }
    map.putArray("perConcept", arr)
    if (message != null) map.putString("message", message)
    promise.resolve(map)
  }

  companion object {
    private const val REQUEST_CODE = 0x4843 // "HC"
  }
}
