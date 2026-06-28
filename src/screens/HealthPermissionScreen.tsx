/**
 * MR-C (MWR-MRC-002) — iOS HealthKit Capability + Permission flow (PREVIEW).
 *
 * Renders the guarded capability check, the pre-prompt EXPLANATION (explain
 * before any OS prompt), the permission STATUS model, and the read-only write
 * gate chain. It is intentionally inert:
 *   - No real-write button exists.
 *   - The "Request permission" action goes through `requestPermissionGuarded`,
 *     which (with the native bridge absent / gated) returns `gate_pending` and
 *     fires NO OS prompt — never a fake success.
 *   - The explanation COPY below is DRAFT, pending human approval of gate #3
 *     (permission-prompt timing + copy). It is labelled as such on screen.
 *
 * Gate boundary: a live prompt and a real write require human-approval gates
 * #1/#3/#9 + the native `MwrHealthKit` module + a real device + device QA.
 */

import {useNavigation, type NavigationProp} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Platform, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {PrimaryButton} from '../shared/components/PrimaryButton';
import {SafetyBanner} from '../shared/components/SafetyBanner';
import {StatusBadge} from '../shared/components/StatusBadge';
import {colors, fontSize, radius, spacing, StatusKind} from '../shared/theme';
import {
  evaluateHealthKitCapability,
  type HealthKitCapability,
} from '../health/healthKitCapability';
import {
  describeHealthPermission,
  summarizeHealthPermission,
  type HealthPermissionStatus,
} from '../health/healthPermission';
import {
  resolveHealthKitBridge,
  type AuthorizationRequestResult,
  type HealthKitBridge,
} from '../health/healthKitBridge';
import {
  canRequestPermission,
  evaluateWriteGate,
  requestPermissionGuarded,
  type PermissionFlowState,
} from '../health/permissionFlow';
import {MRC_APPROVED_CONCEPT_TOKENS} from '../health/healthKitTypes';
import type {RootStackParamList} from '../navigation/types';

/** DRAFT pre-prompt explanation copy — pending human approval (gate #3). */
const DRAFT_EXPLANATION = [
  'Before any iOS permission prompt appears, mWellness Runner explains why it ' +
    'needs Apple Health (HealthKit) write access:',
  '• To replay a backend-validated test scenario by writing sample health values ' +
    '(e.g. steps, heart rate, distance) into Apple Health on this device.',
  '• You choose per type. Denied types are skipped — never forced.',
  '• Nothing is written now. This screen only checks availability and permission ' +
    'status; the system prompt and any write are enabled in a later, separately ' +
    'approved step.',
];

function permissionKind(status: HealthPermissionStatus): StatusKind {
  switch (status) {
    case 'granted':
      return 'ok';
    case 'partial':
    case 'unavailable':
      return 'warn';
    case 'denied':
      return 'danger';
    case 'not_requested':
    case 'unknown':
    default:
      return 'neutral';
  }
}

