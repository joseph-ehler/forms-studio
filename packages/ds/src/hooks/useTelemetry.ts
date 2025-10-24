/**
 * useTelemetry - Lightweight telemetry hook for overlay/route events
 * 
 * Emits events for:
 * - Sheet escalation
 * - Sub-flow step changes
 * - Route open/close with duration
 * 
 * @example
 * const telemetry = useTelemetry(analytics.track);
 * 
 * telemetry.emit({
 *   event: 'sheet_escalate',
 *   fromDepth: 2,
 *   target: '/create?step=1'
 * });
 */

import { useCallback, useRef, useEffect } from 'react';

export type OverlayTelemetryEvent =
  | {
      event: 'sheet_escalate';
      fromDepth: number;
      target: string;
      reason?: string;
    }
  | {
      event: 'subflow_step';
      flow: string;
      step: string;
      index: number;
      total: number;
    }
  | {
      event: 'route_open';
      path: string;
      type: 'fullscreen' | 'panel';
    }
  | {
      event: 'route_close';
      path: string;
      type: 'fullscreen' | 'panel';
      durationMs: number;
    }
  | {
      event: 'sheet_open';
      type: 'dialog' | 'panel';
      depth: number;
    }
  | {
      event: 'sheet_close';
      type: 'dialog' | 'panel';
      depth: number;
      durationMs: number;
    };

export type TelemetryHandler = (event: OverlayTelemetryEvent) => void;

export interface UseTelemetryResult {
  /** Emit a telemetry event */
  emit: (event: OverlayTelemetryEvent) => void;
  
  /** Start timing a route/sheet (returns stop function) */
  startTiming: (key: string) => () => number;
}

export function useTelemetry(
  onTelemetry?: TelemetryHandler
): UseTelemetryResult {
  const timingsRef = useRef<Map<string, number>>(new Map());

  const emit = useCallback(
    (event: OverlayTelemetryEvent) => {
      if (!onTelemetry) {
        // Log in dev mode
        if (process.env.NODE_ENV !== 'production') {
          console.log('[Telemetry]', event);
        }
        return;
      }

      try {
        onTelemetry(event);
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[Telemetry] Handler error:', error);
        }
      }
    },
    [onTelemetry]
  );

  const startTiming = useCallback((key: string) => {
    const startTime = performance.now();
    timingsRef.current.set(key, startTime);

    // Return stop function
    return () => {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      timingsRef.current.delete(key);
      return duration;
    };
  }, []);

  return { emit, startTiming };
}

/**
 * useRouteOpenTelemetry - Auto-emit route_open on mount, route_close on unmount
 */
export function useRouteOpenTelemetry(
  path: string,
  type: 'fullscreen' | 'panel',
  onTelemetry?: TelemetryHandler
) {
  const { emit, startTiming } = useTelemetry(onTelemetry);

  useEffect(() => {
    emit({ event: 'route_open', path, type });
    const stop = startTiming(`route:${path}`);

    return () => {
      const durationMs = stop();
      emit({ event: 'route_close', path, type, durationMs });
    };
  }, [emit, path, type, startTiming]);
}

/**
 * useSubFlowStepTelemetry - Auto-emit on step change
 */
export function useSubFlowStepTelemetry(
  flow: string,
  step: string,
  index: number,
  total: number,
  onTelemetry?: TelemetryHandler
) {
  const { emit } = useTelemetry(onTelemetry);

  useEffect(() => {
    emit({ event: 'subflow_step', flow, step, index, total });
  }, [emit, flow, step, index, total]);
}
