/**
 * Interactive Showcase
 * 
 * Demonstrates interactive components with overlays
 * to test focus management primitives.
 */

import React from 'react'
import { useForm } from 'react-hook-form'
import {
  Stack,
  Card,
  Heading,
  Text,
  Button,
} from '../../../src/components'

// Import a picker field to test focus trap
import { SelectField } from '../../../src/fields/SelectField'

export function InteractiveShowcase() {
  const { control, watch } = useForm({
    defaultValues: {
      color: '',
      size: '',
    }
  })
  
  const color = watch('color')
  const size = watch('size')
  
  return (
    <Stack spacing="normal">
      <Card padding="lg">
        <Stack spacing="normal">
          <Heading size="lg">Interactive Components</Heading>
          <Text variant="secondary">
            Test keyboard navigation: Tab, Shift+Tab, Escape, Arrow keys
          </Text>
          
          {/* Select Field */}
          <SelectField
            name="color"
            label="Favorite Color"
            description="Open this and test: Tab (cycle), Escape (close), Arrow keys (navigate)"
            placeholder="Choose a color..."
            control={control}
            errors={{}}
            json={{
              options: [
                'Red',
                'Blue',
                'Green',
                'Yellow',
                'Purple',
                'Orange',
                'Pink',
                'Teal',
              ],
              allowSearch: true,
            }}
          />
          
          {/* Another Select */}
          <SelectField
            name="size"
            label="Size"
            description="Test Tab to cycle between pickers"
            placeholder="Choose a size..."
            control={control}
            errors={{}}
            json={{
              options: [
                'Extra Small',
                'Small',
                'Medium',
                'Large',
                'Extra Large',
              ],
            }}
          />
          
          {/* Show selections */}
          {(color || size) && (
            <Card padding="md" variant="surface">
              <Stack spacing="tight">
                <Text size="sm" weight="medium">Your Selections:</Text>
                {color && <Text size="sm">Color: {color}</Text>}
                {size && <Text size="sm">Size: {size}</Text>}
              </Stack>
            </Card>
          )}
          
          {/* Debug hint */}
          <Card padding="md" variant="glass">
            <Stack spacing="tight">
              <Text size="sm" weight="medium">🧪 Debug Console Commands:</Text>
              <Text size="sm" variant="muted" as="code">
                debugFocus() - Show current focus state
              </Text>
              <Text size="sm" variant="muted" as="code">
                debugFocusTraps() - List active traps
              </Text>
              <Text size="sm" variant="muted" as="code">
                testFocusTrap() - Test Tab cycling
              </Text>
              <Text size="sm" variant="muted" as="code">
                watchFocus() - Monitor focus changes
              </Text>
            </Stack>
          </Card>
        </Stack>
      </Card>
    </Stack>
  )
}
