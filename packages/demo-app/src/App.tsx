/**
 * Design System Demo App - God-Tier Showcase
 * 
 * Demonstrates ALL components with flexible width presets.
 * Shows: Blog, content platform, marketing site patterns.
 */

import React, { useState } from 'react'
import {
  // Context & Shell
  AppProvider,
  AppShell,
  TopBar,
  BottomNav,
  Drawer,
  Sheet,
  PullToRefresh,
  
  // Typography
  Display,
  Heading,
  Body,
  Label,
  
  // Surface
  Container,
  Card,
  Stack,
  Grid,
  Box,
  Divider,
  Spacer,
  
  // Interactive
  Button,
} from '@joseph-ehler/wizard-react'

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  
  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    console.log('Refreshed!')
  }
  
  return (
    <AppProvider tenantType="b2c" theme={theme} onThemeChange={setTheme}>
      <AppShell>
        {/* Top Bar */}
        <AppShell.TopBar>
          <TopBar 
            title="Design System"
            leftAction={
              <TopBar.IconButton 
                icon={<MenuIcon />} 
                onClick={() => setDrawerOpen(true)}
                label="Menu"
              />
            }
            rightAction={
              <TopBar.IconButton 
                icon={theme === 'light' ? <MoonIcon /> : <SunIcon />} 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                label="Toggle theme"
              />
            }
          />
        </AppShell.TopBar>
        
        {/* Main Content */}
        <AppShell.Content>
          <PullToRefresh onRefresh={handleRefresh}>
            {activeTab === 'home' && <HomeView onOpenSheet={() => setSheetOpen(true)} />}
            {activeTab === 'components' && <ComponentsView />}
            {activeTab === 'typography' && <TypographyView />}
          </PullToRefresh>
        </AppShell.Content>
        
        {/* Bottom Navigation */}
        <AppShell.BottomNav>
          <BottomNav value={activeTab} onChange={setActiveTab}>
            <BottomNav.Item value="home" icon={<HomeIcon />} label="Home" />
            <BottomNav.Item value="components" icon={<BoxIcon />} label="Components" badge={12} />
            <BottomNav.Item value="typography" icon={<TypeIcon />} label="Typography" />
          </BottomNav>
        </AppShell.BottomNav>
        
        {/* Side Drawer */}
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <Drawer.Content>
            <Stack spacing="normal">
              <Heading size="md">Menu</Heading>
              <Divider />
              <Button variant="ghost" fullWidth onClick={() => { setActiveTab('home'); setDrawerOpen(false); }}>
                🏠 Home
              </Button>
              <Button variant="ghost" fullWidth onClick={() => { setActiveTab('components'); setDrawerOpen(false); }}>
                📦 Components
              </Button>
              <Button variant="ghost" fullWidth onClick={() => { setActiveTab('typography'); setDrawerOpen(false); }}>
                ✍️ Typography
              </Button>
              <Divider />
              <Button variant="ghost" fullWidth onClick={() => setSheetOpen(true)}>
                🚀 About
              </Button>
            </Stack>
          </Drawer.Content>
        </Drawer>
        
        {/* Bottom Sheet */}
        <Sheet 
          open={sheetOpen} 
          onOpenChange={setSheetOpen}
          snapPoints={['120px', '50%', '90%']}
          defaultSnap="50%"
        >
          <Sheet.Content>
            <Stack spacing="normal">
              <Heading size="lg">About This Demo</Heading>
              <Body>
                This demo showcases our <strong>god-tier design system</strong> with:
              </Body>
              <Stack spacing="compact">
                <Body size="sm">✅ Typography System (Display, Heading, Body)</Body>
                <Body size="sm">✅ Surface System (Box, Card, Container, Stack, Grid)</Body>
                <Body size="sm">✅ Button System (8 variants)</Body>
                <Body size="sm">✅ UI Shell (AppShell, TopBar, BottomNav, Drawer, Sheet)</Body>
                <Body size="sm">✅ Gestures (Pull-to-refresh, swipe, snap)</Body>
                <Body size="sm">✅ Theme Support (Light/Dark)</Body>
                <Body size="sm">✅ Width Presets (flexible, content-first)</Body>
              </Stack>
              <Spacer size="md" />
              <Button fullWidth onClick={() => setSheetOpen(false)}>
                Got it!
              </Button>
            </Stack>
          </Sheet.Content>
        </Sheet>
      </AppShell>
    </AppProvider>
  )
}

