#!/usr/bin/env node
/**
 * Scaffold Field - Create a new simplified field from template
 * 
 * Usage: node scripts/process/scaffold-field.mjs <FieldName> <inputType>
 * 
 * Examples:
 *   node scripts/process/scaffold-field.mjs TextField text
 *   node scripts/process/scaffold-field.mjs DateField date
 *   node scripts/process/scaffold-field.mjs SelectField select
 */

import fs from 'node:fs';
import path from 'node:path';

const [,, fieldName, inputType = 'text'] = process.argv;

if (!fieldName) {
  console.error(`❌ Usage: node scripts/process/scaffold-field.mjs <FieldName> [inputType]`);
  console.error(``);
  console.error(`Examples:`);
  console.error(`  node scripts/process/scaffold-field.mjs TextField text`);
  console.error(`  node scripts/process/scaffold-field.mjs EmailField email`);
  console.error(`  node scripts/process/scaffold-field.mjs DateField date`);
  console.error(`  node scripts/process/scaffold-field.mjs SelectField select`);
  process.exit(1);
}

const fieldDir = `packages/forms/src/fields/${fieldName}`;

// Check if already exists
if (fs.existsSync(fieldDir)) {
  console.error(`❌ Field already exists: ${fieldDir}`);
  process.exit(1);
}

// Create directory
fs.mkdirSync(fieldDir, { recursive: true });

// Generate field component based on input type
let componentContent;

if (inputType === 'select') {
  componentContent = `/**
 * ${fieldName} Component
 * 
 * Select field with Zod validation via react-hook-form.
 * Simple, portable contract - no DS typography complexity.
 */

import React from 'react';
import { Controller, type FieldValues } from 'react-hook-form';
import type { FieldComponentProps } from '../../form-core/types';
import { FormLabel, FormHelperText, Stack } from '@intstudio/ds';

export interface ${fieldName}Props<T extends FieldValues = FieldValues> extends FieldComponentProps<T> {
  options: Array<{ value: string; label: string }>;
}

export function ${fieldName}<T extends FieldValues = FieldValues>({
  name,
  control,
  errors,
  label,
  required,
  disabled,
  description,
  placeholder,
  options,
}: ${fieldName}Props<T>) {
  const hasError = Boolean((errors as any)?.[name]);
  const errorMessage = (errors as any)?.[name]?.message;

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
          <select
            id={name}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={description ? \`\${name}-desc\` : undefined}
            value={field.value ?? ''}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: hasError ? '1px solid #ef4444' : '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: '#fff',
            }}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      />

      {description && (
        <div id={\`\${name}-desc\`}>
          <FormHelperText size="sm" aria-live="polite">
            {description}
          </FormHelperText>
        </div>
      )}
      
      {hasError && errorMessage && (
        <FormHelperText variant="error" size="sm" aria-live="polite">
          {errorMessage as string}
        </FormHelperText>
      )}
    </Stack>
  );
}
`;
} else {
  // Standard input field
  componentContent = `/**
 * ${fieldName} Component
 * 
 * ${inputType} input field with Zod validation via react-hook-form.
 * Simple, portable contract - no DS typography complexity.
 */

import React from 'react';
import { Controller, type FieldValues } from 'react-hook-form';
import type { FieldComponentProps } from '../../form-core/types';
import { FormLabel, FormHelperText, Stack } from '@intstudio/ds';

export function ${fieldName}<T extends FieldValues = FieldValues>({
  name,
  control,
  errors,
  label,
  required,
  disabled,
  description,
  placeholder,
}: FieldComponentProps<T>) {
  const hasError = Boolean((errors as any)?.[name]);
  const errorMessage = (errors as any)?.[name]?.message;

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
            id={name}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={description ? \`\${name}-desc\` : undefined}
            value={field.value ?? ''}
            onChange={(e) => field.onChange(e.target.value)}
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
          <FormHelperText size="sm" aria-live="polite">
            {description}
          </FormHelperText>
        </div>
      )}
      
      {hasError && errorMessage && (
        <FormHelperText variant="error" size="sm" aria-live="polite">
          {errorMessage as string}
        </FormHelperText>
      )}
    </Stack>
  );
}
`;
}

// Write component file
const componentPath = path.join(fieldDir, `${fieldName}.tsx`);
fs.writeFileSync(componentPath, componentContent);
console.log(`✅ Created: ${componentPath}`);

// Create barrel
const barrelContent = `export * from './${fieldName}';\n`;
const barrelPath = path.join(fieldDir, 'index.ts');
fs.writeFileSync(barrelPath, barrelContent);
console.log(`✅ Created: ${barrelPath}`);

// Update package barrel
const packageBarrelPath = 'packages/forms/src/fields/index.ts';
let packageBarrel = fs.readFileSync(packageBarrelPath, 'utf8');
if (!packageBarrel.includes(`export * from './${fieldName}'`)) {
  packageBarrel += `export * from './${fieldName}';\n`;
  fs.writeFileSync(packageBarrelPath, packageBarrel);
  console.log(`✅ Updated: ${packageBarrelPath}`);
}

console.log(``);
console.log(`🎉 ${fieldName} scaffolded successfully!`);
console.log(``);
console.log(`📋 Next steps:`);
console.log(`   1. Review: packages/forms/src/fields/${fieldName}/${fieldName}.tsx`);
console.log(`   2. Build: pnpm -F @intstudio/forms build`);
console.log(`   3. Create façade: Manual or use migrate-field.mjs script`);
console.log(`   4. Build DS: pnpm -F @intstudio/ds build`);
console.log(``);
