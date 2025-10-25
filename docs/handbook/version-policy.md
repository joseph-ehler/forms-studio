# Version Policy - Quality Layer Dependencies

**Locked versions for stability and compatibility**

---

## Current Matrix (Locked)

| Package | Version | Why |
|---------|---------|-----|
| **tailwindcss** | 3.4.14 | Max Flowbite compatibility (v4 experimental) |
| **typescript** | 5.8.2 | Flowbite peer: `>=4.8.4 <5.9.0` |
| **flowbite-react** | 0.10.2 | Stable, matches blocks library |
| **flowbite** | 2.5.2 | Pairs with flowbite-react 0.10.x |

---

## Enforcement

### pnpm Overrides (Root)

```json
{
  "pnpm": {
    "overrides": {
      "tailwindcss": "3.4.14",
      "typescript": "5.8.2",
      "flowbite-react": "0.10.2",
      "flowbite": "2.5.2"
    }
  }
}
```

**Result**: All packages use these exact versions.

### Verification Script

```bash
# Check locked versions match
pnpm list tailwindcss flowbite flowbite-react typescript --depth=0
```

**CI**: Fail if versions mismatch.

---

## Upgrade Playbook

**Goal**: Upgrade safely without breaking the world.

### When to Upgrade

#### Tailwind v4
- **Trigger**: Flowbite officially supports v4
- **Timeline**: Likely 6+ months
- **Risk**: High (major version)

#### TypeScript 5.9+
- **Trigger**: Flowbite peer range updates
- **Timeline**: When Flowbite ships support
- **Risk**: Low (minor features)

#### Flowbite Minor (0.10.x → 0.11.x)
- **Trigger**: Bug fixes or new components needed
- **Timeline**: As needed
- **Risk**: Low (minor version)

#### Flowbite Major (0.x → 1.x)
- **Trigger**: Breaking changes needed
- **Timeline**: When stable
- **Risk**: High (major version)

### Upgrade Process

1. **Spike** (isolated branch)
   ```bash
   git checkout -b spike/upgrade-flowbite-0.11
   
   # Update overrides
   # Update package.json in DS
   pnpm install
   
   # Test locally
   pnpm build
   pnpm play
   # Validate quality-layer-demo works
   ```

2. **Validate**
   - [ ] All wrappers still build
   - [ ] Storybook renders correctly
   - [ ] Axe a11y tests pass
   - [ ] Demo page works end-to-end
   - [ ] No new peer warnings

3. **Document Breaking Changes**
   ```markdown
   ## Breaking Changes (Flowbite 0.11.0)
   
   - Modal API changed: `show` → `open`
   - Button `color` prop removed
   
   ### Migration
   
   Run codemod:
   `node scripts/codemods/flowbite-0.11-upgrade.mjs`
   ```

4. **Codemod** (if needed)
   - Write AST transform
   - Test dry-run
   - Apply to all packages

5. **PR** (small, focused)
   - Title: `chore: upgrade flowbite-react 0.10.2 → 0.11.0`
   - Body: Breaking changes + migration steps
   - Label: `dependencies`
   - Reviewers: Team

6. **Merge & Monitor**
   - Watch CI
   - Monitor Sentry/logs for regressions
   - Be ready to rollback

---

## Compatibility Notes

### Flowbite Blocks Library

The `flowbite-react-blocks-1.8.0-beta/` folder contains 450+ example blocks.

**Authored against**: Flowbite 2.x / flowbite-react 0.10.x

**When using**:
- Most blocks work as-is
- Some may reference newer APIs (check on copy)
- Keep a `docs/compat-notes.md` if you hit issues

**If mismatch found**:
1. Check Flowbite changelog for API changes
2. Adjust block code to match locked version
3. Document in `docs/compat-notes.md`

### Tailwind v4 Migration (Future)

When Flowbite supports Tailwind v4:

1. **Audit breaking changes**
   - Config format changes
   - Plugin API changes
   - Utility class changes

