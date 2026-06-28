/**
 * MR-A — P03 Runner Dashboard.
 *
 * Landing after login. Shows: user identity, env badge, the dry-run-default
 * SafetyBanner, a Platform-capability PLACEHOLDER card (no real capability
 * check — that is MR-D), a disabled "Browse test cases" action ("Coming in
 * MR-B"), and Diagnostics/Logout actions (logout works).
 *
 * Scope guard: no real capability/permission/write logic here. No fabricated
 * "last run" data — that surface is deferred.
 */

import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSession} from '../auth/SessionContext';
import {EnvBadge} from '../shared/components/EnvBadge';
import {PrimaryButton} from '../shared/components/PrimaryButton';
import {SafetyBanner} from '../shared/components/SafetyBanner';
import {StatusBadge} from '../shared/components/StatusBadge';
import {colors, fontSize, radius, spacing} from '../shared/theme';
import type {RootStackParamList} from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

export function DashboardScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const {user, logout} = useSession();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Identity + env */}
        <View style={styles.headerRow}>
          <View style={styles.flex}>
            <Text style={styles.hello}>
              {user?.name ?? user?.username ?? 'Signed in'}
            </Text>
            {user?.username ? (
              <Text style={styles.userId}>
                {user.username}
                {user.role ? ` · ${user.role}` : ''}
              </Text>
            ) : null}
          </View>
          <EnvBadge />
        </View>

        <SafetyBanner mode="dryRun" />

        {/* Platform capability placeholder (real check is MR-D). */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Platform capability</Text>
            <StatusBadge kind="neutral" label="Not checked" />
          </View>
          <Text style={styles.cardBody}>
            iOS · Apple Health and Android · Health Connect readiness is checked
            before any run. Capability detection arrives in MR-D.
          </Text>
        </View>

        {/* Browse test cases — enabled in MR-B (read-only from the backend). */}
        <View style={styles.section}>
          <PrimaryButton
            title="Browse test cases"
            subtitle="Read-only · loaded from the MWDS backend"
            onPress={() => navigation.navigate('TestCaseList')}
          />
        </View>

        {/* MR-C (MWR-MRC-002) — iOS HealthKit capability/permission PREVIEW.
            No write path; the OS prompt is gated. */}
        <View style={styles.section}>
          <PrimaryButton
            title="iOS HealthKit permission (preview)"
            variant="secondary"
            subtitle="Capability + permission status · no write · prompt gated"
            onPress={() => navigation.navigate('HealthPermission')}
          />
        </View>

        {/* Diagnostics (placeholder) + Logout (works). */}
        <View style={styles.section}>
          <PrimaryButton
            title="Diagnostics"
            variant="secondary"
            disabled
            subtitle="Coming in a later phase"
          />
        </View>
        <View style={styles.section}>
          <PrimaryButton
            title="Settings"
            variant="secondary"
            onPress={() => navigation.navigate('Settings')}
          />
        </View>
        <View style={styles.section}>
          <PrimaryButton
            title="Log out"
            variant="secondary"
            onPress={() => {
              void logout();
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.lg, gap: spacing.md},
  flex: {flex: 1},
  headerRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  hello: {color: colors.text, fontSize: fontSize.lg, fontWeight: '800'},
  userId: {color: colors.textMuted, fontSize: fontSize.xs, marginTop: spacing.xs},
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
  section: {marginTop: spacing.xs},
});
