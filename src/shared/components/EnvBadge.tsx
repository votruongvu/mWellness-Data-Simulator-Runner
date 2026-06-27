/**
 * MR-A — Foundation. Lightweight env badge (e.g. "ENV · dev").
 *
 * Reads the env label from config. This is intentionally a BADGE, not an
 * environment management control (no local/dev/staging/prod switcher in MR-A).
 */

import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {getEnv} from '../../config/env';
import {colors, fontSize, radius, spacing} from '../theme';

interface EnvBadgeProps {
  /** Override label; defaults to the active env label. */
  label?: string;
}

export function EnvBadge({label}: EnvBadgeProps): React.JSX.Element {
  const envLabel = label ?? getEnv().envLabel;
  return (
    <View style={styles.badge} accessibilityLabel={`Environment ${envLabel}`}>
      <Text style={styles.text}>ENV · {envLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  text: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
