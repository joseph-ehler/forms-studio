#!/usr/bin/env tsx
/**
 * Codemod: Migrate Raw HTML → Design System Components
 * 
 * Transforms all 32 fields from raw Tailwind scaffolding to DS components.
 * Mobile-first, consistent spacing, a11y-ready, token-driven.
 * 
 * Usage:
 *   npx tsx scripts/codemod-to-design-system.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { glob } from 'glob'

// Transformation rules (order matters!)
const TRANSFORMS = [
  // 1. Import Design System components at top of file
  {
    name: 'Add DS imports',
    pattern: /(import.*from '\.\.\/components')/,
    replace: `$1\nimport { FormStack, FormGrid } from '../components'`
  },
  
  // 2. Replace space-y-* with <FormStack>
  {
    name: 'space-y-1 → FormStack tight',
    pattern: /<div className="space-y-1">([\s\S]*?)<\/div>/g,
    replace: '<FormStack spacing="tight">$1</FormStack>'
  },
  {
    name: 'space-y-2 → FormStack tight',
    pattern: /<div className="space-y-2">([\s\S]*?)<\/div>/g,
    replace: '<FormStack spacing="tight">$1</FormStack>'
  },
  {
    name: 'space-y-3 → FormStack normal',
    pattern: /<div className="space-y-3">([\s\S]*?)<\/div>/g,
    replace: '<FormStack spacing="normal">$1</FormStack>'
  },
  {
    name: 'space-y-4 → FormStack normal',
    pattern: /<div className="space-y-4">([\s\S]*?)<\/div>/g,
    replace: '<FormStack spacing="normal">$1</FormStack>'
  },
  {
    name: 'space-y-6 → FormStack relaxed',
    pattern: /<div className="space-y-6">([\s\S]*?)<\/div>/g,
    replace: '<FormStack spacing="relaxed">$1</FormStack>'
  },
  
  // 3. Replace grid patterns
  {
    name: 'grid grid-cols-2 gap-4 → FormGrid',
    pattern: /<div className="grid grid-cols-2 gap-4">([\s\S]*?)<\/div>/g,
    replace: '<FormGrid columns={2}>$1</FormGrid>'
  },
  {
    name: 'grid gap-4 → FormGrid',
    pattern: /<div className="grid gap-4">([\s\S]*?)<\/div>/g,
    replace: '<FormGrid>$1</FormGrid>'
  },
]

// Fields to transform
const FIELD_PATTERNS = [
  'src/fields/**/*.tsx',
  '!src/fields/utils/**',
  '!src/fields/types.ts',
  '!src/fields/registry.ts',
  '!src/fields/createField.tsx'
]

async function transformFile(filePath: string): Promise<boolean> {
  const content = fs.readFileSync(filePath, 'utf-8')
  let transformed = content
  let changed = false
  
  // Apply each transformation
  for (const transform of TRANSFORMS) {
    const before = transformed
    transformed = transformed.replace(transform.pattern, transform.replace)
    if (before !== transformed) {
      console.log(`  ✓ ${transform.name}`)
      changed = true
    }
  }
  
  // Write back if changed
  if (changed) {
    fs.writeFileSync(filePath, transformed, 'utf-8')
    return true
  }
  
  return false
}

async function main() {
  console.log('🎨 Codemod: Migrating to Design System Components\n')
  
  // Find all field files
  const files = await glob(FIELD_PATTERNS)
  console.log(`Found ${files.length} field files to transform\n`)
  
  let transformedCount = 0
  
  for (const file of files) {
    const fileName = path.basename(file)
    console.log(`\n📝 ${fileName}`)
    
    const wasTransformed = await transformFile(file)
    if (wasTransformed) {
      transformedCount++
      console.log(`  ✅ Transformed`)
    } else {
      console.log(`  ⏭️  No changes needed`)
    }
  }
  
  console.log(`\n\n✨ Complete!`)
  console.log(`   Transformed: ${transformedCount}/${files.length} files`)
  console.log(`   Unchanged: ${files.length - transformedCount}/${files.length} files`)
  console.log(`\n📋 Next steps:`)
  console.log(`   1. Review changes: git diff`)
  console.log(`   2. Run build: npm run build`)
  console.log(`   3. Test fields visually`)
  console.log(`   4. Commit: "refactor: migrate all fields to design system components"`)
}

main().catch(console.error)
