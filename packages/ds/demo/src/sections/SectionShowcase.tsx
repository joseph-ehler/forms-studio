/**
 * Section Showcase - Background & Surface Patterns
 * 
 * Demonstrates Section primitive with all features:
 * - Semantic backgrounds
 * - Gradients & overlays
 * - Tone system (text contrast)
 * - Dividers & borders
 * - Auto-container mode
 */

import React from 'react'
import {
  Section,
  Container,
  Stack,
  Card,
  Grid,
  Box,
  Display,
  Heading,
  Text,
  Label,
  Divider,
} from '../../../src/components'

// Wrapper to constrain Section examples within demo cards
const SectionDemoWrapper: React.FC<{ children: React.ReactNode; bg?: string }> = ({ 
  children, 
  bg = 'var(--ds-color-surface-subtle)' 
}) => (
  <div style={{ 
    background: bg,
    borderRadius: 'var(--ds-radius-md)', 
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  }}>
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      {children}
    </div>
  </div>
)

// Style override to constrain Section's edge-to-edge behavior for demo purposes
const constrainedSectionStyle: React.CSSProperties = {
  width: '100%',
  left: 'auto',
  right: 'auto',
  marginLeft: '0',
  marginRight: '0',
}

export function SectionShowcase() {
  return (
    <Stack spacing="normal">
      {/* Pattern 1: Hero Section */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Pattern: Hero Section</Label>
          <Divider />
          <Text size="sm" variant="muted">
            Full-bleed background + gradient overlay + tone inversion + narrow content
          </Text>
          
          {/* Demo wrapper to constrain Section */}
          <SectionDemoWrapper>
            <Section 
              bg="primary" 
              gradient="bottom" 
              tone="dark"
              paddingY="xl"
              maxWidth="narrow"
              padding
              style={{ 
                width: '100%',
                left: 'auto',
                right: 'auto',
                marginLeft: '0',
                marginRight: '0',
              }}
            >
              <Display size="lg">Hero Title</Display>
              <Text size="lg">
                Beautiful hero section with automatic text contrast
              </Text>
            </Section>
          </SectionDemoWrapper>
          
          <Text size="xs" variant="muted" style={{ fontFamily: 'monospace' }}>
            {`<Section bg="primary" gradient="bottom" tone="dark" paddingY="xl" maxWidth="narrow" padding>`}
          </Text>
        </Stack>
      </Card>

      {/* Pattern 2: Feature Stripe */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Pattern: Feature Stripe</Label>
          <Divider />
          <Text size="sm" variant="muted">
            Subtle background + clean borders + standard width
          </Text>
          
          <SectionDemoWrapper bg="var(--ds-color-surface-base)">
            <Section 
              bg="subtle" 
              borderTop
              borderBottom
              paddingY="lg"
              style={constrainedSectionStyle}
            >
              <Container maxWidth="standard" padding>
                <Heading size="lg">Key Features</Heading>
                <Grid columns={3} gap="md" style={{ marginTop: '16px' }}>
                  <Box p="4" style={{ 
                    background: 'var(--ds-color-surface-base)', 
                    borderRadius: 'var(--ds-radius-sm)' 
                  }}>
                    <Text size="sm">🚀 Fast</Text>
                  </Box>
                  <Box p="4" style={{ 
                    background: 'var(--ds-color-surface-base)', 
                    borderRadius: 'var(--ds-radius-sm)' 
                  }}>
                    <Text size="sm">🎨 Beautiful</Text>
                  </Box>
                  <Box p="4" style={{ 
                    background: 'var(--ds-color-surface-base)', 
                    borderRadius: 'var(--ds-radius-sm)' 
                  }}>
                    <Text size="sm">♿ Accessible</Text>
                  </Box>
                </Grid>
              </Container>
            </Section>
          </SectionDemoWrapper>
          
          <Text size="xs" variant="muted" style={{ fontFamily: 'monospace' }}>
            {`<Section bg="subtle" dividerTop="wave" dividerBottom="wave">`}
          </Text>
        </Stack>
      </Card>

      {/* Pattern 3: All Backgrounds */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>All Background Tones</Label>
          <Divider />
          
          <Stack spacing="tight">
            {/* Transparent */}
            <SectionDemoWrapper>
              <Section bg="transparent" paddingY="sm" style={constrainedSectionStyle}>
                <Container maxWidth="standard" padding>
                  <Text size="sm">transparent - No background</Text>
                </Container>
              </Section>
            </SectionDemoWrapper>
            
            {/* Base */}
            <SectionDemoWrapper>
              <Section bg="base" paddingY="sm" style={constrainedSectionStyle}>
                <Container maxWidth="standard" padding>
                  <Text size="sm">base - Default surface</Text>
                </Container>
              </Section>
            </SectionDemoWrapper>
            
            {/* Subtle */}
            <SectionDemoWrapper bg="var(--ds-color-surface-base)">
              <Section bg="subtle" paddingY="sm" style={constrainedSectionStyle}>
                <Container maxWidth="standard" padding>
                  <Text size="sm">subtle - Soft contrast</Text>
                </Container>
              </Section>
            </SectionDemoWrapper>
            
            {/* Elevated */}
            <SectionDemoWrapper bg="var(--ds-color-surface-base)">
              <Section bg="elevated" paddingY="sm" style={constrainedSectionStyle}>
                <Container maxWidth="standard" padding>
                  <Text size="sm">elevated - Raised surface</Text>
                </Container>
              </Section>
            </SectionDemoWrapper>
            
            {/* Primary */}
            <SectionDemoWrapper bg="var(--ds-color-surface-base)">
              <Section bg="primary" tone="dark" paddingY="sm" style={constrainedSectionStyle}>
                <Container maxWidth="standard" padding>
                  <Text size="sm">primary - Brand color (tone="dark" for contrast)</Text>
                </Container>
              </Section>
            </SectionDemoWrapper>
            
            {/* Accent */}
            <SectionDemoWrapper bg="var(--ds-color-surface-base)">
              <Section bg="accent" tone="dark" paddingY="sm" style={constrainedSectionStyle}>
                <Container maxWidth="standard" padding>
                  <Text size="sm">accent - Link/highlight color</Text>
                </Container>
              </Section>
            </SectionDemoWrapper>
          </Stack>
        </Stack>
      </Card>

      {/* Pattern 4: Gradient Overlays */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Gradient Overlays (for images/video)</Label>
          <Divider />
          <Text size="sm" variant="muted">
            Ensures text contrast over background media
          </Text>
          
          <Grid columns={3} gap="md">
            {/* Top gradient */}
            <SectionDemoWrapper>
              <Section 
                bg="primary" 
                gradient="top"
                tone="dark"
                paddingY="md"
                style={constrainedSectionStyle}
              >
                <Container maxWidth="standard" padding>
                  <Text size="sm">gradient="top"</Text>
                </Container>
              </Section>
            </SectionDemoWrapper>
            
            {/* Bottom gradient */}
            <SectionDemoWrapper>
              <Section 
                bg="primary" 
                gradient="bottom"
                tone="dark"
                paddingY="md"
                style={constrainedSectionStyle}
              >
                <Container maxWidth="standard" padding>
                  <Text size="sm">gradient="bottom"</Text>
                </Container>
              </Section>
            </SectionDemoWrapper>
            
            {/* Cover gradient */}
            <SectionDemoWrapper>
              <Section 
                bg="primary" 
                gradient="cover"
                tone="dark"
                paddingY="md"
                style={constrainedSectionStyle}
              >
                <Container maxWidth="standard" padding>
                  <Text size="sm">gradient="cover"</Text>
                </Container>
              </Section>
            </SectionDemoWrapper>
          </Grid>
        </Stack>
      </Card>

      {/* Pattern 5: Vertical Rhythm */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Vertical Rhythm (paddingY)</Label>
          <Divider />
          
          <Grid columns={4} gap="md">
            <SectionDemoWrapper>
              <Section bg="base" paddingY="sm" style={constrainedSectionStyle}>
                <Container maxWidth="standard" padding>
                  <Text size="sm">sm: 32px</Text>
                </Container>
              </Section>
            </SectionDemoWrapper>
            
            <SectionDemoWrapper>
              <Section bg="base" paddingY="md" style={constrainedSectionStyle}>
                <Container maxWidth="standard" padding>
                  <Text size="sm">md: 48px</Text>
                </Container>
              </Section>
            </SectionDemoWrapper>
            
            <SectionDemoWrapper>
              <Section bg="base" paddingY="lg" style={constrainedSectionStyle}>
                <Container maxWidth="standard" padding>
                  <Text size="sm">lg: 64px</Text>
                </Container>
              </Section>
            </SectionDemoWrapper>
            
            <SectionDemoWrapper>
              <Section bg="base" paddingY="xl" style={constrainedSectionStyle}>
                <Container maxWidth="standard" padding>
                  <Text size="sm">xl: 80px</Text>
                </Container>
              </Section>
            </SectionDemoWrapper>
          </Grid>
        </Stack>
      </Card>

      {/* Pattern 6: Auto-Container Mode */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Auto-Container Convenience Mode</Label>
          <Divider />
          <Text size="sm" variant="muted">
            Provide <strong>maxWidth</strong> prop to auto-wrap children in Container
          </Text>
          
          <SectionDemoWrapper>
            <Section bg="subtle" maxWidth="narrow" padding paddingY="md" style={constrainedSectionStyle}>
              <Heading size="md">Auto-wrapped Content</Heading>
              <Text size="sm">
                This content is automatically wrapped in a Container with maxWidth="narrow"
              </Text>
            </Section>
          </SectionDemoWrapper>
          
          <Text size="xs" variant="muted" style={{ fontFamily: 'monospace' }}>
            {`<Section bg="subtle" maxWidth="narrow" padding>`}
          </Text>
          
          <Text size="xs" variant="muted">
            ✅ Use for simple cases • ⚠️ Explicit Container recommended for complex layouts
          </Text>
        </Stack>
      </Card>
    </Stack>
  )
}
