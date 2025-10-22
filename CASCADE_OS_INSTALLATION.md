# Cascade OS Installation Guide

**Status**: ✅ Infrastructure created, ready to activate

---

## What Was Created

### ✅ Enforcement Infrastructure (New Files)

1. **`.github/workflows/cascade-os.yml`** - CI enforcement
   - ESLint overlay rules check
   - Playwright smoke tests @375×480
   - Design tokens verification (no magic numbers)

2. **`tests/overlay.spec.ts`** - Playwright smoke tests
   - Footer visible, content scrollable
   - Overlay within viewport
   - Clear/Done button behavior
   - Escape/outside-click closing

3. **`_templates/picker/new/`** - Hygen generator
   - `prompt.js` - Interactive picker creation
   - `field.ejs.t` - Field template
   - `story.ejs.t` - Storybook template

4. **`docs/adr/`** - Architecture Decision Records
   - `README.md` - ADR index
   - `TEMPLATE.md` - ADR template
   - `ADR-001-contentref-auto-wiring.md` - First ADR

5. **`tools/eslint-plugin-cascade/index.js`** - Custom ESLint rules
   - `no-manual-scroll-containers`
   - `require-design-tokens`
   - `prefer-pointer-events`

6. **`docs/ONBOARDING.md`** - New developer checklist

---

## What Needs Manual Merging

### 1. PR Template

**File**: `.github/pull_request_template.md` (already exists)

**Action**: Open `.github/PR_TEMPLATE_MERGE.md` and copy the Cascade OS Checklist block into your existing template.

**Location**: Add at the top or in a dedicated section.

---

### 2. ESLint Configuration

**File**: `packages/wizard-react/.eslintrc.overlay-rules.json` (already exists)

**Current rules** (your existing file):
- ✅ Blocks `react-day-picker/dist/style.css` import
- ✅ Blocks direct `DayPicker` import
- ✅ Blocks manual scroll containers
- ✅ Blocks `position: fixed`
- ✅ Warns on `mousedown` events

**No merge needed!** Your existing ESLint config already has the critical rules.

**Optional**: To enable the custom Cascade plugin rules:

1. Add to root `.eslintrc.json`:
```json
{
  "plugins": ["cascade"],
  "extends": ["./packages/wizard-react/.eslintrc.overlay-rules.json"],
  "rules": {
    "cascade/no-manual-scroll-containers": "error",
    "cascade/require-design-tokens": "warn",
    "cascade/prefer-pointer-events": "warn"
  }
}
```

2. Register the plugin in `package.json`:
```json
{
  "devDependencies": {
    "eslint-plugin-cascade": "file:./tools/eslint-plugin-cascade"
  }
}
```

---

## Activation Steps

### Step 1: Install Dependencies

```bash
# Playwright (if not installed)
pnpm add -D @playwright/test

# Hygen (for generators)
pnpm add -D hygen

# Husky + lint-staged (optional, for git hooks)
pnpm add -D husky lint-staged
```

### Step 2: Update package.json Scripts

```json
{
  "scripts": {
    "gen:picker": "hygen picker new",
    "test:overlay-smoke": "playwright test tests/overlay.spec.ts",
    "prepare": "husky install"
  }
}
```

### Step 3: Configure Git Hooks (Optional)

```bash
# Initialize husky
npx husky install

# Pre-commit: Run lint-staged
npx husky add .husky/pre-commit "npx lint-staged"

# Pre-push: Run overlay smoke tests
npx husky add .husky/pre-push "pnpm test:overlay-smoke"
```

Add to `package.json`:
```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["pnpm -w lint --fix", "git add"]
  }
}
```

### Step 4: Update Playwright Config

Create `playwright.config.ts` (if doesn't exist):

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'Mobile',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'Desktop',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Step 5: Test the Infrastructure

```bash
# 1. Run ESLint
pnpm -w lint

# 2. Run Playwright smoke tests
pnpm test:overlay-smoke

# 3. Generate a test picker
pnpm gen:picker
# Enter name: "TestPicker"
# Select type: "date"

# 4. Verify CI workflow (push to a branch)
git checkout -b test/cascade-os
git add .
git commit -m "test: Cascade OS infrastructure"
git push
# Check GitHub Actions tab
```

---

## Verification Checklist

After activation, verify:

- [ ] **ESLint** blocks manual scroll containers
- [ ] **ESLint** blocks `position: fixed` in fields
- [ ] **ESLint** warns on magic numbers (if custom plugin enabled)
- [ ] **CI workflow** runs on PR
- [ ] **Playwright tests** pass (375×480 viewport)
- [ ] **Generator** creates valid picker (`pnpm gen:picker`)
- [ ] **PR template** shows Cascade OS checklist
- [ ] **Git hooks** run lint on commit (if enabled)

---

## What This Enforces

### 🚫 Blocked (ESLint errors)
- Importing `react-day-picker/dist/style.css` directly
- Using `position: fixed` in overlay code
- Manual scroll containers (`flex-1 min-h-0 overflow-auto`)
- Importing `DayPicker` directly (use `CalendarSkin`)

### ⚠️  Warned (ESLint warnings)
- Magic z-index numbers (use `getZIndex()`)
- Mouse events (prefer pointer events)
- Hardcoded timing values (use tokens)

### ✅ Required (CI fails if missing)
- Playwright smoke tests pass
- Footer visible at 375×480
- Content scrollable
- Overlay within viewport
- Clear/Done buttons work correctly

### 📝 Enforced (PR template)
- 5-step Cascade OS loop filled out
- Evidence provided (console logs/screenshots)
- Root cause identified
- Pattern extraction (if 3rd occurrence)
- Documentation updated

---

## Troubleshooting

### "Playwright not found"
```bash
pnpm add -D @playwright/test
npx playwright install
```

### "Hygen command not found"
```bash
pnpm add -D hygen
```

### "ESLint plugin cascade not found"
1. Ensure `tools/eslint-plugin-cascade/index.js` exists
2. Register in `package.json` devDependencies
3. Run `pnpm install`

### "Overlay tests fail"
1. Ensure dev server runs on `http://localhost:3000`
2. Update `baseURL` in `playwright.config.ts`
3. Adjust selectors in `tests/overlay.spec.ts` to match your app

---

## Next Steps

1. **Merge PR template block** from `.github/PR_TEMPLATE_MERGE.md`
2. **Run activation steps** above
3. **Test with a real PR** following the Cascade OS loop
4. **Generate your first picker** with `pnpm gen:picker`
5. **Run the weekly Foolproof Sweep** (see below)

---

## Weekly Foolproof Sweep (30 min)

Run these searches to catch drift:

```bash
# 1. Find ad-hoc overlays
git grep -n "position: fixed"

# 2. Find CSS imports
git grep -n "react-day-picker/dist/style.css"

# 3. Find manual scroll containers
git grep -n "min-h-0 overflow-auto"

# 4. Find outside-click handlers
git grep -n "onClickOutside"

# 5. Find magic numbers
git grep -n "zIndex.*[0-9]\{3,\}"
```

File tiny PRs to route suspect patterns through primitives.

---

## Success Metrics

Track weekly:
- ✅ Lint violations (should trend ↓)
- ✅ PRs failing overlay smoke (should be 0)
- ✅ Time to root cause (should be <30 min)
- ✅ Patterns converted to primitives (cumulative ↑)

---

**Cascade OS is now on rails!** 🚂

Every PR, every commit, every new picker follows the system automatically.
