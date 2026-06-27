/**
 * MR-A — E02 Backend Unavailable.
 *
 * Shown when the MWDS backend is unreachable / unconfigured. Surfaces the
 * endpoint, the error code (e.g. BACKEND_UNAVAILABLE), and the request ID for
 * correlation. Offers Retry, Change environment (info only in MR-A — no env
 * management UX), and Diagnostics (deferred). NEVER offers a fabricated session.
 */

import {useNavigation, useRoute, type RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSession} from '../../auth/SessionContext';
import {EnvBadge} from '../../shared/components/EnvBadge';
import {PrimaryButton} from '../../shared/components/PrimaryButton';
import {colors, fontSize, radius, spacing} from '../../shared/theme';
import type {RootStackParamList} from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'BackendUnavailable'>;
type Rt = RouteProp<RootStackParamList, 'BackendUnavailable'>;

export function BackendUnavailableScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const {env, restore, clearError} = useSession();
  const [retrying, setRetrying] = useState(false);

  const endpoint = route.params?.endpoint ?? env.apiBaseUrl ?? '(not configured)';
  const code = route.params?.code ?? 'BACKEND_UNAVAILABLE';
  const message =
    route.params?.message ?? 'The MWDS backend could not be reached.';
  const requestId = route.params?.requestId;

  const onRetry = useCallback(async () => {
    clearError();
    setRetrying(true);
    try {
      await restore();
    } finally {
      setRetrying(false);
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  }, [clearError, restore, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Backend unavailable</Text>
        <Text style={styles.body}>
          The Mobile Runner could not reach the MWDS backend. No session was
          created. Test case configuration is managed in the MWDS Web App; the
          runner only executes validated scenarios.
        </Text>

        <View style={styles.detailCard}>
          <DetailRow label="Endpoint" value={endpoint} />
          <DetailRow label="Error code" value={code} />
          <DetailRow label="Message" value={message} />
          <DetailRow label="Request ID" value={requestId ?? '(none captured)'} />
        </View>

        <View style={styles.badge}>
          <EnvBadge />
        </View>

        <View style={styles.actions}>
          <PrimaryButton title="Retry" onPress={onRetry} loading={retrying} />
          <View style={styles.gap} />
          <PrimaryButton
            title="Change environment"
            variant="secondary"
            disabled
            subtitle="Environment is configured at build time in MR-A"
          />
          <View style={styles.gap} />
          <PrimaryButton
            title="Diagnostics"
            variant="secondary"
            disabled
            subtitle="Coming in a later phase"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({label, value}: {label: string; value: string}): React.JSX.Element {
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
  content: {padding: spacing.lg},
  title: {color: colors.text, fontSize: fontSize.xl, fontWeight: '800'},
  body: {color: colors.textMuted, fontSize: fontSize.md, marginTop: spacing.md, lineHeight: 22},
  detailCard: {
    backgroundColor: colors.surface,
    borderColor: colors.danger,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  detailRow: {gap: 2},
  detailLabel: {color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700'},
  detailValue: {color: colors.text, fontSize: fontSize.sm},
  badge: {marginTop: spacing.lg},
  actions: {marginTop: spacing.xl},
  gap: {height: spacing.md},
});
