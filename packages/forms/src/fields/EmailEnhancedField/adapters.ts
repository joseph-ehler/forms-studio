/**
 * EmailEnhancedField Adapters (auto-generated)
 *
 * Generator v2.4
 */

import type { ValidationPort } from '../../ports/ValidationPort';
import { defaultValidationAdapter } from '../../adapters/defaultValidationAdapter';
export const validationAdapter: ValidationPort = defaultValidationAdapter;

import type { TelemetryPort } from '../../ports/TelemetryPort';
import { defaultTelemetryAdapter } from '../../adapters/defaultTelemetryAdapter';
export const telemetryAdapter: TelemetryPort = defaultTelemetryAdapter;

import type { SecurityPort } from '../../ports/SecurityPort';
import { defaultSecurityAdapter } from '../../adapters/defaultSecurityAdapter';
export const securityAdapter: SecurityPort = defaultSecurityAdapter;
