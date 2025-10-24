/**
 * SheetPanel Stories
 * 
 * Demonstrates non-modal app-shell panel patterns:
 * - Map + ride options (Uber/Lyft-style)
 * - Canvas + tool panel (Figma-style)
 * - Gesture routing between sheet and canvas
 * - URL binding and back button semantics
 */

import React, { useState, useRef, useCallback } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { SheetPanel, defaultGestureRouter } from '../../components/overlay/SheetPanel'
import type { GestureContext } from '../../components/overlay/SheetPanel'

// Wrapper component for stories
const SheetPanelDemo = () => <div />

const meta = {
  title: 'Overlay/SheetPanel',
  component: SheetPanelDemo,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SheetPanelDemo>

export default meta
type Story = StoryObj<typeof meta>

// Simulated map component
const SimulatedMap: React.FC<{
  isPanEnabled: boolean
  onPan?: () => void
}> = ({ isPanEnabled, onPan }) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isPanEnabled) return
    setIsDragging(true)
    setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !isPanEnabled) return
    setOffset({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y,
    })
    onPan?.()
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  return (
    <div
      data-testid="map-container"
      data-panned={offset.x !== 0 || offset.y !== 0 ? 'true' : 'false'}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#e5e7eb',
        cursor: isPanEnabled ? 'grab' : 'default',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Grid pattern */}
      <svg width="100%" height="100%" style={{ position: 'absolute' }}>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#d1d5db"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Map content (moves with pan) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease',
        }}
      >
        {/* Simulated markers */}
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          width: '32px',
          height: '32px',
          backgroundColor: '#3b82f6',
          borderRadius: '50% 50% 50% 0',
          transform: 'translate(-50%, -100%) rotate(-45deg)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '12px',
            height: '12px',
            backgroundColor: 'white',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%) rotate(45deg)',
          }} />
        </div>

        {/* Roads */}
        <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#fff" strokeWidth="4" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#fff" strokeWidth="4" />
        </svg>
      </div>

      {/* Status indicator */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        padding: '8px 12px',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 500,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        Map Pan: {isPanEnabled ? '✅ Enabled' : '🚫 Disabled'}
      </div>
    </div>
  )
}

// Ride option component
const RideOption: React.FC<{
  name: string
  eta: string
  price: string
  icon: string
  selected?: boolean
  onClick?: () => void
}> = ({ name, eta, price, icon, selected, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px',
      border: selected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
      borderRadius: '12px',
      backgroundColor: selected ? '#eff6ff' : 'white',
      cursor: 'pointer',
      transition: 'all 0.2s',
      width: '100%',
    }}
  >
    <div style={{ fontSize: '32px' }}>{icon}</div>
    <div style={{ flex: 1, textAlign: 'left' }}>
      <div style={{ fontWeight: 600, fontSize: '16px' }}>{name}</div>
      <div style={{ fontSize: '14px', color: '#6b7280' }}>{eta}</div>
    </div>
    <div style={{ fontWeight: 700, fontSize: '18px' }}>{price}</div>
  </button>
)

