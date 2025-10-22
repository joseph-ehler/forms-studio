/**
 * Theme Switcher - Live Brand/Theme/Tenant Controls
 */

import React from 'react'
import {
  Stack,
  Grid,
  Heading,
  Label,
  Text,
  Button,
  type BrandId,
  type ThemeMode,
  type TenantType,
} from '../../../src/components'

type WidthPreset = 'prose' | 'narrow' | 'comfy' | 'standard' | 'wide' | 'max' | 'full'

interface ThemeSwitcherProps {
  brand: BrandId
  theme: ThemeMode
  tenant: TenantType
  activePreset: WidthPreset
  onBrandChange: (brand: BrandId) => void
  onThemeChange: (theme: ThemeMode) => void
  onTenantChange: (tenant: TenantType) => void
  setActivePreset: (preset: WidthPreset) => void
  onShowMobileShell: () => void
}

export function ThemeSwitcher({
  brand,
  theme,
  tenant,
  activePreset,
  onBrandChange,
  onThemeChange,
  onTenantChange,
  setActivePreset,
  onShowMobileShell,
}: ThemeSwitcherProps) {
  const brands: { id: BrandId; name: string; color: string }[] = [
    { id: 'default', name: 'Default', color: 'Blue' },
    { id: 'acme', name: 'ACME', color: 'Violet' },
    { id: 'techcorp', name: 'TechCorp', color: 'Emerald' },
    { id: 'sunset', name: 'Sunset', color: 'Rose' },
  ]

  const themes: { id: ThemeMode; name: string }[] = [
    { id: 'light', name: '☀️ Light' },
    { id: 'dark', name: '🌙 Dark' },
    { id: 'system', name: '💻 System' },
  ]

  const tenants: { id: TenantType; name: string; width: string }[] = [
    { id: 'b2c', name: 'B2C', width: '1280px' },
    { id: 'b2b', name: 'B2B', width: '2560px' },
  ]

  return (
    <Stack spacing="normal">
      <Heading size="lg">Live Controls</Heading>
      <Text variant="secondary">
        Switch brands and themes in real-time (no rebuild!)
      </Text>

      {/* Brand Switcher */}
      <div>
        <Label>Brand (White-Label)</Label>
        <Grid columns={4} gap="sm" style={{ marginTop: '8px' }}>
          {brands.map((b) => (
            <Button
              key={b.id}
              variant={brand === b.id ? 'primary' : 'secondary'}
              onClick={() => onBrandChange(b.id)}
              style={{ fontSize: '14px' }}
            >
              {b.name}
            </Button>
          ))}
        </Grid>
        <Text size="sm" variant="muted" style={{ marginTop: '4px' }}>
          Current: {brands.find(b => b.id === brand)?.color} accent
        </Text>
      </div>

      {/* Theme Switcher */}
      <div>
        <Label>Theme Mode</Label>
        <Grid columns={3} gap="sm" style={{ marginTop: '8px' }}>
          {themes.map((t) => (
            <Button
              key={t.id}
              variant={theme === t.id ? 'primary' : 'secondary'}
              onClick={() => onThemeChange(t.id)}
              style={{ fontSize: '14px' }}
            >
              {t.name}
            </Button>
          ))}
        </Grid>
      </div>

      {/* Width Preset Switcher */}
      <div>
        <Label>Width Preset (Live Demo)</Label>
        <Grid columns={4} gap="sm" style={{ marginTop: '8px' }}>
          <Button
            variant={activePreset === 'prose' ? 'primary' : 'secondary'}
            onClick={() => setActivePreset('prose')}
            style={{ fontSize: '12px' }}
          >
            prose
          </Button>
          <Button
            variant={activePreset === 'narrow' ? 'primary' : 'secondary'}
            onClick={() => setActivePreset('narrow')}
            style={{ fontSize: '12px' }}
          >
            narrow
          </Button>
          <Button
            variant={activePreset === 'comfy' ? 'primary' : 'secondary'}
            onClick={() => setActivePreset('comfy')}
            style={{ fontSize: '12px' }}
          >
            comfy
          </Button>
          <Button
            variant={activePreset === 'standard' ? 'primary' : 'secondary'}
            onClick={() => setActivePreset('standard')}
            style={{ fontSize: '12px' }}
          >
            standard
          </Button>
        </Grid>
        <Grid columns={3} gap="sm" style={{ marginTop: '8px' }}>
          <Button
            variant={activePreset === 'wide' ? 'primary' : 'secondary'}
            onClick={() => setActivePreset('wide')}
            style={{ fontSize: '12px' }}
          >
            wide
          </Button>
          <Button
            variant={activePreset === 'max' ? 'primary' : 'secondary'}
            onClick={() => setActivePreset('max')}
            style={{ fontSize: '12px' }}
          >
            max
          </Button>
          <Button
            variant={activePreset === 'full' ? 'primary' : 'secondary'}
            onClick={() => setActivePreset('full')}
            style={{ fontSize: '12px' }}
          >
            full
          </Button>
        </Grid>
        <Text size="sm" variant="muted" style={{ marginTop: '8px' }}>
          {activePreset === 'prose' && 'prose: 65ch - Optimal reading by measure'}
          {activePreset === 'narrow' && 'narrow: 36rem (576px) - Auth, short forms'}
          {activePreset === 'comfy' && 'comfy: 42rem (672px) - Label-heavy forms'}
          {activePreset === 'standard' && 'standard: 56rem (896px) - Sections, marketing'}
          {activePreset === 'wide' && 'wide: 64rem (1024px) - Media-rich sections'}
          {activePreset === 'max' && 'max: 80rem (1280px) - Page default'}
          {activePreset === 'full' && 'full: 100% - Dashboards, canvases'}
        </Text>
      </div>

      {/* Mobile Shell Demo */}
      <div>
        <Label>Mobile Experience</Label>
        <Button
          variant="ghost"
          onClick={onShowMobileShell}
          style={{ marginTop: '8px', width: '100%' }}
        >
          📱 Show Mobile Shell Demo
        </Button>
      </div>
    </Stack>
  )
}
