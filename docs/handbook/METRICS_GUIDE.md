# Metrics Scripts

**Principal-level observability**: Measure adoption, track velocity, prove impact.

---

## Quick Start

```bash
# Run all metrics
pnpm metrics:all

# Individual metrics
pnpm metrics:adoption  # Flowbite vs DS adoption
pnpm metrics:ci        # Doctor timing & pass rate
```

---

## Adoption Metrics

**What it measures**: Raw Flowbite usage vs DS wrapper adoption

**Command**: `pnpm metrics:adoption`

**Output**:
- `reports/adoption-YYYY-MM-DD.json` (detailed per-file)
- `reports/adoption-YYYY-MM-DD.csv` (spreadsheet-friendly)

### Interpretation

```json
{
  "summary": {
    "date": "2025-01-25",
    "totals": {
      "flowbiteReact": 7,    // Raw flowbite-react imports
      "flowbiteCss": 0,       // Direct flowbite CSS/JS
      "dsWrappers": 1         // @intstudio/ds/fb/* usage
    },
    "ratio": {
      "dsToFlowbite": 0.14    // Adoption rate (14%)
    }
  }
}
```

**Targets**:
- ✅ **dsToFlowbite > 1.0** = More DS wrappers than raw Flowbite (good)
- 🎯 **Increasing trend** = Adoption growing over time
- ⚠️  **Ratio < 1.0** = Migration needed

**Migration hot spots**: Check `perFile` array for files still importing `flowbite-react`

---

## CI Metrics

**What it measures**: Doctor command timing & success rate

**Command**: `pnpm metrics:ci`

**Custom command**: `pnpm metrics:ci "pnpm typecheck"`

**Output**:
- `reports/ci-YYYY-MM-DD.json`

### Interpretation

```json
{
  "date": "2025-01-25",
  "command": "pnpm doctor",
  "ok": true,
  "durationMs": 175
}
```

**Targets**:
- ✅ **ok: true** = All checks passing
- ✅ **durationMs < 120000** = Under 2 minutes (good DX)
- 🎯 **Decreasing trend** = Getting faster over time

**Use cases**:
- Track time-to-green improvements
- Measure impact of optimizations
- Identify slow periods (nightly vs PR)

---

## Baseline (2025-01-25)

**Initial state** (committed to git):

```json
{
  "adoption": {
    "flowbiteReact": 7,
    "dsWrappers": 1,
    "dsToFlowbite": 0.14
  },
  "ci": {
    "durationMs": 175,
    "ok": true
  }
}
```

**Files tracked**:
- `reports/baseline-2025-01-25.json` (adoption)
- `reports/ci-baseline-2025-01-25.json` (CI timing)

---

## Trend Analysis

### Week-over-week adoption

```bash
# Compare current to baseline
jq '.summary.ratio.dsToFlowbite' reports/adoption-*.json
```

**Expected trajectory** (30 days):
- Day 1: 0.14 (14% adoption)
- Day 7: 0.50 (50% - codemods + SelectField)
- Day 14: 0.80 (80% - TextField, EmailField)
- Day 30: 2.00 (200% - most code using DS wrappers)

### CI velocity trend

```bash
# Check doctor timing over time
jq '.durationMs' reports/ci-*.json
```

**Expected trajectory** (30 days):
- Day 1: 175ms (baseline)
- Day 7: ~90s (barrels + typecheck + build)
- Day 14: <90s (optimizations)
- Day 30: <60s (stable fast feedback)

---

## Integration

### Nightly job (optional)

```yaml
# .github/workflows/metrics-nightly.yml
name: metrics-nightly
on:
  schedule:
    - cron: "0 3 * * *"   # daily at 03:00 UTC

jobs:
  metrics:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm metrics:all
      - uses: actions/upload-artifact@v4
        with:
          name: metrics-${{ github.run_id }}
          path: reports/
```

### Commit snapshots (weekly)

```bash
# Every Friday, commit a milestone snapshot
cp reports/adoption-$(date +%Y-%m-%d).json reports/milestone-$(date +%Y-%m-%d).json
git add reports/milestone-*.json
git commit -m "metrics: weekly snapshot"
```

---

## Migration Workflow

### 1. Identify targets

```bash
pnpm metrics:adoption
jq '.perFile[] | select(.flowbiteReact > 0) | .file' reports/adoption-*.json
```

### 2. Run codemod (coming soon)

```bash
pnpm codemod flowbite-to-ds --target packages/ui-bridge
```

### 3. Measure impact

```bash
pnpm metrics:adoption
# Compare before/after dsToFlowbite ratio
```

### 4. Track trend

```bash
# Compare week-over-week
diff <(jq '.summary' reports/adoption-2025-01-18.json) \
     <(jq '.summary' reports/adoption-2025-01-25.json)
```

---

## Principal-Level Proof Points

**What you'll show upwards** (after 60-90 days):

### Adoption

> "Raw Flowbite usage down from 7 imports → 2 in 60 days.  
> DS wrapper adoption up 400%. Zero net new violations."

### Velocity

> "Time-to-green improved from 90s → 45s.  
> pnpm doctor p95 under 60s. Developer satisfaction up."

### Quality

> "0 rename incidents since guardrails.  
> 100% of renames via refactor:rename.  
> API stability: 0 unintentional breaks."

### Governance

> "Migration policy enforced via CI.  
> Codemods provided for all breaking changes.  
> 3 teams adopted DS wrappers, 2 more scheduled."

---

## Files

- `scripts/metrics/adoption.mjs` - Adoption scanner
- `scripts/metrics/ci.mjs` - CI timing tracker
- `reports/` - Output directory (gitignored, except baselines)
- `reports/baseline-*.json` - Committed milestones

---

## Dependencies

- **globby** (`^15.0.0`) - Fast glob matching for adoption scan

---

## Next Steps

### Week 1
- ✅ Adoption metrics baseline
- [ ] API Extractor (contract enforcement)
- [ ] Changesets (versioning)

### Week 2
- [ ] Migration codemods (driven by metrics)
- [ ] Hot spot analysis (identify high-value targets)

### Week 4
- [ ] Docs site with trend charts
- [ ] Nightly metrics job
- [ ] Weekly milestone snapshots

---

## Philosophy

**"Observe → Systematize → Scale"**

- **Observe**: Metrics show current state (baseline)
- **Systematize**: Codemods + guardrails (make changes easy)
- **Scale**: Policy + enforcement (org-wide adoption)

Can't improve what you don't measure. **Metrics first, then act.** 📊
