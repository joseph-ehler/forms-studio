/**
 * Deprecation Utilities
 * 
 * Systematized approach to phasing out old implementations:
 * 1. Mark old implementation with deprecation warning
 * 2. Log usage in dev mode
 * 3. Track via telemetry (if enabled)
 * 4. Remove after 1-2 releases
 * 
 * @example
 * ```tsx
 * import { deprecated } from '../utils/deprecate';
 * 
 * export const OldButton = deprecated(
 *   Button,
 *   'OldButton',
 *   'Use the new token-only Button from @intstudio/ds/fb instead',
 *   '0.5.0', // Remove in version
 * );
 * ```
 */

import React, { ComponentType, useEffect } from 'react';

type DeprecationInfo = {
  component: string;
  message: string;
  removeIn: string;
  since: string;
  migrationUrl?: string;
};

const deprecationRegistry = new Map<string, DeprecationInfo>();
const warningCache = new Set<string>();

/**
 * Log deprecation warning (once per component)
 */
function logDeprecationWarning(info: DeprecationInfo): void {
  if (process.env.NODE_ENV === 'production') return;
  
  const key = info.component;
  if (warningCache.has(key)) return;
  
  warningCache.add(key);
  
  console.warn(
    `\n⚠️  [DS Deprecation] ${info.component} is deprecated and will be removed in v${info.removeIn}\n` +
    `   Since: v${info.since}\n` +
    `   ${info.message}\n` +
    (info.migrationUrl ? `   Migration: ${info.migrationUrl}\n` : '')
  );
}

/**
 * Mark a component as deprecated
 * 
 * Wraps the component with deprecation warning that fires on mount.
 * 
 * @param Component - The component to deprecate
 * @param name - Component name for logging
 * @param message - Migration message
 * @param removeIn - Version when it will be removed
 * @param since - Version when deprecated (optional, defaults to current)
 * @param migrationUrl - URL to migration guide (optional)
 */
export function deprecated<P extends object>(
  Component: ComponentType<P>,
  name: string,
  message: string,
  removeIn: string,
  since: string = '0.4.0',
  migrationUrl?: string,
): ComponentType<P> {
  const info: DeprecationInfo = {
    component: name,
    message,
    removeIn,
    since,
    migrationUrl,
  };
  
  deprecationRegistry.set(name, info);
  
  const DeprecatedComponent = (props: P): React.ReactElement => {
    useEffect(() => {
      logDeprecationWarning(info);
    }, []);
    
    return React.createElement(Component, props);
  };
  
  DeprecatedComponent.displayName = `Deprecated(${name})`;
  
  return DeprecatedComponent;
}

/**
 * Get all registered deprecations
 * (useful for build-time checks, documentation)
 */
export function getDeprecations(): DeprecationInfo[] {
  return Array.from(deprecationRegistry.values());
}

/**
 * Check if a component is deprecated
 */
export function isDeprecated(componentName: string): boolean {
  return deprecationRegistry.has(componentName);
}

/**
 * Clear warning cache (useful for testing)
 */
export function clearWarningCache(): void {
  warningCache.clear();
}
