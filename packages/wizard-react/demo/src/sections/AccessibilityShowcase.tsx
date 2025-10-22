/**
 * Accessibility Showcase - Runtime Control System
 * 
 * Demonstrates the Accessibility Control System (ACS) with:
 * - FAB for quick access
 * - Live preset switching
 * - Real-time visual feedback
 * - Persistent preferences
 */

import React from 'react'
import {
  FAB,
  FABMenu,
  FABItem,
  applyA11y,
  saveA11yPreferences,
  loadA11yPreferences,
  resetA11y,
  A11Y_PRESETS,
  type A11yProfile,
  Stack,
  Card,
  Grid,
  Heading,
  Text,
  Label,
  Divider,
  Button,
  FormLayout,
} from '../../../src/components'

export function AccessibilityShowcase() {
  const [fabOpen, setFabOpen] = React.useState(false)
  const [currentPreset, setCurrentPreset] = React.useState<string>('default')
  const [customSettings, setCustomSettings] = React.useState<A11yProfile>({})
  
  // Load saved preferences on mount
  React.useEffect(() => {
    const saved = loadA11yPreferences()
    if (saved) {
      applyA11y(saved)
      setCustomSettings(saved)
    }
  }, [])
  
  // Apply preset
  const handlePreset = (presetName: string, profile: A11yProfile) => {
    setCurrentPreset(presetName)
    applyA11y(profile)
    saveA11yPreferences(profile)
    setCustomSettings(profile)
    setFabOpen(false)
  }
  
  // Reset to defaults
  const handleReset = () => {
    resetA11y()
    setCurrentPreset('default')
    setCustomSettings({})
    setFabOpen(false)
  }
  
  // Custom control handlers
  const handleFontSize = (scale: number) => {
    const updated = { ...customSettings, sizeScale: scale }
    setCustomSettings(updated)
    applyA11y(updated)
    saveA11yPreferences(updated)
  }
  
  const handleLineHeight = (height: number) => {
    const updated = { ...customSettings, lineHeight: height }
    setCustomSettings(updated)
    applyA11y(updated)
    saveA11yPreferences(updated)
  }
  
  const handleToggle = (key: keyof A11yProfile, value: boolean) => {
    const updated = { ...customSettings, [key]: value }
    setCustomSettings(updated)
    applyA11y(updated)
    saveA11yPreferences(updated)
  }
  
  return (
    <>
      <Stack spacing="normal">
        {/* Introduction */}
        <Card padding="lg">
          <Stack spacing="tight">
            <Heading size="lg">Runtime Accessibility Control</Heading>
            <Text>
              The Accessibility Control System (ACS) lets users reshape the entire design system
              at runtime without rebuilding. All changes are instant and persist across sessions.
            </Text>
            <Divider />
            <Text size="sm" variant="muted">
              <strong>Current preset:</strong> {currentPreset}
            </Text>
          </Stack>
        </Card>

        {/* Quick Presets */}
        <Card padding="lg">
          <Stack spacing="tight">
            <Label>Quick Presets (One-Click)</Label>
            <Divider />
            
            <Grid columns={2} gap="md">
              <Button
                variant={currentPreset === 'readable' ? 'primary' : 'secondary'}
                onClick={() => handlePreset('readable', A11Y_PRESETS.readable)}
              >
                🔍 Readable
              </Button>
              
              <Button
                variant={currentPreset === 'dyslexia' ? 'primary' : 'secondary'}
                onClick={() => handlePreset('dyslexia', A11Y_PRESETS.dyslexia)}
              >
                📖 Dyslexia
              </Button>
              
              <Button
                variant={currentPreset === 'hyperlegible' ? 'primary' : 'secondary'}
                onClick={() => handlePreset('hyperlegible', A11Y_PRESETS.hyperlegible)}
              >
                📝 Hyperlegible
              </Button>
              
              <Button
                variant={currentPreset === 'lowVision' ? 'primary' : 'secondary'}
                onClick={() => handlePreset('lowVision', A11Y_PRESETS.lowVision)}
              >
                👁️ Low Vision
              </Button>
              
              <Button
                variant={currentPreset === 'motionSafe' ? 'primary' : 'secondary'}
                onClick={() => handlePreset('motionSafe', A11Y_PRESETS.motionSafe)}
              >
                🎬 Motion Safe
              </Button>
              
              <Button
                variant={currentPreset === 'colorblindSafe' ? 'primary' : 'secondary'}
                onClick={() => handlePreset('colorblindSafe', A11Y_PRESETS.colorblindSafe)}
              >
                🌈 Colorblind Safe
              </Button>
            </Grid>
            
            <Button variant="ghost" onClick={handleReset}>
              ↻ Reset to Defaults
            </Button>
          </Stack>
        </Card>

        {/* Font Size Control */}
        <Card padding="lg">
          <Stack spacing="tight">
            <Label>Font Size Scale</Label>
            <Divider />
            <Text size="sm" variant="muted">
              Current: {((customSettings.sizeScale || 1) * 100).toFixed(0)}%
            </Text>
            
            <Grid columns={5} gap="sm">
              <Button
                variant={customSettings.sizeScale === 1 ? 'primary' : 'secondary'}
                onClick={() => handleFontSize(1)}
              >
                100%
              </Button>
              <Button
                variant={customSettings.sizeScale === 1.1 ? 'primary' : 'secondary'}
                onClick={() => handleFontSize(1.1)}
              >
                110%
              </Button>
              <Button
                variant={customSettings.sizeScale === 1.25 ? 'primary' : 'secondary'}
                onClick={() => handleFontSize(1.25)}
              >
                125%
              </Button>
              <Button
                variant={customSettings.sizeScale === 1.5 ? 'primary' : 'secondary'}
                onClick={() => handleFontSize(1.5)}
              >
                150%
              </Button>
            </Grid>
            
            <Text size="sm" style={{ marginTop: '12px' }}>
              This text scales with your selection. Notice how all typography in the entire
              design system updates instantly!
            </Text>
          </Stack>
        </Card>

        {/* Line Height Control */}
        <Card padding="lg">
          <Stack spacing="tight">
            <Label>Line Height</Label>
            <Divider />
            <Text size="sm" variant="muted">
              Current: {(customSettings.lineHeight || 1).toFixed(1)}
            </Text>
            
            <Grid columns={4} gap="sm">
              <Button
                variant={customSettings.lineHeight === 1.2 ? 'primary' : 'secondary'}
                onClick={() => handleLineHeight(1.2)}
              >
                Tight (1.2)
              </Button>
              <Button
                variant={customSettings.lineHeight === 1.3 ? 'primary' : 'secondary'}
                onClick={() => handleLineHeight(1.3)}
              >
                Normal (1.3)
              </Button>
              <Button
                variant={customSettings.lineHeight === 1.4 ? 'primary' : 'secondary'}
                onClick={() => handleLineHeight(1.4)}
              >
                Relaxed (1.4)
              </Button>
              <Button
                variant={customSettings.lineHeight === 1.5 ? 'primary' : 'secondary'}
                onClick={() => handleLineHeight(1.5)}
              >
                Loose (1.5)
              </Button>
            </Grid>
            
            <Text size="sm" style={{ marginTop: '12px' }}>
              Line height affects reading comfort. More space between lines can help
              readers track their position, especially with dyslexia or low vision.
            </Text>
          </Stack>
        </Card>

        {/* Toggle Controls */}
        <Card padding="lg">
          <Stack spacing="tight">
            <Label>Additional Options</Label>
            <Divider />
            
            <Grid columns={2} gap="md">
              <Button
                variant={customSettings.underlineLinks ? 'primary' : 'secondary'}
                onClick={() => handleToggle('underlineLinks', !customSettings.underlineLinks)}
              >
                {customSettings.underlineLinks ? '✓' : '○'} Underline Links
              </Button>
              
              <Button
                variant={customSettings.highContrast ? 'primary' : 'secondary'}
                onClick={() => handleToggle('highContrast', !customSettings.highContrast)}
              >
                {customSettings.highContrast ? '✓' : '○'} High Contrast
              </Button>
              
              <Button
                variant={customSettings.reducedMotion ? 'primary' : 'secondary'}
                onClick={() => handleToggle('reducedMotion', !customSettings.reducedMotion)}
              >
                {customSettings.reducedMotion ? '✓' : '○'} Reduce Motion
              </Button>
              
              <Button
                variant={customSettings.readingRuler ? 'primary' : 'secondary'}
                onClick={() => handleToggle('readingRuler', !customSettings.readingRuler)}
              >
                {customSettings.readingRuler ? '✓' : '○'} Reading Ruler
              </Button>
            </Grid>
          </Stack>
        </Card>

        {/* Live Example */}
        <Card padding="lg">
          <Stack spacing="tight">
            <Label>Live Example</Label>
            <Divider />
            
            <Heading size="md">This is a Heading</Heading>
            <Text>
              This paragraph demonstrates how typography scales in real-time. The Accessibility
              Control System reshapes the entire design system instantly—no rebuild required.
              All changes persist across sessions using localStorage.
            </Text>
            
            <Text>
              Try the "Dyslexia" preset to see OpenDyslexic font, increased spacing, and
              left-aligned text. Or try "Low Vision" for 150% text size and high contrast colors.
            </Text>
            
            <div style={{ marginTop: '16px' }}>
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary" style={{ marginLeft: '8px' }}>Secondary Button</Button>
            </div>
          </Stack>
        </Card>

        {/* FormLayout Auto-Promotion Demo */}
        <Card padding="lg">
          <Stack spacing="tight">
            <Label>Smart Form Adaptation</Label>
            <Divider />
            
            <Text size="sm" variant="muted">
              When you scale text to 1.25x or larger, forms automatically widen from 36rem → 42rem
              to prevent cramped layouts. Watch the red border!
            </Text>
            
            <FormLayout 
              maxWidth="narrow"
              style={{ 
                border: '2px solid #ef4444',
                padding: '20px',
                background: 'var(--ds-color-surface-raised)',
                borderRadius: '8px',
                transition: 'max-width 300ms ease',
              }}
            >
              <Heading size="sm">Sign Up Form</Heading>
              <Text size="sm">
                Current width: {customSettings.sizeScale && customSettings.sizeScale >= 1.25 ? '42rem (comfy - AUTO-PROMOTED)' : '36rem (narrow)'}
              </Text>
              <Label>Email Address</Label>
              <Label>Password</Label>
              <Button variant="primary">Submit</Button>
            </FormLayout>
            
            <Text size="sm" variant="muted" style={{ marginTop: '12px' }}>
              💡 Try scaling to 125% or 150% and watch the form widen automatically!
            </Text>
          </Stack>
        </Card>

        {/* Tone Resolver Demo */}
        <Card padding="lg">
          <Stack spacing="tight">
            <Label>Tone Resolver - Auto-Detect Text Color</Label>
            <Divider />
            
            <Text size="sm" variant="muted">
              Section components automatically detect background luminance and apply safe text colors.
              Marketing gets loud brand colors, low vision gets guaranteed legibility!
            </Text>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Light background */}
              <div style={{ 
                background: '#FFF8DC',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e5e5e5',
              }}>
                <Text style={{ color: 'inherit' }}>
                  🌅 Cornsilk (light) → Auto-detected dark text (Luminance: 0.936)
                </Text>
              </div>
              
              {/* Dark background */}
              <div style={{ 
                background: '#1a1a1a',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #404040',
              }}>
                <Text style={{ color: '#fafafa' }}>
                  🌑 Dark gray → Auto-detected light text (Luminance: 0.010)
                </Text>
              </div>
              
              {/* Brand blue */}
              <div style={{ 
                background: '#3b82f6',
                padding: '16px',
                borderRadius: '8px',
              }}>
                <Text style={{ color: '#fafafa' }}>
                  💙 Blue-500 (brand) → Auto-detected light text (Luminance: 0.235)
                </Text>
              </div>
              
              {/* Pink marketing */}
              <div style={{ 
                background: '#FF6B9D',
                padding: '16px',
                borderRadius: '8px',
              }}>
                <Text style={{ color: '#fafafa' }}>
                  💗 Pink (marketing) → Auto-detected light text (Luminance: 0.342)
                </Text>
              </div>
              
              {/* Green */}
              <div style={{ 
                background: '#22c55e',
                padding: '16px',
                borderRadius: '8px',
              }}>
                <Text style={{ color: '#fafafa' }}>
                  💚 Green-500 → Auto-detected light text (Luminance: 0.411)
                </Text>
              </div>
            </div>
            
            <Text size="sm" variant="muted" style={{ marginTop: '12px' }}>
              💡 Threshold: 0.54 luminance (WCAG recommendation)
            </Text>
            
            <div style={{ 
              fontFamily: 'monospace', 
              fontSize: '11px',
              padding: '12px',
              background: 'var(--ds-color-surface-subtle)',
              borderRadius: '4px',
            }}>
              <div>Luminance {'>'}0.54 → dark text (light background)</div>
              <div>Luminance {'<'}0.54 → light text (dark background)</div>
              <div>Works with: solid colors, gradients, images!</div>
            </div>
          </Stack>
        </Card>

        {/* Semantic Sizing Demo */}
        <Card padding="lg">
          <Stack spacing="tight">
            <Label>Semantic Sizing - Hierarchy Preserved</Label>
            <Divider />
            
            <Text size="sm" variant="muted">
              Headings use importance levels (critical/primary/secondary) instead of pixel sizes.
              Hierarchy is preserved at ANY scale - critical items get EXTRA emphasis at lowVision!
            </Text>
            
            <div style={{ 
              padding: '20px',
              background: 'var(--ds-color-surface-raised)',
              borderRadius: '8px',
              border: '2px solid #3b82f6',
            }}>
              <Stack spacing="normal">
                <Heading importance="critical">Critical: Hero Headline</Heading>
                <Heading importance="primary">Primary: Page Title</Heading>
                <Heading importance="secondary">Secondary: Section Heading</Heading>
                <Heading importance="tertiary">Tertiary: Card Title</Heading>
                <Heading importance="minor">Minor: Caption Text</Heading>
              </Stack>
            </div>
            
            <Text size="sm" variant="muted" style={{ marginTop: '12px' }}>
              💡 Try lowVision preset - critical items scale 1.5x, primary 1.3x, maintaining hierarchy!
            </Text>
            
            <div style={{ 
              fontFamily: 'monospace', 
              fontSize: '11px',
              padding: '12px',
              background: 'var(--ds-color-surface-subtle)',
              borderRadius: '4px',
            }}>
              <div>critical: 1.5x multiplier (2.25rem base × 1.5 × a11yScale)</div>
              <div>primary: 1.3x multiplier (1.875rem base × 1.3 × a11yScale)</div>
              <div>secondary: 1.15x multiplier (1.5rem base × 1.15 × a11yScale)</div>
              <div>tertiary: 1.0x multiplier (1.125rem base × 1.0 × a11yScale)</div>
              <div>minor: 0.95x multiplier (0.875rem base × 0.95 × a11yScale)</div>
            </div>
          </Stack>
        </Card>

        {/* Preset Details */}
        <Card padding="lg">
          <Stack spacing="tight">
            <Label>Preset Details</Label>
            <Divider />
            
            <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
              <div><strong>Readable:</strong> 1.1x text, 1.3 line height, slight letter spacing</div>
              <div><strong>Dyslexia:</strong> OpenDyslexic font, 1.15x text, increased word/letter spacing, underlined links</div>
              <div><strong>Hyperlegible:</strong> Atkinson Hyperlegible font, 1.1x text</div>
              <div><strong>Low Vision:</strong> 1.5x text, high contrast, 56px touch targets, thicker focus rings</div>
              <div><strong>Motion Safe:</strong> All animations disabled</div>
              <div><strong>Colorblind Safe:</strong> Deuteranopia-safe color palette</div>
            </div>
          </Stack>
        </Card>

        {/* Technical Info */}
        <Card padding="lg">
          <Stack spacing="tight">
            <Label>How It Works</Label>
            <Divider />
            
            <Text size="sm">
              <strong>Runtime Control:</strong> Changes CSS custom properties on :root instantly.
            </Text>
            <Text size="sm">
              <strong>Zero Rebuilds:</strong> No compilation needed, works at runtime.
            </Text>
            <Text size="sm">
              <strong>Persistent:</strong> Preferences saved to localStorage and restored on page load.
            </Text>
            <Text size="sm">
              <strong>System Integration:</strong> Respects prefers-reduced-motion and other system preferences.
            </Text>
            <Text size="sm">
              <strong>Universal:</strong> Affects every component in the design system automatically.
            </Text>
          </Stack>
        </Card>
      </Stack>

      {/* FAB for Quick Access */}
      <FAB
        expanded={fabOpen}
        onToggle={() => setFabOpen(!fabOpen)}
        ariaLabel="Accessibility settings"
        position="bottom-right"
        menu={
          <FABMenu>
            <FABItem 
              icon="🔍" 
              onClick={() => handlePreset('readable', A11Y_PRESETS.readable)}
            >
              Readable
            </FABItem>
            <FABItem 
              icon="📖" 
              onClick={() => handlePreset('dyslexia', A11Y_PRESETS.dyslexia)}
            >
              Dyslexia Mode
            </FABItem>
            <FABItem 
              icon="📝" 
              onClick={() => handlePreset('hyperlegible', A11Y_PRESETS.hyperlegible)}
            >
              Hyperlegible
            </FABItem>
            <FABItem 
              icon="👁️" 
              onClick={() => handlePreset('lowVision', A11Y_PRESETS.lowVision)}
            >
              Low Vision
            </FABItem>
            <FABItem 
              icon="🎬" 
              onClick={() => handlePreset('motionSafe', A11Y_PRESETS.motionSafe)}
            >
              Motion Safe
            </FABItem>
            <FABItem 
              icon="🌈" 
              onClick={() => handlePreset('colorblindSafe', A11Y_PRESETS.colorblindSafe)}
            >
              Colorblind Safe
            </FABItem>
            <FABItem 
              icon="↻" 
              onClick={handleReset}
            >
              Reset Defaults
            </FABItem>
          </FABMenu>
        }
      >
        ♿
      </FAB>
    </>
  )
}
