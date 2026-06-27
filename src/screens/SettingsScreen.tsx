/**
 * MR-A — S05 Settings (minimal).
 *
 * Shows user + env, the immutable safety statement, and Logout. There are NO
 * disable-safety / bypass-confirm / force-success toggles (gate #12). The
 * dry-run-default indicator is shown read-only.
 */

import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSession} from '../auth/SessionContext';
import {EnvBadge} from '../shared/components/EnvBadge';
import {PrimaryButton} from '../shared/components/PrimaryButton';
import {StatusBadge} from '../shared/components/StatusBadge';
import {colors, fontSize, radius, spacing} from '../shared/theme';

export function SettingsScreen(): React.JSX.Element {
  const {user, env, logout} = useSession();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>Account</Text>
          <Text style={styles.value}>
            {user?.name ?? user?.username ?? user?.userId ?? '—'}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Environment</Text>
          <EnvBadge label={env.envLabel} />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Safety mode</Text>
          <StatusBadge kind="dryRun" label="Dry-run default" />
        </View>

        <View style={styles.safetyBox}>
          <Text style={styles.safetyText}>
            Safety gates and confirmation cannot be disabled in this build.
          </Text>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: {color: colors.textMuted, fontSize: fontSize.sm},
  value: {color: colors.text, fontSize: fontSize.md, fontWeight: '600'},
  safetyBox: {
    backgroundColor: 'rgba(46, 168, 160, 0.12)',
    borderColor: colors.dryRun,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  safetyText: {color: colors.text, fontSize: fontSize.sm},
  section: {marginTop: spacing.lg},
});
