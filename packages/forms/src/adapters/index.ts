/**
 * Adapters - Default Implementations
 * 
 * Provides sensible defaults for ports (validation, telemetry, security).
 * Apps can provide custom adapters at root level to swap implementations.
 * 
 * @see ../ports for port interfaces
 */

export * from './defaultValidationAdapter';
export * from './defaultTelemetryAdapter';
export * from './defaultSecurityAdapter';