2. **Test tokens**
   - Ensure `--ds-*` variables still work
   - Verify Tailwind maps correctly

3. **Staged rollout**
   - DS package first
   - Playground second
   - Apps third

4. **Rollback plan**
   - Keep v3 branch
   - Document rollback steps

---

## Version Check Script

Add to `package.json`:

```json
{
  "scripts": {
    "versions:check": "node scripts/check-versions.mjs"
  }
}
```

**Script** (`scripts/check-versions.mjs`):
```javascript
#!/usr/bin/env node
import { execSync } from 'child_process';

const required = {
  tailwindcss: '3.4.14',
  typescript: '5.8.2',
  'flowbite-react': '0.10.2',
  flowbite: '2.5.2',
};

console.log('🔍 Checking locked versions...\n');

let allMatch = true;

for (const [pkg, expectedVersion] of Object.entries(required)) {
  try {
    const output = execSync(`pnpm list ${pkg} --depth=0 --json`, {
      encoding: 'utf-8',
    });
    const json = JSON.parse(output);
    const actualVersion = json[0]?.dependencies?.[pkg]?.version || 'NOT FOUND';

    const match = actualVersion === expectedVersion;
    const icon = match ? '✅' : '❌';
    
    console.log(`${icon} ${pkg}: ${actualVersion} ${match ? '' : `(expected ${expectedVersion})`}`);
    
    if (!match) allMatch = false;
  } catch (err) {
    console.log(`❌ ${pkg}: ERROR - ${err.message}`);
    allMatch = false;
  }
}

console.log('');

if (!allMatch) {
  console.error('❌ Version mismatch detected!\n');
  console.error('Run: rm -rf node_modules pnpm-lock.yaml && pnpm install\n');
  process.exit(1);
}

console.log('✅ All versions match!\n');
```

Run in CI:
```yaml
# .github/workflows/ci.yml
- name: Check versions
  run: pnpm versions:check
```

---

## Icons Policy

**Prefer**: `flowbite-react-icons`

**Why**:
- Consistent with Flowbite ecosystem
- Tree-shakeable
- TypeScript support

**Avoid**: Inline SVG bloat (unless bespoke icon)

**Usage**:
```tsx
import { HiX, HiCheck } from 'flowbite-react-icons/hi';

<Button>
  <HiCheck className="mr-2 h-4 w-4" />
  Save
</Button>
```

---

## Dark Mode Strategy

**Strategy**: Class-based (`.dark`)

**Why**:
- Controlled (not media query)
- SSR-safe
- User preference override

**Implementation**:
```javascript
// tailwind.config.js
export default {
  darkMode: 'class',
  // ...
}
```

**Usage**:
```tsx
<div className="bg-white text-black dark:bg-gray-900 dark:text-white">
```

**Toggle** (app-level):
```tsx
const [darkMode, setDarkMode] = useState(false);

<html className={darkMode ? 'dark' : ''}>
```

---

## Token Naming

**Convention**: `--ds-*` prefix

**Permanence**: Forever (no alias churn)

**Why**:
- Clear namespace
- Predictable
- Searchable

**Examples**:
```css
--ds-color-primary
--ds-color-text
--ds-color-background
--ds-space-4
--ds-radius-md
--ds-shadow-overlay
```

**Usage in Tailwind**:
```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: 'var(--ds-color-primary)',
      text: 'var(--ds-color-text)',
    },
    spacing: {
      4: 'var(--ds-space-4)',
    },
  },
}
```

---

## Summary

**Locked for stability**:
- Tailwind 3.4.14
- TypeScript 5.8.2
- Flowbite 0.10.2 / 2.5.2

**Upgrade when**:
- Flowbite officially supports newer versions
- Spike → validate → codemod → PR → monitor

**Check versions**:
```bash
pnpm versions:check
```

**Result**: Predictable, safe upgrades without surprise breakage.
