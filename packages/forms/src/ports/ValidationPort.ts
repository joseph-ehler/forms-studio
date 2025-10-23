/**
 * ValidationPort
 * 
 * Defines the contract for sync and async validation.
 * Fields use this port to validate user input without coupling to a specific implementation.
 * 
 * @example
 * ```typescript
 * const result = await validationPort.validateAsync(
 *   'user@example.com',
 *   { url: '/api/check-email', queryKey: 'email' },
 *   signal
 * );
 * ```
 */

export interface ValidationResult {
  valid: boolean;
  errors?: Array<{
    message: string;
    path?: string;
  }>;
}

export interface AsyncValidationConfig {
  id: string;
  url: string;
  method?: 'GET' | 'POST';
  queryKey?: string;
  onFailMessage?: string;
  debounceMs?: number;
  retryPolicy?: {
    maxAttempts: number;
    backoffMs: number[];
  };
}

export interface ValidationPort {
  /**
   * Synchronous validation using a schema (e.g., Zod)
   */
  validateSync(value: unknown, schema: any): ValidationResult;
  
  /**
   * Asynchronous validation (e.g., uniqueness check via API)
   * Supports AbortSignal for cancellation
   */
  validateAsync(
    value: unknown,
    config: AsyncValidationConfig,
    signal: AbortSignal
  ): Promise<ValidationResult>;
}
