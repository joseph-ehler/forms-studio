#!/usr/bin/env node

/**
 * Codemod: Migrate field imports from @intstudio/ds to @intstudio/forms
 * 
 * Rewrites:
 *   import { TextField } from '@intstudio/ds/fields'
 * To:
 *   import { TextField } from '@intstudio/forms/fields'
 * 
 * Usage:
 *   pnpm codemod:fields [--dry-run] [--field FieldName]
 * 
 * Examples:
 *   pnpm codemod:fields --dry-run           # Preview all field migrations
 *   pnpm codemod:fields --field TextField   # Migrate only TextField
 *   pnpm codemod:fields                     # Apply all migrations
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { parseArgs } from 'util';

const { values } = parseArgs({
  options: {
    'dry-run': { type: 'boolean', default: false },
    'field': { type: 'string' },
  },
});

const dryRun = values['dry-run'];
const oneField = values['field'];

// Fields to migrate
const FIELDS = [
  'TextField',
  'NumberField',
  'CheckboxField',
  'TextareaField',
  'SwitchField',
  'DateField',
  'TimeField',
  'DateRangeField',
  'SelectField',
  'MultiSelectField',
  'RadioGroupField',
  // Add more as they're migrated
];

/**
 * Transform import statements
 */
function transformImports(content) {
  let modified = false;

  // If migrating only one field, be more selective
  if (oneField) {
    // Pattern: import { FieldName } from '@intstudio/ds/fields'
    const singleFieldPattern = new RegExp(
      `(import\\s+{[^}]*\\b${oneField}\\b[^}]*}\\s+from\\s+['"])@intstudio/ds/fields(['"])`,
      'g'
    );
    if (singleFieldPattern.test(content)) {
      content = content.replace(singleFieldPattern, `$1@intstudio/forms/fields$2`);
      modified = true;
    }
  } else {
    // Pattern 1: import { TextField, ... } from '@intstudio/ds/fields'
    const pattern1 = /@intstudio\/ds\/fields/g;
    if (pattern1.test(content)) {
      content = content.replace(pattern1, '@intstudio/forms/fields');
      modified = true;
    }
  }

  // Pattern 2: import { TextField } from '@intstudio/ds'
  // Check if any known fields are imported from @intstudio/ds
  const pattern2 = /import\s+{([^}]+)}\s+from\s+['"]@intstudio\/ds['"]/g;
  content = content.replace(pattern2, (match, imports) => {
    const importList = imports.split(',').map(s => s.trim());
    const fieldImports = importList.filter(imp => 
      FIELDS.some(field => imp.includes(field))
    );
    
    if (fieldImports.length > 0) {
      modified = true;
      const dsImports = importList.filter(imp => 
        !FIELDS.some(field => imp.includes(field))
      );
      
      let result = '';
      if (dsImports.length > 0) {
        result += `import { ${dsImports.join(', ')} } from '@intstudio/ds'\n`;
      }
      result += `import { ${fieldImports.join(', ')} } from '@intstudio/forms/fields'`;
      return result;
    }
    
    return match;
  });

  return { content, modified };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  const original = readFileSync(filePath, 'utf8');
  const { content, modified } = transformImports(original);

  if (!modified) {
    return false;
  }

  if (dryRun) {
    console.log(`[DRY RUN] Would update: ${filePath}`);
  } else {
    writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
  }

  return true;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔄 Migrating field imports: @intstudio/ds → @intstudio/forms\n');
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }

  // Find all TS/TSX files (excluding node_modules and dist)
  const files = await glob('**/*.{ts,tsx}', {
    ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/build/**'],
    absolute: true,
  });

  let count = 0;
  for (const file of files) {
    if (processFile(file)) {
      count++;
    }
  }

  console.log(`\n✨ Complete! Modified ${count} file(s)`);
  
  if (dryRun) {
    console.log('\n💡 Run without --dry-run to apply changes');
  } else {
    console.log('\n💡 Next steps:');
    console.log('   1. Review changes: git diff');
    console.log('   2. Test your app');
    console.log('   3. Commit: git commit -am "chore: migrate to @intstudio/forms"');
  }
}

main().catch(console.error);
