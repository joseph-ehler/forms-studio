/**
 * Form Showcase - FormLayout & Form Patterns
 */

import React from 'react'
import {
  Stack,
  FormLayout,
  Card,
  Heading,
  Text,
  Label,
  Button,
  HelperText,
  Divider,
} from '../../../src/components'

export function FormShowcase() {
  return (
    <Stack spacing="normal">
      {/* FormLayout Demo */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>FormLayout Component</Label>
          <Divider />
          <Text size="sm" variant="muted">
            Forms are single-column and constrained to 576px by default for better focus and completion rates.
          </Text>
          
          <div style={{ background: 'var(--ds-color-surface-subtle)', padding: 'var(--ds-space-6)', borderRadius: 'var(--ds-radius-lg)' }}>
            <FormLayout>
              <Stack spacing="normal">
                <div>
                  <Label required>Email Address</Label>
                  <input 
                    type="email" 
                    placeholder="you@example.com"
                    style={{
                      width: '100%',
                      padding: 'var(--ds-space-3)',
                      borderRadius: 'var(--ds-radius-md)',
                      border: '1px solid var(--ds-color-border-subtle)',
                      fontSize: '16px',
                      fontFamily: 'inherit',
                    }}
                  />
                  <HelperText variant="hint">We'll never share your email</HelperText>
                </div>

                <div>
                  <Label required>Password</Label>
                  <input 
                    type="password" 
                    placeholder="Enter password"
                    style={{
                      width: '100%',
                      padding: 'var(--ds-space-3)',
                      borderRadius: 'var(--ds-radius-md)',
                      border: '1px solid var(--ds-color-border-subtle)',
                      fontSize: '16px',
                      fontFamily: 'inherit',
                    }}
                  />
                  <HelperText variant="hint">Must be at least 8 characters</HelperText>
                </div>

                <div>
                  <Label optional>Newsletter</Label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-space-2)', cursor: 'pointer' }}>
                    <input type="checkbox" />
                    <Text size="sm">Send me product updates and tips</Text>
                  </label>
                </div>

                <Button variant="primary" fullWidth>
                  Create Account
                </Button>
              </Stack>
            </FormLayout>
          </div>
          
          <HelperText variant="hint">
            576px max width · 24px spacing · Single column
          </HelperText>
        </Stack>
      </Card>

      {/* Form Width Sizes */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>FormLayout Sizes</Label>
          <Divider />
          <Text size="sm" variant="muted">
            Different max-width options for various use cases
          </Text>
          
          <Stack spacing="normal">
            {[
              { size: 'sm', width: '384px', label: 'Small (login forms)' },
              { size: 'md', width: '448px', label: 'Medium (compact forms)' },
              { size: 'lg', width: '512px', label: 'Large (standard)' },
              { size: 'xl', width: '576px', label: 'XL (default)' },
              { size: '2xl', width: '672px', label: '2XL (wider forms)' },
            ].map(({ size, width, label }) => (
              <div key={size} style={{ background: 'var(--ds-color-surface-subtle)', padding: 'var(--ds-space-4)', borderRadius: 'var(--ds-radius-md)' }}>
                <FormLayout maxWidth={size as any}>
                  <Card padding="md" border>
                    <Text size="sm">{label} - {width}</Text>
                  </Card>
                </FormLayout>
              </div>
            ))}
          </Stack>
        </Stack>
      </Card>

      {/* Form States */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Form Field States</Label>
          <Divider />
          
          <div style={{ background: 'var(--ds-color-surface-subtle)', padding: 'var(--ds-space-6)', borderRadius: 'var(--ds-radius-lg)' }}>
            <FormLayout>
              <Stack spacing="normal">
                <div>
                  <Label>Default State</Label>
                  <input 
                    type="text" 
                    placeholder="Normal input"
                    style={{
                      width: '100%',
                      padding: 'var(--ds-space-3)',
                      borderRadius: 'var(--ds-radius-md)',
                      border: '1px solid var(--ds-color-border-subtle)',
                      fontSize: '16px',
                      fontFamily: 'inherit',
                    }}
                  />
                  <HelperText variant="hint">Default helper text</HelperText>
                </div>

                <div>
                  <Label>Error State</Label>
                  <input 
                    type="text" 
                    placeholder="Invalid input"
                    aria-invalid="true"
                    style={{
                      width: '100%',
                      padding: 'var(--ds-space-3)',
                      borderRadius: 'var(--ds-radius-md)',
                      border: '2px solid var(--ds-color-state-danger)',
                      fontSize: '16px',
                      fontFamily: 'inherit',
                    }}
                  />
                  <HelperText variant="error">This field is required</HelperText>
                </div>

                <div>
                  <Label>Success State</Label>
                  <input 
                    type="text" 
                    value="Valid input"
                    readOnly
                    style={{
                      width: '100%',
                      padding: 'var(--ds-space-3)',
                      borderRadius: 'var(--ds-radius-md)',
                      border: '2px solid var(--ds-color-state-success)',
                      fontSize: '16px',
                      fontFamily: 'inherit',
                    }}
                  />
                  <HelperText variant="success">Looks good!</HelperText>
                </div>

                <div>
                  <Label>Warning State</Label>
                  <input 
                    type="text" 
                    placeholder="Warning input"
                    style={{
                      width: '100%',
                      padding: 'var(--ds-space-3)',
                      borderRadius: 'var(--ds-radius-md)',
                      border: '2px solid var(--ds-color-state-warning)',
                      fontSize: '16px',
                      fontFamily: 'inherit',
                    }}
                  />
                  <HelperText variant="warning">Please review this value</HelperText>
                </div>
              </Stack>
            </FormLayout>
          </div>
        </Stack>
      </Card>
    </Stack>
  )
}
