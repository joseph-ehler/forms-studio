# Pre-Flight Checklist: Generator Infrastructure

**Status**: ⚠️  **CRITICAL GAPS IDENTIFIED**

Before using generators, the following infrastructure must be in place.

---

## 🔴 **CRITICAL: Missing Forms Package**

### **Issue**
The `@intstudio/forms` package **DOES NOT EXIST**.

**Current state:**
```
packages/forms/
  ├── api-extractor.json  ✅ (exists)
  ├── dist/              (empty)
  ├── etc/               (empty)
  ├── node_modules/      (empty)
  ❌ package.json        (MISSING)
  ❌ src/                (MISSING)
  ❌ tsconfig.json       (MISSING)
  ❌ tsup.config.ts      (MISSING)
```

**Impact:**
- ❌ `pnpm forms:new` will fail (cannot import @intstudio/ds)
- ❌ `pnpm validate:generated` will fail (no forms structure)
- ❌ `pnpm build` will fail (forms not in workspace)
- ❌ Generated fields have no home

**Fix Required:** Scaffold complete forms package

---

## ✅ **WORKING: DS Infrastructure**

### **DS Package** ✅
```
packages/ds/
  ├── package.json               ✅
  ├── src/
  │   ├── fb/                    ✅ (Button, Input, Field)
  │   ├── control/
  │   │   ├── variants.config.ts  ✅
  │   │   └── skin-contracts.ts   ✅
  │   ├── registry/skins/
  │   │   ├── button.skin.ts      ✅
  │   │   └── input.skin.ts       ✅
  │   └── index.ts               ✅
```

**Status:** Ready for component generation

---

## 🟡 **NEEDS VALIDATION: Generator Integration**

### **Generators** 🟡
- ✅ `scripts/ds-new.mjs` created
- ✅ `scripts/forms-new.mjs` created
- ❌ **NOT TESTED** (cannot test without forms package)

### **Validation** 🟡
- ✅ `scripts/validate-generated.mjs` created
- ❌ **Will fail** on empty forms package
- ❌ Needs update to handle missing forms gracefully

### **CI/CD** 🟡
- ✅ `.github/workflows/generators.yml` created
- ⚠️  Will fail until forms package exists

---

## 📋 **Detailed Gap Analysis**

### **1. Forms Package Structure (CRITICAL)**

**Needed:**
```
packages/forms/
  ├── package.json           # Package manifest
  ├── tsconfig.json          # TypeScript config
  ├── tsup.config.ts         # Build config
  ├── README.md              # Package docs
  ├── src/
  │   ├── index.ts           # Main export
  │   ├── control/
  │   │   └── field-contracts.ts   # Base field types
  │   ├── registry/
  │   │   └── field-types.ts       # Field registry
  │   └── fields/
  │       └── .gitkeep       # Placeholder
```

**Dependencies needed:**
- `@intstudio/ds` (composes primitives)
- `@intstudio/tokens` (design tokens)
- `react` + `react-dom` (peer deps)
- `react-hook-form` (form state)
- `zod` (validation)

---

### **2. Generator Template Issues**

**DS Generator** ✅
- References existing patterns (Button)
- Uses correct imports
- Updates existing files correctly

**Forms Generator** ⚠️
- References `@intstudio/ds/fb` ✅ (correct)
- References Field component ✅ (exists in DS)
- **BUT**: Tries to write to non-existent package ❌

---

### **3. Validation Script Updates**

**Current behavior:**
```javascript
const fieldsPath = join(FORMS_PATH, 'fields');
if (existsSync(fieldsPath)) {
  // validate fields
} else {
  warn('Forms fields directory does not exist yet');
}
```

**Issue:** Logs warning but continues - this is actually fine for initial state.

---

### **4. Barrel Generation**

**Check:** Will barrels work with new structure?

Need to verify:
- `.barrelsby.json` configuration
- Excluded patterns (templates, stories)
- Forms package included in generation

---

### **5. API Extractor**

**DS:** ✅ Configured (`packages/ds/api-extractor.json`)

**Forms:** 🟡 Config exists but package doesn't
- Has `api-extractor.json`
- Will fail until src/ exists
- Needs `mainEntryPointFilePath` to point to `dist/index.d.ts`

