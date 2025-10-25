# Token System: God-Tier Architecture

## Current State ✅

**What you have:**
- ✅ `tokens.css` - CSS custom properties (single source of truth)
- ✅ `tailwind-theme.ts` - Maps to CSS vars
- ✅ Dark mode support
- ✅ Reduced motion support
- ✅ Good naming conventions

**This is 70% of god-tier!**

---

## The God-Tier Vision

### 1. **Single Source of Truth** (Primitive Tokens)

Create a **JSON/TypeScript source** that generates everything:

```
tokens.source.ts (primitives)
       ↓
   [codegen]
       ↓
   ├─→ tokens.css (CSS variables)
   ├─→ tailwind-theme.ts (Tailwind config)
   ├─→ tokens.d.ts (TypeScript types)
   ├─→ figma-tokens.json (Figma sync)
   └─→ storybook-tokens.json (Docs)
```

**Why:** Zero manual sync, impossible to have mismatches.

---

## Implementation Strategy

### Phase 1: Token Source (Primitive → Semantic)

**Create:** `packages/tokens/src/tokens.source.ts`

```typescript
/**
 * Design Token Source
 * 
 * Primitive tokens → Semantic tokens → Generated outputs
 * This is the ONLY place to edit token values.
 */

// ============================================
// PRIMITIVE TOKENS (Raw values)
// ============================================

const primitives = {
  // Colors - Raw hex values
  colors: {
    gray: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      900: '#0b0b0c',
    },
    blue: {
      50: '#eff6ff',
      500: '#2F6FED',
      600: '#1e5dd7',
    },
    red: {
      50: '#fef2f2',
      600: '#dc2626',
    },
    green: {
      50: '#f0fdf4',
      600: '#16a34a',
    },
    yellow: {
      50: '#fffbeb',
      500: '#f59e0b',
    },
    cyan: {
      50: '#ecfeff',
      600: '#0891b2',
    },
  },
  
  // Spacing - Raw values
  spacing: {
    0: '0',
    1: '0.25rem',    // 4px
    2: '0.5rem',     // 8px
    3: '0.75rem',    // 12px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    8: '2rem',       // 32px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
  },
  
  // Border radius
  radius: {
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    none: 'none',
    'overlay-sm': '0 4px 12px rgba(0, 0, 0, 0.08)',
    'overlay-md': '0 8px 24px rgba(0, 0, 0, 0.12)',
    'overlay-lg': '0 12px 32px rgba(0, 0, 0, 0.16)',
    'overlay-xl': '0 20px 48px rgba(0, 0, 0, 0.20)',
  },
  
  // Z-index
  zIndex: {
    base: 0,
    dropdown: 50,
    sticky: 60,
    panel: 70,
    overlay: 80,
    modal: 90,
    popover: 95,
    toast: 100,
    tooltip: 110,
  },
  
  // Typography
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  fontFamily: {
    sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  },
  
  // Transitions
  transition: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Touch targets
  touchTarget: '44px',
  
  // Focus
  focus: {
    ring: '2px',
    offset: '2px',
  },
} as const;

// ============================================
// SEMANTIC TOKENS (Intent-based)
// ============================================

export const tokens = {
  color: {
    surface: {
      base: primitives.colors.gray[50],       // Background
      raised: primitives.colors.gray[50],     // Elevated cards
      sunken: primitives.colors.gray[100],    // Input backgrounds
      overlay: '#ffffff',
    },
    text: {
      DEFAULT: primitives.colors.gray[900],
      subtle: primitives.colors.gray[500],
      muted: primitives.colors.gray[400],
      inverse: '#ffffff',
    },
    border: {
      subtle: primitives.colors.gray[200],
      medium: primitives.colors.gray[300],
      strong: primitives.colors.gray[400],
    },
    primary: {
      DEFAULT: primitives.colors.blue[500],
      hover: primitives.colors.blue[600],
      subtle: primitives.colors.blue[50],
    },
    success: {
      DEFAULT: primitives.colors.green[600],
      subtle: primitives.colors.green[50],
    },
    warning: {
      DEFAULT: primitives.colors.yellow[500],
      subtle: primitives.colors.yellow[50],
    },
    danger: {
      DEFAULT: primitives.colors.red[600],
      subtle: primitives.colors.red[50],
    },
    info: {
      DEFAULT: primitives.colors.cyan[600],
      subtle: primitives.colors.cyan[50],
    },
  },
  
  spacing: primitives.spacing,
  radius: primitives.radius,
  shadow: primitives.shadows,
  zIndex: primitives.zIndex,
  fontSize: primitives.fontSize,
  lineHeight: primitives.lineHeight,
  fontWeight: primitives.fontWeight,
  fontFamily: primitives.fontFamily,
  transition: primitives.transition,
  touchTarget: primitives.touchTarget,
  focus: primitives.focus,
  
  // Theme modes
  modes: {
    dark: {
      surface: {
        base: primitives.colors.gray[900],
        raised: '#1a1a1b',
        sunken: '#000000',
      },
      text: {
        DEFAULT: '#ffffff',
        subtle: '#a1a1aa',
        muted: '#71717a',
      },
      border: {
        subtle: '#27272a',
        medium: '#3f3f46',
      },
    },
  },
} as const;

export type TokensType = typeof tokens;
export default tokens;
```

