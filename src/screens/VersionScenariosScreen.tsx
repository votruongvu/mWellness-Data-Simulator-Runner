/**
 * MR-B — P07 Version / Ordered Scenarios (read-only).
 *
 * Shows an immutable version: destination [device · destination], device
 * profiles, catalog revision, metrics grouped via catalog metadata
 * (writable vs not-selectable, with the backend `reason`), and the ordered
 * scenario summaries (order index, name, slug, validation). CTA: "Build
 * execution plan" -> P08.
 *
 * Honest boundary: a metric/metadata preview is shown, but NO full per-scenario
 * payload preview is available in MR-B read scope — we show the boundary note,
 * never fabricate JSON. NO reorder/edit/upload/seed. Honest screen states.
 */

import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useMemo} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSession} from '../auth/SessionContext';
import {Metric} from '../catalog/types';
import {loadVersionPlanInputs, orderScenarios} from '../runner/planInputs';
import {ScenarioSummary, Version} from '../testCases/types';
import {ErrorState, LoadingState} from '../shared/components/ScreenStates';
import {PrimaryButton} from '../shared/components/PrimaryButton';
import {StatusBadge} from '../shared/components/StatusBadge';
import {useApiResource} from '../shared/hooks/useApiResource';
import {platformForDestination} from '../shared/platform';
import {colors, fontSize, radius, spacing} from '../shared/theme';
import type {RootStackParamList} from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'VersionScenarios'>;
type Rt = RouteProp<RootStackParamList, 'VersionScenarios'>;

