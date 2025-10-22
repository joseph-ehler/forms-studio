/**
 * Layout Showcase - Layout Primitives Demo
 */

import React from 'react'
import {
  Stack,
  Grid,
  Card,
  Box,
  Spacer,
  Divider,
  FormLayout,
  Container,
  Heading,
  Text,
  Label,
  HelperText,
  type TenantType,
} from '../../../src/components'

interface LayoutShowcaseProps {
  tenant: TenantType
}

export function LayoutShowcase({ tenant }: LayoutShowcaseProps) {
  return (
    <Stack spacing="normal">
      {/* Stack */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Stack (Vertical Spacing)</Label>
          <Divider />
          <Text size="sm" variant="muted">Stack with "tight" spacing (12px):</Text>
          <Box p="4" style={{ background: 'var(--ds-color-surface-subtle)', borderRadius: 'var(--ds-radius-md)' }}>
            <Stack spacing="tight">
              <Text>Item 1</Text>
              <Text>Item 2</Text>
              <Text>Item 3</Text>
            </Stack>
          </Box>
          
          <Spacer size="2" />
          
          <Text size="sm" variant="muted">Stack with "normal" spacing (24px - beautiful default!):</Text>
          <Box p="4" style={{ background: 'var(--ds-color-surface-subtle)', borderRadius: 'var(--ds-radius-md)' }}>
            <Stack spacing="normal">
              <Text>Item 1</Text>
              <Text>Item 2</Text>
              <Text>Item 3</Text>
            </Stack>
          </Box>
          
          <Spacer size="2" />
          
          <Text size="sm" variant="muted">Stack with "relaxed" spacing (32px):</Text>
          <Box p="4" style={{ background: 'var(--ds-color-surface-subtle)', borderRadius: 'var(--ds-radius-md)' }}>
            <Stack spacing="relaxed">
              <Text>Item 1</Text>
              <Text>Item 2</Text>
              <Text>Item 3</Text>
            </Stack>
          </Box>
          
          <HelperText variant="hint">
            Uses CSS gap property - no margins on children!
          </HelperText>
        </Stack>
      </Card>

      {/* Grid */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Grid (Responsive Columns)</Label>
          <Divider />
          
          <Text size="sm" variant="muted">2 Columns (mobile: 1, tablet: 2):</Text>
          <Grid columns={2} gap="md">
            <Box p="4" style={{ background: 'var(--ds-color-surface-subtle)', borderRadius: 'var(--ds-radius-md)', textAlign: 'center' }}>
              <Text>Col 1</Text>
            </Box>
            <Box p="4" style={{ background: 'var(--ds-color-surface-subtle)', borderRadius: 'var(--ds-radius-md)', textAlign: 'center' }}>
              <Text>Col 2</Text>
            </Box>
          </Grid>
          
          <Spacer size="2" />
          
          <Text size="sm" variant="muted">3 Columns (mobile: 1, tablet: 2, desktop: 3):</Text>
          <Grid columns={3} gap="md">
            <Box p="4" style={{ background: 'var(--ds-color-surface-subtle)', borderRadius: 'var(--ds-radius-md)', textAlign: 'center' }}>
              <Text>1</Text>
            </Box>
            <Box p="4" style={{ background: 'var(--ds-color-surface-subtle)', borderRadius: 'var(--ds-radius-md)', textAlign: 'center' }}>
              <Text>2</Text>
            </Box>
            <Box p="4" style={{ background: 'var(--ds-color-surface-subtle)', borderRadius: 'var(--ds-radius-md)', textAlign: 'center' }}>
              <Text>3</Text>
            </Box>
          </Grid>
          
          <HelperText variant="hint">
            Pure CSS - no Tailwind dependency!
          </HelperText>
        </Stack>
      </Card>

      {/* FormLayout */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>FormLayout (576px Constrained)</Label>
          <Divider />
          <Text size="sm" variant="muted">
            Forms are single-column and constrained by default for better focus and readability
          </Text>
          
          <Box style={{ background: 'var(--ds-color-surface-subtle)', borderRadius: 'var(--ds-radius-md)', padding: 'var(--ds-space-4)' }}>
            <FormLayout maxWidth="xl">
              <Box p="4" style={{ background: 'var(--ds-color-surface-base)', border: '2px dashed var(--ds-color-border-subtle)', borderRadius: 'var(--ds-radius-md)', textAlign: 'center' }}>
                <Text>Content constrained to 576px</Text>
              </Box>
            </FormLayout>
          </Box>
          
          <HelperText variant="hint">
            Default 24px spacing between form elements
          </HelperText>
        </Stack>
      </Card>

      {/* Container & Width Presets - Updated! */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Container (Width Presets)</Label>
          <Divider />
          <Text size="sm" variant="muted">
            7 flexible presets: <strong>prose, narrow, comfy, standard, wide, max, full</strong>
          </Text>
          <Text size="sm" variant="muted">
            Choose by content type, not tenant!
          </Text>
          
          <Stack spacing="tight">
            {/* Prose - 65ch */}
            <Box style={{ background: 'var(--ds-color-surface-subtle)', borderRadius: 'var(--ds-radius-md)', padding: 'var(--ds-space-2)' }}>
              <Container maxWidth="prose">
                <Box style={{ background: 'var(--ds-color-primary-bg)', color: 'var(--ds-color-primary-text)', borderRadius: 'var(--ds-radius-sm)', padding: 'var(--ds-space-2)', textAlign: 'center' }}>
                  <Text size="sm">prose: 65ch</Text>
                </Box>
              </Container>
            </Box>
            
            {/* Narrow - 36rem */}
            <Box style={{ background: 'var(--ds-color-surface-subtle)', borderRadius: 'var(--ds-radius-md)', padding: 'var(--ds-space-2)' }}>
              <Container maxWidth="narrow">
                <Box style={{ background: 'var(--ds-color-primary-bg)', color: 'var(--ds-color-primary-text)', borderRadius: 'var(--ds-radius-sm)', padding: 'var(--ds-space-2)', textAlign: 'center' }}>
                  <Text size="sm">narrow: 36rem (576px)</Text>
                </Box>
              </Container>
            </Box>
            
            {/* Standard - 56rem */}
            <Box style={{ background: 'var(--ds-color-surface-subtle)', borderRadius: 'var(--ds-radius-md)', padding: 'var(--ds-space-2)' }}>
              <Container maxWidth="standard">
                <Box style={{ background: 'var(--ds-color-primary-bg)', color: 'var(--ds-color-primary-text)', borderRadius: 'var(--ds-radius-sm)', padding: 'var(--ds-space-2)', textAlign: 'center' }}>
                  <Text size="sm">standard: 56rem (896px)</Text>
                </Box>
              </Container>
            </Box>
            
            {/* Max - 80rem */}
            <Box style={{ background: 'var(--ds-color-surface-subtle)', borderRadius: 'var(--ds-radius-md)', padding: 'var(--ds-space-2)' }}>
              <Container maxWidth="max">
                <Box style={{ background: 'var(--ds-color-primary-bg)', color: 'var(--ds-color-primary-text)', borderRadius: 'var(--ds-radius-sm)', padding: 'var(--ds-space-2)', textAlign: 'center' }}>
                  <Text size="sm">max: 80rem (1280px) - default</Text>
                </Box>
              </Container>
            </Box>
          </Stack>
          
          <HelperText variant="hint">
            prose (reading) · narrow (forms) · standard (sections) · max (pages)
          </HelperText>
        </Stack>
      </Card>

      {/* Box & Card */}
      <Grid columns={2} gap="md">
        <Card padding="lg">
          <Stack spacing="tight">
            <Label>Box (Universal Container)</Label>
            <Divider />
            <Box p="6" style={{ background: 'var(--ds-color-surface-subtle)', borderRadius: 'var(--ds-radius-md)' }}>
              <Text>Padding utilities</Text>
            </Box>
            <HelperText variant="hint">
              Spacing, bg, borders
            </HelperText>
          </Stack>
        </Card>

        <Card padding="lg">
          <Stack spacing="tight">
            <Label>Card (Flat Surface)</Label>
            <Divider />
            <Card padding="md" border>
              <Text>No shadow!</Text>
            </Card>
            <HelperText variant="hint">
              Flat first design
            </HelperText>
          </Stack>
        </Card>
      </Grid>

      {/* 4px Grid */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>4px Mathematical Grid</Label>
          <Divider />
          <Text size="sm" variant="muted">
            All spacing values are multiples of 4px for perfect alignment
          </Text>
          <Grid columns={4} gap="sm">
            <Box p="1" style={{ background: 'var(--ds-color-primary-bg)', height: '4px' }}></Box>
            <Box p="2" style={{ background: 'var(--ds-color-primary-bg)', height: '8px' }}></Box>
            <Box p="3" style={{ background: 'var(--ds-color-primary-bg)', height: '12px' }}></Box>
            <Box p="4" style={{ background: 'var(--ds-color-primary-bg)', height: '16px' }}></Box>
            <Box p="6" style={{ background: 'var(--ds-color-primary-bg)', height: '24px' }}></Box>
            <Box p="8" style={{ background: 'var(--ds-color-primary-bg)', height: '32px' }}></Box>
            <Box p="12" style={{ background: 'var(--ds-color-primary-bg)', height: '48px' }}></Box>
            <Box p="16" style={{ background: 'var(--ds-color-primary-bg)', height: '64px' }}></Box>
          </Grid>
          <HelperText variant="hint">
            4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
          </HelperText>
        </Stack>
      </Card>
    </Stack>
  )
}
