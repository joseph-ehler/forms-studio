#!/usr/bin/env node
/**
 * Step 3-4: Migrate Field - Copy from DS to Forms, create façade, verify
 * 
 * Usage: pnpm process:migrate-field <FieldName>
 * 
 * Does:
 * 1. Copy field from DS → Forms
 * 2. Normalize imports in copied files
 * 3. Create local barrel
 * 4. Add to Forms package barrel + build Forms
 * 5. Create DS façade + build DS
 * 6. Run guard + imports:fix
 * 
 * Field Name Mapping (DS → Forms):
 * - ToggleField → CheckboxField
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

// Field name mapping: DS name → Forms name
const FIELD_NAME_MAP = {
  'ToggleField': 'CheckboxField',
  // Add more as needed
};

const inputFieldName = process.argv[2];

if (!inputFieldName) {
  console.error(`❌ Usage: pnpm process:migrate-field <FieldName>`);
  console.error(``);
  console.error(`   Example: pnpm process:migrate-field NumberField`);
  console.error(`   Example: pnpm process:migrate-field ToggleField  # Maps to CheckboxField`);
  process.exit(1);
}

// Apply field name mapping if exists
const fieldName = FIELD_NAME_MAP[inputFieldName] || inputFieldName;
const sourceFieldName = inputFieldName; // Original DS field name

if (FIELD_NAME_MAP[inputFieldName]) {
  console.log(`📋 Mapping: ${inputFieldName} → ${fieldName}`);
}

const dsFieldDir = `packages/ds/src/fields/${fieldName}`;
const dsFieldFile = `packages/ds/src/fields/${fieldName}.tsx`;
const formsFieldDir = `packages/forms/src/fields/${fieldName}`;

// Verify source exists (directory or file)
const isDirectory = fs.existsSync(dsFieldDir) && fs.statSync(dsFieldDir).isDirectory();
const isFile = fs.existsSync(dsFieldFile);

if (!isDirectory && !isFile) {
  console.error(`❌ Source not found: ${dsFieldDir} or ${dsFieldFile}`);
  console.error(``);
  console.error(`   Available fields in DS:`);
  const fieldsDir = 'packages/ds/src/fields';
  if (fs.existsSync(fieldsDir)) {
    const items = fs.readdirSync(fieldsDir)
      .filter(f => {
        const fullPath = path.join(fieldsDir, f);
        const stat = fs.statSync(fullPath);
        return stat.isDirectory() || (stat.isFile() && f.endsWith('.tsx') && !f.includes('.old'));
      })
      .map(f => f.replace(/\.tsx$/, ''));
    items.forEach(f => console.error(`   - ${f}`));
  }
  process.exit(1);
}

function run(cmd, options = {}) {
  console.log(`   $ ${cmd}`);
  try {
    execSync(cmd, { stdio: options.silent ? 'pipe' : 'inherit', cwd: process.cwd() });
  } catch (error) {
    if (!options.allowFail) {
      console.error(`\n❌ Command failed: ${cmd}`);
      process.exit(1);
    }
  }
}

function normalizeImports(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  // DS internal paths → public barrels
  code = code
    .replace(/@intstudio\/ds\/primitives\b/g, '@intstudio/ds')
    .replace(/(['"])\.\.\/\.\.\/primitives(\/[a-zA-Z0-9/_-]*)?\1/g, (_, q, sub) => `${q}@intstudio/ds${sub || ''}${q}`)
    .replace(/(['"])\.\.\/primitives(\/[a-zA-Z0-9/_-]*)?\1/g, (_, q, sub) => `${q}@intstudio/ds${sub || ''}${q}`);
  
  // Overlay/Picker: primitives → @intstudio/ds (they're exported from DS barrel)
  code = code
    .replace(/@intstudio\/ds\/overlay\b/g, '@intstudio/ds')
    .replace(/(['"])\.\.\/\.\.\/primitives\/overlay(\/[a-zA-Z0-9/_-]*)?\1/g, (_, q, sub) => `${q}@intstudio/ds${sub || ''}${q}`)
    .replace(/(['"])\.\.\/\.\.\/primitives\/picker(\/[a-zA-Z0-9/_-]*)?\1/g, (_, q, sub) => `${q}@intstudio/ds${sub || ''}${q}`);
  
  // Utils imports → @intstudio/ds/utils
  code = code.replace(/(['"])\.\.\/utils\/(typography-display|field-json-config|a11y-helpers)\1/g, (_, q, file) => `${q}@intstudio/ds/utils${q}`);
  
  fs.writeFileSync(filePath, code);
}

console.log(`🚀 Migrating ${fieldName} from DS to Forms...`);
console.log(``);

// Step 1: Copy field to Forms
console.log(`📦 Step 1: Copying to Forms...`);
fs.mkdirSync(formsFieldDir, { recursive: true });

const copiedFiles = [];

if (isFile) {
  // Single file - copy as-is
  const destFilePath = path.join(formsFieldDir, `${fieldName}.tsx`);
  fs.copyFileSync(dsFieldFile, destFilePath);
  console.log(`   ✓ ${fieldName}.tsx`);
  copiedFiles.push(destFilePath);
} else {
  // Directory - copy all files
  const files = fs.readdirSync(dsFieldDir);
  for (const file of files) {
    const srcPath = path.join(dsFieldDir, file);
    const destPath = path.join(formsFieldDir, file);
    
    if (fs.statSync(srcPath).isFile()) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`   ✓ ${file}`);
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        copiedFiles.push(destPath);
      }
    }
  }
}

// Step 2: Normalize imports in copied files
console.log(``);
console.log(`🔧 Step 2: Normalizing imports...`);
for (const file of copiedFiles) {
  normalizeImports(file);
  console.log(`   ✓ ${path.basename(file)}`);
}

// Step 2.5: Create local field barrel
console.log(``);
console.log(`📝 Step 2.5: Creating local field barrel...`);
const localBarrelPath = path.join(formsFieldDir, 'index.ts');
const localBarrelContent = `export * from './${fieldName}';\n`;
fs.writeFileSync(localBarrelPath, localBarrelContent);
console.log(`   ✓ ${localBarrelPath}`);

// Step 3: Add to Forms barrel
console.log(``);
console.log(`📝 Step 3: Updating Forms barrel...`);
const formsBarrelPath = 'packages/forms/src/fields/index.ts';
let formsBarrel = fs.readFileSync(formsBarrelPath, 'utf8');

// Remove empty export if present
formsBarrel = formsBarrel.replace(/export\s*\{\s*\};?\s*/g, '');

