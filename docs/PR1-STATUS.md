# PR #1: Runtime Math & Policies - IN PROGRESS

**Status:** ✅ Foundation Complete | 🔄 Integration Pending

---

## ✅ Files Created (5/5)

### 1. `interval-guard.ts` ✅
- [x] `INTERVAL_WIDTH_THRESHOLD` (τ = 0.02)
- [x] `FeasibleInterval` interface
- [x] `uiBoundsForSurface()` - WCAG 1.4.11 constraint
- [x] `textBoundsForFg()` - WCAG 1.4.3 constraint  
- [x] `calculateFeasibleInterval()` - intersection logic
- [x] `handleNarrowInterval()` - neutralize when τ violated

**Contract:** Ensures Y values satisfy BOTH surface and text constraints

### 2. `headroom-targeting.ts` ✅
- [x] `HeadroomTargets` interface
- [x] `DEFAULT_HEADROOM` constants (subtle: +0.3, solid: +0.2)
- [x] `pickYTargetWithHeadroom()` - bias toward text contrast
- [x] `calculateHeadroom()` - measure safety margin
- [x] `meetsHeadroomTarget()` - validation helper

**Contract:** Aims for targets, not just pass/fail

### 3. `text-policy.ts` ✅
- [x] `TextPolicy` interface
- [x] `TEXT_POLICIES` registry
  - Yellow/Amber/Lime [35°-85°] → black (fallback: white ≥7:1)
  - Sky/Mint [160°-200°] → black (fallback: white ≥4.5:1)
- [x] `chooseTextByPolicy()` - codified selection
- [x] `getPolicyForHue()` - lookup helper

**Contract:** Hardcoded yellow exception, no guessing

### 4. `determinism.ts` ✅
- [x] `SeededRandom` class (LCG)
- [x] `next()` - deterministic PRN generation
- [x] `nextInRange()` - bounded random
- [x] `hashToSeed()` - string → seed conversion

**Contract:** Same input → same output

### 5. `cache.ts` ✅
- [x] `PaletteCache` class (LRU)
- [x] `computeSurfaceSignature()` - cache key component
- [x] `get()` / `set()` with LRU eviction
- [x] `getStats()` - hit rate monitoring
- [x] Singleton `paletteCache` instance

**Contract:** Cache by (seed + theme + level + surface + options)

---

## 🔄 Next Steps

### A. Wire into `palette-generator.ts`
```typescript
// Import new modules
import { calculateFeasibleInterval, handleNarrowInterval } from './interval-guard';
import { pickYTargetWithHeadroom, DEFAULT_HEADROOM } from './headroom-targeting';
import { chooseTextByPolicy } from './text-policy';
import { SeededRandom } from './determinism';
import { paletteCache, computeSurfaceSignature } from './cache';

// Extend GeneratedPalette interface
export interface GeneratedPalette {
  // ... existing fields ...
  
  vibrant?: {
    color: string;
    role: 'vibrant-accent';
    warning: 'NO_TEXT_ALLOWED';
  };
  
  _diagnostics: {
    feasibleIntervalWidth: number;
    intervalWasNarrow: boolean;
    headroom: { subtle: number; solid: number };
    textPolicy: string | null;
    computeTimeMs: number;
  };
  
  _pairIds: {
    subtle: string;
    solid: string;
  };
}

// Extend options
export interface GeneratorOptions {
  // ... existing ...
  deterministicSeed?: number;
  customSurface?: string;
  includeVibrant?: boolean;
}
```

### B. Update `generateSubtleFromSeed()` function
```typescript
// 1. Calculate interval
const interval = calculateFeasibleInterval(theme, surface.Y, { ui: 3.0, text: 7.0 }, fg);

// 2. Check narrow
if (interval.isNarrow) {
  const { oklch, interval: adjusted } = handleNarrowInterval(interval, seedOklch, theme);
  // use adjusted.oklch
}

// 3. Pick Y with headroom
const yTarget = pickYTargetWithHeadroom(interval, DEFAULT_HEADROOM.subtle.textVsBg);

// 4. Solve for L (existing binary search)
```

### C. Update `chooseFg()` to use text policy
```typescript
const fg = chooseTextByPolicy(proposedBg, seedOklch.h, 'solid');
```

### D. Add cache wrapper
```typescript
export function generatePalette(seed: string, options: GeneratorOptions = {}): GeneratedPalette {
  const startTime = performance.now();
  
  // Check cache
  const cacheKey = { seed, theme, level, surfaceSignature, optionsHash };
  const cached = paletteCache.get(cacheKey);
  if (cached) return cached;
  
  // Generate
  const palette = generatePaletteUncached(seed, options);
  palette._diagnostics.computeTimeMs = performance.now() - startTime;
  
  // Cache
  paletteCache.set(cacheKey, palette);
  return palette;
}
```

---

## 📋 Remaining Tasks (Issues #1-4)

- [ ] **#1** Wire interval guard into generator
- [ ] **#2** Wire headroom targeting into Y selection
- [ ] **#3** Replace text selection with policy
- [ ] **#4** Add cache + diagnostics to public API

**Estimated:** 3-4 hours

---

## ✅ Acceptance Criteria

Once wired:
- [ ] Yellow (#FFFF00) → solid.text = 'black'
- [ ] Near-white (#FEFEFE) → subtle vs surface ≥ 3.0
- [ ] Narrow interval → neutralized with C ≤ 0.10
- [ ] Headroom reported in diagnostics
- [ ] Cache hit rate > 0 on repeated calls
- [ ] Same seed + deterministicSeed → identical output

---

**Next Action:** Wire new modules into `palette-generator.ts` (Issue #1)
