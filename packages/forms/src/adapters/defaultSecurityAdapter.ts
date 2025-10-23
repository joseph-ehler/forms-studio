/**
 * Default SecurityPort Adapter
 * 
 * Basic XSS protection via HTML entity escaping.
 * For advanced security (CSP, sanitization libraries), provide custom adapter.
 */

import type { SecurityPort } from '../ports/SecurityPort';

export const defaultSecurityAdapter: SecurityPort = {
  /**
   * Sanitize user input by escaping HTML entities
   * Prevents basic XSS attacks
   */
  sanitize: (value: string): string => {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/`/g, '&#x60;');
  },
  
  /**
   * Check if value matches allowlist pattern
   * Returns true if no pattern specified (unrestricted)
   */
  allowListCheck: (value: string, pattern?: RegExp): boolean => {
    if (!pattern) return true;
    return pattern.test(value);
  },
};
