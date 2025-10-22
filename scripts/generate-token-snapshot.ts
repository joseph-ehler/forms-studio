#!/usr/bin/env tsx
/**
 * Generate Token Snapshot
 * 
 * Reads all token files and generates a versioned JSON snapshot.
 * Run before each release to create contract baseline.
 * 
 * Usage:
 *   npm run tokens:snapshot
 */

import fs from 'fs';
import path from 'path';

const TOKENS_DIR = path.join(__dirname, '../packages/wizard-react/src/tokens');
const CONTRACTS_DIR = path.join(__dirname, '../contracts');
const VERSION = process.env.npm_package_version || '0.2.0';

interface TokenSnapshot {
  $schema: string;
  version: string;
  generatedAt: string;
  tokens: Record<string, any>;
  primitives: Record<string, any>;
  metadata: {
    totalTokens: number;
    categories: number;
    primitives: number;
    changedFrom?: string;
  };
}

async function generateSnapshot(): Promise<void> {
  console.log('🔍 Scanning token files...');
  
  // Import all token modules
  const typography = await import(path.join(TOKENS_DIR, 'typography.ts'));
  const spacing = await import(path.join(TOKENS_DIR, 'spacing.ts'));
  const radius = await import(path.join(TOKENS_DIR, 'radius.ts'));
  const interactive = await import(path.join(TOKENS_DIR, 'interactive.ts'));
  const colors = await import(path.join(TOKENS_DIR, 'colors.ts'));
  const shadows = await import(path.join(TOKENS_DIR, 'shadows.ts'));
  const transitions = await import(path.join(TOKENS_DIR, 'transitions.ts'));
  const glassmorphism = await import(path.join(TOKENS_DIR, 'glassmorphism.ts'));

  // Build snapshot
  const snapshot: TokenSnapshot = {
    $schema: './token-snapshot.schema.json',
    version: VERSION,
    generatedAt: new Date().toISOString(),
    tokens: {
      typography: {
        size: typography.TYPO_TOKENS.size,
        weight: typography.TYPO_TOKENS.weight,
      },
      spacing: {
        form: spacing.SPACING_TOKENS.form,
        component: spacing.SPACING_TOKENS.component,
      },
      radius: radius.RADIUS_TOKENS,
      interactive: {
        minHeight: interactive.INTERACTIVE_TOKENS.minHeight,
        minWidth: interactive.INTERACTIVE_TOKENS.minWidth,
        iconSize: interactive.INTERACTIVE_TOKENS.iconSize,
        focusRing: interactive.INTERACTIVE_TOKENS.focusRing,
      },
      colors: {
        semantic: colors.COLOR_TOKENS.semantic,
        neutral: colors.COLOR_TOKENS.neutral,
        interactive: colors.COLOR_TOKENS.interactive,
      },
      shadows: shadows.SHADOW_TOKENS,
      transitions: transitions.TRANSITION_TOKENS,
      glassmorphism: {
        blur: glassmorphism.GLASS_TOKENS.blur,
        opacity: glassmorphism.GLASS_TOKENS.opacity,
      },
    },
    primitives: {
      'ds-input': {
        states: ['default', 'hover', 'focus', 'disabled', 'error'],
        contracts: {
          minHeight: '48px',
          borderRadius: '6px',
          focusRing: '3px',
          contrastRatio: 4.5,
        },
      },
      'ds-button': {
        variants: ['primary', 'secondary', 'ghost', 'danger', 'success', 'warning', 'link'],
        states: ['default', 'hover', 'active', 'focus', 'disabled'],
        contracts: {
          minHeight: '48px',
          minWidth: '88px',
          borderRadius: '8px',
          contrastRatio: 4.5,
          hoverElevation: 'translateY(-1px)',
          activeElevation: 'translateY(0px)',
        },
      },
    },
    metadata: {
      totalTokens: 133,
      categories: 8,
      primitives: 2,
    },
  };

  // Write snapshot
  const filename = `tokens@v${VERSION}.json`;
  const filepath = path.join(CONTRACTS_DIR, filename);
  
  if (!fs.existsSync(CONTRACTS_DIR)) {
    fs.mkdirSync(CONTRACTS_DIR, { recursive: true });
  }

  fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2));
  
  console.log(`✅ Snapshot generated: ${filename}`);
  console.log(`   Total tokens: ${snapshot.metadata.totalTokens}`);
  console.log(`   Categories: ${snapshot.metadata.categories}`);
}

generateSnapshot().catch(console.error);