export function VersionScenariosScreen(): React.JSX.Element {
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

  // MR-C — "Build execution plan" loads the backend F8 runnable payload for an
  // operation-level (concrete) plan + dry-run. The preview/dry-run screens own
  // the F8 fetch (consistent with the other read-only screens) and fall back to
  // the MR-B metric-level path on their own when no F8 plan is available.
  const onBuildPlan = useCallback(() => {
    navigation.navigate('ExecutionPlanPreview', {
      testCaseId,
      versionId,
      planSource: 'operation',
    });
  }, [navigation, testCaseId, versionId]);

  if (resource.status === 'loading') {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <LoadingState label="Loading version…" />
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

  const {version, scenarios, metrics} = resource.data!;
  return (
    <VersionScenariosView
      version={version}
      scenarios={scenarios}
      metrics={metrics}
      onBuildPlan={onBuildPlan}
    />
  );
}

function VersionScenariosView({
  version,
  scenarios,
  metrics,
  onBuildPlan,
}: {
  version: Version;
  scenarios: ScenarioSummary[];
  metrics: Metric[];
  onBuildPlan: () => void;
}): React.JSX.Element {
  const target = platformForDestination(version.destination_slug);
  const ordered = useMemo(() => orderScenarios(scenarios), [scenarios]);

  // Group the version's metrics into selectable vs not, using catalog metadata.
  const metricBySlug = useMemo(() => {
    const map = new Map<string, Metric>();
    for (const m of metrics) {
      map.set(m.slug, m);
    }
    return map;
  }, [metrics]);

  const grouped = useMemo(() => {
    const writable: {slug: string; name: string; meta?: Metric}[] = [];
    const notSelectable: {slug: string; name: string; meta?: Metric}[] = [];
    for (const sn of version.display.metrics) {
      const meta = metricBySlug.get(sn.slug);
      const entry = {slug: sn.slug, name: sn.display_name, meta};
      // Authoritative: a metric is writable on this platform when the catalog
      // marks it selectable for the version's destination+profiles.
      if (meta?.selectable) {
        writable.push(entry);
      } else {
        notSelectable.push(entry);
      }
    }
    return {writable, notSelectable};
  }, [version.display.metrics, metricBySlug]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Version {version.version_number}</Text>
          {version.is_current ? (
            <StatusBadge kind="ok" label="current" />
          ) : (
            <StatusBadge kind="neutral" label={version.status} />
          )}
        </View>

        <View style={styles.card}>
          <Row label="Destination" value={`${target.label} (${target.api})`} />
          <Row
            label="Profiles"
            value={
              version.display.profiles.map(p => p.display_name).join(', ') || '—'
            }
          />
          <Row label="Catalog revision" value={version.catalog_revision_hash} />
        </View>

        {/* Metrics grouped via catalog metadata. */}
        <Text style={styles.sectionTitle}>
          Metrics ({version.metric_slugs.length})
        </Text>
        <MetricGroup
          title="Writable on this platform"
          kind="ok"
          items={grouped.writable}
        />
        <MetricGroup
          title="Not selectable"
          kind="warn"
          items={grouped.notSelectable}
          showReason
        />

        {/* Ordered scenarios (summaries only). */}
        <Text style={styles.sectionTitle}>
          Ordered scenarios ({ordered.length})
        </Text>
        {ordered.length === 0 ? (
          <Text style={styles.muted}>No scenarios returned for this version.</Text>
        ) : (
          ordered.map((s, idx) => (
            <ScenarioRow key={s.scenario_slug} scenario={s} position={idx + 1} />
          ))
        )}

        {/* Honest payload boundary. */}
        <View style={styles.boundaryNote}>
          <Text style={styles.boundaryText}>
            Per-scenario payloads (operation values, timestamps, segments) are
            not available in the MR-B read scope — only summaries above. A full
            payload preview is deferred to MR-C; nothing is fabricated here.
          </Text>
        </View>

        <View style={styles.cta}>
          <PrimaryButton title="Build execution plan" onPress={onBuildPlan} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricGroup({
  title,
  kind,
  items,
  showReason = false,
}: {
  title: string;
  kind: 'ok' | 'warn';
  items: {slug: string; name: string; meta?: Metric}[];
  showReason?: boolean;
}): React.JSX.Element | null {
  if (items.length === 0) {
    return null;
  }
  return (
    <View style={styles.card}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupTitle}>{title}</Text>
        <StatusBadge kind={kind} label={String(items.length)} />
      </View>
      {items.map(item => (
        <View key={item.slug} style={styles.metricRow}>
          <View style={styles.flex}>
            <Text style={styles.metricName}>{item.name}</Text>
            <Text style={styles.metricSlug}>
              {item.slug}
              {item.meta?.unit ? ` · ${item.meta.unit}` : ''}
              {item.meta?.category ? ` · ${item.meta.category}` : ''}
            </Text>
            {showReason && item.meta?.reason ? (
              <Text style={styles.metricReason}>reason: {item.meta.reason}</Text>
            ) : null}
            {showReason && !item.meta ? (
              <Text style={styles.metricReason}>
                reason: metric not present in catalog for this context
              </Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

function ScenarioRow({
  scenario,
  position,
}: {
  scenario: ScenarioSummary;
  position: number;
}): React.JSX.Element {
  const valid = scenario.validation_status === 'valid';
  return (
    <View style={styles.scenarioCard}>
      <View style={styles.scenarioHeader}>
        <Text style={styles.scenarioOrder}>
          {scenario.order_index ?? position}
        </Text>
        <Text style={styles.scenarioName} numberOfLines={2}>
          {scenario.scenario_name}
        </Text>
        <StatusBadge
          kind={valid ? 'ok' : 'danger'}
          label={scenario.validation_status}
        />
      </View>
      <Text style={styles.scenarioSlug}>{scenario.scenario_slug}</Text>
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
  flex: {flex: 1},
  headerRow: {flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md},
  title: {color: colors.text, fontSize: fontSize.lg, fontWeight: '800'},
  muted: {color: colors.textMuted, fontSize: fontSize.sm},
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  detailRow: {gap: 2},
  detailLabel: {color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700'},
  detailValue: {color: colors.text, fontSize: fontSize.sm},
  sectionTitle: {color: colors.text, fontSize: fontSize.md, fontWeight: '700', marginTop: spacing.sm},
  groupHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  groupTitle: {color: colors.text, fontSize: fontSize.sm, fontWeight: '700'},
  metricRow: {flexDirection: 'row', gap: spacing.sm},
  metricName: {color: colors.text, fontSize: fontSize.sm, fontWeight: '600'},
  metricSlug: {color: colors.textMuted, fontSize: fontSize.xs},
  metricReason: {color: colors.warn, fontSize: fontSize.xs, marginTop: 2},
  scenarioCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  scenarioHeader: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  scenarioOrder: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '800',
    minWidth: 20,
  },
  scenarioName: {color: colors.text, fontSize: fontSize.sm, fontWeight: '600', flex: 1},
  scenarioSlug: {color: colors.textMuted, fontSize: fontSize.xs},
  boundaryNote: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.warn,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  boundaryText: {color: colors.text, fontSize: fontSize.xs, lineHeight: 18},
  cta: {marginTop: spacing.sm},
});
