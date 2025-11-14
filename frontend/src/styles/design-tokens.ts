/**
 * Design Tokens for Whistle
 *
 * Centralized design system values for consistent theming across the application.
 * Uses a neutral dark theme with deep-indigo accent.
 */

export const colors = {
  // Primary brand color - deep indigo
  primary: '#3b49ff',
  primaryHover: '#4e5aff',
  primaryActive: '#2938e6',

  // Background colors
  background: '#0f1115',
  surface: '#121316',
  surfaceHover: '#1a1b1f',

  // Text colors
  text: '#e6eef8',
  textMuted: '#9aa0a6',
  textDim: '#6b7280',

  // Border colors
  border: '#1f2128',
  borderHover: '#2a2c34',

  // Semantic colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
} as const;

export const spacing = {
  base: 8,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const fontSize = {
  xs: '12px',
  sm: '14px',
  base: '16px',
  lg: '18px',
  xl: '22px',
  '2xl': '28px',
} as const;

export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const borderRadius = {
  sm: '6px',
  base: '10px',
  lg: '14px',
  xl: '20px',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 2px 8px rgba(2, 6, 23, 0.3)',
  base: '0 6px 20px rgba(2, 6, 23, 0.6)',
  lg: '0 10px 30px rgba(2, 6, 23, 0.8)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
} as const;

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const zIndex = {
  base: 1,
  dropdown: 10,
  sticky: 20,
  modal: 50,
  popover: 60,
  toast: 70,
} as const;

// Layout constants
export const layout = {
  leftNavWidth: '260px',
  rightRailWidth: '320px',
  maxContentWidth: '680px',
  headerHeight: '60px',
} as const;

// Font stack
export const fontFamily = {
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
  mono: '"SF Mono", "Fira Code", "Consolas", monospace',
} as const;
