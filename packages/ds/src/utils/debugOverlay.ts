/**
 * Debug Overlay - Dev-Only Observability
 * 
 * Visualizes sheet state for debugging.
 * Trigger via ?debugOverlay=1 or programmatically.
 */

export interface DebugOverlayState {
  currentSnap: number
  velocity: number
  gestureOwner: 'sheet' | 'canvas' | 'none'
  isAtTop: boolean
  deviceMode: 'mobile' | 'tablet' | 'desktop'
  resolvedMode: 'sheet' | 'popover' | 'dialog' | 'docked-panel'
  prefersReducedMotion: boolean
  isRTL: boolean
  viewportWidth: number
  viewportHeight: number
}

class DebugOverlay {
  private element: HTMLDivElement | null = null
  private enabled: boolean = false

  constructor() {
    // Check URL param
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      this.enabled = params.get('debugOverlay') === '1'
      
      if (this.enabled) {
        this.mount()
      }
    }
  }

  private mount() {
    if (this.element || typeof window === 'undefined') return

    this.element = document.createElement('div')
    this.element.id = 'ds-debug-overlay'
    this.element.style.cssText = `
      position: fixed;
      top: 60px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: #00ff00;
      padding: 16px;
      border-radius: 8px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 12px;
      z-index: 99999;
      min-width: 300px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      pointer-events: none;
      line-height: 1.6;
    `

    document.body.appendChild(this.element)
  }

  enable() {
    this.enabled = true
    this.mount()
  }

  disable() {
    this.enabled = false
    if (this.element) {
      this.element.remove()
      this.element = null
    }
  }

  update(state: Partial<DebugOverlayState>) {
    if (!this.enabled || !this.element) return

    const lines: string[] = [
      '🐛 DEBUG OVERLAY',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    ]

    if (state.currentSnap !== undefined) {
      lines.push(`Snap: ${(state.currentSnap * 100).toFixed(0)}%`)
    }

    if (state.velocity !== undefined) {
      const direction = state.velocity < 0 ? '↑' : '↓'
      lines.push(`Velocity: ${direction} ${Math.abs(state.velocity).toFixed(2)} px/ms`)
    }

    if (state.gestureOwner) {
      const icon = state.gestureOwner === 'sheet' ? '📄' : state.gestureOwner === 'canvas' ? '🗺️' : '⏸️'
      lines.push(`Gesture: ${icon} ${state.gestureOwner}`)
    }

    if (state.isAtTop !== undefined) {
      lines.push(`isAtTop: ${state.isAtTop ? '✅' : '❌'}`)
    }

    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    if (state.deviceMode) {
      const icon = 
        state.deviceMode === 'mobile' ? '📱' :
        state.deviceMode === 'tablet' ? '📲' : '🖥️'
      lines.push(`Device: ${icon} ${state.deviceMode}`)
    }

    if (state.resolvedMode) {
      lines.push(`Mode: ${state.resolvedMode}`)
    }

    if (state.viewportWidth && state.viewportHeight) {
      lines.push(`Viewport: ${state.viewportWidth}×${state.viewportHeight}`)
    }

    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    if (state.prefersReducedMotion !== undefined) {
      lines.push(`Reduced Motion: ${state.prefersReducedMotion ? '✅' : '❌'}`)
    }

    if (state.isRTL !== undefined) {
      lines.push(`RTL: ${state.isRTL ? '✅' : '❌'}`)
    }

    this.element.innerHTML = lines.join('<br>')
  }

  log(message: string) {
    if (!this.enabled) return
    console.log(`[Debug Overlay] ${message}`)
  }
}

// Singleton instance
let instance: DebugOverlay | null = null

export const getDebugOverlay = (): DebugOverlay => {
  if (!instance) {
    instance = new DebugOverlay()
  }
  return instance
}

/**
 * Console helper for manual debugging
 */
export const debugOverlay = () => {
  const overlay = getDebugOverlay()
  
  return {
    enable: () => overlay.enable(),
    disable: () => overlay.disable(),
    update: (state: Partial<DebugOverlayState>) => overlay.update(state),
    log: (message: string) => overlay.log(message),
  }
}

// Expose to window for console access
if (typeof window !== 'undefined') {
  (window as any).__debugOverlay = debugOverlay()
}