// Map + Panel Demo
export const MapWithRideOptions: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    const [mapPanEnabled, setMapPanEnabled] = useState(false)
    const [selectedRide, setSelectedRide] = useState<string>('uberx')

    const gestureRouter = useCallback((ctx: GestureContext) => {
      const owner = defaultGestureRouter(ctx)
      setMapPanEnabled(owner === 'canvas')
      return owner
    }, [])

    // Expose setSnap for Playwright tests
    React.useEffect(() => {
      ;(window as any).setSheetSnap = (snap: number) => {
        console.log('Setting snap to:', snap)
      }
    }, [])

    return (
      <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
        <SimulatedMap
          isPanEnabled={mapPanEnabled}
          onPan={() => console.log('Map panned')}
        />

        <SheetPanel
          open={open}
          onClose={() => setOpen(false)}
          snap={[0.25, 0.5, 0.9]}
          initialSnap={0.5}
          gestureRouter={gestureRouter}
          ariaLabel="Ride options"
          header={
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
                Choose a ride
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6b7280' }}>
                123 Main St → 456 Oak Ave
              </p>
            </div>
          }
          footer={
            <button
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Request {selectedRide === 'uberx' ? 'UberX' : selectedRide === 'comfort' ? 'Comfort' : 'Black'}
            </button>
          }
        >
          <div style={{ padding: '16px' }} data-testid="panel-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <RideOption
                icon="🚗"
                name="UberX"
                eta="3 min away"
                price="$12.50"
                selected={selectedRide === 'uberx'}
                onClick={() => setSelectedRide('uberx')}
              />
              <RideOption
                icon="✨"
                name="Comfort"
                eta="5 min away"
                price="$18.25"
                selected={selectedRide === 'comfort'}
                onClick={() => setSelectedRide('comfort')}
              />
              <RideOption
                icon="🎩"
                name="Black"
                eta="8 min away"
                price="$32.00"
                selected={selectedRide === 'black'}
                onClick={() => setSelectedRide('black')}
              />
            </div>

            {/* Instructions */}
            <div style={{
              marginTop: '24px',
              padding: '12px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#4b5563',
            }}>
              <strong>Try this:</strong>
              <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
                <li>At low snap (25%): Drag map → sheet moves</li>
                <li>At high snap (90%): Scroll list → sheet scrolls</li>
                <li>At high snap + top: Drag map → map pans ✅</li>
                <li>Press Esc: Collapse → Close</li>
              </ul>
            </div>
          </div>
        </SheetPanel>

        {/* Reopen button */}
        {!open && (
          <button
            onClick={() => setOpen(true)}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              padding: '16px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
            }}
          >
            Show Ride Options
          </button>
        )}
      </div>
    )
  },
}

// With URL Binding
export const WithURLBinding: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    const [currentSnap, setCurrentSnap] = useState(0.5)

    const routeBinding = {
      get: () => {
        const params = new URLSearchParams(window.location.search)
        const snap = params.get('panel')
        return snap ? parseFloat(snap) : null
      },
      set: (snap: number) => {
        const url = new URL(window.location.href)
        url.searchParams.set('panel', snap.toFixed(2))
        window.history.replaceState({}, '', url.toString())
        setCurrentSnap(snap)
      },
    }

    return (
      <div style={{ position: 'relative', height: '100vh', width: '100vw', backgroundColor: '#f3f4f6' }}>
        <SimulatedMap isPanEnabled={false} />

        <SheetPanel
          open={open}
          onClose={() => setOpen(false)}
          snap={[0.25, 0.5, 0.9]}
          routeBinding={routeBinding}
          ariaLabel="Panel with URL binding"
          header={
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
                URL Binding Demo
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6b7280' }}>
                Current snap: <strong>{currentSnap.toFixed(2)}</strong>
              </p>
            </div>
          }
        >
          <div style={{ padding: '24px' }}>
            <div style={{
              padding: '16px',
              backgroundColor: '#eff6ff',
              borderRadius: '8px',
              marginBottom: '16px',
              border: '1px solid #3b82f6',
            }}>
              <p style={{ margin: 0, fontWeight: 600, color: '#1e40af' }}>
                Check your URL bar for: <code>?panel=0.50</code>
              </p>
            </div>
            
            <h3 style={{ marginTop: 0 }}>How it works:</h3>
            <ul style={{ lineHeight: 1.6 }}>
              <li>Drag to different snap → URL updates automatically</li>
              <li>Browser back button → panel collapses to previous snap</li>
              <li>Refresh page → snap position restored from URL</li>
              <li>Share URL → opens at same snap position</li>
            </ul>

            <div style={{
              marginTop: '24px',
              padding: '12px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
            }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#4b5563' }}>
                <strong>Technical:</strong> Uses <code>URLSearchParams</code> + <code>history.replaceState</code>
              </p>
            </div>
          </div>
        </SheetPanel>

        {!open && (
          <button
            onClick={() => setOpen(true)}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              padding: '16px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
            }}
          >
            Open Panel
          </button>
        )}
      </div>
    )
  },
}

