/**
 * MR-B — P09 Dry-run Result.
 *
 * Rebuilds the plan deterministically from the same read-only inputs and runs
 * the PURE dry-run simulation (no writes, no network beyond the read load, no
 * native calls). Renders:
 *  - "Dry-run completed · No health data was written."
 *  - simulated-writable / would-skip counts (with the would-skip breakdown),
 *  - per-skip warnings (nothing silently dropped),
 *  - the honest next-step note: permission check is deferred to MR-C/MR-D.
 *
 * There is NO real-write button. Honest screen states throughout.
 */

import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useMemo} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSession} from '../auth/SessionContext';
import {loadVersionPlanInputs} from '../runner/planInputs';
import {buildExecutionPlan} from '../runner/interpreter';
import {simulateDryRun, DryRunResult} from '../runner/dryRun';
import {ErrorState, LoadingState} from '../shared/components/ScreenStates';
import {StatusBadge} from '../shared/components/StatusBadge';
import {useApiResource} from '../shared/hooks/useApiResource';
import {colors, fontSize, radius, spacing, StatusKind} from '../shared/theme';
import type {RootStackParamList} from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'DryRunResult'>;
type Rt = RouteProp<RootStackParamList, 'DryRunResult'>;

export function DryRunResultScreen(): React.JSX.Element {
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

  // Deterministic, pure: build plan -> simulate. No writes, no native calls.
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
          <Row label="Total operations (metric level)" value={String(result.total)} />
        </View>

        <Text style={styles.metricLevelNote}>
          Counts are metric-level (payload detail deferred to MR-C). A
          "simulated writable" means the operation WOULD be attempted — never
          that data was written.
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
                <Text style={styles.warnScenario}>scenario: {w.scenarioSlug}</Text>
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
  warnScenario: {color: colors.textMuted, fontSize: fontSize.xs},
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
