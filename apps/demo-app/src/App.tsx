import { useState } from 'react';
import { Sheet } from '@intstudio/ds';

export default function App() {
  const [activeDemo, setActiveDemo] = useState('basic');
  
  return (
    <div style={{ padding: 40, fontFamily: 'system-ui, sans-serif' }}>
      <h1>DS Demo App - Sheet Testing</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>
        Clean demo app for testing Sheet component. No Storybook iframe bullshit.
      </p>
      
      {/* Demo selector */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32, borderBottom: '2px solid #eee', paddingBottom: 16 }}>
        <button 
          onClick={() => setActiveDemo('basic')}
          style={{
            padding: '8px 16px',
            background: activeDemo === 'basic' ? '#3b82f6' : '#f3f4f6',
            color: activeDemo === 'basic' ? 'white' : '#333',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Basic
        </button>
        <button 
          onClick={() => setActiveDemo('slots')}
          style={{
            padding: '8px 16px',
            background: activeDemo === 'slots' ? '#3b82f6' : '#f3f4f6',
            color: activeDemo === 'slots' ? 'white' : '#333',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          With Slots
        </button>
        <button 
          onClick={() => setActiveDemo('fullbleed')}
          style={{
            padding: '8px 16px',
            background: activeDemo === 'fullbleed' ? '#3b82f6' : '#f3f4f6',
            color: activeDemo === 'fullbleed' ? 'white' : '#333',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Full-Bleed
        </button>
      </div>
      
      {/* Active demo */}
      {activeDemo === 'basic' && <BasicDemo />}
      {activeDemo === 'slots' && <SlotsDemo />}
      {activeDemo === 'fullbleed' && <FullBleedDemo />}
    </div>
  );
}

function BasicDemo() {
  const [open, setOpen] = useState(false);
  
  return (
    <div>
      <h2>Basic Sheet</h2>
      <p>Simple sheet with content wrapper providing padding.</p>
      
      <button 
        onClick={() => setOpen(true)}
        style={{
          padding: '12px 24px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 16,
          fontWeight: 500,
        }}
      >
        Open Sheet
      </button>
      
      {open && (
        <Sheet
          ariaLabel="Basic Demo"
          open={open}
          onOpenChange={setOpen}
          snapPoints={[0.5, 0.9]}
          defaultSnap={0.5}
        >
          <Sheet.Header>
            <div style={{ padding: '16px 24px' }}>
              <h3 style={{ margin: 0 }}>Title</h3>
            </div>
          </Sheet.Header>
          
          <Sheet.Content>
            <div style={{ padding: '24px' }}>
              <p>This content has padding from the wrapper div.</p>
              <p>The Sheet.Content slot itself has ZERO padding.</p>
              <p>Inspect this in DevTools to verify.</p>
            </div>
          </Sheet.Content>
          
          <Sheet.Footer>
            <div style={{ padding: '16px 24px' }}>
              <button
                onClick={() => setOpen(false)}
                style={{
                  padding: '10px 20px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                Close
              </button>
            </div>
          </Sheet.Footer>
        </Sheet>
      )}
    </div>
  );
}

function SlotsDemo() {
  const [open, setOpen] = useState(false);
  
  return (
    <div>
      <h2>Sheet with All Slots</h2>
      <p>Header, Content, Footer with scroll.</p>
      
      <button 
        onClick={() => setOpen(true)}
        style={{
          padding: '12px 24px',
          background: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 16,
          fontWeight: 500,
        }}
      >
        Open Sheet
      </button>
      
      {open && (
        <Sheet
          ariaLabel="Slots Demo"
          open={open}
          onOpenChange={setOpen}
          snapPoints={[0.25, 0.5, 0.9]}
          defaultSnap={0.5}
          footerMode="auto"
        >
          <Sheet.Header>
            <div style={{ padding: '16px 24px' }}>
              <div style={{ fontWeight: 600, fontSize: 18 }}>Header Title</div>
              <div style={{ opacity: 0.7, fontSize: 14, marginTop: 4 }}>Subtitle text</div>
            </div>
          </Sheet.Header>
          
          <Sheet.Content>
            <div style={{ padding: '24px' }}>
              {Array.from({ length: 20 }).map((_, i) => (
                <p key={i}>Scrollable paragraph {i + 1}. The content area scrolls while header/footer stay sticky.</p>
              ))}
            </div>
          </Sheet.Content>
          
          <Sheet.Footer>
            <div style={{ padding: '16px 24px', display: 'flex', gap: 8 }}>
              <button
                onClick={() => setOpen(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'transparent',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Confirm
              </button>
            </div>
          </Sheet.Footer>
        </Sheet>
      )}
    </div>
  );
}

function FullBleedDemo() {
  const [open, setOpen] = useState(false);
  
  return (
    <div>
      <h2>Full-Bleed Media</h2>
      <p>Image area edge-to-edge, controls padded.</p>
      
      <button 
        onClick={() => setOpen(true)}
        style={{
          padding: '12px 24px',
          background: '#8b5cf6',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 16,
          fontWeight: 500,
        }}
      >
        Open Sheet
      </button>
      
      {open && (
        <Sheet
          ariaLabel="Full-Bleed Demo"
          open={open}
          onOpenChange={setOpen}
          snapPoints={[0.5, 0.9]}
          defaultSnap={0.9}
        >
          <Sheet.Content>
            <div>
              {/* Full-bleed image area */}
              <div style={{ 
                height: 240, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 24,
                fontWeight: 600,
              }}>
                Full-Bleed Media Area
              </div>
              
              {/* Padded controls */}
              <div style={{ padding: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0' }}>Photo Details</h3>
                <p style={{ color: '#666' }}>This demonstrates edge-to-edge media with padded content below.</p>
                <p style={{ color: '#666' }}>The media area has zero padding, touching the sheet edges.</p>
              </div>
            </div>
          </Sheet.Content>
          
          <Sheet.Footer data-footer-safe>
            <div style={{ padding: '16px 24px', display: 'flex', gap: 8 }}>
              <button
                onClick={() => setOpen(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'transparent',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
            </div>
          </Sheet.Footer>
        </Sheet>
      )}
    </div>
  );
}
