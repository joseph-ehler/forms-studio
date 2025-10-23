#!/usr/bin/env node
/**
 * Composite Field Generator v2.2
 * 
 * Generates composite fields (multi-part inputs like LocationField, RangeField)
 * 
 * Features:
 * - Multiple Controllers (one per part)
 * - Layout support (row, stack, grid)
 * - Per-part prop filtering
 * - Aggregated error handling
 * - Separator support
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * Map gap values to Stack spacing
 */
function gapToSpacing(gap) {
  const mapping = {
    none: 'none',
    tight: 'tight',
    normal: 'normal',
    loose: 'relaxed',
  };
  return mapping[gap] || 'normal';
}

/**
 * Get value coercion for a part type
 */
function getPartCoercion(partType) {
  switch (partType) {
    case 'number':
      return 'Number(e.target.value)';
    case 'checkbox':
      return 'e.target.checked';
    case 'date':
    case 'time':
    case 'datetime-local':
      return 'e.target.value';
    default:
      return 'e.target.value';
  }
}

/**
 * Get default value for a part type
 */
function getPartDefault(partType) {
  switch (partType) {
    case 'number':
      return '0';
    case 'checkbox':
      return 'false';
    default:
      return '""';
  }
}

/**
 * Generate composite field implementation
 */
export function generateCompositeField(spec, allowlist) {
  const { name, composite, value, aria, description } = spec;
  const parts = composite.parts || [];
  const layout = composite.layout || 'row';
  const gap = composite.gap || 'normal';
  const separator = composite.separator || null;

  if (parts.length === 0) {
    throw new Error(`Composite field ${name} must have at least one part`);
  }

  // Build part renders
  const partRenders = parts.map((part, index) => {
    const partType = part.type || 'text';
    const partLabel = part.label || part.name;
    const partCoercion = getPartCoercion(partType);
    const partDefault = getPartDefault(partType);
    const hasNextPart = index < parts.length - 1;
    const showSeparator = separator && hasNextPart;

    // Get allowed props for this part's input type
    const allowedProps = getAllowedPropsForType(partType, allowlist);
    const filteredProps = filterPartProps(part.props || {}, allowedProps);

    return `
        {/* ${part.name} part */}
        <Controller
          name={\`\${name}.${part.name}\` as any}
          control={control as any}
          render={({ field }) => (
            <div style={{ flex: 1 }}>
              ${part.label ? `<FormLabel htmlFor={\`\${name}-${part.name}\`} size="sm">${partLabel}</FormLabel>` : ''}
              <input
                type="${partType}"
                id={\`\${name}-${part.name}\`}
                disabled={disabled}
                aria-invalid={hasError || undefined}
                aria-describedby={description ? \`\${name}-desc\` : undefined}
                ${filteredProps}
                value={field.value ?? ${partDefault}}
                onChange={(e) => field.onChange(${partCoercion})}
                onBlur={field.onBlur}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: hasError ? '1px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              />
            </div>
          )}
        />
        ${showSeparator ? `<span style={{ padding: '0 8px', alignSelf: 'center' }}>${separator}</span>` : ''}`;
  }).join('\n');

  // Build error aggregation
  const partErrorChecks = parts.map(p => `(errors as any)?.[name]?.${p.name}`).join(' || ');
  const partErrorMessages = parts.map(p => `(errors as any)?.[name]?.${p.name}?.message`).join(', ');

  const implementation = `/**
 * ${name} Component
 * 
 * ${description || `${name} field with Zod validation via react-hook-form.`}
 * Composite field with parts: ${parts.map(p => p.name).join(', ')}
 */

import React from 'react';
import { Controller, type FieldValues } from 'react-hook-form';
import type { FieldComponentProps } from '../../form-core/types';
import { FormLabel, FormHelperText, Stack } from '@intstudio/ds';

export interface ${name}Props<T extends FieldValues = FieldValues>
  extends FieldComponentProps<T> {
  // Composite field - no additional props
}

export function ${name}<T extends FieldValues = FieldValues>({
  name,
  control,
  errors,
  label,
  required,
  disabled,
  description,
}: ${name}Props<T>) {
  // Aggregate errors from all parts
  const hasError = Boolean(${partErrorChecks});
  const errorMessage = [${partErrorMessages}].find(Boolean) as string | undefined;

  return (
    <Stack spacing="tight">
      {label && (
        <FormLabel htmlFor={name} required={required} size="md">
          {label}
        </FormLabel>
      )}

      {/* Composite parts - ${layout} layout */}
      <div style={{ display: 'flex', flexDirection: '${layout === 'stack' ? 'column' : 'row'}', gap: '${gapToSpacing(gap) === 'tight' ? '8px' : gapToSpacing(gap) === 'relaxed' ? '16px' : '12px'}', alignItems: '${layout === 'row' ? 'flex-start' : 'stretch'}' }}>
${partRenders}
      </div>

      {description && (
        <div id={\`\${name}-desc\`}>
          <FormHelperText size="sm">
            {description}
          </FormHelperText>
        </div>
      )}

      {hasError && (
        <FormHelperText variant="error" size="sm">
          {errorMessage}
        </FormHelperText>
      )}
    </Stack>
  );
}
`;

  return implementation;
}

/**
 * Get allowed DOM props for a type
 */
function getAllowedPropsForType(inputType, allowlist) {
  const common = allowlist.common || [];
  const typeSpecific = allowlist.byType[inputType] || [];
  return new Set([...common, ...typeSpecific]);
}

/**
 * Filter part props to only allowed ones
 */
function filterPartProps(props, allowedProps) {
  return Object.entries(props)
    .filter(([key]) => allowedProps.has(key))
    .map(([key, val]) => `${key}={${JSON.stringify(val)}}`)
    .join('\n                ');
}
