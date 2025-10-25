/**
 * Dev-only assertion helper
 * 
 * Throws in development if condition is falsy.
 * Stripped in production builds.
 * 
 * Benefits:
 * - Consistent error format
 * - Searchable stack traces
 * - Easy to grep for "[DS.*]" errors
 * 
 * @example
 * ```ts
 * devAssert(ariaLabel, '[DS.Modal] ariaLabel is required');
 * devAssert(id, '[DS.Field] id is required for htmlFor');
 * ```
 */
export function devAssert(condition: unknown, message: string): asserts condition {
  if (process.env.NODE_ENV !== 'production' && !condition) {
    throw new Error(message);
  }
}

// Optional: debug flag typing
declare global {
  interface Window {
    __DS_DEBUG?: boolean;
  }
}
