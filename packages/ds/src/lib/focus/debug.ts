/**
 * Focus Debug Utilities
 * 
 * Console helpers for debugging focus management.
 * 
 * Usage:
 *   debugFocus()                    // Show current focus state
 *   debugFocusTraps()               // List all active traps
 *   debugFocusScopes()              // Show scope hierarchy
 *   watchFocus()                    // Live monitor focus changes
 */

import { getFocusableElements, FOCUSABLE_SELECTOR } from './focusUtils'

/**
 * Debug current focus state
 */
export function debugFocus(): void {
  const active = document.activeElement
  
  console.group('🎯 FOCUS STATE')
  
  console.log('Active element:', active)
  console.log('Tag:', active?.tagName)
  console.log('ID:', (active as HTMLElement)?.id || '(none)')
  console.log('Classes:', (active as HTMLElement)?.className || '(none)')
  console.log('Focusable:', active?.matches(FOCUSABLE_SELECTOR))
  
  // Focus trap info
  const trap = (active as HTMLElement)?.closest('[data-focus-trap]')
  if (trap) {
    console.log('\nFocus Trap:', trap.getAttribute('data-focus-trap'))
  }
  
  // Focus scope info
  const scope = (active as HTMLElement)?.closest('[data-focus-scope]')
  if (scope) {
    console.log('Focus Scope:', scope.getAttribute('data-focus-scope'))
  }
  
  // Roving focus info
  const roving = (active as HTMLElement)?.closest('[data-roving-focus]')
  if (roving) {
    console.log('Roving Focus:', roving.getAttribute('data-roving-focus'))
    console.log('Loop:', roving.getAttribute('data-roving-loop'))
  }
  
  console.groupEnd()
}

/**
 * List all focus traps
 */
export function debugFocusTraps(): void {
  const traps = document.querySelectorAll('[data-focus-trap]')
  
  console.group('🔒 FOCUS TRAPS')
  console.log(`Found ${traps.length} trap(s)`)
  
  traps.forEach((trap, i) => {
    const status = trap.getAttribute('data-focus-trap')
    const focusable = getFocusableElements(trap as HTMLElement)
    
    console.log(`\nTrap ${i + 1}:`)
    console.log('  Status:', status)
    console.log('  Focusable elements:', focusable.length)
    console.log('  Element:', trap)
  })
  
  console.groupEnd()
}

/**
 * Show focus scope hierarchy
 */
export function debugFocusScopes(): void {
  const scopes = document.querySelectorAll('[data-focus-scope]')
  
  console.group('🎯 FOCUS SCOPES')
  console.log(`Found ${scopes.length} scope(s)`)
  
  scopes.forEach((scope, i) => {
    const id = scope.getAttribute('data-focus-scope')
    const focusable = getFocusableElements(scope as HTMLElement)
    const parent = (scope as HTMLElement).parentElement?.closest('[data-focus-scope]')
    
    console.log(`\nScope ${i + 1}:`)
    console.log('  ID:', id)
    console.log('  Parent:', parent?.getAttribute('data-focus-scope') || '(none)')
    console.log('  Focusable elements:', focusable.length)
    console.log('  Element:', scope)
  })
  
  console.groupEnd()
}

/**
 * Watch focus changes (live monitoring)
 */
export function watchFocus(enabled = true): () => void {
  if (!enabled) return () => {}
  
  let previousElement: Element | null = null
  
  const handleFocusChange = () => {
    const current = document.activeElement
    
    if (current !== previousElement) {
      console.log('👁️ Focus changed:', {
        from: previousElement,
        to: current,
        tag: current?.tagName,
        id: (current as HTMLElement)?.id || '(none)',
      })
      
      previousElement = current
    }
  }
  
  // Monitor both focus and blur events
  document.addEventListener('focus', handleFocusChange, true)
  document.addEventListener('blur', handleFocusChange, true)
  
  console.log('👁️ Focus watcher enabled (call returned function to stop)')
  
  // Return cleanup function
  return () => {
    document.removeEventListener('focus', handleFocusChange, true)
    document.removeEventListener('blur', handleFocusChange, true)
    console.log('👁️ Focus watcher disabled')
  }
}

/**
 * Debug roving focus containers
 */
export function debugRovingFocus(): void {
  const containers = document.querySelectorAll('[data-roving-focus]')
  
  console.group('🔄 ROVING FOCUS')
  console.log(`Found ${containers.length} container(s)`)
  
  containers.forEach((container, i) => {
    const orientation = container.getAttribute('data-roving-focus')
    const loop = container.getAttribute('data-roving-loop')
    const focusable = getFocusableElements(container as HTMLElement)
    
    console.log(`\nContainer ${i + 1}:`)
    console.log('  Orientation:', orientation)
    console.log('  Loop:', loop)
    console.log('  Focusable items:', focusable.length)
    console.log('  Items:', focusable)
  })
  
  console.groupEnd()
}

/**
 * Test focus trap (try to escape)
 */
export function testFocusTrap(): void {
  console.group('🧪 FOCUS TRAP TEST')
  
  const trap = document.querySelector('[data-focus-trap="active"]')
  
  if (!trap) {
    console.warn('No active focus trap found')
    console.groupEnd()
    return
  }
  
  const focusable = getFocusableElements(trap as HTMLElement)
  
  console.log('Testing focus trap...')
  console.log('Focusable elements:', focusable.length)
  
  if (focusable.length === 0) {
    console.error('❌ Trap has no focusable elements!')
  } else {
    console.log('✅ Trap has', focusable.length, 'focusable element(s)')
    console.log('First:', focusable[0])
    console.log('Last:', focusable[focusable.length - 1])
  }
  
  // Test Tab cycling
  console.log('\n📝 To test:')
  console.log('1. Focus first element')
  console.log('2. Press Tab repeatedly → should cycle')
  console.log('3. Press Shift+Tab → should cycle backwards')
  console.log('4. Press Escape → should close')
  
  console.groupEnd()
}

// Auto-expose to window in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugFocus = debugFocus;
  (window as any).debugFocusTraps = debugFocusTraps;
  (window as any).debugFocusScopes = debugFocusScopes;
  (window as any).debugRovingFocus = debugRovingFocus;
  (window as any).watchFocus = watchFocus;
  (window as any).testFocusTrap = testFocusTrap;
}
