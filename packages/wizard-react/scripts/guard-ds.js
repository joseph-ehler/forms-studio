#!/usr/bin/env node

/**
 * CI Tripwire - Design System Quality Check
 * 
 * Scans DS CSS files for violations:
 * - Raw hex colors (#abc, #123456)
 * - Raw rgb(a) colors
 * - Margins (except margin: 0)
 * 
 * Exits with error code 1 if violations found.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const COLORS = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
}

const log = {
  error: (msg) => console.error(`${COLORS.red}❌ ${msg}${COLORS.reset}`),
  success: (msg) => console.log(`${COLORS.green}✅ ${msg}${COLORS.reset}`),
  warn: (msg) => console.warn(`${COLORS.yellow}⚠️  ${msg}${COLORS.reset}`),
}

// Patterns to check
const PATTERNS = {
  hexColor: /#(?:[0-9a-fA-F]{3}){1,2}\b/g,
  rgbColor: /rgba?\([^)]+\)/g,
  margin: /\bmargin[^:]*:\s*(?!0\b|0px\b|-1px\b|var\(|inherit|initial|unset|auto)/g,
}

// Files that are exceptions to the rules
const EXCEPTIONS = {
  margins: ['ds-prose.css', 'ds-typography.css', 'ds-calendar.css'], // Prose, sr-only, calendar (self-contained components)
  colors: ['ds-calendar.tokens.css', 'input.vars.css'], // Token definition files (rgba in token values is OK)
}

// Safe selectors (margins allowed inside these)
const SAFE_MARGIN_SELECTORS = [
  /^\.ds-prose\s/,      // .ds-prose *
  /^\.ds-prose>/,       // .ds-prose >
  /^\.ds-sr-only$/,     // .ds-sr-only (screen reader only)
]

// Helper to check if a line is inside a safe selector
function isSafeMarginContext(line) {
  return SAFE_MARGIN_SELECTORS.some(pattern => pattern.test(line.trim()))
}

let violations = []

// Find all DS CSS files
const cssFiles = []
function findCssFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name)
    
    if (file.isDirectory() && !file.name.includes('node_modules') && !file.name.includes('dist')) {
      findCssFiles(fullPath)
    } else if (file.name.startsWith('ds-') && file.name.endsWith('.css')) {
      cssFiles.push(fullPath)
    }
  }
}

findCssFiles(path.join(__dirname, '../src'))

log.warn(`Scanning ${cssFiles.length} DS CSS files...`)

// Scan each file
for (const file of cssFiles) {
  const content = fs.readFileSync(file, 'utf-8')
  const lines = content.split('\n')
  const fileName = path.basename(file)
  
  lines.forEach((line, index) => {
    const lineNum = index + 1
    const relativePath = path.relative(process.cwd(), file)
    
    // Check for hex colors
    if (PATTERNS.hexColor.test(line) && !EXCEPTIONS.colors.includes(fileName)) {
      const matches = line.match(PATTERNS.hexColor)
      violations.push(`${relativePath}:${lineNum} - Raw hex color: ${matches.join(', ')}`)
    }
    
    // Check for rgb(a) colors (skip comments and CSS variable definitions)
    if (PATTERNS.rgbColor.test(line) && !line.trim().startsWith('/*') && !line.includes('--')) {
      const matches = line.match(PATTERNS.rgbColor)
      violations.push(`${relativePath}:${lineNum} - Raw rgb color: ${matches.join(', ')}`)
    }
    
    // Check for margins (except in Prose and sr-only)
    if (PATTERNS.margin.test(line) && !EXCEPTIONS.margins.includes(fileName) && !isSafeMarginContext(line)) {
      violations.push(`${relativePath}:${lineNum} - Margin found (use gap in layout): ${line.trim()}`)
    }
  })
}

// Report results
if (violations.length > 0) {
  log.error(`Found ${violations.length} design system violations:\n`)
  violations.forEach(v => console.log(`  ${v}`))
  console.log('\n')
  log.error('DS Quality Check FAILED')
  log.warn('Fix: Use --ds-color-* tokens, --ds-space-* tokens, and gap instead of margin')
  process.exit(1)
} else {
  log.success('DS Quality Check PASSED - No violations found')
  process.exit(0)
}
