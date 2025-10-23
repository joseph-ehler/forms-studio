/**
 * Default ValidationPort Adapter
 * 
 * Provides sensible defaults for sync (Zod) and async (fetch) validation.
 * Apps can provide custom adapters by injecting them at the root level.
 */

import type { ValidationPort, ValidationResult, AsyncValidationConfig } from '../ports/ValidationPort';

export const defaultValidationAdapter: ValidationPort = {
  /**
   * Synchronous validation using Zod schema
   */
  validateSync: (value: unknown, schema: any): ValidationResult => {
    const result = schema.safeParse?.(value) ?? { success: true };
    
    return result.success
      ? { valid: true }
      : { valid: false, errors: result.error.errors };
  },
  
  /**
   * Asynchronous validation via HTTP request
   * Supports GET/POST, query params, AbortSignal cancellation
   */
  validateAsync: async (
    value: unknown,
    config: AsyncValidationConfig,
    signal: AbortSignal
  ): Promise<ValidationResult> => {
    try {
      const url = new URL(config.url, globalThis.location?.origin ?? 'http://localhost');
      
      if (config.queryKey && config.method !== 'POST') {
        url.searchParams.set(config.queryKey, String(value));
      }
      
      const options: RequestInit = {
        method: config.method ?? 'GET',
        signal,
      };
      
      if (config.method === 'POST' && config.queryKey) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify({ [config.queryKey]: value });
      }
      
      const response = await fetch(url.toString(), options);
      
      if (!response.ok) {
        return {
          valid: false,
          errors: [{ message: config.onFailMessage ?? 'Validation failed' }],
        };
      }
      
      return { valid: true };
      
    } catch (error: any) {
      // Re-throw abort errors to allow caller to handle cancellation
      if (error?.name === 'AbortError') {
        throw error;
      }
      
      return {
        valid: false,
        errors: [{ message: 'Validation service unavailable' }],
      };
    }
  },
};