// Home View - Hero + Features
function HomeView({ onOpenSheet }: { onOpenSheet: () => void }) {
  return (
    <Container maxWidth="max">
      <Stack spacing="loose">
        {/* Hero Section */}
        <Box padding="loose" style={{ textAlign: 'center' }}>
          <Display size="lg" style={{ marginBottom: 16 }}>
            God-Tier Design System
          </Display>
          <Body size="lg" variant="secondary">
            Mobile-first, tenant-aware, gesture-driven components
          </Body>
          <Spacer size="md" />
          <Stack spacing="normal" style={{ alignItems: 'center' }}>
            <Button variant="primary" size="lg" onClick={onOpenSheet}>
              Learn More
            </Button>
            <Button variant="ghost">
              View Components →
            </Button>
          </Stack>
        </Box>
        
        <Spacer size="lg" />
        
        {/* Feature Cards */}
        <Heading size="lg" style={{ textAlign: 'center' }}>Features</Heading>
        <Grid cols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="normal">
          <FeatureCard 
            title="Typography" 
            description="Fluid, responsive text scales for every use case"
            icon="✍️"
          />
          <FeatureCard 
            title="Gestures" 
            description="Native iOS/Android feel with swipe, snap, and pull"
            icon="👆"
          />
          <FeatureCard 
            title="Themes" 
            description="Perfect light and dark modes with auto-adaptation"
            icon="🌓"
          />
          <FeatureCard 
            title="Flat Design" 
            description="No shadows by default. Borders for separation."
            icon="⬜"
          />
          <FeatureCard 
            title="Width Presets" 
            description="7 flexible presets: prose, narrow, comfy, standard, wide, max"
            icon="📏"
          />
          <FeatureCard 
            title="Accessible" 
            description="WCAG AA compliant with keyboard navigation"
            icon="♿"
          />
        </Grid>
        
        <Spacer size="lg" />
        
        {/* Button Showcase */}
        <Card>
          <Stack spacing="normal">
            <Heading size="md">Button Variants</Heading>
            <Body variant="secondary">All 8 variants in action</Body>
            <Divider />
            <Grid cols={{ mobile: 1, tablet: 2 }} gap="normal">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="info">Info</Button>
              <Button variant="link">Link</Button>
            </Grid>
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
}

// Components View - All Surfaces
function ComponentsView() {
  return (
    <Container maxWidth="max">
      <Stack spacing="loose">
        <Heading size="xl">Surface Components</Heading>
        
        {/* Cards */}
        <Box>
          <Heading size="md">Cards</Heading>
          <Spacer size="sm" />
          <Grid cols={{ mobile: 1, tablet: 2 }} gap="normal">
            <Card>
              <Stack spacing="compact">
                <Heading size="sm">Default Card</Heading>
                <Body size="sm">Flat design with subtle background</Body>
              </Stack>
            </Card>
            <Card variant="glass">
              <Stack spacing="compact">
                <Heading size="sm">Glass Card</Heading>
                <Body size="sm">Frosted glass effect</Body>
              </Stack>
            </Card>
          </Grid>
        </Box>
        
        {/* Stacks */}
        <Card>
          <Stack spacing="normal">
            <Heading size="md">Stack Spacing</Heading>
            <Divider />
            <Stack spacing="compact">
              <Body size="sm" variant="muted">Compact spacing</Body>
              <Body size="sm" variant="muted">Perfect for lists</Body>
              <Body size="sm" variant="muted">Tight vertical rhythm</Body>
            </Stack>
            <Divider />
            <Stack spacing="normal">
              <Body size="sm">Normal spacing</Body>
              <Body size="sm">Default for most content</Body>
            </Stack>
            <Divider />
            <Stack spacing="loose">
              <Body size="sm">Loose spacing</Body>
              <Body size="sm">Breathable sections</Body>
            </Stack>
          </Stack>
        </Card>
        
        {/* Grid */}
        <Box>
          <Heading size="md">Responsive Grid</Heading>
          <Spacer size="sm" />
          <Grid cols={{ mobile: 2, tablet: 3, desktop: 4 }} gap="compact">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <Card key={i} style={{ textAlign: 'center', padding: '1rem' }}>
                <Body size="sm">Item {i}</Body>
              </Card>
            ))}
          </Grid>
        </Box>
        
        {/* Button Sizes */}
        <Card>
          <Stack spacing="normal">
            <Heading size="md">Button Sizes</Heading>
            <Divider />
            <Stack spacing="compact">
              <Button size="sm">Small</Button>
              <Button size="md">Medium (default)</Button>
              <Button size="lg">Large</Button>
              <Button fullWidth>Full Width</Button>
            </Stack>
          </Stack>
        </Card>
        
        {/* Button States */}
        <Card>
          <Stack spacing="normal">
            <Heading size="md">Button States</Heading>
            <Divider />
            <Grid cols={{ mobile: 1, tablet: 2 }} gap="compact">
              <Button>Normal</Button>
              <Button disabled>Disabled</Button>
              <Button loading>Loading</Button>
              <Button leftIcon={<PlusIcon />}>With Icon</Button>
            </Grid>
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
}

