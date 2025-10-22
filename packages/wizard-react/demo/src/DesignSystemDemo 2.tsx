/**
 * Design System Demo - White-Label Showcase
 * 
 * Interactive demo of the complete design system with:
 * - Live brand/theme/tenant switching
 * - All component categories
 * - Responsive behavior
 * - Accessibility features
 */

import React from 'react'
import {
  AppProvider,
  applyBrand,
  getCurrentBrand,
  getCurrentTheme,
  getCurrentTenant,
  // Layout
  Stack,
  FormLayout,
  Container,
  Grid,
  Box,
  Card,
  Spacer,
  Divider,
  // Typography
  Display,
  Heading,
  Body,
  Text,
  Label,
  HelperText,
  Prose,
  // Interactive
  Button,
  // Shell (mobile)
  AppShell,
  TopBar,
  BottomNav,
  ContrastBadge,
  type BrandId,
  type ThemeMode,
  type TenantType,
} from '../../src/components'

// Demo sections
import { TypographyShowcase } from './sections/TypographyShowcase'
import { LayoutShowcase } from './sections/LayoutShowcase'
import { SectionShowcase } from './sections/SectionShowcase'
import { MediaShowcase } from './sections/MediaShowcase'
import { AccessibilityShowcase } from './sections/AccessibilityShowcase'
import { ButtonShowcase } from './sections/ButtonShowcase'
import { FormShowcase } from './sections/FormShowcase'
import { ProseShowcase } from './sections/ProseShowcase'
import { ThemeSwitcher } from './components/ThemeSwitcher'

type WidthPreset = 'prose' | 'narrow' | 'comfy' | 'standard' | 'wide' | 'max' | 'full'

export function DesignSystemDemo() {
  const [brand, setBrand] = React.useState<BrandId>('default')
  const [theme, setTheme] = React.useState<ThemeMode>('system')
  const [tenant, setTenant] = React.useState<TenantType>('b2c')
  const [activePreset, setActivePreset] = React.useState<WidthPreset>('max')
  const [showMobileShell, setShowMobileShell] = React.useState(false)

  // Apply brand/theme/tenant changes
  React.useEffect(() => {
    applyBrand({
      id: brand,
      theme,
      tenantType: tenant,
    })
  }, [brand, theme, tenant])

  if (showMobileShell) {
    return (
      <AppProvider tenantType={tenant} theme={theme}>
        <MobileShellDemo 
          onClose={() => setShowMobileShell(false)}
          brand={brand}
        />
      </AppProvider>
    )
  }

  return (
    <AppProvider tenantType={tenant} theme={theme}>
      {/* Contrast validation badge (dev only) */}
      <ContrastBadge position="bottom-left" />
      <Container maxWidth={activePreset} padding>
        <Stack spacing="relaxed">
          {/* Header */}
          <Box p="6">
            <Stack spacing="normal">
              <Display size="xl">Design System</Display>
              <Text size="lg" variant="secondary">
                White-label ready · Flat first · Mobile-native · 44 components
              </Text>
            </Stack>
          </Box>

          {/* Theme Switcher */}
          <Card padding="lg">
            <ThemeSwitcher
              brand={brand}
              theme={theme}
              tenant={tenant}
              activePreset={activePreset}
              onBrandChange={setBrand}
              onThemeChange={setTheme}
              onTenantChange={setTenant}
              setActivePreset={setActivePreset}
              onShowMobileShell={() => setShowMobileShell(true)}
            />
          </Card>

          <Divider />

          {/* Typography */}
          <section>
            <Stack spacing="normal">
              <Heading size="xl">Typography System</Heading>
              <Text variant="secondary">
                Responsive, theme-aware typography with atoms that are always neutral (margin: 0)
              </Text>
              <TypographyShowcase />
            </Stack>
          </section>

          <Divider />

          {/* Layout */}
          <section>
            <Stack spacing="normal">
              <Heading size="xl">Layout Primitives</Heading>
              <Text variant="secondary">
                4px grid, beautiful defaults (24px), 7 flexible width presets
              </Text>
              <LayoutShowcase tenant={tenant} />
            </Stack>
          </section>

          <Divider />

          {/* Section - Background Surfaces */}
          <section>
            <Stack spacing="normal">
              <Heading size="xl">Section - Background Surfaces</Heading>
              <Text variant="secondary">
                Full-bleed backgrounds, gradients, dividers, tone system
              </Text>
              <SectionShowcase />
            </Stack>
          </section>

          <Divider />

          {/* Media - Images & Video */}
          <section>
            <Stack spacing="normal">
              <Heading size="xl">Media - Images & Video</Heading>
              <Text variant="secondary">
                Aspect ratios, responsive images, video player, captions, overlays
              </Text>
              <MediaShowcase />
            </Stack>
          </section>

          <Divider />

          {/* Accessibility - Runtime Control */}
          <section>
            <Stack spacing="normal">
              <Heading size="xl">Accessibility - Runtime Control</Heading>
              <Text variant="secondary">
                One-click presets, custom controls, FAB menu, persistent preferences
              </Text>
              <AccessibilityShowcase />
            </Stack>
          </section>

          <Divider />

          {/* Buttons */}
          <section>
            <Stack spacing="normal">
              <Heading size="xl">Interactive Components</Heading>
              <Text variant="secondary">
                Flat design, theme-aware, accessible states
              </Text>
              <ButtonShowcase />
            </Stack>
          </section>

          <Divider />

          {/* Forms */}
          <section>
            <Stack spacing="normal">
              <Heading size="xl">Form Components</Heading>
              <Text variant="secondary">
                576px default width, 24px spacing, single-column by design
              </Text>
              <FormShowcase />
            </Stack>
          </section>

          <Divider />

          {/* Prose */}
          <section>
            <Stack spacing="normal">
              <Heading size="xl">Prose Component</Heading>
              <Text variant="secondary">
                The ONLY place where typography gets external margins (for CMS/markdown content)
              </Text>
              <ProseShowcase />
            </Stack>
          </section>

          {/* Footer */}
          <Spacer size="12" />
          <Box p="6">
            <Text size="sm" variant="muted" style={{ textAlign: 'center' }}>
              Design System v0.4.0 · {getCurrentBrand()} · {getCurrentTheme()} · {getCurrentTenant()}
            </Text>
          </Box>
        </Stack>
      </Container>
    </AppProvider>
  )
}

