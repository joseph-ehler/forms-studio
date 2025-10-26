#!/usr/bin/env node
/**
 * Classmap Integrity Validator
 * 
 * Validates components.classmap.json for:
 * 1. Schema validation (structure)
 * 2. Dangling entries (component listed but no DS wrapper file)
 * 3. Stale research (missing or outdated research snapshot)
 * 
 * Usage: pnpm ds:classmap:validate
 * Runs: pre-commit + CI
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Paths
const CLASSMAP_PATH = path.join(ROOT, 'packages/ds/src/control/components.classmap.json');
const SCHEMA_PATH = path.join(ROOT, 'packages/ds/src/control/components.classmap.schema.json');
const DS_FB_PATH = path.join(ROOT, 'packages/ds/src/fb');
const RESEARCH_PATH = path.join(ROOT, 'docs/handbook/flowbite-components');

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// Colors
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

let errors = [];
let warnings = [];

console.log('🔍 Validating Component Classmap...\n');

// ============================================================================
// 1. Load & Parse Classmap
// ============================================================================

if (!fs.existsSync(CLASSMAP_PATH)) {
  console.error(`${RED}❌ Classmap not found: ${CLASSMAP_PATH}${RESET}`);
  process.exit(1);
}

let classmap;
try {
  classmap = JSON.parse(fs.readFileSync(CLASSMAP_PATH, 'utf-8'));
} catch (err) {
  console.error(`${RED}❌ Failed to parse classmap JSON: ${err.message}${RESET}`);
  process.exit(1);
}

console.log(`✅ Classmap loaded (${Object.keys(classmap.components || {}).length} components)\n`);

// ============================================================================
// 2. Schema Validation (Basic)
// ============================================================================

console.log('📋 Checking schema structure...');

if (!classmap.components || typeof classmap.components !== 'object') {
  errors.push('Classmap missing "components" object');
}

if (!classmap.classes || typeof classmap.classes !== 'object') {
  errors.push('Classmap missing "classes" object');
}

const validClasses = Object.keys(classmap.classes || {});

for (const [componentName, componentData] of Object.entries(classmap.components || {})) {
  // Check required fields
  if (!componentData.class) {
    errors.push(`${componentName}: Missing "class" field`);
  } else if (!validClasses.includes(componentData.class)) {
    errors.push(`${componentName}: Invalid class "${componentData.class}". Must be one of: ${validClasses.join(', ')}`);
  }

  if (!componentData.engine) {
    errors.push(`${componentName}: Missing "engine" field`);
  }

  if (componentData.flowbiteName === undefined) {
    errors.push(`${componentName}: Missing "flowbiteName" field (use null if not from Flowbite)`);
  }

  if (!Array.isArray(componentData.controlledProps)) {
    errors.push(`${componentName}: "controlledProps" must be an array`);
  }

  if (typeof componentData.acceptsChildren !== 'boolean') {
    errors.push(`${componentName}: "acceptsChildren" must be boolean`);
  }
}

console.log(errors.length === 0 ? `${GREEN}✅ Schema valid${RESET}` : `${RED}❌ ${errors.length} schema errors${RESET}`);
console.log();

// ============================================================================
// 3. Check for Dangling Entries (Component Listed but No File)
// ============================================================================

console.log('📂 Checking for dangling entries...');

for (const componentName of Object.keys(classmap.components || {})) {
  const componentFile = path.join(DS_FB_PATH, `${componentName}.tsx`);
  
  if (!fs.existsSync(componentFile)) {
    warnings.push(`${componentName}: Listed in classmap but ${componentName}.tsx not found in packages/ds/src/fb/`);
  }
}

console.log(warnings.length === 0 ? `${GREEN}✅ No dangling entries${RESET}` : `${YELLOW}⚠️  ${warnings.length} dangling entries${RESET}`);
console.log();

// ============================================================================
// 4. Check for Stale Research (Missing or Outdated Snapshot)
// ============================================================================

console.log('🔬 Checking research snapshots...');

const staleResearch = [];

for (const componentName of Object.keys(classmap.components || {})) {
  const researchFile = path.join(RESEARCH_PATH, `${componentName}.md`);
  
  if (!fs.existsSync(researchFile)) {
    staleResearch.push(`${componentName}: No research snapshot found (expected ${researchFile})`);
  } else {
    // Check if older than 7 days
    const stats = fs.statSync(researchFile);
    const age = Date.now() - stats.mtimeMs;
    
    if (age > SEVEN_DAYS_MS) {
      const days = Math.floor(age / (24 * 60 * 60 * 1000));
      staleResearch.push(`${componentName}: Research snapshot is ${days} days old (consider refreshing with pnpm ds:research ${componentName})`);
    }
  }
}

if (staleResearch.length > 0) {
  warnings.push(...staleResearch);
}

console.log(staleResearch.length === 0 ? `${GREEN}✅ All research fresh${RESET}` : `${YELLOW}⚠️  ${staleResearch.length} stale research snapshots${RESET}`);
console.log();

// ============================================================================
// 5. Check for Orphaned Files (DS Component but Not in Classmap)
// ============================================================================

console.log('🔍 Checking for orphaned DS components...');

const orphans = [];

if (fs.existsSync(DS_FB_PATH)) {
  const dsFiles = fs.readdirSync(DS_FB_PATH).filter(f => f.endsWith('.tsx') && !f.includes('.stories'));
  
  for (const file of dsFiles) {
    const componentName = path.basename(file, '.tsx');
    
    if (!classmap.components[componentName]) {
      orphans.push(`${componentName}: Found in packages/ds/src/fb/ but not in classmap`);
    }
  }
}

if (orphans.length > 0) {
  warnings.push(...orphans);
}

console.log(orphans.length === 0 ? `${GREEN}✅ No orphaned components${RESET}` : `${YELLOW}⚠️  ${orphans.length} orphaned components${RESET}`);
console.log();

// ============================================================================
// 6. Report Results
// ============================================================================

console.log('═══════════════════════════════════════════════════════════');
console.log('📊 VALIDATION SUMMARY');
console.log('═══════════════════════════════════════════════════════════\n');

if (errors.length > 0) {
  console.log(`${RED}❌ ERRORS (${errors.length}):${RESET}`);
  errors.forEach(err => console.log(`   ${RED}•${RESET} ${err}`));
  console.log();
}

if (warnings.length > 0) {
  console.log(`${YELLOW}⚠️  WARNINGS (${warnings.length}):${RESET}`);
  warnings.forEach(warn => console.log(`   ${YELLOW}•${RESET} ${warn}`));
  console.log();
}

if (errors.length === 0 && warnings.length === 0) {
  console.log(`${GREEN}✅ ALL CHECKS PASSED${RESET}\n`);
  process.exit(0);
} else if (errors.length > 0) {
  console.log(`${RED}❌ VALIDATION FAILED${RESET}\n`);
  console.log('Fix errors before committing.\n');
  process.exit(1);
} else {
  console.log(`${YELLOW}⚠️  VALIDATION PASSED WITH WARNINGS${RESET}\n`);
  console.log('Consider addressing warnings.\n');
  process.exit(0);
}
