/**
 * MR-B — P06 Test Case Detail.
 *
 * Read-only: shows the selected test case + its version list (current marker,
 * destination, version number, scenario count). "Configuration is managed in
 * the MWDS Web App." Tapping a version opens P07 (Version / Ordered Scenarios).
 *
 * NO author/edit/version-create actions. Honest loading/empty/error/backend-
 * unavailable/session-expired/backend-gap states. Nothing fabricated.
 */

import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback, useEffect} from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSession} from '../auth/SessionContext';
import {getTestCase} from '../testCases/testCasesApi';
import {listVersions} from '../testCases/versionsApi';
import {Version} from '../testCases/types';
import {ErrorState, LoadingState} from '../shared/components/ScreenStates';
import {StatusBadge} from '../shared/components/StatusBadge';
import {useApiResource} from '../shared/hooks/useApiResource';
import {platformForDestination} from '../shared/platform';
import {colors, fontSize, radius, spacing} from '../shared/theme';
import {formatDate} from './TestCaseListScreen';
import type {RootStackParamList} from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'TestCaseDetail'>;
type Rt = RouteProp<RootStackParamList, 'TestCaseDetail'>;

export function TestCaseDetailScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const {testCaseId} = route.params;
  const {env, expireSession} = useSession();

  const detail = useApiResource(() => getTestCase(testCaseId), [testCaseId]);
  const versions = useApiResource(() => listVersions(testCaseId), [testCaseId]);

  // Route the two app-level error states honestly (first error wins).
  useEffect(() => {
    const err = detail.error ?? versions.error;
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
  }, [detail.error, versions.error, expireSession, navigation, env.apiBaseUrl]);

  const onOpenVersion = useCallback(
    (v: Version) => {
      navigation.navigate('VersionScenarios', {
        testCaseId,
        versionId: v.id,
      });
    },
    [navigation, testCaseId],
  );

  if (detail.status === 'loading') {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <LoadingState label="Loading test case…" />
      </SafeAreaView>
    );
  }
  if (detail.status === 'error' && detail.error) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ErrorState error={detail.error} onRetry={detail.reload} />
      </SafeAreaView>
    );
  }

  const tc = detail.data?.test_case;
  const versionList = sortVersions(versions.data?.versions ?? []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{tc?.name ?? route.params.name ?? 'Test case'}</Text>
          {tc ? (
            <StatusBadge
              kind={tc.status === 'active' ? 'ok' : 'neutral'}
              label={tc.status}
            />
          ) : null}
        </View>
        {tc?.description ? (
          <Text style={styles.body}>{tc.description}</Text>
        ) : null}
        {tc && tc.tags.length > 0 ? (
          <View style={styles.tagRow}>
            {tc.tags.map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.managedNote}>
          <Text style={styles.managedText}>
            Configuration is managed in the MWDS Web App. The runner is
            read-only: it loads validated versions and scenarios, then dry-runs
            them. It never authors, edits, or reorders.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Versions</Text>

        {versions.status === 'loading' ? (
          <LoadingState label="Loading versions…" />
        ) : versions.status === 'error' && versions.error ? (
          <ErrorState error={versions.error} onRetry={versions.reload} />
        ) : versionList.length === 0 ? (
          <Text style={styles.muted}>
            No versions were returned for this test case.
          </Text>
        ) : (
          versionList.map(v => (
            <VersionRow key={v.id} version={v} onPress={() => onOpenVersion(v)} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function VersionRow({
  version,
  onPress,
}: {
  version: Version;
  onPress: () => void;
}): React.JSX.Element {
  const target = platformForDestination(version.destination_slug);
  return (
    <TouchableOpacity
      style={styles.versionCard}
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open version ${version.version_number}`}>
      <View style={styles.versionHeader}>
        <Text style={styles.versionTitle}>
          v{version.version_number} · {version.display.destination.display_name}
        </Text>
        <View style={styles.badges}>
          {version.is_current ? (
            <StatusBadge kind="ok" label="current" />
          ) : (
            <StatusBadge kind="neutral" label={version.status} />
          )}
        </View>
      </View>
      <Text style={styles.versionMeta}>{target.label}</Text>
      <Text style={styles.versionMeta}>
        {version.scenario_count} scenario
        {version.scenario_count === 1 ? '' : 's'} ·{' '}
        {version.metric_slugs.length} metric
        {version.metric_slugs.length === 1 ? '' : 's'} · updated{' '}
        {formatDate(version.updated_at)}
      </Text>
      {version.change_reason ? (
        <Text style={styles.versionReason} numberOfLines={2}>
          {version.change_reason}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

/** Current first, then by version_number descending. Pure. */
export function sortVersions(versions: Version[]): Version[] {
  return [...versions].sort((a, b) => {
    if (a.is_current !== b.is_current) {
      return a.is_current ? -1 : 1;
    }
    return b.version_number - a.version_number;
  });
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.lg, gap: spacing.md},
  headerRow: {flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md},
  title: {color: colors.text, fontSize: fontSize.lg, fontWeight: '800', flex: 1},
  body: {color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 20},
  muted: {color: colors.textMuted, fontSize: fontSize.sm},
  tagRow: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs},
  tag: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  tagText: {color: colors.textMuted, fontSize: fontSize.xs},
  managedNote: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  managedText: {color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 20},
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  versionCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  versionHeader: {flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md},
  versionTitle: {color: colors.text, fontSize: fontSize.md, fontWeight: '700', flex: 1},
  badges: {flexDirection: 'row', gap: spacing.xs},
  versionMeta: {color: colors.textMuted, fontSize: fontSize.xs},
  versionReason: {color: colors.textMuted, fontSize: fontSize.xs, fontStyle: 'italic'},
});