// Mobile Shell Demo
function MobileShellDemo({ 
  onClose, 
  brand 
}: { 
  onClose: () => void
  brand: BrandId 
}) {
  const [activeTab, setActiveTab] = React.useState(0)

  const navItems = [
    { label: 'Home', icon: '🏠' },
    { label: 'Explore', icon: '🔍' },
    { label: 'Profile', icon: '👤' },
  ]

  return (
    <AppShell>
      <AppShell.TopBar>
        <TopBar 
          title="Mobile Shell Demo"
          leftAction={{
            label: 'Close',
            onClick: onClose,
          }}
        />
      </AppShell.TopBar>

      <AppShell.Content>
        <Container padding>
          <Stack spacing="normal">
            <Card padding="lg">
              <Stack spacing="tight">
                <Heading size="lg">Mobile-Native Experience</Heading>
                <Text variant="secondary">
                  iOS/Android-native feel with safe areas, gestures, and 100dvh viewport
                </Text>
              </Stack>
            </Card>

            <Card padding="lg">
              <Stack spacing="tight">
                <Label>Current Brand</Label>
                <Display size="md" style={{ 
                  background: 'var(--ds-color-primary-bg)',
                  color: 'var(--ds-color-primary-text)',
                  padding: 'var(--ds-space-4)',
                  borderRadius: 'var(--ds-radius-lg)',
                  textAlign: 'center'
                }}>
                  {brand.toUpperCase()}
                </Display>
              </Stack>
            </Card>

            <Grid columns={2} gap="md">
              <Card padding="md">
                <Stack spacing="tight">
                  <Text size="sm" variant="muted">Safe Areas</Text>
                  <Heading size="sm">✅ iOS Notch</Heading>
                </Stack>
              </Card>
              <Card padding="md">
                <Stack spacing="tight">
                  <Text size="sm" variant="muted">Viewport</Text>
                  <Heading size="sm">✅ Dynamic</Heading>
                </Stack>
              </Card>
              <Card padding="md">
                <Stack spacing="tight">
                  <Text size="sm" variant="muted">Touch</Text>
                  <Heading size="sm">✅ 48px Min</Heading>
                </Stack>
              </Card>
              <Card padding="md">
                <Stack spacing="tight">
                  <Text size="sm" variant="muted">Gestures</Text>
                  <Heading size="sm">✅ Swipe</Heading>
                </Stack>
              </Card>
            </Grid>

            <Spacer size="20" />
          </Stack>
        </Container>
      </AppShell.Content>

      <AppShell.BottomNav>
        <BottomNav 
          items={navItems}
          activeIndex={activeTab}
          onItemClick={setActiveTab}
        />
      </AppShell.BottomNav>
    </AppShell>
  )
}