---

### Phase 2: Codegen Script

**Create:** `packages/tokens/scripts/generate.ts`

```typescript
/**
 * Token Generator
 * 
 * Reads tokens.source.ts and generates:
 * - tokens.css (CSS custom properties)
 * - tailwind-theme.ts (Tailwind config)
 * - tokens.d.ts (TypeScript types)
 */

import fs from 'fs';
import path from 'path';
import tokens from '../src/tokens.source';

// Generate CSS
function generateCSS() {
  let css = `/**
 * @intstudio/tokens - Design System Tokens
 * ⚠️  AUTO-GENERATED - DO NOT EDIT
 * Edit packages/tokens/src/tokens.source.ts instead
 */

:root {
`;

  // Colors
  Object.entries(tokens.color).forEach(([category, values]) => {
    css += `\n  /* ${category} */\n`;
    Object.entries(values).forEach(([key, value]) => {
      const name = key === 'DEFAULT' ? category : `${category}-${key}`;
      css += `  --ds-color-${name}: ${value};\n`;
    });
  });

  // Spacing
  css += `\n  /* Spacing */\n`;
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    css += `  --ds-space-${key}: ${value};\n`;
  });

  // ... etc for all token types

  css += `}\n\n/* Dark mode */\n@media (prefers-color-scheme: dark) {\n  :root {\n`;
  
  // Dark mode overrides
  Object.entries(tokens.modes.dark).forEach(([category, values]) => {
    Object.entries(values).forEach(([key, value]) => {
      const name = key === 'DEFAULT' ? category : `${category}-${key}`;
      css += `    --ds-color-${name}: ${value};\n`;
    });
  });
  
  css += `  }\n}\n`;

  fs.writeFileSync(
    path.join(__dirname, '../dist/tokens.css'),
    css
  );
}

// Generate TypeScript types
function generateTypes() {
  let types = `/**
 * @intstudio/tokens - TypeScript Types
 * ⚠️  AUTO-GENERATED - DO NOT EDIT
 */

// Token paths for autocomplete
export type ColorToken = 
`;

  // Generate union types for each token category
  Object.keys(tokens.color).forEach(category => {
    types += `  | 'color.${category}'\n`;
  });

  types += `;\n\nexport type SpacingToken = ${Object.keys(tokens.spacing).map(k => `'${k}'`).join(' | ')};\n`;
  
  // ... etc

  fs.writeFileSync(
    path.join(__dirname, '../dist/tokens.d.ts'),
    types
  );
}

// Generate Tailwind theme
function generateTailwind() {
  // Map tokens to Tailwind format
  const theme = {
    colors: {},
    spacing: {},
    // ... etc
  };

  Object.entries(tokens.color).forEach(([category, values]) => {
    Object.entries(values).forEach(([key, value]) => {
      const name = key === 'DEFAULT' ? category : `${category}-${key}`;
      theme.colors[category] = theme.colors[category] || {};
      theme.colors[category][key] = `var(--ds-color-${name})`;
    });
  });

  const output = `/**
 * @intstudio/tokens - Tailwind Theme
 * ⚠️  AUTO-GENERATED - DO NOT EDIT
 */

export const tokensTheme = ${JSON.stringify(theme, null, 2)} as const;

export default tokensTheme;
`;

  fs.writeFileSync(
    path.join(__dirname, '../dist/tailwind-theme.ts'),
    output
  );
}

// Run all generators
generateCSS();
generateTypes();
generateTailwind();

console.log('✅ Token generation complete!');
```

**Add to `package.json`:**
```json
{
  "scripts": {
    "generate": "tsx scripts/generate.ts",
    "prepublishOnly": "pnpm generate"
  }
}
```

---

