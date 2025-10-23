/**
 * Default TelemetryPort Adapter
 * 
 * Console-based telemetry in development.
 * In production, integrate with your analytics provider (Segment, Mixpanel, etc.)
 */

import type { TelemetryPort, FieldEvent, FieldEventName } from '../ports/TelemetryPort';

export const defaultTelemetryAdapter: TelemetryPort = {
  emit: (eventName: FieldEventName, payload: FieldEvent): void => {
    // Development: log to console
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Telemetry] ${eventName}`, payload);
    }
    
    // Production: integrate with analytics service
    // Example:
    // if (typeof window !== 'undefined') {
    //   window.analytics?.track(eventName, payload);
    // }
  },
};
