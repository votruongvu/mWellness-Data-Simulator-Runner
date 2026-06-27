/**
 * MR-A — Foundation. Primary action button with disabled state + subtitle.
 */

import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {colors, fontSize, radius, spacing} from '../theme';

interface PrimaryButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** Optional subtitle, e.g. "Coming in MR-B" for a disabled action. */
  subtitle?: string;
  variant?: 'primary' | 'secondary';
  accessibilityLabel?: string;
}

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  subtitle,
  variant = 'primary',
  accessibilityLabel,
}: PrimaryButtonProps): React.JSX.Element {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={isDisabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{disabled: isDisabled, busy: loading}}
      accessibilityLabel={accessibilityLabel ?? title}
      style={[
        styles.button,
        variant === 'secondary' && styles.secondary,
        isDisabled && styles.disabled,
      ]}>
      <View style={styles.row}>
        {loading ? <ActivityIndicator color={colors.text} /> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondary: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
  },
  disabled: {
    backgroundColor: colors.surfaceAlt,
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
});
