# Tailwind Config for Storybook

**Critical**: Add Storybook paths to Tailwind content globs

---

## Problem

Tailwind needs to "see" all files that use utility classes to generate CSS.

If Storybook stories use utilities not present in source files, those utilities won't be generated → broken styling.

---

## Solution

Add Storybook globs to `tailwind.config.js` content array:

```javascript
// tailwind.config.js or tailwind.config.ts
export default {
  content: [
    // Existing source paths
    './src/**/*.{ts,tsx,js,jsx}',
    './packages/*/src/**/*.{ts,tsx,js,jsx}',
    
    // ADD THESE for Storybook
    './.storybook/**/*.{ts,tsx,mdx}',
    './**/*.stories.@(tsx|mdx)',
  ],
  // ... rest of config
};
```

---

## Where to Apply

### If Tailwind config is per-package:

Update each package that has Storybook stories:
- `packages/ds/tailwind.config.js`
- `packages/demo-app/tailwind.config.js`

### If Tailwind config is at root:

Update root `tailwind.config.js` once.

---

## Verify It Works

1. Add a story with a unique utility:
   ```tsx
   // MyComponent.stories.tsx
   export const Example = () => (
     <div className="bg-purple-950">Unique color</div>
   );
   ```

2. Start Storybook:
   ```bash
   pnpm storybook
   ```

3. Check if `bg-purple-950` is applied
   - If it works: ✅ Config correct
   - If no background: ❌ Missing content glob

---

## Common Mistake

**Wrong** (too specific):
```javascript
content: [
  './src/**/*.tsx',  // Misses .ts, .js, .jsx
]
```

**Right** (catches all):
```javascript
content: [
  './src/**/*.{ts,tsx,js,jsx}',  // All extensions
  './**/*.stories.@(tsx|mdx)',   // All story locations
]
```

---

## Dark Mode Note

If using class-based dark mode:

```javascript
export default {
  darkMode: 'class',  // Not 'media'
  content: [
    // ... globs
  ],
};
```

This allows `.dark` class toggle for Storybook dark mode addon.

---

## Status

- [ ] Add Storybook globs to Tailwind config
- [ ] Test with unique utility in story
- [ ] Verify dark mode toggle works

Add this check to your validation spike.