### Phase 3: Type-Safe Token Hook

**Create:** `packages/ds/src/hooks/useToken.ts`

```typescript
import { useMemo } from 'react';

type TokenPath = `color.${string}` | `spacing.${string}` | `fontSize.${string}`;

/**
 * Type-safe token access with autocomplete
 * 
 * @example
 * const primary = useToken('color.primary');
 * const space4 = useToken('spacing.4');
 */
export function useToken(path: TokenPath): string {
  return useMemo(() => {
    if (typeof window === 'undefined') return '';
    
    const [category, key] = path.split('.');
    const cssVar = `--ds-${category}-${key}`;
    
    return getComputedStyle(document.documentElement)
      .getPropertyValue(cssVar)
      .trim();
  }, [path]);
}

/**
 * Get multiple tokens at once
 */
export function useTokens<T extends Record<string, TokenPath>>(
  paths: T
): { [K in keyof T]: string } {
  return useMemo(() => {
    const result = {} as { [K in keyof T]: string };
    
    Object.entries(paths).forEach(([key, path]) => {
      result[key as keyof T] = useToken(path as TokenPath);
    });
    
    return result;
  }, [paths]);
}
```

---

### Phase 4: ESLint Rules (Token Enforcement)

**Create:** `tools/eslint-plugin-cascade/rules/no-magic-colors.js`

```javascript
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded color values, require design tokens',
    },
    fixable: 'code',
  },
  create(context) {
    const hexColorRegex = /#[0-9A-Fa-f]{3,8}/;
    const rgbRegex = /rgba?\(/;
    
    return {
      Literal(node) {
        const value = node.value;
        
        if (typeof value === 'string' && 
            (hexColorRegex.test(value) || rgbRegex.test(value))) {
          context.report({
            node,
            message: 'Hardcoded color detected. Use design tokens instead (e.g., var(--ds-color-primary))',
          });
        }
      },
      
      TemplateElement(node) {
        const value = node.value.raw;
        
        if (hexColorRegex.test(value) || rgbRegex.test(value)) {
          context.report({
            node,
            message: 'Hardcoded color detected. Use design tokens instead.',
          });
        }
      },
    };
  },
};
```

**Add to `.eslintrc.js`:**
```javascript
rules: {
  'cascade/no-magic-colors': 'error',
  'cascade/no-magic-spacing': 'error',
}
```

---

### Phase 5: Token Contract System

**Create:** `packages/tokens/src/contracts.ts`

```typescript
/**
 * Token Contracts
 * 
 * Enforces valid token usage patterns at runtime (dev only)
 */

export type TokenCategory = 'color' | 'spacing' | 'radius' | 'shadow' | 'zIndex';

const validTokens: Record<TokenCategory, RegExp> = {
  color: /^var\(--ds-color-[\w-]+\)$/,
  spacing: /^var\(--ds-space-\d+\)$/,
  radius: /^var\(--ds-radius-(sm|md|lg|xl|full)\)$/,
  shadow: /^var\(--ds-shadow-[\w-]+\)$/,
  zIndex: /^var\(--ds-z-[\w-]+\)$/,
};

/**
 * Validate token usage (dev mode only)
 * Throws descriptive error if invalid
 */
export function validateToken(
  value: string,
  category: TokenCategory,
  componentName: string
): void {
  if (process.env.NODE_ENV === 'production') return;
  
  const pattern = validTokens[category];
  
  if (!pattern.test(value)) {
    throw new Error(
      `[DS.${componentName}] Invalid ${category} token: "${value}"\n` +
      `Expected format: var(--ds-${category}-*)\n` +
      `See packages/tokens/README.md for valid tokens.`
    );
  }
}
```

---

### Phase 6: Storybook Token Documentation

**Create:** `packages/ds/.storybook/TokensDocumentation.stories.mdx`

```mdx
import { Meta } from '@storybook/blocks';
import tokens from '@intstudio/tokens/tokens.source';

<Meta title="Foundation/Design Tokens" />

# Design Tokens

Single source of truth for all design values.

## Colors

### Surface
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
  {Object.entries(tokens.color.surface).map(([key, value]) => (
    <div key={key}>
      <div style={{ 
        background: value, 
        height: 80, 
        borderRadius: 8,
        border: '1px solid #ddd' 
      }} />
      <p style={{ marginTop: 8, fontSize: 12 }}>
        <strong>{key}</strong><br/>
        <code style={{ fontSize: 10 }}>{value}</code>
      </p>
    </div>
  ))}
</div>

{/* Auto-generate docs for all token categories */}
```

