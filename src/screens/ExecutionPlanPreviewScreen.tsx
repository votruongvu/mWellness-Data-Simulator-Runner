/**
 * P08 Execution Plan Preview.
 *
 * MR-C (preferred): when route param `planSource === 'operation'`, loads the
 * backend F8 runnable payload and builds a DETERMINISTIC OPERATION-LEVEL plan
 * (concrete value/unit/time/idempotency per operation), previewing:
 *  - mode badge: Dry-run (never a real write),
 *  - target: iOS · Apple Health / Android · Health Connect,
 *  - operation-level totals (writable / unsupported / invalid / skipped),
 *  - per-scenario, per-operation rows in backend order with concrete detail,
 *  - an explicit BLOCKED state when EVERY operation is invalid (missing
 *    required concrete fields) — surfaced, never fabricated.
 *
 * MR-B (fallback): otherwise loads version-plan inputs and builds the
 * metric-level plan via the interpreter (read-only fallback/diagnostic).
 *
 * No real-write path exists on this screen. Honest screen states throughout.
 */

import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useMemo} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSession} from '../auth/SessionContext';
import {loadVersionPlanInputs} from '../runner/planInputs';
import {buildExecutionPlan} from '../runner/interpreter';
import {buildExecutionPlanFromPayload} from '../runner/operationPlan';
import {getRunnablePayload} from '../testCases/runnablePayloadApi';
import {
  ConcreteExecutionPlan,
  ExecutionPlan,
  OperationStatus,
  PlanConcreteScenarioGroup,
  PlanRelativeTime,
  PlanScenarioGroup,
} from '../runner/executionPlan';
import {EmptyState, ErrorState, LoadingState} from '../shared/components/ScreenStates';
import {PrimaryButton} from '../shared/components/PrimaryButton';
import {SafetyBanner} from '../shared/components/SafetyBanner';
import {StatusBadge} from '../shared/components/StatusBadge';
import {useApiResource} from '../shared/hooks/useApiResource';
import {colors, fontSize, radius, spacing, StatusKind} from '../shared/theme';
import type {RootStackParamList} from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ExecutionPlanPreview'>;
type Rt = RouteProp<RootStackParamList, 'ExecutionPlanPreview'>;

export function ExecutionPlanPreviewScreen(): React.JSX.Element {
  const route = useRoute<Rt>();
  if (route.params.planSource === 'operation') {
    return <OperationPlanPreview />;
  }
  return <MetricPlanPreview />;
}

/* ----------------------------- MR-C operation-level ----------------------- */

