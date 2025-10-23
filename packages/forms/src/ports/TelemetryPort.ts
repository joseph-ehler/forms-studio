/**
 * TelemetryPort
 * 
 * Defines the contract for emitting field telemetry events.
 * Fields emit structured events for observability without coupling to a specific analytics provider.
 * 
 * @example
 * ```typescript
 * telemetryPort.emit('field_focus', {
 *   schemaPath: 'user.email',
 *   fieldType: 'email',
 * });
 * ```
 */

export interface FieldEvent {
  schemaPath: string;
  fieldType: string;
  formId?: string;
  valueSample?: string;
  valid?: boolean;
  errorCode?: string;
  durationMs?: number;
  meta?: Record<string, unknown>;
}

export type FieldEventName =
  | 'field_focus'
  | 'field_blur'
  | 'field_change'
  | 'field_validate_sync'
  | 'field_validate_async'
  | 'field_validate_fail'
  | 'field_submit';

export interface TelemetryPort {
  /**
   * Emit a structured field event
   * 
   * Events are privacy-aware (see spec.telemetry.pii):
   * - redact: valueSample omitted
   * - hash: valueSample hashed
   * - allow: valueSample included (only for non-PII fields)
   */
  emit(eventName: FieldEventName, payload: FieldEvent): void;
}