---

### Phase 7: Token Deprecation System

**Create:** `packages/tokens/deprecations.json`

```json
{
  "deprecated": [
    {
      "old": "--ds-color-grey-500",
      "new": "--ds-color-gray-500",
      "reason": "Standardizing on 'gray' spelling",
      "since": "v2.1.0",
      "removeIn": "v3.0.0"
    }
  ]
}
```

**Watcher script:**
```typescript
// Warns when deprecated tokens are used
function checkDeprecations() {
  const files = getAllCSSFiles();
  const deprecations = require('./deprecations.json');
  
  deprecations.deprecated.forEach(({ old, new, reason }) => {
    files.forEach(file => {
      if (file.includes(old)) {
        console.warn(
          `⚠️  Deprecated token in ${file}:\n` +
          `   ${old} → ${new}\n` +
          `   Reason: ${reason}`
        );
      }
    });
  });
}
```

---

## God-Tier Features Unlocked

### 1. **Zero Sync Drift**
- Edit `tokens.source.ts` → everything regenerates
- Impossible to have CSS/Tailwind/TypeScript mismatches

### 2. **Type-Safe Everywhere**
```typescript
// Autocomplete + type checking
const color = useToken('color.primary'); // ✅
const bad = useToken('color.purple'); // ❌ TypeScript error
```

### 3. **Enforce at Build Time**
```typescript
// ESLint catches this:
const style = { color: '#2F6FED' }; // ❌ Error: use token

// Correct:
const style = { color: 'var(--ds-color-primary)' }; // ✅
```

### 4. **Contract Validation**
```typescript
// Runtime checks (dev mode):
validateToken('var(--ds-color-purple)', 'color', 'Button');
// ❌ Throws: Invalid color token, see docs
```

### 5. **Self-Documenting**
- Storybook auto-generates token docs
- TypeScript provides inline docs
- Deprecation warnings guide migrations

### 6. **Themeable**
```typescript
// Swap themes at runtime
document.documentElement.setAttribute('data-theme', 'dark');
// All tokens update automatically
```

### 7. **Figma Sync** (Future)
- Generate `figma-tokens.json`
- Figma plugin reads tokens
- Designers always work with latest values

---

## Implementation Timeline

**Week 1: Foundation**
- Day 1-2: Create `tokens.source.ts`
- Day 3: Build codegen script
- Day 4: Add npm scripts + CI integration
- Day 5: Validate output matches current

**Week 2: Types & Contracts**
- Day 1: Generate TypeScript types
- Day 2: Create `useToken` hook
- Day 3: Add ESLint rules
- Day 4: Add runtime contracts
- Day 5: Test + document

**Week 3: Polish**
- Day 1-2: Storybook documentation
- Day 3: Deprecation system
- Day 4: Migration guide
- Day 5: Team training

---

## Success Metrics

**God-Tier = ALL of these:**
- ✅ Single file to edit (tokens.source.ts)
- ✅ Type-safe token access
- ✅ Build-time validation (ESLint)
- ✅ Runtime contracts (dev mode)
- ✅ Auto-generated docs
- ✅ Zero sync drift
- ✅ Themeable
- ✅ Deprecation workflow
- ✅ <10s codegen time

---

## Quick Wins (Today)

**Immediate improvements without codegen:**

1. **Add type safety to current setup:**
   ```typescript
   // packages/tokens/src/types.ts
   export type DSColor = 
     | 'surface.base'
     | 'surface.raised'
     | 'text'
     | 'text.subtle'
     | 'primary'
     | 'primary.hover'
     // ... etc
   ;
   ```

2. **Add validation helper:**
   ```typescript
   export function dsColor(path: DSColor): string {
     return `var(--ds-color-${path.replace('.', '-')})`;
   }
   
   // Usage:
   const style = { color: dsColor('primary.hover') }; // Typed!
   ```

3. **Add ESLint rule TODAY:**
   - Install the no-magic-colors rule
   - Run across codebase
   - Fix violations

---

## Recommended Path

**Option 1: Full God-Tier (3 weeks)**
- Build complete system
- Maximum leverage

**Option 2: Incremental (Start today)**
- Week 1: Add types to current system
- Week 2: Add ESLint enforcement  
- Week 3: Add codegen
- Spread over 3 sprints

**My recommendation:** Option 2 (incremental). Get value immediately while building toward full god-tier.

---

**Want me to implement any phase right now?** I can start with types + validation helpers (Quick Wins) and have them working in 30 minutes.
