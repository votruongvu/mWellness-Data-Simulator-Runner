/**
 * P09 Dry-run Result.
 *
 * MR-C (preferred): when route param `planSource === 'operation'`, loads the
 * backend F8 runnable payload, builds the operation-level plan, and runs the
 * PURE operation-level dry-run (no writes, no native, no network beyond the
 * read load). Renders per-operation CONCRETE detail (value/unit/time/
 * idempotency) and the would-skip breakdown.
 *
 * MR-B (fallback): otherwise rebuilds the metric-level plan and runs the
 * metric-level dry-run (read-only fallback/diagnostic).
 *
 * Both paths assert "No health data was written." There is NO real-write
 * button. Honest screen states throughout.
 */

import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useMemo} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSession} from '../auth/SessionContext';
import {loadVersionPlanInputs} from '../runner/planInputs';
import {buildExecutionPlan} from '../runner/interpreter';
import {buildExecutionPlanFromPayload} from '../runner/operationPlan';
import {getRunnablePayload} from '../testCases/runnablePayloadApi';
import {simulateDryRun, DryRunResult} from '../runner/dryRun';
import {
  simulateDryRunFromPayload,
  DryRunResultConcrete,
} from '../runner/operationDryRun';
import {ErrorState, LoadingState} from '../shared/components/ScreenStates';
import {StatusBadge} from '../shared/components/StatusBadge';
import {useApiResource} from '../shared/hooks/useApiResource';
import {colors, fontSize, radius, spacing, StatusKind} from '../shared/theme';
import {statusKind} from './ExecutionPlanPreviewScreen';
import type {RootStackParamList} from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'DryRunResult'>;
type Rt = RouteProp<RootStackParamList, 'DryRunResult'>;

export function DryRunResultScreen(): React.JSX.Element {
  const route = useRoute<Rt>();
  if (route.params.planSource === 'operation') {
    return <OperationDryRun />;
  }
  return <MetricDryRun />;
}

/* ----------------------------- MR-C operation-level ----------------------- */

