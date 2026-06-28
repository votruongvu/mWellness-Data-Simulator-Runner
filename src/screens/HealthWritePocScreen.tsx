/**
 * MR-C-003 — iOS Guarded HealthKit Write POC screen.
 *
 * Reached AFTER a dry-run. Walks the five-gate write chain to a single guarded
 * HealthKit write of the minimal metric set (stepCount), using ONLY backend F8
 * payload values. Safety, all enforced + visible:
 *   - The "Run guarded write" button is DISABLED until all five gates pass.
 *   - Permission goes through the explain-before-prompt guard (no silent prompt).
 *   - Real-write mode: danger banner + the approved confirm copy + a confirm checkbox.
 *   - No fake success: succeeded counts come from the native result; partial
 *     success is rendered distinctly from full success.
 * On a simulator / without the native module, capability is unavailable → the
 * write stays blocked (honest; nothing is written).
 */

import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSession} from '../auth/SessionContext';
import {buildExecutionPlanFromPayload} from '../runner/operationPlan';
import {getRunnablePayload} from '../testCases/runnablePayloadApi';
import type {ConcreteExecutionPlan, PlanConcreteOperation} from '../runner/executionPlan';
import {EmptyState, ErrorState, LoadingState} from '../shared/components/ScreenStates';
import {PrimaryButton} from '../shared/components/PrimaryButton';
import {StatusBadge} from '../shared/components/StatusBadge';
import {useApiResource} from '../shared/hooks/useApiResource';
import {colors, fontSize, radius, spacing, StatusKind} from '../shared/theme';
import {evaluateHealthKitCapability, type HealthKitCapability} from '../health/healthKitCapability';
import {summarizeHealthPermission, type HealthPermissionStatus} from '../health/healthPermission';
import {resolveHealthKitBridge, type HealthKitBridge} from '../health/healthKitBridge';
import {
  canRequestPermission,
  evaluateWriteGate,
  requestPermissionGuarded,
  type FiveGateState,
  type PermissionFlowState,
} from '../health/permissionFlow';
import {
  executeGuardedWrite,
  MRC_003_WRITABLE_CONCEPTS,
  type WriteSummary,
} from '../health/healthKitWriter';
import type {RootStackParamList} from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'HealthWritePoc'>;
type Rt = RouteProp<RootStackParamList, 'HealthWritePoc'>;

const CONFIRM_COPY = 'I understand this writes real test data to Apple Health on this device.';
const WARN_COPY =
  'This will write test data to your health platform. Use only on approved DEV/QA devices and accounts.';

