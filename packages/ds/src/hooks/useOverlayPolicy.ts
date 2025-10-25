/**
 * useOverlayPolicy - Sheet escalation policy enforcement
 * 
 * Handles automatic escalation from sheets to routes when:
 * - Depth exceeds 2
 * - Multi-step flow requires more steps
 * - Task requires full-screen focus
 */

import { useCallback } from 'react';
import { useLocation,useNavigate } from 'react-router';

export interface OverlayPolicyConfig {
  depth: number;
  maxDepth?: number;
  onCloseAll?: () => void;
}

export function useOverlayPolicy(config: OverlayPolicyConfig) {
  const { depth, maxDepth = 2, onCloseAll } = config;
  const navigate = useNavigate();
  const location = useLocation();

  const shouldEscalate = useCallback(() => depth >= maxDepth, [depth, maxDepth]);

  const maybeEscalate = useCallback(
    (target: string, options?: { reason?: string }) => {
      if (!shouldEscalate()) return false;

      if (process.env.NODE_ENV !== 'production') {
        console.log(
          `[OverlayPolicy] Escalating to route: ${target}`,
          options?.reason ? `(${options.reason})` : ''
        );
      }

      onCloseAll?.();
      
      const from = encodeURIComponent(location.pathname + location.search);
      const separator = target.includes('?') ? '&' : '?';
      navigate(`${target}${separator}from=${from}`);
      
      return true;
    },
    [shouldEscalate, onCloseAll, location, navigate]
  );

  return {
    maybeEscalate,
    shouldEscalate,
    getDepthStatus: () => ({
      current: depth,
      max: maxDepth,
      remaining: Math.max(0, maxDepth - depth),
      atLimit: depth >= maxDepth,
    }),
  };
}
