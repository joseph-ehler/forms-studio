/**
 * Typography Showcase - All Typography Components
 */

import React from 'react'
import {
  Stack,
  Grid,
  Card,
  Display,
  Heading,
  Body,
  Text,
  Label,
  HelperText,
  Divider,
} from '../../../src/components'

export function TypographyShowcase() {
  return (
    <Stack spacing="normal">
      {/* Display Scale */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Display Scale (Marketing/Hero)</Label>
          <Divider />
          <Display size="2xl">Display 2XL (72px)</Display>
          <Display size="xl">Display XL (60px)</Display>
          <Display size="lg">Display LG (48px)</Display>
          <Display size="md">Display MD (36px)</Display>
          <HelperText variant="hint">
            Responsive: scales down on mobile
          </HelperText>
        </Stack>
      </Card>

      {/* Heading Scale */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Heading Scale (SaaS/App)</Label>
          <Divider />
          <Heading size="xl">Heading XL (30px)</Heading>
          <Heading size="lg">Heading LG (24px)</Heading>
          <Heading size="md">Heading MD (20px)</Heading>
          <Heading size="sm">Heading SM (18px)</Heading>
          <Heading size="xs">Heading XS (16px)</Heading>
          <HelperText variant="hint">
            All headings: margin: 0 (atoms are neutral!)
          </HelperText>
        </Stack>
      </Card>

      {/* Body Scale */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Body Scale (Content/UI)</Label>
          <Divider />
          <Body size="xl">Body XL (20px) - Large content blocks</Body>
          <Body size="lg">Body LG (18px) - Comfortable reading</Body>
          <Body size="md">Body MD (16px) - Default UI text</Body>
          <Body size="sm">Body SM (14px) - Secondary content</Body>
          <Body size="xs">Body XS (12px) - Metadata, captions</Body>
        </Stack>
      </Card>

      {/* Variants */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Text Variants (Semantic Colors)</Label>
          <Divider />
          <Text variant="primary">Primary text (main content)</Text>
          <Text variant="secondary">Secondary text (supporting info)</Text>
          <Text variant="muted">Muted text (subtle, de-emphasized)</Text>
          <HelperText variant="hint">
            Colors adapt automatically to theme (light/dark)
          </HelperText>
        </Stack>
      </Card>

      {/* Helper Text States */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Helper Text States</Label>
          <Divider />
          <HelperText variant="hint">Hint: Helpful guidance text</HelperText>
          <HelperText variant="error">Error: Something went wrong</HelperText>
          <HelperText variant="success">Success: Action completed</HelperText>
          <HelperText variant="warning">Warning: Please review</HelperText>
        </Stack>
      </Card>

      {/* Labels */}
      <Grid columns={2} gap="md">
        <Card padding="md">
          <Stack spacing="tight">
            <Label>Default Label</Label>
            <Text size="sm" variant="muted">Standard form label</Text>
          </Stack>
        </Card>
        <Card padding="md">
          <Stack spacing="tight">
            <Label required>Required Field</Label>
            <Text size="sm" variant="muted">Red asterisk indicator</Text>
          </Stack>
        </Card>
        <Card padding="md">
          <Stack spacing="tight">
            <Label optional>Optional Field</Label>
            <Text size="sm" variant="muted">Muted optional tag</Text>
          </Stack>
        </Card>
        <Card padding="md">
          <Stack spacing="tight">
            <Label>All margin: 0</Label>
            <Text size="sm" variant="muted">Atoms are neutral!</Text>
          </Stack>
        </Card>
      </Grid>
    </Stack>
  )
}
