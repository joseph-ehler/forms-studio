#!/usr/bin/env node
/**
 * Story scaffolder - generates boilerplate Storybook story files
 * 
 * Usage:
 *   pnpm sb:new packages/ds/src/fb/Button/Button.tsx
 * 
 * Creates:
 *   packages/ds/src/fb/Button/Button.stories.tsx
 */

import { promises as fs } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';

const file = process.argv[2];

if (!file) {
  console.error('Usage: pnpm sb:new <path/to/Component.tsx>');
  console.error('Example: pnpm sb:new packages/ds/src/fb/Button/Button.tsx');
  process.exit(1);
}

const abs = resolve(file);
const dir = dirname(abs);
const name = basename(abs).replace(/\.tsx?$/, '');
const out = resolve(dir, `${name}.stories.tsx`);

// Extract title from path (e.g., "packages/ds/src/fb/Button" -> "DS/FB/Button")
const pathParts = dir.split('/src/')[1]?.split('/') ?? [];
const title = pathParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('/');

const template = `import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta: Meta<typeof ${name}> = {
  title: '${title}/${name}',
  component: ${name},
  tags: ['autodocs'],
  args: {
    // Add default args here
  },
};

export default meta;

type Story = StoryObj<typeof ${name}>;

export const Basic: Story = {
  args: {
    // Override args for this story
  },
};

export const Variant: Story = {
  args: {
    // Add variant-specific args
  },
};
`;

await fs.writeFile(out, template);
console.log(`✅ Created ${out}`);
console.log('');
console.log('Next steps:');
console.log('  1. Update args in the meta object');
console.log('  2. Add more story variants as needed');
console.log('  3. Run `pnpm sb` to see your story');