function OperationDryRun(): React.JSX.Element {
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

  // Deterministic, pure: build plan -> simulate. No writes, no native calls.
  const result = useMemo<DryRunResultConcrete | undefined>(() => {
    if (resource.status !== 'ready' || !resource.data) {
      return undefined;
    }
    const plan = buildExecutionPlanFromPayload(resource.data);
    return simulateDryRunFromPayload(plan);
  }, [resource.status, resource.data]);

  if (resource.status === 'loading') {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <LoadingState label="Running dry-run…" />
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
  if (!result) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <LoadingState label="Running dry-run…" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Dry-run completed</Text>
          <StatusBadge kind="dryRun" label="Dry-run" />
        </View>

        {/* The safety statement — load-bearing. */}
        <View style={styles.safeBanner} accessibilityRole="alert">
          <Text style={styles.safeText}>No health data was written.</Text>
        </View>

        <View style={styles.card}>
          <Row label="Target" value={result.targetLabel} />
          <Row label="Version" value={`v${result.versionNumber}`} />
        </View>

        <View style={styles.totalsRow}>
          <Total label="Simulated writable" value={result.simulatedWritable} kind="ok" />
          <Total label="Would skip" value={result.wouldSkip} kind="warn" />
        </View>

        <View style={styles.card}>
          <Row label="Would skip · unsupported" value={String(result.wouldSkipUnsupported)} />
          <Row label="Would skip · invalid" value={String(result.wouldSkipInvalid)} />
          <Row label="Would skip · other" value={String(result.wouldSkipOther)} />
          <Row label="Total operations" value={String(result.total)} />
        </View>

        <Text style={styles.metricLevelNote}>
          Operation-level dry-run. A "simulated writable" means the concrete
          operation WOULD be attempted — never that data was written. Missing
          required fields are surfaced as invalid, not fabricated.
        </Text>

        <Text style={styles.sectionTitle}>
          Operations ({result.operations.length})
        </Text>
        {result.operations.map(op => (
          <View key={op.operationId} style={styles.opCard}>
            <View style={styles.opHeader}>
              <Text style={styles.opMetric}>
                {op.metricSlug ?? op.metricId ?? '(no metric ref)'}
                {' · '}
                {op.operationKind}
              </Text>
              <StatusBadge kind={statusKind(op.status)} label={op.status} />
            </View>
            <Text style={styles.opDetailLine} selectable>
              {formatValue(op.value, op.unit)}
              {op.startTime ? ` · ${op.startTime}` : ''}
              {op.endTime ? ` → ${op.endTime}` : ''}
            </Text>
            <Text style={styles.opReason}>{op.reasonCode}</Text>
            {op.idempotencyKey ? (
              <Text style={styles.opIdem} selectable>
                idempotency: {op.idempotencyKey}
              </Text>
            ) : null}
            <Text style={styles.opScenario}>scenario: {op.scenarioId}</Text>
          </View>
        ))}

        <View style={styles.nextNote}>
          <Text style={styles.nextText}>{result.nextStepNote}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** Format a concrete value+unit without fabricating absent fields. */
function formatValue(value: number | string | undefined, unit?: string): string {
  if (value === undefined) {
    return '(no value)';
  }
  return unit ? `${value} ${unit}` : `${value}`;
}

/* ------------------------------ MR-B fallback ----------------------------- */

function MetricDryRun(): React.JSX.Element {
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

  const result = useMemo<DryRunResult | undefined>(() => {
    if (resource.status !== 'ready' || !resource.data) {
      return undefined;
    }
    const {version, scenarios, metrics} = resource.data;
    const plan = buildExecutionPlan(testCaseId, version, scenarios, metrics);
    return simulateDryRun(plan);
  }, [resource.status, resource.data, testCaseId]);

  if (resource.status === 'loading') {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <LoadingState label="Running dry-run…" />
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
  if (!result) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <LoadingState label="Running dry-run…" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Dry-run completed</Text>
          <StatusBadge kind="dryRun" label="Dry-run" />
        </View>

        <View style={styles.safeBanner} accessibilityRole="alert">
          <Text style={styles.safeText}>No health data was written.</Text>
        </View>

        <View style={styles.card}>
          <Row label="Target" value={result.targetLabel} />
          <Row label="Version" value={`v${result.versionNumber}`} />
        </View>

        <View style={styles.totalsRow}>
          <Total label="Simulated writable" value={result.simulatedWritable} kind="ok" />
          <Total label="Would skip" value={result.wouldSkip} kind="warn" />
        </View>

        <View style={styles.card}>
          <Row label="Would skip · unsupported" value={String(result.wouldSkipUnsupported)} />
          <Row label="Would skip · invalid" value={String(result.wouldSkipInvalid)} />
          <Row label="Would skip · other" value={String(result.wouldSkipOther)} />
          <Row label="Total operations (metric level)" value={String(result.total)} />
        </View>

        <Text style={styles.metricLevelNote}>
          Counts are metric-level (the operation-level F8 path renders concrete
          detail). A "simulated writable" means the operation WOULD be
          attempted — never that data was written.
        </Text>

        {result.warnings.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>
              Would-skip warnings ({result.warnings.length})
            </Text>
            {result.warnings.map((w, i) => (
              <View key={`${w.scenarioSlug}:${w.metricSlug}:${i}`} style={styles.warnCard}>
                <View style={styles.warnHeader}>
                  <Text style={styles.warnMetric}>{w.metricSlug}</Text>
                  <StatusBadge kind="warn" label={w.reasonCode} />
                </View>
                <Text style={styles.warnDetail}>{w.detail}</Text>
                <Text style={styles.opScenario}>scenario: {w.scenarioSlug}</Text>
              </View>
            ))}
          </>
        ) : null}

        <View style={styles.nextNote}>
          <Text style={styles.nextText}>{result.nextStepNote}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------------------------------- shared ---------------------------------- */

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

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.lg, gap: spacing.md},
  headerRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  title: {color: colors.text, fontSize: fontSize.lg, fontWeight: '800'},
  safeBanner: {
    backgroundColor: 'rgba(46, 168, 160, 0.15)',
    borderColor: colors.dryRun,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  safeText: {color: colors.text, fontSize: fontSize.md, fontWeight: '700'},
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  detailRow: {flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md},
  detailLabel: {color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700', flexShrink: 1},
  detailValue: {color: colors.text, fontSize: fontSize.sm},
  totalsRow: {flexDirection: 'row', gap: spacing.sm},
  totalCell: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  totalValue: {color: colors.text, fontSize: fontSize.xl, fontWeight: '800'},
  metricLevelNote: {color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18},
  sectionTitle: {color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginTop: spacing.sm},
  opCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  opHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm},
  opMetric: {color: colors.text, fontSize: fontSize.sm, fontWeight: '700', flexShrink: 1},
  opDetailLine: {color: colors.text, fontSize: fontSize.xs},
  opReason: {color: colors.textMuted, fontSize: fontSize.xs},
  opIdem: {color: colors.textMuted, fontSize: fontSize.xs},
  opScenario: {color: colors.textMuted, fontSize: fontSize.xs},
  warnCard: {
    backgroundColor: colors.surface,
    borderColor: colors.warn,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  warnHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  warnMetric: {color: colors.text, fontSize: fontSize.sm, fontWeight: '700'},
  warnDetail: {color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18},
  nextNote: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  nextText: {color: colors.text, fontSize: fontSize.sm, lineHeight: 20},
});
