#!/usr/bin/env node

/**
 * CI Tripwire - Atoms Neutrality Check
 * 
 * Ensures all atom CSS classes have margin: 0
 * Atoms: Display, Heading, Body, Label, HelperText, Caption
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

// Atom class patterns to check
const ATOM_PATTERNS = [
  /\.ds-display-(2xl|xl|lg|md)\s*\{[^}]*\}/gs,
  /\.ds-heading-(xl|lg|md|sm|xs)\s*\{[^}]*\}/gs,
  /\.ds-body-(xl|lg|md|sm|xs)\s*\{[^}]*\}/gs,
  /\.ds-label(?:-|__|\s|\{)[^}]*\}/gs,
  /\.ds-helper[^}]*\}/gs,
  /\.ds-caption[^}]*\}/gs,
]

let violations = []

// Read typography CSS
const typographyCss = path.join(__dirname, '../src/components/ds-typography.css')

if (!fs.existsSync(typographyCss)) {
  log.error('ds-typography.css not found')
  process.exit(1)
}

const content = fs.readFileSync(typographyCss, 'utf-8')

// Exception: .ds-sr-only is allowed to have margins (for accessibility)
const SAFE_CLASSES = ['.ds-sr-only']

function isSafeClass(className) {
  return SAFE_CLASSES.some(safe => className.includes(safe))
}

// Check each atom pattern
for (const pattern of ATOM_PATTERNS) {
  const matches = content.matchAll(pattern)
  
  for (const match of matches) {
    const block = match[0]
    const className = block.match(/\.(ds-[a-z-_]+)/)?.[1]
    
    // Skip safe classes (sr-only)
    if (className && isSafeClass(className)) {
      continue
    }
    
    // Check if block has margin property (allow margin: 0)
    const marginMatch = block.match(/margin[^:]*:\s*([^;]+);/)
    if (marginMatch) {
      const value = marginMatch[1].trim()
      // Allow margin: 0, 0px, auto, var(), inherit, initial, unset
      const isAllowed = /^(0|0px|auto|var\(|inherit|initial|unset)/.test(value)
      if (!isAllowed) {
        violations.push(`${className} has non-zero margin: ${value}`)
      }
    }
  }
}

// Report results
if (violations.length > 0) {
  log.error(`Found ${violations.length} atom neutrality violations:\n`)
  violations.forEach(v => console.log(`  ${v}`))
  console.log('\n')
  log.error('Atoms Neutrality Check FAILED')
  log.warn('Fix: All atom classes must have margin: 0 (layout owns spacing)')
  process.exit(1)
} else {
  log.success('Atoms Neutrality Check PASSED - All atoms are neutral')
  process.exit(0)
}
