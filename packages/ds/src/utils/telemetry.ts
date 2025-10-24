/**
 * Telemetry Hooks - Lightweight Event Tracking
 * 
 * Optional telemetry for observing sheet behavior in production.
 * Zero PII, opt-in via onTelemetry prop.
 */

export type TelemetryEvent =
  | OverlayOpenEvent
  | OverlayCloseEvent
  | SheetSnapChangeEvent
  | GestureRoutedEvent

export interface BaseTelemetryEvent {
  timestamp: number
  sessionId?: string
}

export interface OverlayOpenEvent extends BaseTelemetryEvent {
  type: 'overlay_open_start' | 'overlay_open_end'
  kind: 'field' | 'dialog' | 'panel'
  mode: 'sheet' | 'popover' | 'dialog' | 'docked-panel'
  device: 'mobile' | 'tablet' | 'desktop'
  viewportWidth: number
  viewportHeight: number
}

export interface OverlayCloseEvent extends BaseTelemetryEvent {
  type: 'overlay_close'
  reason: 'done' | 'cancel' | 'esc' | 'flick' | 'route-change' | 'back-button'
  kind: 'field' | 'dialog' | 'panel'
  mode: 'sheet' | 'popover' | 'dialog' | 'docked-panel'
  durationMs: number
}

export interface SheetSnapChangeEvent extends BaseTelemetryEvent {
  type: 'sheet_snap_change'
  from: number
  to: number
  velocity: number
  trigger: 'gesture' | 'button' | 'url' | 'back-button'
  durationMs: number
}

export interface GestureRoutedEvent extends BaseTelemetryEvent {
  type: 'gesture_routed'
  owner: 'sheet' | 'canvas'
  angle: number
  snap: number
  velocity: number
  isAtTop: boolean
}

export type TelemetryCallback = (event: TelemetryEvent) => void

/**
 * Dev adapter - logs to console
 */
export const createDevTelemetryAdapter = (): TelemetryCallback => {
  return (event: TelemetryEvent) => {
    console.log('[Telemetry]', event.type, event)
  }
}

/**
 * Segment adapter example (feature-flagged)
 */
export const createSegmentAdapter = (
  writeKey: string,
  enabled: boolean = false
): TelemetryCallback => {
  if (!enabled || typeof window === 'undefined') {
    return () => {} // No-op
  }

  return (event: TelemetryEvent) => {
    if (!(window as any).analytics) {
      console.warn('[Telemetry] Segment not loaded')
      return
    }

    // Map to Segment track event
    ;(window as any).analytics.track(event.type, {
      ...event,
      // Remove sensitive data
      sessionId: undefined,
    })
  }
}

/**
 * Mixpanel adapter example
 */
export const createMixpanelAdapter = (
  token: string,
  enabled: boolean = false
): TelemetryCallback => {
  if (!enabled || typeof window === 'undefined') {
    return () => {}
  }

  return (event: TelemetryEvent) => {
    if (!(window as any).mixpanel) {
      console.warn('[Telemetry] Mixpanel not loaded')
      return
    }

    ;(window as any).mixpanel.track(event.type, event)
  }
}

/**
 * No-op adapter (default)
 */
export const createNoOpAdapter = (): TelemetryCallback => {
  return () => {}
}

/**
 * Helper to track overlay lifecycle
 */
export class OverlayTelemetry {
  private openTime: number = 0
  private initialSnap: number = 0
  private snapChangeTime: number = 0
  
  constructor(private callback: TelemetryCallback) {}

  trackOpenStart(
    kind: 'field' | 'dialog' | 'panel',
    mode: 'sheet' | 'popover' | 'dialog' | 'docked-panel',
    device: 'mobile' | 'tablet' | 'desktop'
  ) {
    this.openTime = Date.now()
    
    this.callback({
      type: 'overlay_open_start',
      kind,
      mode,
      device,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      timestamp: this.openTime,
    })
  }

  trackOpenEnd(
    kind: 'field' | 'dialog' | 'panel',
    mode: 'sheet' | 'popover' | 'dialog' | 'docked-panel',
    device: 'mobile' | 'tablet' | 'desktop'
  ) {
    this.callback({
      type: 'overlay_open_end',
      kind,
      mode,
      device,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      timestamp: Date.now(),
    })
  }

  trackClose(
    reason: 'done' | 'cancel' | 'esc' | 'flick' | 'route-change' | 'back-button',
    kind: 'field' | 'dialog' | 'panel',
    mode: 'sheet' | 'popover' | 'dialog' | 'docked-panel'
  ) {
    const now = Date.now()
    
    this.callback({
      type: 'overlay_close',
      reason,
      kind,
      mode,
      durationMs: now - this.openTime,
      timestamp: now,
    })
  }

  trackSnapChange(
    from: number,
    to: number,
    velocity: number,
    trigger: 'gesture' | 'button' | 'url' | 'back-button'
  ) {
    const now = Date.now()
    
    this.callback({
      type: 'sheet_snap_change',
      from,
      to,
      velocity,
      trigger,
      durationMs: now - this.snapChangeTime,
      timestamp: now,
    })
    
    this.snapChangeTime = now
  }

  trackGestureRouted(
    owner: 'sheet' | 'canvas',
    angle: number,
    snap: number,
    velocity: number,
    isAtTop: boolean
  ) {
    this.callback({
      type: 'gesture_routed',
      owner,
      angle,
      snap,
      velocity,
      isAtTop,
      timestamp: Date.now(),
    })
  }
}

/**
 * Hook to use telemetry in components
 */
export const useTelemetry = (callback?: TelemetryCallback) => {
  if (!callback) {
    return new OverlayTelemetry(createNoOpAdapter())
  }
  
  return new OverlayTelemetry(callback)
}
