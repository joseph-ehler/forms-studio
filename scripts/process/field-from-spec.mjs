#!/usr/bin/env node
/**
 * Field from Spec - Meta-Generator
 * 
 * Reads a YAML field spec and generates:
 * 1. Forms field implementation
 * 2. DS façade
 * 3. Storybook stories (optional)
 * 4. Test harness (optional)
 * 5. Updates COMPAT_FACADES.md
 * 6. Changeset entry (optional)
 * 
 * Usage: node scripts/process/field-from-spec.mjs SliderField
 * (Reads from specs/fields/SliderField.yaml)
 */

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { validateSpec } from './validate-spec.mjs';

const ROOT = process.cwd();
const fieldName = process.argv[2];

if (!fieldName) {
  console.error('Usage: node scripts/process/field-from-spec.mjs <FieldName>');
  console.error('Example: node scripts/process/field-from-spec.mjs SliderField');
  process.exit(1);
}

const specPath = path.join(ROOT, `specs/fields/${fieldName}.yaml`);
if (!fs.existsSync(specPath)) {
  console.error(`❌ Spec not found: ${specPath}`);
  console.error('   Create a YAML spec first in specs/fields/');
  process.exit(1);
}

// Validate spec before proceeding
const validation = validateSpec(specPath);
if (!validation.valid) {
  console.error(`❌ Spec validation failed: ${specPath}`);
  validation.errors.forEach((err, i) => {
    console.error(`   ${i + 1}. ${err.path || '/'}: ${err.message}`);
  });
  console.error('   Fix the spec and try again. Schema: specs/_schema.json');
  process.exit(1);
}

// Load spec
const spec = yaml.load(fs.readFileSync(specPath, 'utf8'));

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`🏭 Generating ${fieldName} from spec...`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

// 1. Generate Forms field implementation
console.log('1️⃣  Generating Forms field...');
generateFormsField(spec);

// 2. Generate DS façade
console.log('2️⃣  Generating DS façade...');
generateFacade(spec);

// 3. Update COMPAT_FACADES.md
console.log('3️⃣  Updating COMPAT_FACADES.md...');
updateCompatDocs(spec);

// 4. Generate stories (optional)
if (spec.stories && spec.stories.length > 0) {
  console.log('4️⃣  Generating stories...');
  console.log('   ⚠️  Story generation not yet implemented');
  console.log('   ⚠️  Manually add to FieldLab.stories.tsx');
}

// 5. Generate tests (optional)
if (spec.tests && spec.tests.length > 0) {
  console.log('5️⃣  Generating tests...');
  console.log('   ⚠️  Test generation not yet implemented');
  console.log('   ⚠️  Manually add test file');
}

console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`✅ ${fieldName} generated successfully!`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('📋 Next steps:');
console.log('   1. Review generated field implementation');
console.log('   2. pnpm -F @intstudio/forms build');
console.log('   3. pnpm -F @intstudio/ds build');
console.log('   4. pnpm preflight:green');
console.log('');

// ====================================================================
// GENERATORS
// ====================================================================

function generateFormsField(spec) {
  const { name, type, props = [], value, aria, description } = spec;
  
  // Determine HTML input type
  const inputType = type === 'composite' ? 'number' : type;
  
  // Build props interface
  const propsInterface = props.length > 0
    ? `export interface ${name}Props<T extends FieldValues = FieldValues>
  extends ${props.some(p => p.name === 'placeholder') ? '' : 'Omit<'}FieldComponentProps<T>${props.some(p => p.name === 'placeholder') ? '' : ", 'placeholder'>"} {
${props.map(p => `  ${p.name}?: ${p.type};  // ${p.description || ''}`).join('\n')}
}`
    : '';
  
  // Build value coercion
  const valueCoercion = value?.coercion || 'e.target.value';
  
  // Build default props
  const defaultProps = props
    .filter(p => p.default !== undefined)
    .map(p => `${p.name} = ${p.default}`)
    .join(',\n  ');
  
  const implementation = `/**
 * ${name} Component
 * 
 * ${description || `${name} field with Zod validation via react-hook-form.`}
 * Simple, portable contract - no DS typography complexity.
 */

import React from 'react';
import { Controller, type FieldValues } from 'react-hook-form';
import type { FieldComponentProps } from '../../form-core/types';
import { FormLabel, FormHelperText, Stack } from '@intstudio/ds';

