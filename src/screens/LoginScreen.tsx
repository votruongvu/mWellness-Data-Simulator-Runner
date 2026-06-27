/**
 * MR-A — P02 Login.
 *
 * Auth to the MWDS backend. Internal-QA tone. Shows the env badge (NOT an env
 * setup form). Calls session.login(); on failure it surfaces the typed error.
 * When there is no backend, login returns BACKEND_UNAVAILABLE — we route to the
 * Backend-Unavailable state (E02). NEVER a fake authenticated session.
 */

import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback, useMemo, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSession} from '../auth/SessionContext';
import {EnvBadge} from '../shared/components/EnvBadge';
import {PrimaryButton} from '../shared/components/PrimaryButton';
import {colors, fontSize, radius, spacing} from '../shared/theme';
import type {RootStackParamList} from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export function LoginScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const {login, lastError, env, backendConfigured, clearError} = useSession();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => username.trim().length > 0 && password.length > 0 && !submitting,
    [username, password, submitting],
  );

  const onSignIn = useCallback(async () => {
    clearError();
    setSubmitting(true);
    try {
      await login(username.trim(), password);
    } finally {
      setSubmitting(false);
    }
  }, [clearError, username, password, login]);

  // If the failure was a backend-reachability problem, escalate to E02.
  React.useEffect(() => {
    if (lastError?.code === 'BACKEND_UNAVAILABLE') {
      navigation.navigate('BackendUnavailable', {
        endpoint: env.apiBaseUrl,
        code: lastError.code,
        message: lastError.message,
        requestId: lastError.requestId,
      });
    }
  }, [lastError, navigation, env.apiBaseUrl]);

  // Inline (non-backend-down) errors, e.g. VALIDATION / AUTH_EXPIRED on login.
  const inlineError =
    lastError && lastError.code !== 'BACKEND_UNAVAILABLE' ? lastError : undefined;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>mWellness Mobile Runner</Text>
            <Text style={styles.subtitle}>Internal DEV/QA Runner</Text>
            <View style={styles.badge}>
              <EnvBadge />
            </View>
          </View>

          {!backendConfigured ? (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>
                No MWDS backend is configured in this build. Sign-in will report
                a backend gap rather than create a session. Configure a base URL
                to connect.
              </Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
              placeholder="qa.user"
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Username"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Password"
            />

            {inlineError ? (
              <View style={styles.errorBox} accessibilityRole="alert">
                <Text style={styles.errorCode}>{inlineError.code}</Text>
                <Text style={styles.errorMsg}>{inlineError.message}</Text>
                {inlineError.requestId ? (
                  <Text style={styles.errorMeta}>
                    Request ID: {inlineError.requestId}
                  </Text>
                ) : null}
              </View>
            ) : null}

            <View style={styles.submit}>
              <PrimaryButton
                title="Sign in to MWDS backend"
                onPress={onSignIn}
                disabled={!canSubmit}
                loading={submitting}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  flex: {flex: 1},
  content: {padding: spacing.lg, flexGrow: 1, justifyContent: 'center'},
  header: {alignItems: 'center', marginBottom: spacing.xl},
  title: {color: colors.text, fontSize: fontSize.lg, fontWeight: '800'},
  subtitle: {color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs},
  badge: {marginTop: spacing.md},
  notice: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.warn,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  noticeText: {color: colors.text, fontSize: fontSize.sm},
  form: {gap: spacing.sm},
  label: {color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.sm},
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: fontSize.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  errorBox: {
    backgroundColor: 'rgba(224, 83, 61, 0.12)',
    borderColor: colors.danger,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  errorCode: {color: colors.danger, fontSize: fontSize.xs, fontWeight: '800'},
  errorMsg: {color: colors.text, fontSize: fontSize.sm, marginTop: spacing.xs},
  errorMeta: {color: colors.textMuted, fontSize: fontSize.xs, marginTop: spacing.xs},
  submit: {marginTop: spacing.lg},
});
