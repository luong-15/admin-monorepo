import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with proper precedence handling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Conditionally join class names (alias for clsx)
 */
export function cx(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Generate a responsive class string
 */
export function responsive(
  mobile: string,
  tablet?: string,
  desktop?: string,
): string {
  return cn(mobile, tablet, desktop);
}

/**
 * Generate hover/active state classes
 */
export function interactive(
  base: string,
  hover?: string,
  active?: string,
): string {
  return cn(base, hover && `hover:${hover}`, active && `active:${active}`);
}

/**
 * Check if value is within a range
 */
export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Format number with Vietnamese locale
 */
export function formatNumber(
  num: number,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat("vi-VN", options).format(num);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + "\u2026";
}

/**
 * Generate a unique ID
 */
export function uid(prefix = "id"): string {
  // Security-sensitive: avoid Math.random() for ID generation.
  // Prefer cryptographically secure UUID when available.
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  // Fallback: use Web Crypto if present.
  // Note: this is still more secure than Math.random().
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  ) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
      "",
    );
    return `${prefix}-${hex}`;
  }

  // Last-resort fallback (should be avoided): non-cryptographic randomness.
  return `${prefix}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
