/**
 * SecurityPort
 * 
 * Defines the contract for input sanitization and validation.
 * Fields use this port to protect against XSS and enforce allowlists.
 * 
 * @example
 * ```typescript
 * const clean = securityPort.sanitize(userInput);
 * const allowed = securityPort.allowListCheck(userInput, /^[a-zA-Z0-9]+$/);
 * ```
 */

export interface SecurityPort {
  /**
   * Sanitize user input (escape HTML entities to prevent XSS)
   */
  sanitize(value: string): string;
  
  /**
   * Check if value matches allowlist pattern
   * Returns true if pattern is undefined (no restriction)
   */
  allowListCheck(value: string, pattern?: RegExp): boolean;
}