export function HealthPermissionScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [bridge, setBridge] = useState<HealthKitBridge | null>(null);
  const [capability, setCapability] = useState<HealthKitCapability | null>(null);
  const [permission, setPermission] = useState<HealthPermissionStatus>('unknown');
  const [explanationAcknowledged, setExplanationAcknowledged] = useState(false);
  const [requestResult, setRequestResult] = useState<AuthorizationRequestResult | null>(null);
  const [busy, setBusy] = useState(false);

  // Resolve the bridge + evaluate capability/permission once. No prompt is fired.
  useEffect(() => {
    let cancelled = false;
    const {bridge: resolved, present} = resolveHealthKitBridge();
    void (async () => {
      const nativeIsAvailable = await resolved.isHealthDataAvailable().catch(() => null);
      const status = await resolved
        .getShareStatus(MRC_APPROVED_CONCEPT_TOKENS)
        .catch(() => []);
      if (cancelled) {
        return;
      }
      const os: 'ios' | 'android' | 'unknown' =
        Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'unknown';
      setBridge(resolved);
      setCapability(
        evaluateHealthKitCapability({os, bridgePresent: present, nativeIsAvailable}),
      );
      setPermission(summarizeHealthPermission(status));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const flowState = useMemo<PermissionFlowState>(
    () => ({
      step: 'capability_checked',
      capability:
        capability ??
        ({available: false, reason: 'unknown', summary: 'Checking…'} as HealthKitCapability),
      explanationAcknowledged,
      permission,
    }),
    [capability, explanationAcknowledged, permission],
  );

  const guard = canRequestPermission(flowState);

  const onRequest = useCallback(async () => {
    if (!bridge) {
      return;
    }
    setBusy(true);
    const result = await requestPermissionGuarded(
      flowState,
      bridge,
      MRC_APPROVED_CONCEPT_TOKENS,
    );
    setRequestResult(result);
    // Only a real `resolved` outcome updates the granted status — never a fake success.
    if (result.outcome === 'resolved' && result.perConcept.length > 0) {
      setPermission(summarizeHealthPermission(result.perConcept));
    }
    setBusy(false);
  }, [bridge, flowState]);

  // Read-only write-gate chain reflecting what this screen establishes. The
  // run-time gates (dry-run, payload, confirmation) are set during a run (MR-C-003).
  const gate = evaluateWriteGate({
    dryRunCompleted: false,
    payloadSourceVerified: false,
    capabilityChecked: capability?.available ?? false,
    permissionResolvedOrGranted: permission === 'granted',
    explicitConfirmation: false,
  });

  const capKind: StatusKind = capability?.available ? 'ok' : 'warn';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Apple Health permission</Text>
          <StatusBadge kind="dryRun" label="Preview" />
        </View>

        <SafetyBanner
          mode="dryRun"
          message="No health data is written. The OS prompt and any write are gated (pending human approval #1/#3/#9)."
        />

        <View style={styles.draftNotice} accessibilityRole="alert">
          <Text style={styles.draftTitle}>Preview — not an approved flow</Text>
          <Text style={styles.draftText}>
            The explanation copy and prompt timing below are DRAFT and require human
            approval (gate #3). The native HealthKit bridge is not enabled (gates
            #1/#3/#9), so no system prompt fires and nothing is written.
          </Text>
        </View>

        {/* Capability */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Capability</Text>
            <StatusBadge
              kind={capability ? capKind : 'neutral'}
              label={capability ? (capability.available ? 'Available' : capability.reason) : 'Checking…'}
            />
          </View>
          <Text style={styles.cardBody}>
            {capability?.summary ?? 'Checking HealthKit availability…'}
          </Text>
        </View>

        {/* Pre-prompt explanation (DRAFT) */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Why HealthKit access</Text>
            <StatusBadge kind="warn" label="DRAFT copy · gate #3" />
          </View>
          {DRAFT_EXPLANATION.map((line, i) => (
            <Text key={i} style={styles.cardBody}>
              {line}
            </Text>
          ))}
          {!explanationAcknowledged ? (
            <PrimaryButton
              title="I understand — continue"
              variant="secondary"
              onPress={() => setExplanationAcknowledged(true)}
            />
          ) : (
            <Text style={styles.ackNote}>Explanation acknowledged.</Text>
          )}
        </View>

        {/* Permission status */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Permission status</Text>
            <StatusBadge kind={permissionKind(permission)} label={permission} />
          </View>
          <Text style={styles.cardBody}>{describeHealthPermission(permission)}</Text>

          <PrimaryButton
            title="Request HealthKit permission"
            onPress={() => {
              void onRequest();
            }}
            loading={busy}
            disabled={!guard.allowed}
            subtitle={
              guard.allowed
                ? 'Explain-before-prompt satisfied · request is gated (no OS prompt yet)'
                : `Blocked: ${guard.blockedBy.join(', ')}`
            }
          />

          {requestResult ? (
            <View
              style={[
                styles.outcomeCard,
                requestResult.outcome === 'resolved' ? styles.outcomeOk : styles.outcomeGated,
              ]}>
              <Text style={styles.outcomeTitle}>Request outcome: {requestResult.outcome}</Text>
              {requestResult.reasonCode ? (
                <Text style={styles.outcomeReason}>{requestResult.reasonCode}</Text>
              ) : null}
              {requestResult.message ? (
                <Text style={styles.cardBody}>{requestResult.message}</Text>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* Read-only write gate chain */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Write gate chain (read-only)</Text>
          <Text style={styles.cardBody}>
            A real write requires all five software gates AND human-approval gate #1.
            This build has no write path — write is BLOCKED.
          </Text>
          <GateRow label="dry_run_completed" met={false} note="set during a run (MR-C-003)" />
          <GateRow label="payload_source_verified" met={false} note="set during a run (MR-C-003)" />
          <GateRow label="capability_checked" met={capability?.available ?? false} />
          <GateRow label="permission_resolved_or_granted" met={permission === 'granted'} />
          <GateRow label="explicit_confirmation" met={false} note="set during a run (MR-C-003)" />
          <View style={styles.writeBlocked}>
            <StatusBadge kind="danger" label="Real write: BLOCKED" />
            <Text style={styles.cardBody}>
              {gate.blockedBy.length} gate(s) unmet; plus native writer + gates
              #1/#3/#9 + device QA are absent.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <PrimaryButton
            title="Back"
            variant="secondary"
            onPress={() => navigation.goBack()}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function GateRow({
  label,
  met,
  note,
}: {
  label: string;
  met: boolean;
  note?: string;
}): React.JSX.Element {
  return (
    <View style={styles.gateRow}>
      <StatusBadge kind={met ? 'ok' : 'neutral'} label={met ? 'met' : 'unmet'} />
      <View style={styles.flex}>
        <Text style={styles.gateLabel}>{label}</Text>
        {note ? <Text style={styles.gateNote}>{note}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.lg, gap: spacing.md},
  flex: {flex: 1},
  headerRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  title: {color: colors.text, fontSize: fontSize.lg, fontWeight: '800'},
  draftNotice: {
    backgroundColor: 'rgba(224, 163, 61, 0.12)',
    borderColor: colors.warn,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  draftTitle: {color: colors.warn, fontSize: fontSize.sm, fontWeight: '800'},
  draftText: {color: colors.text, fontSize: fontSize.xs, lineHeight: 18},
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeaderRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  cardTitle: {color: colors.text, fontSize: fontSize.md, fontWeight: '700'},
  cardBody: {color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 20},
  ackNote: {color: colors.ok, fontSize: fontSize.xs, fontWeight: '700'},
  outcomeCard: {
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
  },
  outcomeGated: {backgroundColor: colors.surfaceAlt, borderColor: colors.warn},
  outcomeOk: {backgroundColor: colors.surfaceAlt, borderColor: colors.ok},
  outcomeTitle: {color: colors.text, fontSize: fontSize.sm, fontWeight: '800'},
  outcomeReason: {color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700'},
  gateRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  gateLabel: {color: colors.text, fontSize: fontSize.sm},
  gateNote: {color: colors.textMuted, fontSize: fontSize.xs},
  writeBlocked: {gap: spacing.xs, marginTop: spacing.xs},
  section: {marginTop: spacing.xs},
});
