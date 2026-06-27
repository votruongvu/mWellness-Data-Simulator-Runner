/**
 * MR-B — P08 Execution Plan Preview.
 *
 * Loads the version-plan inputs (read-only), builds a DETERMINISTIC execution
 * plan via the interpreter, and previews it:
 *  - mode badge: Dry-run (MR-B is never a real write),
 *  - target: iOS · Apple Health / Android · Health Connect,
 *  - metric-level totals (writable / unsupported / invalid / skipped),
 *  - per-scenario rows in backend order with per-metric status + reason code.
 *
 * Clearly labels that operation detail is metric-level (payload deferred to
 * MR-C). CTA: "Run dry-run" -> P09. No real-write path. Honest screen states.
 */

import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useMemo} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSession} from '../auth/SessionContext';
import {loadVersionPlanInputs} from '../runner/planInputs';
import {buildExecutionPlan} from '../runner/interpreter';
import {
  ExecutionPlan,
  OperationStatus,
  PlanScenarioGroup,
} from '../runner/executionPlan';
import {ErrorState, LoadingState} from '../shared/components/ScreenStates';
import {PrimaryButton} from '../shared/components/PrimaryButton';
import {SafetyBanner} from '../shared/components/SafetyBanner';
import {StatusBadge} from '../shared/components/StatusBadge';
import {useApiResource} from '../shared/hooks/useApiResource';
import {colors, fontSize, radius, spacing, StatusKind} from '../shared/theme';
import type {RootStackParamList} from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ExecutionPlanPreview'>;
type Rt = RouteProp<RootStackParamList, 'ExecutionPlanPreview'>;

export function ExecutionPlanPreviewScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const {testCaseId, versionId} = route.params;
  const {env, expireSession} = useSession();

  const resource = useApiResource(
    () => loadVersionPlanInputs(testCaseId, versionId),
    [testCaseId, versionId],
  );

  useEffect(() => {
    const err = resource.error;
    if (!err) {
      return;
    }
    if (err.code === 'AUTH_EXPIRED') {
      void expireSession();
    } else if (err.code === 'BACKEND_UNAVAILABLE') {
      navigation.navigate('BackendUnavailable', {
        endpoint: env.apiBaseUrl,
        code: err.code,
        message: err.message,
        requestId: err.requestId,
      });
    }
  }, [resource.error, expireSession, navigation, env.apiBaseUrl]);

  // Deterministic, pure plan build from the loaded inputs.
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
          <Row
            label="Scenarios"
            value={`${plan.groups.length} (ordered)`}
          />
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
          Per-scenario per-operation payload detail is deferred to MR-C.
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
  opMetric: {color: colors.text, fontSize: fontSize.sm},
  opReason: {color: colors.textMuted, fontSize: fontSize.xs},
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
