#!/usr/bin/env node
/**
 * Remove Compat Shims Codemod
 * 
 * Replaces legacy compat imports with direct primitives:
 * - FormStack → Stack
 * - FormGrid → Grid
 * - Flex → Stack (with direction="row" where needed)
 * 
 * Usage: node scripts/codemods/remove-compat-shims.mjs
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';

const ROOT = process.cwd();
const DRY_RUN = process.argv.includes('--dry-run');

console.log('🔄 Removing compat shims...');
console.log(DRY_RUN ? '📋 DRY RUN MODE' : '✏️  LIVE MODE');
console.log('');

// Find all TypeScript/TSX files in packages/ds/src
const files = await glob('packages/ds/src/**/*.{ts,tsx}', {
  cwd: ROOT,
  ignore: ['**/node_modules/**', '**/dist/**', '**/compat/**']
});

let totalFiles = 0;
let totalReplacements = 0;

for (const file of files) {
  const filePath = path.join(ROOT, file);
  let content = await fs.readFile(filePath, 'utf-8');
  let modified = false;
  let fileReplacements = 0;

  // Step 1: Remove FormStack, FormGrid, Flex from imports
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"]@intstudio\/ds\/primitives['"]/g;
  content = content.replace(importRegex, (match, imports) => {
    const importList = imports.split(',').map(i => i.trim());
    
    // Check if it has compat imports
    const hasCompat = importList.some(i => 
      i === 'FormStack' || i === 'FormGrid' || i === 'Flex'
    );
    
    if (!hasCompat) return match;
    
    // Remove compat imports and ensure real ones are present
    let cleanImports = importList.filter(i => 
      i !== 'FormStack' && i !== 'FormGrid' && i !== 'Flex'
    );
    
    // Add Stack if not present (for FormStack/Flex replacement)
    if (!cleanImports.includes('Stack') && 
        (importList.includes('FormStack') || importList.includes('Flex'))) {
      cleanImports.push('Stack');
    }
    
    // Add Grid if not present (for FormGrid replacement)
    if (!cleanImports.includes('Grid') && importList.includes('FormGrid')) {
      cleanImports.push('Grid');
    }
    
    modified = true;
    fileReplacements++;
    return `import { ${cleanImports.join(', ')} } from '@intstudio/ds/primitives'`;
  });

  // Step 2: Replace component usages
  // FormStack → Stack
  if (content.includes('FormStack')) {
    content = content.replace(/\bFormStack\b/g, 'Stack');
    modified = true;
    fileReplacements++;
  }

  // FormGrid → Grid
  if (content.includes('FormGrid')) {
    content = content.replace(/\bFormGrid\b/g, 'Grid');
    modified = true;
    fileReplacements++;
  }

  // Flex → Stack (note: Flex was already row-direction, so Stack should work)
  // This is a simplification - real Flex might need direction="row"
  if (content.includes('<Flex')) {
    content = content.replace(/<Flex\b/g, '<Stack direction="row"');
    modified = true;
    fileReplacements++;
  }
  if (content.includes('</Flex>')) {
    content = content.replace(/<\/Flex>/g, '</Stack>');
    modified = true;
  }

  // Save if modified
  if (modified) {
    totalFiles++;
    totalReplacements += fileReplacements;
    
    console.log(`✅ ${file} (${fileReplacements} replacements)`);
    
    if (!DRY_RUN) {
      await fs.writeFile(filePath, content, 'utf-8');
    }
  }
}

console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`📊 Summary:`);
console.log(`   Files modified: ${totalFiles}`);
console.log(`   Total replacements: ${totalReplacements}`);
console.log('');

if (DRY_RUN) {
  console.log('💡 Run without --dry-run to apply changes');
} else {
  console.log('✅ Compat shims removed!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Remove compat export from packages/ds/src/index.ts');
  console.log('2. Delete packages/ds/src/compat/ directory');
  console.log('3. Run: pnpm guard');
  console.log('4. Run: pnpm -F @intstudio/ds build');
}
