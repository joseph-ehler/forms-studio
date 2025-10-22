/**
 * Prose Showcase - CMS/Markdown Content Rendering
 */

import React from 'react'
import {
  Stack,
  Card,
  Prose,
  Label,
  Text,
  Divider,
  HelperText,
} from '../../../src/components'

export function ProseShowcase() {
  return (
    <Stack spacing="normal">
      {/* Default Prose */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Prose (CMS Content)</Label>
          <Divider />
          <Text size="sm" variant="muted">
            The ONLY component where typography gets external margins. For rich text / markdown content.
          </Text>
          
          <div style={{ background: 'var(--ds-color-surface-subtle)', padding: 'var(--ds-space-6)', borderRadius: 'var(--ds-radius-lg)' }}>
            <Prose size="md">
              <h1>Large Heading (H1)</h1>
              <p>
                This is a paragraph with <strong>bold text</strong>, <em>italic text</em>, and{' '}
                <a href="#" style={{ color: 'var(--ds-color-text-link)' }}>a link</a>. 
                The Prose component automatically adds vertical rhythm (margins) to all HTML elements.
              </p>
              
              <h2>Medium Heading (H2)</h2>
              <p>
                All other typography components (Heading, Body, Label, etc.) have <code style={{ 
                  background: 'var(--ds-color-surface-raised)',
                  padding: '2px 6px',
                  borderRadius: 'var(--ds-radius-sm)',
                  fontSize: '0.9em'
                }}>margin: 0</code> and are neutral. 
                Prose is the exception for CMS/markdown content.
              </p>
              
              <h3>Lists</h3>
              <ul>
                <li>Unordered list item one</li>
                <li>Unordered list item two</li>
                <li>Nested lists work too:
                  <ul>
                    <li>Nested item</li>
                    <li>Another nested item</li>
                  </ul>
                </li>
              </ul>
              
              <ol>
                <li>Ordered list item one</li>
                <li>Ordered list item two</li>
                <li>Third item</li>
              </ol>
              
              <blockquote style={{ 
                borderLeft: '4px solid var(--ds-color-border-strong)',
                paddingLeft: 'var(--ds-space-4)',
                fontStyle: 'italic',
                color: 'var(--ds-color-text-secondary)'
              }}>
                Blockquotes are styled with subtle borders and muted text.
                Great for highlighting important information or quotes.
              </blockquote>
              
              <p>
                Code blocks and inline code automatically get styled. Everything is theme-aware
                and adapts to light/dark modes automatically.
              </p>
            </Prose>
          </div>
          
          <HelperText variant="hint">
            Automatic vertical rhythm · Theme-aware colors · All HTML elements styled
          </HelperText>
        </Stack>
      </Card>

      {/* Prose Sizes */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Prose Sizes</Label>
          <Divider />
          
          <Text size="sm" variant="muted">Small (14px base):</Text>
          <div style={{ background: 'var(--ds-color-surface-subtle)', padding: 'var(--ds-space-4)', borderRadius: 'var(--ds-radius-md)' }}>
            <Prose size="sm">
              <h3>Compact Content</h3>
              <p>Smaller text for sidebars, footnotes, or dense content areas.</p>
            </Prose>
          </div>
          
          <Text size="sm" variant="muted">Medium (16px base - default):</Text>
          <div style={{ background: 'var(--ds-color-surface-subtle)', padding: 'var(--ds-space-4)', borderRadius: 'var(--ds-radius-md)' }}>
            <Prose size="md">
              <h3>Standard Content</h3>
              <p>Comfortable reading size for blog posts, articles, and documentation.</p>
            </Prose>
          </div>
          
          <Text size="sm" variant="muted">Large (18px base):</Text>
          <div style={{ background: 'var(--ds-color-surface-subtle)', padding: 'var(--ds-space-4)', borderRadius: 'var(--ds-radius-md)' }}>
            <Prose size="lg">
              <h3>Generous Content</h3>
              <p>Larger, more comfortable reading for long-form content and marketing pages.</p>
            </Prose>
          </div>
        </Stack>
      </Card>

      {/* Theme Aware */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Theme-Aware Styling</Label>
          <Divider />
          <Text size="sm" variant="muted">
            All Prose content automatically adapts to theme changes. Links, headings, blockquotes, and code blocks 
            use semantic color tokens that switch with light/dark themes.
          </Text>
          <HelperText variant="hint">
            Try switching to dark mode above to see automatic adaptation!
          </HelperText>
        </Stack>
      </Card>
    </Stack>
  )
}
