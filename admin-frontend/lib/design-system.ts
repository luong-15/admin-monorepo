/**
 * TechNova Design System — TypeScript Constants & Helpers
 * Centralized design values for consistency across the app.
 */

// ============================================
// Border Radius
// ============================================
export const radius = {
  sm: '0.25rem',   // 4px
  md: '0.375rem',  // 6px
  lg: '0.625rem',  // 10px
  xl: '1.125rem',  // 18px
  '2xl': '1.625rem', // 26px
  '3xl': '2.5rem',   // 40px
  full: '9999px',
} as const

// ============================================
// Shadows
// ============================================
export const shadow = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  glow: '0 0 20px -5px var(--primary)',
  'glow-sm': '0 0 10px -3px var(--primary)',
} as const

// ============================================
// Z-Index Scale
// ============================================
export const zIndex = {
  base: 0,
  dropdown: 50,
  sticky: 100,
  fixed: 200,
  drawer: 300,
  modal: 400,
  popover: 500,
  toast: 600,
  tooltip: 700,
} as const

// ============================================
// Animation Durations (ms)
// ============================================
export const duration = {
  instant: 100,
  fast: 150,
  normal: 250,
  slow: 400,
  slower: 600,
} as const

// ============================================
// Easing Functions
// ============================================
export const easing = {
  outExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
  inOutExpo: 'cubic-bezier(0.87, 0, 0.13, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const

// ============================================
// Spacing (Tailwind compatible)
// ============================================
export const spacing = {
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  2: '0.5rem',      // 8px
  3: '0.75rem',     // 12px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  8: '2rem',        // 32px
  10: '2.5rem',     // 40px
  12: '3rem',       // 48px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
} as const

// ============================================
// Brand Colors (hex)
// ============================================
export const brandColors = {
  blue: '#3b82f6',
  blueLight: '#60a5fa',
  blueDark: '#1d4ed8',
  indigo: '#6366f1',
  purple: '#8b5cf6',
  emerald: '#10b981',
  red: '#ef4444',
  amber: '#f59e0b',
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
} as const

// ============================================
// Typography
// ============================================
export const typography = {
  fontFamily: {
    sans: '"Geist", "Geist Fallback", system-ui, -apple-system, sans-serif',
    mono: '"Geist Mono", "Geist Mono Fallback", monospace',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  lineHeight: {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
} as const

// ============================================
// Breakpoints
// ============================================
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// ============================================
// Helper Functions
// ============================================

/**
 * Generate stagger delay CSS value
 */
export function staggerDelay(index: number, baseMs = 40): string {
  return `${index * baseMs}ms`
}

/**
 * Generate responsive padding classes
 */
export function responsivePadding(mobile: keyof typeof spacing, desktop: keyof typeof spacing): string {
  return `p-${mobile} md:p-${desktop}`
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Generate shadow class from elevation level
 */
export function elevationShadow(level: 0 | 1 | 2 | 3 | 4 | 5): string {
  const shadows = [
    'none',
    shadow.sm,
    shadow.md,
    shadow.lg,
    shadow.xl,
    shadow['2xl'],
  ]
  return shadows[level] ?? shadow.md
}

/**
 * Generate glass background style
 */
export function glassStyle(strength: 'light' | 'medium' | 'strong' = 'medium'): React.CSSProperties {
  const opacities = { light: 0.02, medium: 0.03, strong: 0.06 }
  const borderOpacities = { light: 0.05, medium: 0.08, strong: 0.12 }
  const blur = { light: 12, medium: 16, strong: 24 }

  return {
    background: `rgba(255, 255, 255, ${opacities[strength]})`,
    backdropFilter: `blur(${blur[strength]}px)`,
    WebkitBackdropFilter: `blur(${blur[strength]}px)`,
    border: `1px solid rgba(255, 255, 255, ${borderOpacities[strength]})`,
  }
}

// ============================================
// Animation Presets (Framer Motion compatible)
// ============================================
export const motionPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: easing.easeOut },
  },

  fadeInUp: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.4, ease: easing.outExpo },
  },

  fadeInScale: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
    transition: { duration: 0.3, ease: easing.outExpo },
  },

  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3, ease: easing.outExpo },
  },

  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3, ease: easing.outExpo },
  },

  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.05,
      },
    },
  },

  staggerItem: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: easing.outExpo },
  },

  pageTransition: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -4 },
    transition: { duration: 0.35, ease: easing.easeOut },
  },
} as const

// Type re-export
import type React from 'react'
