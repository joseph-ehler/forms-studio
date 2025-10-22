/**
 * Button Showcase - All Button Variants & States
 */

import React from 'react'
import {
  Stack,
  Grid,
  Card,
  Heading,
  Text,
  Label,
  Button,
  Divider,
  HelperText,
} from '../../../src/components'

export function ButtonShowcase() {
  const [loading, setLoading] = React.useState(false)

  const handleLoadingClick = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <Stack spacing="normal">
      {/* Primary Variants */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Button Variants</Label>
          <Divider />
          <Grid columns={3} gap="md">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
          </Grid>
          <HelperText variant="hint">
            Primary uses brand color · Secondary/Ghost are neutral
          </HelperText>
        </Stack>
      </Card>

      {/* State Variants */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>State Variants</Label>
          <Divider />
          <Grid columns={4} gap="md">
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="info">Info</Button>
          </Grid>
          <HelperText variant="hint">
            Semantic state colors that adapt to theme
          </HelperText>
        </Stack>
      </Card>

      {/* Sizes */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Button Sizes</Label>
          <Divider />
          <Grid columns={4} gap="md">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">X-Large</Button>
          </Grid>
          <HelperText variant="hint">
            Touch targets: 44px min (iOS) · 48px comfortable (Android)
          </HelperText>
        </Stack>
      </Card>

      {/* States */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Interactive States</Label>
          <Divider />
          <Grid columns={3} gap="md">
            <Button loading={loading} onClick={handleLoadingClick}>
              {loading ? 'Loading...' : 'Click Me'}
            </Button>
            <Button disabled>Disabled</Button>
            <Button variant="link">Link Style</Button>
          </Grid>
          <HelperText variant="hint">
            Hover, focus, active, disabled - all accessible
          </HelperText>
        </Stack>
      </Card>

      {/* Full Width */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Full Width</Label>
          <Divider />
          <Button variant="primary" fullWidth>
            Full Width Button
          </Button>
          <HelperText variant="hint">
            Useful for mobile forms and CTAs
          </HelperText>
        </Stack>
      </Card>

      {/* Flat Design */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Flat First Design</Label>
          <Divider />
          <Text size="sm" variant="muted">
            All buttons are flat by default (no shadows). Clean, modern, accessible.
          </Text>
          <Grid columns={2} gap="md">
            <div style={{ background: 'var(--ds-color-surface-base)', padding: 'var(--ds-space-4)', borderRadius: 'var(--ds-radius-md)' }}>
              <Button variant="primary">Light Surface</Button>
            </div>
            <div style={{ background: 'var(--ds-color-surface-subtle)', padding: 'var(--ds-space-4)', borderRadius: 'var(--ds-radius-md)' }}>
              <Button variant="primary">Subtle Surface</Button>
            </div>
          </Grid>
          <HelperText variant="hint">
            No shadow artifacts, works on any background
          </HelperText>
        </Stack>
      </Card>
    </Stack>
  )
}