export function HealthWritePocScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const {testCaseId, versionId, dryRunCompleted} = route.params;
  const {env, expireSession} = useSession();

  const payload = useApiResource(() => getRunnablePayload(testCaseId, versionId), [testCaseId, versionId]);

  const [bridge, setBridge] = useState<HealthKitBridge | null>(null);
  const [capability, setCapability] = useState<HealthKitCapability | null>(null);
  const [permission, setPermission] = useState<HealthPermissionStatus>('unknown');
  const [explanationAck, setExplanationAck] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<WriteSummary | null>(null);

  useEffect(() => {
    if (payload.error?.code === 'AUTH_EXPIRED') {
      void expireSession();
    } else if (payload.error?.code === 'BACKEND_UNAVAILABLE') {
      navigation.navigate('BackendUnavailable', {
        endpoint: env.apiBaseUrl,
        code: payload.error.code,
        message: payload.error.message,
        requestId: payload.error.requestId,
      });
    }
  }, [payload.error, expireSession, navigation, env]);

  // Resolve bridge + capability + current permission once. No prompt fired.
  useEffect(() => {
    let cancelled = false;
    const {bridge: resolved, present} = resolveHealthKitBridge();
    void (async () => {
      const nativeIsAvailable = await resolved.isHealthDataAvailable().catch(() => null);
      const status = await resolved.getShareStatus(MRC_003_WRITABLE_CONCEPTS).catch(() => []);
      if (cancelled) {
        return;
      }
      const os: 'ios' | 'android' | 'unknown' =
        Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'unknown';
      setBridge(resolved);
      setCapability(evaluateHealthKitCapability({os, bridgePresent: present, nativeIsAvailable}));
      setPermission(summarizeHealthPermission(status));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const plan = useMemo<ConcreteExecutionPlan | undefined>(() => {
    if (payload.status !== 'ready' || !payload.data) {
      return undefined;
    }
    return buildExecutionPlanFromPayload(payload.data);
  }, [payload.status, payload.data]);

  // The operations in the minimal writable set (for the count shown).
  const writableOps = useMemo<PlanConcreteOperation[]>(() => {
    if (!plan) {
      return [];
    }
    return plan.groups.flatMap(g => g.operations).filter(op => op.metricSlug === 'steps');
  }, [plan]);

  const gates: FiveGateState = {
    dryRunCompleted: dryRunCompleted === true,
    payloadSourceVerified: !!plan,
    capabilityChecked: capability?.available ?? false,
    permissionResolvedOrGranted: permission === 'granted',
    explicitConfirmation: confirmed,
  };
  const gate = evaluateWriteGate(gates);

  const flowState: PermissionFlowState = {
    step: 'capability_checked',
    capability:
      capability ??
      ({available: false, reason: 'unknown', summary: 'Checking…'} as HealthKitCapability),
    explanationAcknowledged: explanationAck,
    permission,
  };
  const permGuard = canRequestPermission(flowState);

  const onRequestPermission = useCallback(async () => {
    if (!bridge) {
      return;
    }
    setBusy(true);
    const result = await requestPermissionGuarded(flowState, bridge, MRC_003_WRITABLE_CONCEPTS);
    if (result.outcome === 'resolved' && result.perConcept.length > 0) {
      setPermission(summarizeHealthPermission(result.perConcept));
    } else {
      // Re-read status (covers an already-resolved state) — never fake granted.
      const status = await bridge.getShareStatus(MRC_003_WRITABLE_CONCEPTS).catch(() => []);
      setPermission(summarizeHealthPermission(status));
    }
    setBusy(false);
  }, [bridge, flowState]);

  const onRunWrite = useCallback(async () => {
    if (!bridge || !plan || !gate.allowed) {
      return;
    }
    setBusy(true);
    // Runner-chosen base instant (injected here; the core stays pure — ADR-MWR-008).
    const baseInstantMs = Date.now();
    const result = await executeGuardedWrite({
      operations: plan.groups.flatMap(g => g.operations),
      gates,
      bridge,
      baseInstantMs,
    });
    setSummary(result);
    setBusy(false);
  }, [bridge, plan, gate.allowed, gates]);

  if (payload.status === 'loading') {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <LoadingState label="Loading runnable payload…" />
      </SafeAreaView>
    );
  }
  if (payload.status === 'error' && payload.error) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ErrorState error={payload.error} onRetry={payload.reload} />
      </SafeAreaView>
    );
  }
  if (!plan) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <LoadingState label="Building plan…" />
      </SafeAreaView>
    );
  }
  if (writableOps.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <EmptyState
          title="No writable operations"
          body="This version has no operations in the MR-C-003 minimal write set (steps). Nothing to write; nothing fabricated."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Guarded write POC</Text>
          <StatusBadge kind="danger" label="Real-write" />
        </View>

        <View style={styles.warnBanner} accessibilityRole="alert">
          <Text style={styles.warnText}>{WARN_COPY}</Text>
        </View>

        <View style={styles.card}>
          <Row label="Target" value={plan.targetLabel} />
          <Row label="Minimal set" value={MRC_003_WRITABLE_CONCEPTS.join(', ')} />
          <Row label="Writable ops (steps)" value={String(writableOps.length)} />
        </View>

        {/* Capability + permission */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Capability</Text>
            <StatusBadge
              kind={capability?.available ? 'ok' : 'warn'}
              label={capability ? (capability.available ? 'available' : capability.reason) : 'checking…'}
            />
          </View>
          <Text style={styles.muted}>{capability?.summary ?? 'Checking HealthKit availability…'}</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Permission (write)</Text>
            <StatusBadge kind={permission === 'granted' ? 'ok' : 'warn'} label={permission} />
          </View>
          {!explanationAck ? (
            <>
              <Text style={styles.muted}>
                Before the iOS prompt: this requests permission to WRITE steps to Apple Health.
                Denied types are skipped. Nothing is written until you confirm below.
              </Text>
              <PrimaryButton title="I understand — continue" variant="secondary" onPress={() => setExplanationAck(true)} />
            </>
          ) : (
            <PrimaryButton
              title="Request HealthKit permission"
              variant="secondary"
              loading={busy}
              disabled={!permGuard.allowed || permission === 'granted'}
              subtitle={permGuard.allowed ? 'Explain-before-prompt satisfied' : `Blocked: ${permGuard.blockedBy.join(', ')}`}
              onPress={() => {
                void onRequestPermission();
              }}
            />
          )}
        </View>

        {/* Five-gate checklist */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Write gate chain</Text>
          <GateRow label="dry_run_completed" met={gates.dryRunCompleted} />
          <GateRow label="payload_source_verified" met={gates.payloadSourceVerified} />
          <GateRow label="capability_checked" met={gates.capabilityChecked} />
          <GateRow label="permission_resolved_or_granted" met={gates.permissionResolvedOrGranted} />
          <GateRow label="explicit_confirmation" met={gates.explicitConfirmation} />
        </View>

        {/* Confirmation */}
        <TouchableOpacity
          style={styles.confirmRow}
          onPress={() => setConfirmed(c => !c)}
          accessibilityRole="checkbox"
          accessibilityState={{checked: confirmed}}>
          <View style={[styles.checkbox, confirmed && styles.checkboxOn]}>
            {confirmed ? <Text style={styles.checkmark}>✓</Text> : null}
          </View>
          <Text style={styles.confirmText}>{CONFIRM_COPY}</Text>
        </TouchableOpacity>

        {/* The guarded write action */}
        <View style={styles.section}>
          <PrimaryButton
            title="Run guarded write POC"
            loading={busy}
            disabled={!gate.allowed}
            subtitle={
              gate.allowed
                ? 'All five gates satisfied'
                : `Blocked — unmet: ${gate.blockedBy.join(', ')}`
            }
            onPress={() => {
              void onRunWrite();
            }}
          />
        </View>

        {/* Result summary */}
        {summary ? <ResultSummary summary={summary} /> : null}

        <View style={styles.section}>
          <PrimaryButton title="Back" variant="secondary" onPress={() => navigation.goBack()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ResultSummary({summary}: {summary: WriteSummary}): React.JSX.Element {
  const terminalKind: StatusKind = summary.fullSuccess
    ? 'ok'
    : summary.partialSuccess
    ? 'warn'
    : summary.counts.succeeded > 0
    ? 'warn'
    : 'danger';
  const terminalLabel = summary.blocked
    ? 'Blocked'
    : summary.fullSuccess
    ? 'Success'
    : summary.partialSuccess
    ? 'Partial success'
    : 'No success';
  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.cardTitle}>Write result</Text>
        <StatusBadge kind={terminalKind} label={terminalLabel} />
      </View>
      {summary.blocked ? (
        <Text style={styles.muted}>Blocked — unmet gates: {summary.blockedBy.join(', ')}. Nothing was written.</Text>
      ) : (
        <>
          <Row label="Succeeded (native)" value={String(summary.counts.succeeded)} />
          <Row label="Failed" value={String(summary.counts.failed)} />
          <Row label="Skipped · permission" value={String(summary.counts.skipped_permission)} />
          <Row label="Skipped · unsupported" value={String(summary.counts.skipped_unsupported)} />
          <Row label="Skipped · invalid payload" value={String(summary.counts.skipped_invalid_payload)} />
          <Text style={styles.muted}>
            Success counts reflect the actual native HealthKit result only. Partial success is not success.
            Written samples are not reversible.
          </Text>
        </>
      )}
    </View>
  );
}

function GateRow({label, met}: {label: string; met: boolean}): React.JSX.Element {
  return (
    <View style={styles.gateRow}>
      <StatusBadge kind={met ? 'ok' : 'neutral'} label={met ? 'met' : 'unmet'} />
      <Text style={styles.gateLabel}>{label}</Text>
    </View>
  );
}

function Row({label, value}: {label: string; value: string}): React.JSX.Element {
  return (
    <View style={styles.rowBetween}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} selectable>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.lg, gap: spacing.md},
  headerRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  title: {color: colors.text, fontSize: fontSize.lg, fontWeight: '800'},
  warnBanner: {
    backgroundColor: 'rgba(224, 83, 61, 0.15)',
    borderColor: colors.realWrite,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  warnText: {color: colors.text, fontSize: fontSize.sm, fontWeight: '700'},
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: {color: colors.text, fontSize: fontSize.md, fontWeight: '700'},
  muted: {color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 20},
  rowBetween: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md},
  detailLabel: {color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700', flexShrink: 1},
  detailValue: {color: colors.text, fontSize: fontSize.sm},
  gateRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  gateLabel: {color: colors.text, fontSize: fontSize.sm},
  confirmRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs},
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderColor: colors.realWrite,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {backgroundColor: colors.realWrite},
  checkmark: {color: colors.text, fontSize: fontSize.sm, fontWeight: '800'},
  confirmText: {color: colors.text, fontSize: fontSize.sm, flex: 1},
  section: {marginTop: spacing.xs},
});
