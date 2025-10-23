#!/usr/bin/env node
/**
 * CONSERVATIVE DS Adoption Codemod
 * 
 * ONLY touches safe patterns:
 * - Simple Tailwind color classes → CSS vars
 * - min-h-[XXpx] → inline style
 * - rounded-* → borderRadius
 * - Basic shadow-* removal
 * 
 * DOES NOT touch:
 * - Conditional styling
 * - Template literals with logic
 * - Hover/focus states (needs handlers)
 */

const fs = require('fs');
const path = require('path');

// Safe color mappings (ONLY when NOT in conditionals)
const colorReplacements = [
  // Text colors
  { from: /text-gray-900(?!['\"`])/g, to: "style={{ color: 'var(--ds-color-text-primary)' }}" },
  { from: /text-gray-700(?!['\"`])/g, to: "style={{ color: 'var(--ds-color-text-primary)' }}" },
  { from: /text-gray-600(?!['\"`])/g, to: "style={{ color: 'var(--ds-color-text-secondary)' }}" },
  { from: /text-gray-500(?!['\"`])/g, to: "style={{ color: 'var(--ds-color-text-secondary)' }}" },
  { from: /text-gray-400(?!['\"`])/g, to: "style={{ color: 'var(--ds-color-text-muted)' }}" },
  
  // Background colors
  { from: /bg-gray-50(?!['\"`])/g, to: "style={{ backgroundColor: 'var(--ds-color-surface-subtle)' }}" },
  { from: /bg-gray-100(?!['\"`])/g, to: "style={{ backgroundColor: 'var(--ds-color-surface-subtle)' }}" },
  { from: /bg-white(?!['\"`])/g, to: "style={{ backgroundColor: 'var(--ds-color-surface-base)' }}" },
  
  // Border colors
  { from: /border-gray-300(?!['\"`])/g, to: "style={{ borderColor: 'var(--ds-color-border-subtle)' }}" },
  { from: /border-gray-200(?!['\"`])/g, to: "style={{ borderColor: 'var(--ds-color-border-subtle)' }}" },
];

// Safe sizing replacements
const sizingReplacements = [
  // min-height with pixel values
  { from: /min-h-\[(\d+)px\]/g, to: (match, px) => `style={{ minHeight: '${px}px' }}` },
  { from: /min-w-\[(\d+)px\]/g, to: (match, px) => `style={{ minWidth: '${px}px' }}` },
];

// Safe border-radius replacements
const radiusReplacements = [
  { from: /rounded-full(?!['\"`])/g, to: "style={{ borderRadius: '9999px' }}" },
  { from: /rounded-lg(?!['\"`])/g, to: "style={{ borderRadius: 'var(--ds-radius-md, 8px)' }}" },
  { from: /rounded-md(?!['\"`])/g, to: "style={{ borderRadius: 'var(--ds-radius-md, 6px)' }}" },
  { from: /rounded-sm(?!['\"`])/g, to: "style={{ borderRadius: 'var(--ds-radius-sm, 4px)' }}" },
];

// Safe shadow removals (DS classes own this)
const shadowReplacements = [
  { from: /\s+shadow-sm/g, to: '' },
  { from: /\s+shadow-md/g, to: '' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Apply safe replacements
  const allReplacements = [
    ...sizingReplacements,
    ...radiusReplacements,
    ...shadowReplacements,
  ];
  
  allReplacements.forEach(({ from, to }) => {
    const before = content;
    if (typeof to === 'function') {
      content = content.replace(from, to);
    } else {
      content = content.replace(from, to);
    }
    if (content !== before) modified = true;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Modified: ${path.basename(filePath)}`);
    return true;
  }
  
  console.log(`⏭️  Skipped: ${path.basename(filePath)} (no safe patterns found)`);
  return false;
}

// Target files (remaining from our sprint)
const targetFiles = [
  // Simple fields
  'packages/wizard-react/src/fields/TextField.tsx',
  'packages/wizard-react/src/fields/TextareaField.tsx',
  'packages/wizard-react/src/fields/NumberField.tsx',
  
  // Composite fields  
  'packages/wizard-react/src/fields/composite/EmailField.tsx',
  'packages/wizard-react/src/fields/composite/PhoneField.tsx',
  'packages/wizard-react/src/fields/composite/CurrencyField.tsx',
  
  // Picker fields
  'packages/wizard-react/src/fields/SelectField.tsx',
  'packages/wizard-react/src/fields/DateField.tsx',
  
  // Form components
  'packages/wizard-react/src/components/FormMessage.tsx',
  'packages/wizard-react/src/components/FormText.tsx',
  'packages/wizard-react/src/components/FormProgress.tsx',
  'packages/wizard-react/src/components/FormHeading.tsx',
  'packages/wizard-react/src/components/FormBadge.tsx',
];

console.log('🚀 DS Adoption Codemod - CONSERVATIVE MODE\n');
console.log(`Targeting ${targetFiles.length} files...\n`);

let modifiedCount = 0;
const baseDir = process.cwd();

targetFiles.forEach(file => {
  const fullPath = path.join(baseDir, file);
  if (fs.existsSync(fullPath)) {
    if (processFile(fullPath)) {
      modifiedCount++;
    }
  } else {
    console.log(`⚠️  Not found: ${file}`);
  }
});

console.log(`\n✨ Complete! Modified ${modifiedCount}/${targetFiles.length} files`);
console.log('\n📝 Next steps:');
console.log('1. Review changes with git diff');
console.log('2. Manual pass for conditionals & hover states');
console.log('3. Test build: pnpm -w build');
