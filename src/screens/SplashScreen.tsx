/**
 * MR-A — P01 Splash / Bootstrap.
 *
 * Shows app identity + env badge while the session restores. Triggers
 * session.restore() once; RootNavigator routes onward when status changes
 * away from 'booting'. No fake session — restore is honest.
 */

import React, {useEffect} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSession} from '../auth/SessionContext';
import {EnvBadge} from '../shared/components/EnvBadge';
import {colors, fontSize, spacing} from '../shared/theme';

export function SplashScreen(): React.JSX.Element {
  const {restore} = useSession();

  useEffect(() => {
    void restore();
  }, [restore]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>mWellness Mobile Runner</Text>
        <Text style={styles.subtitle}>Internal DEV/QA Runner</Text>
        <View style={styles.badge}>
          <EnvBadge />
        </View>
        <ActivityIndicator
          style={styles.spinner}
          color={colors.primary}
          size="large"
        />
        <Text style={styles.loading}>Restoring session…</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg},
  title: {color: colors.text, fontSize: fontSize.xl, fontWeight: '800', textAlign: 'center'},
  subtitle: {color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs},
  badge: {marginTop: spacing.md},
  spinner: {marginTop: spacing.xl},
  loading: {color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.md},
});