function OperationPlanPreview(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const {testCaseId, versionId} = route.params;
  const {env, expireSession} = useSession();

  const resource = useApiResource(
    () => getRunnablePayload(testCaseId, versionId),
    [testCaseId, versionId],
  );

  useEffect(() => {
    routeError(resource.error, {expireSession, navigation, env});
  }, [resource.error, expireSession, navigation, env]);

  // Deterministic, pure plan build from the loaded F8 payload.
  const plan = useMemo<ConcreteExecutionPlan | undefined>(() => {
    if (resource.status !== 'ready' || !resource.data) {
      return undefined;
    }
    return buildExecutionPlanFromPayload(resource.data);
  }, [resource.status, resource.data]);

  const onRunDryRun = useCallback(() => {
    navigation.navigate('DryRunResult', {
      testCaseId,
      versionId,
      planSource: 'operation',
    });
  }, [navigation, testCaseId, versionId]);

  if (resource.status === 'loading') {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <LoadingState label="Loading runnable payload…" />
      </SafeAreaView>
    );
  }
  if (resource.status === 'error' && resource.error) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ErrorState error={resource.error} onRetry={resource.reload} />
      </SafeAreaView>
    );
  }
  if (!plan) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <LoadingState label="Building execution plan…" />
      </SafeAreaView>
    );
  }

  const opCount = plan.totals.total;
  // Empty payload: no operations at all.
  if (opCount === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <EmptyState
          title="No runnable operations"
          body="The backend returned a runnable payload with no operations for this version. Nothing was fabricated."
        />
      </SafeAreaView>
    );
  }

  // Blocked/invalid: every operation is missing a required concrete field.
  const fullyBlocked = plan.totals.invalid === opCount;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Execution plan</Text>
          <StatusBadge kind="dryRun" label="Dry-run" />
        </View>

        <SafetyBanner mode="dryRun" />

        {fullyBlocked ? (
          <View style={styles.blockedCard} accessibilityRole="alert">
            <Text style={styles.blockedTitle}>Plan blocked</Text>
            <Text style={styles.blockedText}>
              Every operation in the backend runnable payload is missing a
              required concrete field (value, unit, time, idempotency key, or
              metric reference). These are surfaced below as invalid — nothing
              was dropped and no value was fabricated. A dry-run would write
              nothing.
            </Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Row label="Target" value={plan.targetLabel} />
          <Row label="Version" value={`v${plan.versionNumber}`} />
          <Row label="Payload status" value={plan.payloadStatus} />
          <Row label="Scenarios" value={`${plan.groups.length} (ordered)`} />
        </View>

        {/* Operation-level totals. */}
        <View style={styles.totalsRow}>
          <Total label="Writable" value={plan.totals.writable} kind="ok" />
          <Total
            label="Unsupported"
            value={plan.totals.unsupported}
            kind="warn"
          />
          <Total label="Invalid" value={plan.totals.invalid} kind="danger" />
          <Total label="Skipped" value={plan.totals.skipped} kind="neutral" />
        </View>

        <Text style={styles.metricLevelNote}>
          Operation-level plan ({opCount} concrete operations). Values, units,
          timestamps and idempotency keys are the backend-authored contract —
          never fabricated on device.
        </Text>

        {/* Per-scenario, per-operation rows. */}
        <Text style={styles.sectionTitle}>Per-operation plan</Text>
        {plan.groups.map(group => (
          <ConcreteScenarioCard key={group.scenarioId} group={group} />
        ))}

        {/* Boundary note. */}
        <View style={styles.boundaryNote}>
          <Text style={styles.boundaryText}>{plan.boundaryNote}</Text>
        </View>

        <View style={styles.cta}>
          <PrimaryButton title="Run dry-run" onPress={onRunDryRun} />
          <Text style={styles.ctaNote}>
            Dry-run only · no health data is written.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ConcreteScenarioCard({
  group,
}: {
  group: PlanConcreteScenarioGroup;
}): React.JSX.Element {
  return (
    <View style={styles.scenarioCard}>
      <View style={styles.scenarioHeader}>
        <Text style={styles.scenarioOrder}>{group.scenarioOrder}</Text>
        <Text style={styles.scenarioName} numberOfLines={2}>
          {group.scenarioName}
        </Text>
        <StatusBadge kind="neutral" label={`${group.operations.length} ops`} />
      </View>
      {group.operations.map(op => (
        <View key={op.operationId} style={styles.opRowCol}>
          <View style={styles.opTopRow}>
            <View style={styles.flex}>
              <Text style={styles.opMetric}>
                {op.metricSlug ?? op.metricId ?? '(no metric ref)'}
                {' · '}
                {op.operationKind}
              </Text>
              <Text style={styles.opReason}>{op.reasonCode}</Text>
            </View>
            <StatusBadge kind={statusKind(op.status)} label={op.status} />
          </View>
          <Text style={styles.opDetailLine} selectable>
            {formatValue(op.value, op.unit)}
            {formatTime(op.startTimeIso, op.endTimeIso, op.time)}
          </Text>
          {op.idempotencyKey ? (
            <Text style={styles.opIdem} selectable>
              idempotency: {op.idempotencyKey}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

/** Format a concrete value+unit without fabricating absent fields. */
function formatValue(value: number | string | undefined, unit?: string): string {
  if (value === undefined) {
    return '(no value)';
  }
  return unit ? `${value} ${unit}` : `${value}`;
}

/**
 * Format the operation's time. Prefers the resolved absolute ISO window (only
 * present when a base instant was injected); otherwise shows the raw relative
 * offset-minutes. Never fabricates an absolute time when none was resolved.
 */
function formatTime(
  startTimeIso?: string,
  endTimeIso?: string,
  time?: PlanRelativeTime,
): string {
  if (startTimeIso) {
    return ` · ${startTimeIso}${endTimeIso ? ` → ${endTimeIso}` : ''}`;
  }
  if (time) {
    return ` · ${time.model} ${time.startOffsetMinutes}→${time.endOffsetMinutes} min`;
  }
  return '';
}

/* ------------------------------ MR-B fallback ----------------------------- */

function MetricPlanPreview(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const {testCaseId, versionId} = route.params;
  const {env, expireSession} = useSession();

  const resource = useApiResource(
    () => loadVersionPlanInputs(testCaseId, versionId),
    [testCaseId, versionId],
  );

  useEffect(() => {
    routeError(resource.error, {expireSession, navigation, env});
  }, [resource.error, expireSession, navigation, env]);

  const plan = useMemo<ExecutionPlan | undefined>(() => {
    if (resource.status !== 'ready' || !resource.data) {
      return undefined;
    }
    const {version, scenarios, metrics} = resource.data;
    return buildExecutionPlan(testCaseId, version, scenarios, metrics);
  }, [resource.status, resource.data, testCaseId]);

  const onRunDryRun = useCallback(() => {
    navigation.navigate('DryRunResult', {testCaseId, versionId});
  }, [navigation, testCaseId, versionId]);

  if (resource.status === 'loading') {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <LoadingState label="Building execution plan…" />
      </SafeAreaView>
    );
  }
  if (resource.status === 'error' && resource.error) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ErrorState error={resource.error} onRetry={resource.reload} />
      </SafeAreaView>
    );
  }
  if (!plan) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <LoadingState label="Building execution plan…" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Execution plan</Text>
          <StatusBadge kind="dryRun" label="Dry-run" />
        </View>

        <SafetyBanner mode="dryRun" />

        <View style={styles.card}>
          <Row label="Target" value={plan.targetLabel} />
          <Row label="Version" value={`v${plan.versionNumber}`} />
          <Row label="Scenarios" value={`${plan.groups.length} (ordered)`} />
        </View>

        {/* Metric-level totals. */}
        <View style={styles.totalsRow}>
          <Total label="Writable" value={plan.totals.writable} kind="ok" />
          <Total
            label="Unsupported"
            value={plan.totals.unsupported}
            kind="warn"
          />
          <Total label="Invalid" value={plan.totals.invalid} kind="danger" />
          <Total label="Skipped" value={plan.totals.skipped} kind="neutral" />
        </View>

        <Text style={styles.metricLevelNote}>
          Counts are metric-level estimates ({plan.totals.total} operations).
          Per-scenario per-operation payload detail is the operation-level
          (F8) path.
        </Text>

        {/* Per-scenario plan rows. */}
        <Text style={styles.sectionTitle}>Per-scenario plan</Text>
        {plan.groups.map(group => (
          <ScenarioPlanCard key={group.scenarioSlug} group={group} />
        ))}

        {/* Boundary note. */}
        <View style={styles.boundaryNote}>
          <Text style={styles.boundaryText}>{plan.boundaryNote}</Text>
        </View>

        <View style={styles.cta}>
          <PrimaryButton title="Run dry-run" onPress={onRunDryRun} />
          <Text style={styles.ctaNote}>
            Dry-run only · no health data is written.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ScenarioPlanCard({
  group,
}: {
  group: PlanScenarioGroup;
}): React.JSX.Element {
  return (
    <View style={styles.scenarioCard}>
      <View style={styles.scenarioHeader}>
        <Text style={styles.scenarioOrder}>{group.scenarioOrder}</Text>
        <Text style={styles.scenarioName} numberOfLines={2}>
          {group.scenarioName}
        </Text>
        <StatusBadge
          kind={group.validationStatus === 'valid' ? 'ok' : 'danger'}
          label={group.validationStatus}
        />
      </View>
      {group.operations.map(op => (
        <View key={op.metricSlug} style={styles.opRow}>
          <View style={styles.flex}>
            <Text style={styles.opMetric}>{op.metricName}</Text>
            <Text style={styles.opReason}>{op.reasonCode}</Text>
          </View>
          <StatusBadge kind={statusKind(op.status)} label={op.status} />
        </View>
      ))}
    </View>
  );
}

/* -------------------------------- shared ---------------------------------- */

/** Centralized error routing shared by both preview variants. */
function routeError(
  err: ReturnType<typeof useApiResource>['error'],
  ctx: {
    expireSession: () => void | Promise<void>;
    navigation: Nav;
    env: {apiBaseUrl?: string | null};
  },
): void {
  if (!err) {
    return;
  }
  if (err.code === 'AUTH_EXPIRED') {
    void ctx.expireSession();
  } else if (err.code === 'BACKEND_UNAVAILABLE') {
    ctx.navigation.navigate('BackendUnavailable', {
      endpoint: ctx.env.apiBaseUrl,
      code: err.code,
      message: err.message,
      requestId: err.requestId,
    });
  }
}

function Total({
  label,
  value,
  kind,
}: {
  label: string;
  value: number;
  kind: StatusKind;
}): React.JSX.Element {
  return (
    <View style={styles.totalCell}>
      <Text style={styles.totalValue}>{value}</Text>
      <StatusBadge kind={kind} label={label} />
    </View>
  );
}

function Row({label, value}: {label: string; value: string}): React.JSX.Element {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} selectable>
        {value}
      </Text>
    </View>
  );
}

/** Map an operation status to a status-badge kind. */
export function statusKind(status: OperationStatus): StatusKind {
  switch (status) {
    case 'writable':
      return 'ok';
    case 'unsupported':
      return 'warn';
    case 'invalid':
      return 'danger';
    case 'permission_missing':
      return 'warn';
    case 'skipped':
    default:
      return 'neutral';
  }
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.lg, gap: spacing.md},
  flex: {flex: 1},
  headerRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  title: {color: colors.text, fontSize: fontSize.lg, fontWeight: '800'},
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  blockedCard: {
    backgroundColor: colors.surface,
    borderColor: colors.danger,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  blockedTitle: {color: colors.danger, fontSize: fontSize.md, fontWeight: '800'},
  blockedText: {color: colors.text, fontSize: fontSize.xs, lineHeight: 18},
  detailRow: {flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md},
  detailLabel: {color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700'},
  detailValue: {color: colors.text, fontSize: fontSize.sm, flexShrink: 1, textAlign: 'right'},
  totalsRow: {flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap'},
  totalCell: {
    flex: 1,
    minWidth: 70,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  totalValue: {color: colors.text, fontSize: fontSize.lg, fontWeight: '800'},
  metricLevelNote: {color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18},
  sectionTitle: {color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginTop: spacing.sm},
  scenarioCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  scenarioHeader: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  scenarioOrder: {color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '800', minWidth: 20},
  scenarioName: {color: colors.text, fontSize: fontSize.sm, fontWeight: '700', flex: 1},
  opRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  opRowCol: {gap: 2, paddingVertical: spacing.xs, borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth},
  opTopRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  opMetric: {color: colors.text, fontSize: fontSize.sm},
  opReason: {color: colors.textMuted, fontSize: fontSize.xs},
  opDetailLine: {color: colors.text, fontSize: fontSize.xs},
  opIdem: {color: colors.textMuted, fontSize: fontSize.xs},
  boundaryNote: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.warn,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  boundaryText: {color: colors.text, fontSize: fontSize.xs, lineHeight: 18},
  cta: {marginTop: spacing.sm, gap: spacing.xs},
  ctaNote: {color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center'},
});
