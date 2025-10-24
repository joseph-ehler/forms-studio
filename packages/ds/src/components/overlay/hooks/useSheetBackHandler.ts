/**
 * useSheetBackHandler
 * 
 * Handles back button / Esc key semantics for SheetPanel:
 * 1st back → collapse to next lower snap
 * 2nd back (already at min) → close
 * 3rd back → navigate (app-level, not handled here)
 */

import { useEffect } from 'react'

export type Snap = number

export interface BackHandlerOptions {
  snaps: Snap[]
  currentSnap: Snap
  setSnap: (s: Snap) => void
  onClose: () => void
  collapseTarget?: 'lower' | 'min' | Snap
  onBackPressure?: () => 'collapse' | 'close' | 'cancel'
}

export function useSheetBackHandler(opts: BackHandlerOptions): void {
  const {
    snaps,
    currentSnap,
    setSnap,
    onClose,
    collapseTarget = 'lower',
    onBackPressure,
  } = opts

  useEffect(() => {
    const handler = (e: KeyboardEvent | PopStateEvent) => {
      // Only handle Escape key, not all keyboard events
      if (e instanceof KeyboardEvent && e.key !== 'Escape') return

      // Ask consumer what to do
      const action = onBackPressure?.() ?? 'collapse'
      if (action === 'cancel') return // User prevented action (e.g., unsaved changes)

      const sorted = [...snaps].sort((a, b) => a - b)
      const currentIdx = sorted.findIndex(s => Math.abs(s - currentSnap) < 0.01)
      const isAtMin = currentIdx === 0 || currentSnap <= sorted[0] + 0.01

      if (action === 'collapse') {
        // If not at minimum snap → collapse
        if (!isAtMin) {
          let targetSnap: Snap

          if (collapseTarget === 'lower') {
            // Go to next lower snap
            targetSnap = currentIdx > 0 ? sorted[currentIdx - 1] : sorted[0]
          } else if (collapseTarget === 'min') {
            // Go directly to minimum
            targetSnap = sorted[0]
          } else {
            // Go to specific snap
            targetSnap = collapseTarget
          }

          setSnap(targetSnap)
          return
        }

        // Already at minimum → close
        onClose()
        return
      }

      if (action === 'close') {
        // Close immediately
        onClose()
        return
      }
    }

    // Listen to both popstate (back button) and keydown (Esc)
    window.addEventListener('popstate', handler as any)
    window.addEventListener('keydown', handler as any)

    return () => {
      window.removeEventListener('popstate', handler as any)
      window.removeEventListener('keydown', handler as any)
    }
  }, [snaps, currentSnap, setSnap, onClose, collapseTarget, onBackPressure])
}
