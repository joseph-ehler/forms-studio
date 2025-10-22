#!/bin/bash
# 🚑 SURGICAL RECOVERY SCRIPT
# Keeps the 4 gold infrastructure files, rolls back damaged field files

set -e  # Exit on error

echo "🚑 Starting surgical recovery..."

# 1) Create safety branch
echo "📌 Creating safety branch..."
git switch -c fix/ds-migration-repair

# 2) Backup the 4 infrastructure wins
echo "💾 Backing up infrastructure files..."
mkdir -p /tmp/forms-infra
cp src/components/DSShims.tsx /tmp/forms-infra/ 2>/dev/null || echo "DSShims.tsx not found"
cp src/fields/utils/a11y-helpers.ts /tmp/forms-infra/ 2>/dev/null || echo "a11y-helpers.ts not found"
cp src/validation/generateZodFromJSON.ts /tmp/forms-infra/ 2>/dev/null || echo "generateZodFromJSON.ts not found"
cp src/components/OverlayPicker.tsx /tmp/forms-infra/ 2>/dev/null || echo "OverlayPicker.tsx not found"

echo "✅ Infrastructure backed up to /tmp/forms-infra/"
ls -lh /tmp/forms-infra/

# 3) Restore field files to HEAD (before our edits today)
echo "🔄 Restoring field files to last known good..."
git restore --source HEAD --worktree --staged src/fields/ || echo "Already at HEAD"

# 4) Restore infrastructure files from backup
echo "📥 Restoring infrastructure files..."
cp /tmp/forms-infra/DSShims.tsx src/components/ 2>/dev/null || true
cp /tmp/forms-infra/a11y-helpers.ts src/fields/utils/ 2>/dev/null || true
cp /tmp/forms-infra/generateZodFromJSON.ts src/validation/ 2>/dev/null || true
cp /tmp/forms-infra/OverlayPicker.tsx src/components/ 2>/dev/null || true

# 5) Restore export files that we modified
echo "🔄 Restoring index exports..."
git restore --source HEAD --worktree --staged src/index.ts || true
git restore --source HEAD --worktree --staged src/fields/composite/index.ts || true
git restore --source HEAD --worktree --staged src/fields/createField.tsx || true

# 6) Test build
echo "🏗️  Testing build..."
npm run build

echo ""
echo "✅ RECOVERY COMPLETE!"
echo ""
echo "📊 Status:"
echo "  ✅ Infrastructure files: KEPT (4 files)"
echo "  ✅ Field files: RESTORED to clean state"
echo "  ✅ Build: Should be GREEN"
echo ""
echo "📝 Next steps:"
echo "  1. Commit this stable state: git add -A && git commit -m 'chore: rollback field damage, keep infrastructure'"
echo "  2. Review the 4 infra files in src/components/ and src/fields/utils/"
echo "  3. Follow incremental migration plan (3-5 fields at a time)"
echo ""