// Typography View - All Text Styles
function TypographyView() {
  return (
    <Container maxWidth="prose">
      <Stack spacing="loose">
        {/* Display */}
        <Box>
          <Label>Display (Marketing)</Label>
          <Display size="xl">Extra Large</Display>
          <Display size="lg">Large Display</Display>
          <Display size="md">Medium Display</Display>
        </Box>
        
        <Divider />
        
        {/* Headings */}
        <Box>
          <Label>Headings (App)</Label>
          <Heading size="xl">Extra Large Heading</Heading>
          <Heading size="lg">Large Heading</Heading>
          <Heading size="md">Medium Heading</Heading>
          <Heading size="sm">Small Heading</Heading>
          <Heading size="xs">Extra Small Heading</Heading>
        </Box>
        
        <Divider />
        
        {/* Body */}
        <Box>
          <Label>Body Text</Label>
          <Body size="xl">Extra large body text for emphasis</Body>
          <Body size="lg">Large body text for introductions</Body>
          <Body size="md">Medium body text (default). This is the optimal reading size with proper line height and spacing for comfortable long-form content.</Body>
          <Body size="sm">Small body text for captions and secondary information</Body>
          <Body size="xs">Extra small body text for fine print and metadata</Body>
        </Box>
        
        <Divider />
        
        {/* Variants */}
        <Box>
          <Label>Text Variants</Label>
          <Stack spacing="compact">
            <Body variant="primary">Primary text (default)</Body>
            <Body variant="secondary">Secondary text</Body>
            <Body variant="muted">Muted text</Body>
            <Body variant="info">Info text</Body>
            <Body variant="success">Success text</Body>
            <Body variant="warning">Warning text</Body>
            <Body variant="danger">Danger text</Body>
          </Stack>
        </Box>
        
        <Divider />
        
        {/* Reading Experience */}
        <Card>
          <Stack spacing="normal">
            <Heading size="md">Optimal Reading Width</Heading>
            <Body>
              This container uses <code>maxWidth="prose"</code> which sets the width to <strong>65ch</strong> — the optimal line length for reading.
            </Body>
            <Body>
              Research shows that lines between 50-75 characters are easiest to read. Our width preset system makes this effortless with the <code>prose</code> preset.
            </Body>
            <Body size="sm" variant="muted">
              Notice how comfortable it is to read this text? That's intentional design working for you.
            </Body>
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
}

// Feature Card Component
function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <Card>
      <Stack spacing="compact">
        <div style={{ fontSize: '2rem' }}>{icon}</div>
        <Heading size="sm">{title}</Heading>
        <Body size="sm" variant="secondary">{description}</Body>
      </Stack>
    </Card>
  )
}

// Icon Components (simple SVG icons)
function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M17 10.5A7 7 0 1 1 9.5 3a5.5 5.5 0 0 0 7.5 7.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M10 1v2M10 17v2M19 10h-2M3 10H1M16.5 3.5l-1.4 1.4M4.9 15.1l-1.4 1.4M16.5 16.5l-1.4-1.4M4.9 4.9L3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BoxIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 9h18M9 3v18" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function TypeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 7V4h16v3M9 20h6M12 4v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