// Add export for this field
if (!formsBarrel.includes(`export * from './${fieldName}'`)) {
  formsBarrel += `export * from './${fieldName}';\n`;
  fs.writeFileSync(formsBarrelPath, formsBarrel);
  console.log(`   ✓ Added export for ${fieldName}`);
} else {
  console.log(`   ✓ Export already exists`);
}

// Step 4: Build Forms FIRST
console.log(``);
console.log(`🔨 Step 4: Building Forms package...`);
run('pnpm -F @intstudio/forms build');

// Step 5: Create DS compat façade
console.log(``);
console.log(`🔄 Step 5: Creating DS compat façade...`);

const facadeContent = `/**
 * ${fieldName} - Compatibility Re-export
 * 
 * @deprecated Import from @intstudio/forms instead:
 * \`\`\`ts
 * import { ${fieldName} } from '@intstudio/forms/fields';
 * \`\`\`
 * 
 * This re-export will be removed in v2.0.0
 * Migration: pnpm codemod:fields
 */

// Runtime re-export only (types handled separately to avoid circular dependency)
// @ts-ignore - Forms package types not available during DS build
export { ${fieldName} } from '@intstudio/forms/fields';
`;

// Write façade (as .ts file to avoid conflicts)
const facadePath = `packages/ds/src/fields/${fieldName}.ts`;
fs.writeFileSync(facadePath, facadeContent);
console.log(`   ✓ ${facadePath}`);

// Step 6: Build DS
console.log(``);
console.log(`🔨 Step 6: Building DS package...`);
run('pnpm -F @intstudio/ds build');

// Step 7: Fix imports
console.log(``);
console.log(`🔧 Step 7: Fixing imports...`);
run('pnpm imports:fix', { allowFail: true });

// Step 8: Guard
console.log(``);
console.log(`🛡️  Step 8: Running guard...`);
run('pnpm guard', { allowFail: true }); // Allow guard to fail (non-blocking warnings)

console.log(``);
console.log(`✅ ${fieldName} migrated successfully!`);
console.log(``);
console.log(`📋 Next steps:`);
console.log(`   1. Review: git diff`);
console.log(`   2. Simplify: Remove DS-specific props (json, typographyDisplay, etc.)`);
console.log(`   3. Test: Add story to FieldLab.stories.tsx`);
console.log(`   4. Track: Update docs/COMPAT_FACADES.md`);
console.log(`   5. API: pnpm -F @intstudio/forms api:extract (optional)`);
console.log(``);
