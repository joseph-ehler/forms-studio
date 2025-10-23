/**
 * Ports - Architectural Boundaries
 * 
 * Ports define contracts for cross-cutting concerns (validation, telemetry, security).
 * Fields depend on ports, not concrete implementations.
 * Adapters provide default implementations that can be swapped at app level.
 * 
 * @see ../adapters for default implementations
 */

export * from './ValidationPort';
export * from './TelemetryPort';
export * from './SecurityPort';
