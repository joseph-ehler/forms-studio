# Compatibility Façades - Deprecation Tracker

This document tracks all deprecated re-exports in `@intstudio/ds/fields/*` that façade to `@intstudio/forms`.

## Active Façades

| Field | Façade Path | Target | Added | Remove By | Codemod |
|-------|-------------|--------|-------|-----------|---------|
| NumberField | `packages/ds/src/fields/NumberField.ts` | `@intstudio/forms/fields` | 2025-10-23 | v2.0.0 | `pnpm codemod:fields` |
| TextareaField | `packages/ds/src/fields/TextareaField.ts` | `@intstudio/forms/fields` | 2025-10-23 | v2.0.0 | `pnpm codemod:fields` |
| CheckboxField | `packages/ds/src/fields/CheckboxField.ts` | `@intstudio/forms/fields` | 2025-10-23 | v2.0.0 | `pnpm codemod:fields` |
| TextField | `packages/ds/src/fields/TextField.ts` | `@intstudio/forms/fields` | 2025-10-23 | v2.0.0 | `pnpm codemod:fields` |
| SelectField | `packages/ds/src/fields/SelectField.ts` | `@intstudio/forms/fields` | 2025-10-23 | v2.0.0 | `pnpm codemod:fields` |
| DateField | `packages/ds/src/fields/DateField.ts` | `@intstudio/forms/fields` | 2025-10-23 | v2.0.0 | `pnpm codemod:fields` |
| TimeField | `packages/ds/src/fields/TimeField.ts` | `@intstudio/forms/fields` | 2025-10-23 | v2.0.0 | `pnpm codemod:fields` |
| RatingField | `packages/ds/src/fields/RatingField.ts` | `@intstudio/forms/fields` | 2025-10-23 | v2.0.0 | `pnpm codemod:fields` |
| SliderField | `packages/ds/src/fields/SliderField.ts` | `@intstudio/forms/fields` | 2025-10-23 | v2.0.0 | `pnpm codemod:fields` |
| RangeField | `packages/ds/src/fields/RangeField.ts` | `@intstudio/forms/fields` | 2025-10-23 | v2.0.0 | `pnpm codemod:fields` |
| DateTimeField | `packages/ds/src/fields/DateTimeField.ts` | `@intstudio/forms/fields` | 2025-10-23 | v2.0.0 | `pnpm codemod:fields` |
| TagInputField | `packages/ds/src/fields/TagInputField.ts` | `@intstudio/forms/fields` | 2025-10-23 | v2.0.0 | `pnpm codemod:fields` |

## Removal Process

1. **Monitor usage**: `grep -r "from '@intstudio/ds/fields'" apps/`
2. **Run codemod**: `pnpm codemod:fields` (when available)
3. **Verify imports**: `pnpm imports:check`
4. **Remove façade**: Delete file + barrel entry
5. **Add ESLint rule**: Prevent resurrection

## Codemod Template

```typescript
// scripts/codemods/migrate-fields-to-forms.mjs
// Rewrites: import { Field } from '@intstudio/ds/fields'
//       →  import { Field } from '@intstudio/forms/fields'

import { Project } from 'ts-morph';

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
const sourceFiles = project.getSourceFiles('apps/**/*.{ts,tsx}');

let count = 0;
for (const file of sourceFiles) {
  const imports = file.getImportDeclarations();
  for (const imp of imports) {
    const module = imp.getModuleSpecifierValue();
    if (module === '@intstudio/ds/fields' || module.startsWith('@intstudio/ds/fields/')) {
      imp.setModuleSpecifier(module.replace('@intstudio/ds/fields', '@intstudio/forms/fields'));
      count++;
    }
  }
  file.saveSync();
}

console.log(`✅ Migrated ${count} field imports to @intstudio/forms`);
```

## ESLint Rule (Post-Removal)

```javascript
// eslint-plugin-cascade/rules/no-ds-fields.js
module.exports = {
  create(context) {
    return {
      ImportDeclaration(node) {
        const value = node.source.value;
        if (value === '@intstudio/ds/fields' || value.startsWith('@intstudio/ds/fields/')) {
          context.report({
            node,
            message: 'Fields removed from DS in v2.0. Import from @intstudio/forms/fields instead.',
            fix(fixer) {
              return fixer.replaceText(
                node.source,
                `'${value.replace('@intstudio/ds/fields', '@intstudio/forms/fields')}'`
              );
            }
          });
        }
      }
    };
  }
};
```

## Migration Checklist (per field)

- [ ] Façade created with `@ts-ignore` and deprecation comment
- [ ] Added to this tracking doc
- [ ] DS barrel exports façade
- [ ] Both packages build green
- [ ] Usage monitored (optional: telemetry)
- [ ] Removal date set (1-2 releases)
- [ ] Codemod ready (when batch complete)
- [ ] ESLint rule drafted (enforce after removal)
