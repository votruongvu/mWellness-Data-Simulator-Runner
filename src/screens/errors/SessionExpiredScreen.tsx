/**
 * MR-A — E01 Session Expired.
 *
 * Reached when the backend rejects the stored token (AUTH_EXPIRED). Explains
 * the expiry, shows the env badge, and offers Login again / Retry session.
 * No fake re-auth: "Login again" returns to the unauthenticated flow.
 */

import React, {useCallback, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSession} from '../../auth/SessionContext';
import {EnvBadge} from '../../shared/components/EnvBadge';
import {PrimaryButton} from '../../shared/components/PrimaryButton';
import {colors, fontSize, spacing} from '../../shared/theme';

export function SessionExpiredScreen(): React.JSX.Element {
  const {logout, restore} = useSession();
  const [retrying, setRetrying] = useState(false);

  // "Login again": clear the (already-invalid) session -> unauthenticated.
  const onLoginAgain = useCallback(() => {
    void logout();
  }, [logout]);

  // "Retry session": re-run restore (e.g. if expiry was transient).
  const onRetry = useCallback(async () => {
    setRetrying(true);
    try {
      await restore();
    } finally {
      setRetrying(false);
    }
  }, [restore]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>Session expired</Text>
        <Text style={styles.body}>
          Your session is no longer valid and was signed out for safety. Sign in
          again to continue.
        </Text>
        <View style={styles.badge}>
          <EnvBadge />
        </View>

        <View style={styles.actions}>
          <PrimaryButton title="Log in again" onPress={onLoginAgain} />
          <View style={styles.gap} />
          <PrimaryButton
            title="Retry session"
            variant="secondary"
            loading={retrying}
            onPress={onRetry}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  center: {flex: 1, justifyContent: 'center', padding: spacing.lg},
  title: {color: colors.text, fontSize: fontSize.xl, fontWeight: '800'},
  body: {color: colors.textMuted, fontSize: fontSize.md, marginTop: spacing.md, lineHeight: 22},
  badge: {marginTop: spacing.lg},
  actions: {marginTop: spacing.xl},
  gap: {height: spacing.md},
});