// Canvas + Tool Panel (Figma-style)
export const CanvasWithToolPanel: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    const [isDrawing, setIsDrawing] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const gestureRouter = useCallback((ctx: GestureContext) => {
      // If actively drawing, canvas owns all gestures
      if (isDrawing) return 'canvas'

      // Otherwise use default routing
      return defaultGestureRouter(ctx)
    }, [isDrawing])

    return (
      <div style={{ position: 'relative', height: '100vh', width: '100vw', backgroundColor: '#f3f4f6' }}>
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#fff',
            cursor: isDrawing ? 'crosshair' : 'default',
            border: '2px solid #e5e7eb',
          }}
        />

        {/* Drawing toggle */}
        <button
          onClick={() => setIsDrawing(!isDrawing)}
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            padding: '12px 20px',
            backgroundColor: isDrawing ? '#ef4444' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          {isDrawing ? '🎨 Drawing Mode ON' : '✏️ Enable Drawing'}
        </button>

        <SheetPanel
          open={open}
          onClose={() => setOpen(false)}
          snap={[0.3, 0.7]}
          initialSnap={0.3}
          gestureRouter={gestureRouter}
          ariaLabel="Drawing tools"
          header={
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
                Drawing Tools
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6b7280' }}>
                {isDrawing ? '🎨 Drawing mode active' : '✏️ Drawing mode off'}
              </p>
            </div>
          }
        >
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <button style={{
                padding: '16px 20px',
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                backgroundColor: 'white',
                fontSize: '24px',
                cursor: 'pointer',
              }}>🖊️</button>
              <button style={{
                padding: '16px 20px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: 'white',
                fontSize: '24px',
                cursor: 'pointer',
              }}>⭕</button>
              <button style={{
                padding: '16px 20px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: 'white',
                fontSize: '24px',
                cursor: 'pointer',
              }}>▭</button>
            </div>

            <div style={{
              marginTop: '16px',
              padding: '16px',
              backgroundColor: isDrawing ? '#fef3c7' : '#f3f4f6',
              borderRadius: '8px',
              border: isDrawing ? '2px solid #f59e0b' : '1px solid #e5e7eb',
            }}>
              <p style={{ fontSize: '14px', margin: '0 0 8px 0', fontWeight: 600 }}>
                <strong>Gesture Routing:</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: 1.6 }}>
                <li>Drawing mode <strong>ON</strong> → canvas owns all drags</li>
                <li>Drawing mode <strong>OFF</strong> → sheet gestures work</li>
              </ul>
            </div>
          </div>
        </SheetPanel>
      </div>
    )
  },
}

// Unsaved Changes Demo
export const WithUnsavedChanges: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    const [isDirty, setIsDirty] = useState(false)

    const onBackPressure = useCallback(() => {
      if (isDirty) {
        const confirm = window.confirm('You have unsaved changes. Close anyway?')
        return confirm ? 'close' : 'cancel'
      }
      return 'collapse'
    }, [isDirty])

    return (
      <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
        <SimulatedMap isPanEnabled={false} />

        <SheetPanel
          open={open}
          onClose={() => setOpen(false)}
          snap={[0.3, 0.7]}
          onBackPressure={onBackPressure}
          ariaLabel="Form with unsaved changes"
        >
          <div style={{ padding: '24px' }}>
            <h3>Edit Profile</h3>
            <input
              type="text"
              placeholder="Name"
              onChange={() => setIsDirty(true)}
              data-testid="make-dirty"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                marginTop: '16px',
              }}
            />
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: isDirty ? '#fef3c7' : '#f3f4f6',
              borderRadius: '8px',
            }}>
              Status: {isDirty ? '⚠️ Unsaved changes' : '✅ No changes'}
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '16px' }}>
              Try pressing Esc or Back with unsaved changes → confirmation dialog appears
            </p>
          </div>
        </SheetPanel>
      </div>
    )
  },
}
