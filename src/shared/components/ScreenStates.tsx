/**
 * MR-B — Canonical screen-state views for read-only backend screens.
 *
 * Renders honest loading / empty / error states from a typed ApiError. Maps:
 *   AUTH_EXPIRED        -> session-expired messaging (the app also flips the
 *                          session to 'expired' which re-routes to E01).
 *   BACKEND_UNAVAILABLE -> backend-unavailable messaging (no base URL / network).
 *   NOT_FOUND           -> BACKEND_GAP: a needed route 404'd at runtime — we
 *                          surface it honestly, never fabricate.
 *   FORBIDDEN/VALIDATION/UNKNOWN -> generic error with code + request id.
 *
 * Nothing here invents data. The Retry action re-runs the caller's fetch.
 */

import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {ApiError} from '../../backend/types';
import {colors, fontSize, radius, spacing} from '../theme';
import {PrimaryButton} from './PrimaryButton';

export function LoadingState({
  label = 'Loading…',
}: {
  label?: string;
}): React.JSX.Element {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

export function EmptyState({
  title,
  body,
}: {
  title: string;
  body?: string;
}): React.JSX.Element {
  return (
    <View style={styles.center}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {body ? <Text style={styles.muted}>{body}</Text> : null}
    </View>
  );
}

/** Human framing for each ApiError code. */
function describe(error: ApiError): {title: string; body: string} {
  switch (error.code) {
    case 'AUTH_EXPIRED':
      return {
        title: 'Session expired',
        body: 'Your session is no longer valid. Sign in again to continue.',
      };
    case 'BACKEND_UNAVAILABLE':
      return {
        title: 'Backend unavailable',
        body: 'The MWDS backend could not be reached. No data was loaded.',
      };
    case 'NOT_FOUND':
      return {
        title: 'Backend gap',
        body:
          'A required backend route returned 404. This data is not available from the current MWDS build. Nothing was fabricated.',
      };
    case 'FORBIDDEN':
      return {
        title: 'Not permitted',
        body: 'Your account is not permitted to view this resource.',
      };
    case 'VALIDATION':
      return {title: 'Request rejected', body: error.message};
    default:
      return {title: 'Something went wrong', body: error.message};
  }
}

export function ErrorState({
  error,
  onRetry,
}: {
  error: ApiError;
  onRetry?: () => void;
}): React.JSX.Element {
  const {title, body} = describe(error);
  const isBackendGap = error.code === 'NOT_FOUND';
  return (
    <View style={styles.center}>
      <View style={[styles.errorCard, isBackendGap && styles.gapCard]}>
        <Text style={styles.errorTitle}>{title}</Text>
        <Text style={styles.muted}>{body}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Code</Text>
          <Text style={styles.metaValue} selectable>
            {error.backendCode ?? error.code}
          </Text>
        </View>
        {error.requestId ? (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Request ID</Text>
            <Text style={styles.metaValue} selectable>
              {error.requestId}
            </Text>
          </View>
        ) : null}
      </View>
      {onRetry ? (
        <View style={styles.retry}>
          <PrimaryButton title="Retry" variant="secondary" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  muted: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyTitle: {color: colors.text, fontSize: fontSize.md, fontWeight: '700'},
  errorCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderColor: colors.danger,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  gapCard: {borderColor: colors.warn},
  errorTitle: {color: colors.text, fontSize: fontSize.md, fontWeight: '800'},
  metaRow: {flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md},
  metaLabel: {color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700'},
  metaValue: {color: colors.text, fontSize: fontSize.xs, flexShrink: 1, textAlign: 'right'},
  retry: {width: '100%'},
});
