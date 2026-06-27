/**
 * MR-B — P05 Test Case List.
 *
 * Read-only list of backend runnable test cases (GET /api/v1/test-cases).
 * Search + active/archived status filter. Renders the canonical screen states:
 * loading / empty / error / backend-unavailable / session-expired. Cards show
 * name, status, tags, updated_at. NO create/edit/author/archive actions exist.
 *
 * On AUTH_EXPIRED we flip the session to 'expired' (re-routes to E01). On
 * BACKEND_UNAVAILABLE we route to E02. On NOT_FOUND we surface a BACKEND_GAP
 * error state. Nothing is fabricated.
 */

import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSession} from '../auth/SessionContext';
import {listTestCases} from '../testCases/testCasesApi';
import {TestCase, TestCaseStatus} from '../testCases/types';
import {EmptyState, ErrorState, LoadingState} from '../shared/components/ScreenStates';
import {StatusBadge} from '../shared/components/StatusBadge';
import {useApiResource} from '../shared/hooks/useApiResource';
import {colors, fontSize, radius, spacing} from '../shared/theme';
import type {RootStackParamList} from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'TestCaseList'>;

export function TestCaseListScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const {env, expireSession} = useSession();

  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<TestCaseStatus>('active');

  const resource = useApiResource(
    () => listTestCases({status: statusFilter, page_size: 50}),
    [statusFilter],
  );

  // Honest routing for the two app-level error states.
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

  // Client-side text filter on the already-fetched page (search-as-you-type).
  const items = useMemo(() => {
    const all = resource.data?.data ?? [];
    const needle = q.trim().toLowerCase();
    if (!needle) {
      return all;
    }
    return all.filter(
      tc =>
        tc.name.toLowerCase().includes(needle) ||
        tc.tags.some(t => t.toLowerCase().includes(needle)),
    );
  }, [resource.data, q]);

  const onOpen = useCallback(
    (tc: TestCase) => {
      navigation.navigate('TestCaseDetail', {testCaseId: tc.id, name: tc.name});
    },
    [navigation],
  );

  const renderHeader = (
    <View style={styles.controls}>
      <TextInput
        style={styles.search}
        value={q}
        onChangeText={setQ}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Search by name or tag"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Search test cases"
      />
      <View style={styles.filterRow}>
        <FilterChip
          label="Active"
          selected={statusFilter === 'active'}
          onPress={() => setStatusFilter('active')}
        />
        <FilterChip
          label="Archived"
          selected={statusFilter === 'archived'}
          onPress={() => setStatusFilter('archived')}
        />
      </View>
      <Text style={styles.note}>
        Read-only. Test cases are authored and validated in the MWDS Web App.
      </Text>
    </View>
  );

  let body: React.JSX.Element;
  if (resource.status === 'loading') {
    body = <LoadingState label="Loading test cases…" />;
  } else if (resource.status === 'error' && resource.error) {
    // AUTH_EXPIRED / BACKEND_UNAVAILABLE are handled by navigation above; show
    // the inline state for the rest (BACKEND_GAP / forbidden / validation).
    body = <ErrorState error={resource.error} onRetry={resource.reload} />;
  } else if (items.length === 0) {
    body = (
      <EmptyState
        title="No test cases"
        body={
          q.trim()
            ? 'No test cases match your search.'
            : `No ${statusFilter} test cases were returned by the backend.`
        }
      />
    );
  } else {
    body = (
      <FlatList
        data={items}
        keyExtractor={tc => tc.id}
        contentContainerStyle={styles.listContent}
        renderItem={({item}) => (
          <TestCaseCard testCase={item} onPress={() => onOpen(item)} />
        )}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {renderHeader}
      <View style={styles.bodyFill}>{body}</View>
    </SafeAreaView>
  );
}

function TestCaseCard({
  testCase,
  onPress,
}: {
  testCase: TestCase;
  onPress: () => void;
}): React.JSX.Element {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${testCase.name}`}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {testCase.name}
        </Text>
        <StatusBadge
          kind={testCase.status === 'active' ? 'ok' : 'neutral'}
          label={testCase.status}
        />
      </View>
      {testCase.description ? (
        <Text style={styles.cardBody} numberOfLines={2}>
          {testCase.description}
        </Text>
      ) : null}
      {testCase.tags.length > 0 ? (
        <View style={styles.tagRow}>
          {testCase.tags.slice(0, 6).map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <Text style={styles.meta}>Updated {formatDate(testCase.updated_at)}</Text>
    </TouchableOpacity>
  );
}

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}): React.JSX.Element {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{selected}}
      style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/** Render an ISO date as a short readable label; falls back to the raw value. */
export function formatDate(iso: string): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) {
    return iso;
  }
  return new Date(ms).toISOString().slice(0, 10);
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  bodyFill: {flex: 1},
  controls: {padding: spacing.lg, gap: spacing.sm},
  search: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: fontSize.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterRow: {flexDirection: 'row', gap: spacing.sm},
  chip: {
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  chipSelected: {backgroundColor: colors.primaryMuted, borderColor: colors.primary},
  chipText: {color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '700'},
  chipTextSelected: {color: colors.text},
  note: {color: colors.textMuted, fontSize: fontSize.xs, marginTop: spacing.xs},
  listContent: {padding: spacing.lg, paddingTop: 0, gap: spacing.md},
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: {flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md},
  cardTitle: {color: colors.text, fontSize: fontSize.md, fontWeight: '700', flex: 1},
  cardBody: {color: colors.textMuted, fontSize: fontSize.sm, lineHeight: 20},
  tagRow: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs},
  tag: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  tagText: {color: colors.textMuted, fontSize: fontSize.xs},
  meta: {color: colors.textMuted, fontSize: fontSize.xs},
});
