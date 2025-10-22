/**
 * Media Showcase - Images, Video, Aspect Ratios
 * 
 * Demonstrates Media primitives with all features:
 * - MediaContainer with aspect ratios
 * - Picture with responsive images
 * - VideoPlayer with accessibility
 * - Caption & overlay slots
 * - Width preset integration
 */

import React from 'react'
import {
  MediaContainer,
  Picture,
  VideoPlayer,
  Stack,
  Card,
  Grid,
  Container,
  Heading,
  Text,
  Label,
  Divider,
} from '../../../src/components'

export function MediaShowcase() {
  return (
    <Stack spacing="normal">
      {/* Pattern 1: Aspect Ratios */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Aspect Ratios (CLS Prevention)</Label>
          <Divider />
          <Text size="sm" variant="muted">
            5 standardized ratios + auto. All enforce aspect-ratio for zero layout shift.
          </Text>
          
          <Grid columns={3} gap="md">
            {/* 1:1 Square */}
            <div>
              <MediaContainer ratio="1:1" maxWidth="standard">
                <Picture
                  alt="Square format"
                  img={{
                    src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
                  }}
                />
              </MediaContainer>
              <Text size="xs" variant="muted" style={{ marginTop: '8px', textAlign: 'center' }}>
                1:1 (Square)
              </Text>
            </div>
            
            {/* 4:3 Classic */}
            <div>
              <MediaContainer ratio="4:3" maxWidth="standard">
                <Picture
                  alt="Classic format"
                  img={{
                    src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop',
                  }}
                />
              </MediaContainer>
              <Text size="xs" variant="muted" style={{ marginTop: '8px', textAlign: 'center' }}>
                4:3 (Classic)
              </Text>
            </div>
            
            {/* 3:2 Photo */}
            <div>
              <MediaContainer ratio="3:2" maxWidth="standard">
                <Picture
                  alt="Photography format"
                  img={{
                    src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop',
                  }}
                />
              </MediaContainer>
              <Text size="xs" variant="muted" style={{ marginTop: '8px', textAlign: 'center' }}>
                3:2 (Photo)
              </Text>
            </div>
            
            {/* 16:9 Video */}
            <div>
              <MediaContainer ratio="16:9" maxWidth="standard">
                <Picture
                  alt="Video format"
                  img={{
                    src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=450&fit=crop',
                  }}
                />
              </MediaContainer>
              <Text size="xs" variant="muted" style={{ marginTop: '8px', textAlign: 'center' }}>
                16:9 (Video)
              </Text>
            </div>
            
            {/* 21:9 Ultrawide */}
            <div style={{ gridColumn: 'span 2' }}>
              <MediaContainer ratio="21:9" maxWidth="full">
                <Picture
                  alt="Ultrawide hero format"
                  img={{
                    src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&h=600&fit=crop',
                  }}
                />
              </MediaContainer>
              <Text size="xs" variant="muted" style={{ marginTop: '8px', textAlign: 'center' }}>
                21:9 (Ultrawide Hero)
              </Text>
            </div>
          </Grid>
        </Stack>
      </Card>

      {/* Pattern 2: Width Presets Integration */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Width Presets (Snapped Layout)</Label>
          <Divider />
          <Text size="sm" variant="muted">
            MediaContainer maxWidth snaps to your layout presets. No freelance widths!
          </Text>
          
          <Stack spacing="tight">
            <div>
              <MediaContainer ratio="16:9" maxWidth="prose">
                <Picture
                  alt="Prose width"
                  img={{
                    src: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&h=450&fit=crop',
                  }}
                />
              </MediaContainer>
              <Text size="xs" variant="muted" style={{ marginTop: '4px' }}>
                maxWidth="prose" (65ch)
              </Text>
            </div>
            
            <div>
              <MediaContainer ratio="16:9" maxWidth="narrow">
                <Picture
                  alt="Narrow width"
                  img={{
                    src: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&h=450&fit=crop',
                  }}
                />
              </MediaContainer>
              <Text size="xs" variant="muted" style={{ marginTop: '4px' }}>
                maxWidth="narrow" (36rem / 576px)
              </Text>
            </div>
            
            <div>
              <MediaContainer ratio="16:9" maxWidth="standard">
                <Picture
                  alt="Standard width"
                  img={{
                    src: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&h=450&fit=crop',
                  }}
                />
              </MediaContainer>
              <Text size="xs" variant="muted" style={{ marginTop: '4px' }}>
                maxWidth="standard" (56rem / 896px)
              </Text>
            </div>
            
            <div>
              <MediaContainer ratio="16:9" maxWidth="max">
                <Picture
                  alt="Max width"
                  img={{
                    src: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1280&h=720&fit=crop',
                  }}
                />
              </MediaContainer>
              <Text size="xs" variant="muted" style={{ marginTop: '4px' }}>
                maxWidth="max" (80rem / 1280px) - default
              </Text>
            </div>
          </Stack>
        </Stack>
      </Card>

      {/* Pattern 3: Captions */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Captions (Auto-Positioned with Gradient)</Label>
          <Divider />
          <Text size="sm" variant="muted">
            caption prop adds figcaption with automatic gradient overlay for legibility.
          </Text>
          
          <MediaContainer 
            ratio="16:9" 
            maxWidth="wide"
            caption="Beautiful landscape with automatic gradient overlay for text legibility"
          >
            <Picture
              alt="Landscape with caption"
              img={{
                src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=675&fit=crop',
              }}
            />
          </MediaContainer>
          
          <Text size="xs" variant="muted" style={{ fontFamily: 'monospace' }}>
            {`<MediaContainer caption="..." ratio="16:9">`}
          </Text>
        </Stack>
      </Card>

      {/* Pattern 4: Overlays */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Overlays (Badges, Actions, Gradients)</Label>
          <Divider />
          <Text size="sm" variant="muted">
            overlay slot for brand badges, action buttons, or custom gradients.
          </Text>
          
          <MediaContainer 
            ratio="21:9" 
            maxWidth="max"
            overlay={
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'var(--ds-color-primary-bg)',
                color: 'var(--ds-color-primary-text)',
                padding: '4px 12px',
                borderRadius: 'var(--ds-radius-md)',
                fontSize: '14px',
                fontWeight: 600,
              }}>
                NEW
              </div>
            }
            caption="Hero image with brand badge overlay"
          >
            <Picture
              alt="Hero with overlay"
              img={{
                src: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1400&h=600&fit=crop',
              }}
            />
          </MediaContainer>
        </Stack>
      </Card>

      {/* Pattern 5: Clickable Media */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Clickable (Focus Ring + Cursor)</Label>
          <Divider />
          <Text size="sm" variant="muted">
            clickable prop adds keyboard focus ring and pointer cursor.
          </Text>
          
          <Grid columns={3} gap="md">
            {[1, 2, 3].map((i) => (
              <MediaContainer 
                key={i}
                ratio="3:2" 
                clickable
                onClick={() => alert(`Clicked image ${i}`)}
              >
                <Picture
                  alt={`Gallery item ${i}`}
                  img={{
                    src: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=267&fit=crop&seed=${i}`,
                  }}
                />
              </MediaContainer>
            ))}
          </Grid>
          
          <Text size="xs" variant="muted">
            ✅ Keyboard accessible (Tab to focus, Enter to activate)
          </Text>
        </Stack>
      </Card>

      {/* Pattern 6: Performance */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Performance (Lazy + Format Fallback)</Label>
          <Divider />
          <Text size="sm" variant="muted">
            Picture supports AVIF → WebP → JPEG fallback. Lazy loading by default.
          </Text>
          
          <MediaContainer ratio="16:9" maxWidth="wide">
            <Picture
              alt="Modern formats with fallback"
              sources={[
                { 
                  src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=675&fit=crop&fm=avif',
                  type: 'image/avif'
                },
                { 
                  src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=675&fit=crop&fm=webp',
                  type: 'image/webp'
                },
              ]}
              img={{
                src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=675&fit=crop&fm=jpg',
              }}
              loading="lazy"
            />
          </MediaContainer>
          
          <Text size="xs" variant="muted" style={{ fontFamily: 'monospace' }}>
            {`<Picture sources={[{type:'image/avif'}, {type:'image/webp'}]} />`}
          </Text>
        </Stack>
      </Card>

      {/* Pattern 7: Video Player */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>VideoPlayer (Accessible + Reduced Motion)</Label>
          <Divider />
          <Text size="sm" variant="muted">
            HTML5 video with captions, reduced motion detection, and browser policy enforcement.
          </Text>
          
          <MediaContainer ratio="16:9" maxWidth="wide" caption="Big Buck Bunny (CC)">
            <VideoPlayer
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              poster="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
              controls
              muted
              loop
            />
          </MediaContainer>
          
          <Text size="xs" variant="muted">
            ✅ Respects prefers-reduced-motion • ✅ Requires muted for autoplay • ✅ Accessible controls
          </Text>
        </Stack>
      </Card>

      {/* Pattern 8: Real-World Example */}
      <Card padding="lg">
        <Stack spacing="tight">
          <Label>Real-World Pattern: Product Showcase</Label>
          <Divider />
          <Text size="sm" variant="muted">
            MediaContainer + Section + Container composition for marketing pages.
          </Text>
          
          <div style={{ 
            background: 'var(--ds-color-surface-subtle)', 
            borderRadius: 'var(--ds-radius-lg)', 
            padding: 'var(--ds-space-8)'
          }}>
            <Container maxWidth="standard">
              <Stack spacing="normal">
                <Heading size="xl">Our Product</Heading>
                
                <MediaContainer 
                  ratio="16:9"
                  caption="Watch our product in action"
                  overlay={
                    <div style={{
                      position: 'absolute',
                      bottom: '80px',
                      left: '24px',
                      right: '24px',
                    }}>
                      <button style={{
                        background: 'var(--ds-color-primary-bg)',
                        color: 'var(--ds-color-primary-text)',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: 'var(--ds-radius-md)',
                        fontSize: '16px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}>
                        Play Demo
                      </button>
                    </div>
                  }
                >
                  <Picture
                    alt="Product demonstration"
                    img={{
                      src: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1200&h=675&fit=crop',
                    }}
                    fetchPriority="high"
                  />
                </MediaContainer>
                
                <Text>
                  This pattern combines Section, Container, and MediaContainer for perfect
                  width control, aspect ratio enforcement, and caption/overlay support.
                </Text>
              </Stack>
            </Container>
          </div>
        </Stack>
      </Card>
    </Stack>
  )
}
