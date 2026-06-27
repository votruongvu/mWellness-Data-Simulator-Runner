/**
 * MR-A — Foundation. Minimal design tokens.
 *
 * Includes safety-semantic colors (dryRun / realWrite / danger / ok / warn)
 * so later phases reuse one palette for the mode/safety badges. MR-A only
 * renders dry-run-default and neutral states.
 */

export const colors = {
  // Surfaces
  background: '#0F1419',
  surface: '#1B2129',
  surfaceAlt: '#242C36',
  border: '#313B47',

  // Text
  text: '#F2F5F8',
  textMuted: '#9AA7B4',
  textInverse: '#0F1419',

  // Brand / action
  primary: '#2D7FF9',
  primaryMuted: '#1C4C94',

  // Safety semantics
  dryRun: '#2EA8A0', // teal — safe simulation (default mode)
  realWrite: '#E0533D', // strong — real health write (never in MR-A)
  danger: '#E0533D',
  ok: '#3FB860',
  warn: '#E0A33D',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
} as const;

/** Status semantics → color, for StatusBadge and result states. */
export type StatusKind = 'ok' | 'warn' | 'danger' | 'neutral' | 'dryRun';

export const statusColor: Record<StatusKind, string> = {
  ok: colors.ok,
  warn: colors.warn,
  danger: colors.danger,
  neutral: colors.textMuted,
  dryRun: colors.dryRun,
};

export const theme = {colors, spacing, radius, fontSize, statusColor};
export type Theme = typeof theme;
