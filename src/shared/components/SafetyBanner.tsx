/**
 * MR-A — Foundation. Persistent safety banner.
 *
 * Defaults to the dry-run-safe message. Real-write styling exists in the
 * palette for later phases but MR-A never renders a real-write banner — there
 * is no write path in this phase. Copy aligns with the safety UX matrix copy
 * bank (dry-run default).
 */

import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, fontSize, radius, spacing} from '../theme';

type SafetyMode = 'dryRun' | 'realWrite';

interface SafetyBannerProps {
  /** MR-A only ever uses 'dryRun'. */
  mode?: SafetyMode;
  message?: string;
}

const DEFAULT_DRY_RUN_COPY = 'Safety mode: Dry-run default. No health data will be written.';

export function SafetyBanner({
  mode = 'dryRun',
  message,
}: SafetyBannerProps): React.JSX.Element {
  const isReal = mode === 'realWrite';
  const copy = message ?? DEFAULT_DRY_RUN_COPY;
  return (
    <View
      style={[styles.banner, isReal ? styles.real : styles.dry]}
      accessibilityRole="alert">
      <Text style={styles.text}>{copy}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dry: {
    backgroundColor: 'rgba(46, 168, 160, 0.15)',
    borderColor: colors.dryRun,
    borderWidth: StyleSheet.hairlineWidth,
  },
  real: {
    backgroundColor: 'rgba(224, 83, 61, 0.15)',
    borderColor: colors.realWrite,
    borderWidth: StyleSheet.hairlineWidth,
  },
  text: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
