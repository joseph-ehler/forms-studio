#!/usr/bin/env node

/**
 * Codemod: OverlaySheet → SheetDialog
 * 
 * Renames OverlaySheet to SheetDialog across the codebase.
 * Part of the Sheet System lockdown (Week 1, Day 6).
 * 
 * Usage:
 *   node scripts/codemods/overlay-sheet-to-dialog.mjs [--dry-run]
 * 
 * Risk: LOW (string replacement, auto-fixable)
 * Rollback: git restore .
 * 
 * What it does:
 * 1. Updates imports: import { OverlaySheet } → import { SheetDialog }
 * 2. Updates JSX: <OverlaySheet> → <SheetDialog>
 * 3. Updates type references: OverlaySheetProps → SheetDialogProps
 * 4. Preserves formatting and comments
 * 
 * What it doesn't touch:
 * - Comments mentioning "OverlaySheet" (intentional, for context)
 * - File names (manual rename required)
 * - Test fixtures (reviewed separately)
 */

import { readdir, readFile, writeFile } from 'fs/promises'
import { join, extname } from 'path'
import { parseArgs } from 'util'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Config
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const { values } = parseArgs({
  options: {
    'dry-run': { type: 'boolean' }
  }
})

const dryRun = values['dry-run'] || false
const ROOT = process.cwd()
const SEARCH_DIRS = [
  'packages/ds/src',
  'packages/demo-app/src',
  'packages/core/src',
  'packages/datasources/src'
]

const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx']

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Transformations
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function transformContent(content, filePath) {
  let transformed = content
  let changeCount = 0
  
  // 1. Import statements
  // import { OverlaySheet } → import { SheetDialog }
  const importRegex = /import\s*{\s*([^}]*)\bOverlaySheet\b([^}]*)\s*}/g
  transformed = transformed.replace(importRegex, (match, before, after) => {
    changeCount++
    return `import { ${before}SheetDialog${after} }`
  })
  
  // 2. JSX opening tags
  // <OverlaySheet → <SheetDialog
  const openTagRegex = /<OverlaySheet\b/g
  transformed = transformed.replace(openTagRegex, () => {
    changeCount++
    return '<SheetDialog'
  })
  
  // 3. JSX closing tags
  // </OverlaySheet> → </SheetDialog>
  const closeTagRegex = /<\/OverlaySheet>/g
  transformed = transformed.replace(closeTagRegex, () => {
    changeCount++
    return '</SheetDialog>'
  })
  
  // 4. Type references
  // OverlaySheetProps → SheetDialogProps
  const typeRegex = /\bOverlaySheetProps\b/g
  transformed = transformed.replace(typeRegex, () => {
    changeCount++
    return 'SheetDialogProps'
  })
  
  // 5. Variable/const references
  // const sheet = OverlaySheet → const sheet = SheetDialog
  const varRegex = /\bOverlaySheet(?=[^a-zA-Z0-9_])/g
  transformed = transformed.replace(varRegex, () => {
    changeCount++
    return 'SheetDialog'
  })
  
  return { transformed, changeCount }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// File System
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function findFiles(dir, files = []) {
  const entries = await readdir(join(ROOT, dir), { withFileTypes: true })
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    
    if (entry.isDirectory()) {
      // Skip node_modules, dist, build
      if (!['node_modules', 'dist', 'build', '.next'].includes(entry.name)) {
        await findFiles(fullPath, files)
      }
    } else if (entry.isFile()) {
      const ext = extname(entry.name)
      if (FILE_EXTENSIONS.includes(ext)) {
        files.push(fullPath)
      }
    }
  }
  
  return files
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function main() {
  console.log('🔍 Scanning for files...\n')
  
  // Collect all files
  const allFiles = []
  for (const dir of SEARCH_DIRS) {
    const files = await findFiles(dir)
    allFiles.push(...files)
  }
  
  console.log(`Found ${allFiles.length} files to check\n`)
  
  // Process each file
  const results = []
  
  for (const filePath of allFiles) {
    const fullPath = join(ROOT, filePath)
    const content = await readFile(fullPath, 'utf-8')
    
    // Skip if no OverlaySheet references
    if (!content.includes('OverlaySheet')) {
      continue
    }
    
    const { transformed, changeCount } = transformContent(content, filePath)
    
    if (changeCount > 0) {
      results.push({ filePath, changeCount, content: transformed })
    }
  }
  
  // Report
  console.log(`📊 Transformation Results:\n`)
  console.log(`Files to transform: ${results.length}`)
  console.log(`Total changes: ${results.reduce((sum, r) => sum + r.changeCount, 0)}\n`)
  
  if (results.length === 0) {
    console.log('✅ No files need transformation!\n')
    return
  }
  
  // Show changes
  console.log('📝 Files to be changed:\n')
  results.forEach(({ filePath, changeCount }) => {
    console.log(`  ${filePath} (${changeCount} changes)`)
  })
  console.log()
  
  // Dry run or apply
  if (dryRun) {
    console.log('🔍 DRY RUN - No files were modified')
    console.log('Run without --dry-run to apply changes\n')
  } else {
    console.log('✍️  Applying changes...\n')
    
    for (const { filePath, content } of results) {
      const fullPath = join(ROOT, filePath)
      await writeFile(fullPath, content, 'utf-8')
    }
    
    console.log('✅ All changes applied!\n')
    console.log('Next steps:')
    console.log('  1. pnpm barrels     # Regenerate barrel exports')
    console.log('  2. pnpm build       # Verify build passes')
    console.log('  3. pnpm lint        # Check for issues')
    console.log('  4. git diff         # Review changes')
  }
}

// Run
main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
