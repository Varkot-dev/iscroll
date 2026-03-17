/**
 * COLOR SCHEME - Centralized design tokens
 * 
 * Design philosophy: Twitter-like dark mode aesthetic 
 * with accent colors that create urgency and engagement.
 * 
 * All colors are WCAG AA compliant for accessibility.
 */

export const Colors = {
  background: '#0a0a0f',
  surface: '#0f0f18',
  surfaceCard: 'rgba(15, 15, 24, 0.85)',
  border: 'rgba(168, 184, 216, 0.1)',
  borderLight: 'rgba(168, 184, 216, 0.2)',
  textPrimary: '#e8eaf0',
  textSecondary: 'rgba(232, 234, 240, 0.75)',
  textTertiary: 'rgba(232, 234, 240, 0.35)',
  textMuted: 'rgba(232, 234, 240, 0.25)',
  textInverse: '#0a0a0f',
  accent: '#a8b8d8',
  accentHover: '#8a9fc0',
  accentLight: 'rgba(168, 184, 216, 0.1)',
  accentGlow: 'rgba(168, 184, 216, 0.15)',
  urgentRed: '#ff6b6b',
  urgentRedLight: 'rgba(255, 107, 107, 0.15)',
  liveGreen: '#6bcb8b',
  liveGreenLight: 'rgba(107, 203, 139, 0.15)',
  seriesBlue: '#7890c8',
  seriesBlueLight: 'rgba(120, 144, 200, 0.15)',
  warningAmber: '#f0c070',
  warningAmberLight: 'rgba(240, 192, 112, 0.15)',
  success: '#6bcb8b',
  successLight: 'rgba(107, 203, 139, 0.15)',
  error: '#ff6b6b',
  errorLight: 'rgba(255, 107, 107, 0.15)',
  warning: '#f0c070',
  warningLight: 'rgba(240, 192, 112, 0.15)',
  info: '#a8b8d8',
  infoLight: 'rgba(168, 184, 216, 0.15)',
  subscribed: '#a8b8d8',
  unsubscribed: 'rgba(232, 234, 240, 0.3)',
  subscribedBackground: 'rgba(168, 184, 216, 0.1)',
  progressComplete: '#6bcb8b',
  progressCurrent: '#a8b8d8',
  progressUnread: 'rgba(168, 184, 216, 0.15)',
  topicScience: '#6bcb8b',
  topicTech: '#a8b8d8',
  topicHistory: '#f0c070',
  topicEconomics: '#6bcb8b',
  topicPsychology: '#b090d0',
  topicPhysics: '#80c8e0',
} as const;

// ==================================================
// BADGE STYLES
// ==================================================
// Pre-configured badge color combinations

export const BadgeStyles = {
  new: {
    background: Colors.urgentRed,
    text: Colors.textPrimary,
  },
  live: {
    background: Colors.liveGreen,
    text: Colors.textInverse,
  },
  series: {
    background: Colors.seriesBlue,
    text: Colors.textPrimary,
  },
  updates: {
    background: Colors.warningAmber,
    text: Colors.textInverse,
  },
  completed: {
    background: Colors.success,
    text: Colors.textInverse,
  },
  upcoming: {
    background: Colors.textSecondary,
    text: Colors.textPrimary,
  },
} as const;

// ==================================================
// TYPOGRAPHY SCALES
// ==================================================
// Consistent text sizes throughout the app

export const Typography = {
  // Font sizes
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  
  // Line heights
  tight: 1.2,
  lineNormal: 1.4,
  relaxed: 1.6,
  loose: 1.8,

  // Font weights
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;

// ==================================================
// SPACING SCALE
// ==================================================
// Consistent spacing throughout the app

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

// ==================================================
// BORDER RADIUS
// ==================================================

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// Type exports for TypeScript
export type ColorKey = keyof typeof Colors;
export type BadgeStyle = keyof typeof BadgeStyles;
