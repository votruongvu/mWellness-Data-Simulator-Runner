/**
 * MR-A — Foundation. Small status pill keyed to status semantics.
 */

import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, fontSize, radius, spacing, StatusKind, statusColor} from '../theme';

interface StatusBadgeProps {
  kind: StatusKind;
  label: string;
}

export function StatusBadge({kind, label}: StatusBadgeProps): React.JSX.Element {
  const tint = statusColor[kind];
  return (
    <View style={[styles.badge, {borderColor: tint}]}>
      <View style={[styles.dot, {backgroundColor: tint}]} />
      <Text style={[styles.text, {color: tint}]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
});
