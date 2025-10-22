#!/usr/bin/env node
/**
 * Codemod: Migrate raw <label> to FormLabel primitive
 * 
 * Automatically fixes:
 * 1. <label className="sr-only"> → <FormLabel srOnly>
 * 2. <label className="block text-sm ..."> → <FormLabel size="sm">
 * 3. <label ...> → <FormLabel>
 * 4. Adds import if missing
 * 
 * Usage:
 *   node scripts/migrate-labels.js packages/wizard-react/src/fields/**\/*.tsx
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Pattern matchers
const LABEL_PATTERNS = [
  // Pattern 1: sr-only labels
  {
    regex: /<label\s+htmlFor={([^}]+)}\s+className="sr-only">([^<]+)<\/label>/g,
    replace: '<FormLabel htmlFor={$1} srOnly>$2</FormLabel>',
  },
  // Pattern 2: Labels with text-sm
  {
    regex: /<label\s+htmlFor={([^}]+)}\s+className="[^"]*text-sm[^"]*">([^<]+)<\/label>/g,
    replace: '<FormLabel htmlFor={$1} size="sm">$2</FormLabel>',
  },
  // Pattern 3: Labels with text-base or text-md
  {
    regex: /<label\s+htmlFor={([^}]+)}\s+className="[^"]*text-(base|md)[^"]*">([^<]+)<\/label>/g,
    replace: '<FormLabel htmlFor={$1}>$3</FormLabel>',
  },
  // Pattern 4: Simple labels with className
  {
    regex: /<label\s+htmlFor={([^}]+)}\s+className="[^"]*">([^<]+)<\/label>/g,
    replace: '<FormLabel htmlFor={$1}>$2</FormLabel>',
  },
  // Pattern 5: Simple labels without className
  {
    regex: /<label\s+htmlFor={([^}]+)}>([^<]+)<\/label>/g,
    replace: '<FormLabel htmlFor={$1}>$2</FormLabel>',
  },
];

// Import pattern
const IMPORT_PATTERN = /import\s+{([^}]+)}\s+from\s+['"]\.\.\/\.\.\/components['"]/;
const TYPOGRAPHY_IMPORT = "import { FormLabel } from '../../components/typography'";

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Check if file has labels to migrate
  if (!content.includes('<label')) {
    return false;
  }

  console.log(`\n📝 Migrating: ${filePath}`);

  // Apply label replacements
  LABEL_PATTERNS.forEach(({ regex, replace }) => {
    const before = content;
    content = content.replace(regex, replace);
    if (content !== before) {
      const matches = (before.match(regex) || []).length;
      console.log(`  ✅ Replaced ${matches} label(s) with pattern: ${regex.source.substring(0, 50)}...`);
      modified = true;
    }
  });

  if (!modified) {
    console.log('  ⚠️  No labels matched patterns (may be multi-line)');
    return false;
  }

  // Add FormLabel import if needed
  if (content.includes('<FormLabel') && !content.includes("from '../../components/typography'")) {
    // Check if there's already a components import
    const existingImport = content.match(IMPORT_PATTERN);
    
    if (existingImport) {
      // Add FormLabel as FormLabelOld to existing import
      const imports = existingImport[1];
      const newImports = imports.includes('FormLabel') 
        ? imports.replace('FormLabel', 'FormLabel as FormLabelOld')
        : imports + ', FormLabel as FormLabelOld';
      
      content = content.replace(
        existingImport[0],
        `import {${newImports}} from '../../components'`
      );
    }

    // Add typography import
    const firstImport = content.indexOf('import');
    const endOfFirstImport = content.indexOf('\n', firstImport);
    content = 
      content.slice(0, endOfFirstImport + 1) +
      TYPOGRAPHY_IMPORT + '\n' +
      content.slice(endOfFirstImport + 1);

    console.log('  ✅ Added FormLabel import from typography');
  }

  // Write back
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('  💾 Saved');

  return true;
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node migrate-labels.js <glob-pattern>');
    console.log('Example: node migrate-labels.js "packages/wizard-react/src/fields/**/*.tsx"');
    process.exit(1);
  }

  const pattern = args[0];
  const files = glob.sync(pattern, { ignore: '**/node_modules/**' });

  console.log(`\n🔍 Found ${files.length} files matching: ${pattern}\n`);

  let migratedCount = 0;
  let skippedCount = 0;

  files.forEach(file => {
    if (migrateFile(file)) {
      migratedCount++;
    } else {
      skippedCount++;
    }
  });

  console.log(`\n📊 Migration Summary:`);
  console.log(`  ✅ Migrated: ${migratedCount} files`);
  console.log(`  ⏭️  Skipped: ${skippedCount} files (no labels found)`);
  console.log(`\n🎯 Next steps:`);
  console.log(`  1. Review changes: git diff`);
  console.log(`  2. Run checks: .github/scripts/check-typography.sh`);
  console.log(`  3. Test manually: pnpm dev`);
  console.log(`  4. Commit: git add . && git commit -m "chore: migrate labels to FormLabel primitive"`);
}

main();