${propsInterface ? propsInterface + '\n\n' : ''}export function ${name}<T extends FieldValues = FieldValues>({
  name,
  control,
  errors,
  label,
  required,
  disabled,
  description,${props.length > 0 ? '\n  ' + defaultProps + ',' : ''}${props.some(p => p.name === 'placeholder') ? '\n  placeholder,' : ''}
}: ${propsInterface ? `${name}Props<T>` : 'FieldComponentProps<T>'}) {
  const err = (errors as any)?.[name];
  const hasError = Boolean(err);
  const errorMessage = err?.message as string | undefined;

  return (
    <Stack spacing="tight">
      {label && (
        <FormLabel htmlFor={name} required={required} size="md">
          {label}
        </FormLabel>
      )}

      <Controller
        name={name as any}
        control={control as any}
        render={({ field }) => (
          <input
            type="${inputType}"
            id={name}${props.some(p => p.name === 'placeholder') ? '\n            placeholder={placeholder}' : ''}
            disabled={disabled}${aria?.invalid ? `\n            aria-invalid={${aria.invalid} || undefined}` : ''}${aria?.describedby ? `\n            aria-describedby={${aria.describedby} ? \`\${name}-desc\` : undefined}` : ''}${props.map(p => `\n            ${p.name}={${p.name}}`).join('')}
            value={field.value ?? ${value?.default || "''"}}
            onChange={(e) => field.onChange(${valueCoercion})}
            onBlur={field.onBlur}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: hasError ? '1px solid #ef4444' : '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
        )}
      />

      {description && (
        <div id={\`\${name}-desc\`}>
          <FormHelperText size="sm" aria-live="${aria?.live || 'polite'}">
            {description}
          </FormHelperText>
        </div>
      )}

      {hasError && errorMessage && (
        <FormHelperText variant="error" size="sm" aria-live="${aria?.live || 'polite'}">
          {errorMessage}
        </FormHelperText>
      )}
    </Stack>
  );
}
`;

  // Write field file
  const fieldDir = path.join(ROOT, `packages/forms/src/fields/${name}`);
  if (!fs.existsSync(fieldDir)) {
    fs.mkdirSync(fieldDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(fieldDir, `${name}.tsx`), implementation);
  fs.writeFileSync(path.join(fieldDir, 'index.ts'), `export * from './${name}';\n`);
  
  // Update barrel
  const barrelPath = path.join(ROOT, 'packages/forms/src/fields/index.ts');
  const barrel = fs.readFileSync(barrelPath, 'utf8');
  if (!barrel.includes(`export * from './${name}';`)) {
    fs.appendFileSync(barrelPath, `export * from './${name}';\n`);
  }
  
  console.log(`   ✅ Created: packages/forms/src/fields/${name}/${name}.tsx`);
  console.log(`   ✅ Updated: packages/forms/src/fields/index.ts`);
}

function generateFacade(spec) {
  const { name, facade } = spec;
  
  if (!facade || !facade.enabled) {
    console.log('   ⚠️  Façade disabled in spec');
    return;
  }
  
  const facadeContent = `/**
 * ${name} - Compatibility Re-export
 * 
 * @deprecated Import from @intstudio/forms instead:
 * \`\`\`ts
 * import { ${name} } from '@intstudio/forms/fields';
 * \`\`\`
 * 
 * This re-export will be removed in ${facade.removal || 'v2.0.0'}
 * Migration: ${facade.codemod || 'pnpm codemod:fields'}
 * Removal: see docs/COMPAT_FACADES.md
 */

// Runtime re-export only (types handled separately to avoid circular dependency)
// @ts-ignore - Forms package types not available during DS build
export { ${name} } from '@intstudio/forms/fields';
`;

  const facadePath = path.join(ROOT, `packages/ds/src/fields/${name}.ts`);
  fs.writeFileSync(facadePath, facadeContent);
  
  // Update facades.ts aggregator
  const facadesPath = path.join(ROOT, 'packages/ds/src/fields/facades.ts');
  if (fs.existsSync(facadesPath)) {
    const facadesContent = fs.readFileSync(facadesPath, 'utf8');
    if (!facadesContent.includes(`export { ${name} }`)) {
      // Add before "Future batches" comment
      const lines = facadesContent.split('\n');
      const insertIndex = lines.findIndex(l => l.includes('Future batches'));
      if (insertIndex !== -1) {
        lines.splice(insertIndex, 0, `// @ts-ignore\nexport { ${name} } from '@intstudio/forms/fields';`);
        fs.writeFileSync(facadesPath, lines.join('\n'));
        console.log(`   ✅ Updated: packages/ds/src/fields/facades.ts`);
      }
    }
  }
  
  console.log(`   ✅ Created: packages/ds/src/fields/${name}.ts`);
}

function updateCompatDocs(spec) {
  const { name, facade, metadata } = spec;
  
  if (!facade || !facade.enabled) {
    console.log('   ⚠️  Façade disabled, skipping docs update');
    return;
  }
  
  const compatPath = path.join(ROOT, 'docs/COMPAT_FACADES.md');
  if (!fs.existsSync(compatPath)) {
    console.log('   ⚠️  COMPAT_FACADES.md not found');
    return;
  }
  
  let content = fs.readFileSync(compatPath, 'utf8');
  
  // Check if already exists
  if (content.includes(`| ${name} |`)) {
    console.log(`   ⚠️  ${name} already in COMPAT_FACADES.md`);
    return;
  }
  
  // Find the table and add entry
  const tableEntry = `| ${name} | \`packages/ds/src/fields/${name}.ts\` | \`@intstudio/forms/fields\` | ${metadata?.added || new Date().toISOString().split('T')[0]} | ${facade.removal || 'v2.0.0'} | \`${facade.codemod || 'pnpm codemod:fields'}\` |`;
  
  // Insert before "## Removal Process"
  const lines = content.split('\n');
  const insertIndex = lines.findIndex(l => l.includes('## Removal Process'));
  if (insertIndex !== -1) {
    lines.splice(insertIndex - 1, 0, tableEntry);
    fs.writeFileSync(compatPath, lines.join('\n'));
    console.log('   ✅ Updated: docs/COMPAT_FACADES.md');
  }
}