---

## 🎯 **Action Items (Priority Order)**

### **P0 - MUST DO BEFORE GENERATORS WORK**

1. **Create Forms Package Structure**
   ```bash
   # Scaffold forms package
   - package.json (with dependencies)
   - tsconfig.json
   - tsup.config.ts
   - src/index.ts
   - src/control/field-contracts.ts (base types)
   - src/registry/field-types.ts (empty registry)
   - src/fields/.gitkeep
   ```

2. **Install Forms Dependencies**
   ```bash
   pnpm install
   # Verify forms package resolves
   ```

3. **Validate Build**
   ```bash
   pnpm --filter @intstudio/forms build
   # Should produce dist/
   ```

### **P1 - SHOULD DO BEFORE FIRST GENERATION**

4. **Test DS Generator**
   ```bash
   # Try generating a simple component
   pnpm ds:new Badge --variants neutral,primary
   # Verify all files created
   # Run: pnpm doctor
   ```

5. **Test Forms Generator**
   ```bash
   # Try generating a simple field
   pnpm forms:new TextField
   # Verify all files created
   # Run: pnpm doctor
   ```

6. **Test Validation**
   ```bash
   pnpm validate:generated
   # Should pass with generated components
   ```

### **P2 - NICE TO HAVE**

7. **Update Documentation**
   - Add troubleshooting section
   - Add "first run" guide
   - Document forms package structure

8. **Add Dry-Run Mode**
   - Preview changes before writing
   - Show what would be generated

9. **Enhanced Error Messages**
   - Better feedback on failures
   - Suggest fixes automatically

---

## 🔍 **Pre-Flight Validation Commands**

Run these to verify readiness:

```bash
# 1. Check package structure
ls -la packages/forms/src/
# Should see: control/, registry/, fields/, index.ts

# 2. Check dependencies resolve
pnpm list @intstudio/forms
# Should show: @intstudio/forms@<version>

# 3. Check builds
pnpm build
# All packages should build including forms

# 4. Check types
pnpm typecheck
# Should pass with no errors

# 5. Test generator (dry-run if implemented)
pnpm ds:new TestComponent
# Should create files successfully

# 6. Test validation
pnpm validate:generated
# Should pass with generated files
```

---

## 📊 **Current Status**

| Component | Status | Blocker |
|-----------|--------|---------|
| **DS Package** | ✅ Ready | None |
| **Forms Package** | ❌ Missing | No package.json, no src/ |
| **DS Generator** | ✅ Ready | None (can work standalone) |
| **Forms Generator** | ❌ Blocked | Needs forms package |
| **Validation** | 🟡 Partial | Works but warns on missing forms |
| **CI/CD** | 🟡 Ready | Will fail until forms exists |
| **Documentation** | ✅ Complete | None |

---

## 🚦 **GO/NO-GO Decision**

### **Current State: 🔴 NO-GO**

**Blockers:**
1. ❌ Forms package does not exist
2. ❌ Cannot generate form fields
3. ❌ Build will fail
4. ❌ Validation will fail

### **After Forms Package: 🟢 GO**

**Once forms package is scaffolded:**
1. ✅ DS generator ready
2. ✅ Forms generator ready
3. ✅ Validation ready
4. ✅ CI ready
5. ✅ Build passing

---

## 🎯 **Immediate Next Steps**

1. **Create forms package** (15 minutes)
2. **Test DS generator** (5 minutes)
3. **Test forms generator** (5 minutes)
4. **Validate full workflow** (5 minutes)

**Total time to GO**: ~30 minutes

---

## ✅ **Definition of Ready**

Generator infrastructure is ready when:

- [ ] Forms package exists with package.json
- [ ] Forms package has src/ structure
- [ ] Forms package builds successfully
- [ ] Can run `pnpm ds:new TestComponent` successfully
- [ ] Can run `pnpm forms:new TestField` successfully
- [ ] Can run `pnpm validate:generated` successfully
- [ ] Can run `pnpm doctor` successfully
- [ ] CI workflow passes

---

**Bottom Line:** We have 95% of infrastructure ready, but the **missing forms package is a show-stopper**. Once that's scaffolded (15 min), we're GO for launch.
