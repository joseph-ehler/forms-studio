#!/bin/bash
# Cleanup JSON Files
# Organizes and removes duplicate/stray JSON config files

set -e

ROOT=$(pwd)

echo "🧹 Cleaning up JSON files..."

# 1. Remove duplicate JSON files (ending with " 2")
echo "Removing JSON duplicates..."
find . -name "* 2.json" -type f ! -path "*/node_modules/*" -delete
echo "✅ Duplicates removed"

# 2. Remove docs/package.json (unnecessary)
if [ -f "docs/package.json" ]; then
  echo "Removing unnecessary docs/package.json..."
  rm -f docs/package.json
  echo "✅ docs/package.json removed"
fi

# 3. Consolidate root ESLint configs
# These are legacy/duplicate configs that should be in packages/eslint-plugin-cascade
ESLINT_ARCHIVE="packages/eslint-plugin-cascade/configs/archive"
mkdir -p "$ESLINT_ARCHIVE"

echo "Archiving root-level ESLint configs..."
if [ -f ".eslintrc.design-system.json" ]; then
  mv .eslintrc.design-system.json "$ESLINT_ARCHIVE/"
  echo "  → .eslintrc.design-system.json archived"
fi

if [ -f ".eslintrc.import-hygiene.json" ]; then
  mv .eslintrc.import-hygiene.json "$ESLINT_ARCHIVE/"
  echo "  → .eslintrc.import-hygiene.json archived"
fi

if [ -f ".eslintrc.typography-rules.json" ]; then
  mv .eslintrc.typography-rules.json "$ESLINT_ARCHIVE/"
  echo "  → .eslintrc.typography-rules.json archived"
fi

echo "✅ Root ESLint configs archived"

# 4. Consolidate root Stylelint configs
STYLELINT_ARCHIVE="packages/ds/stylelint-plugin-ds/archive"
mkdir -p "$STYLELINT_ARCHIVE"

echo "Archiving root-level Stylelint configs..."
if [ -f ".stylelintrc.spacing.json" ]; then
  mv .stylelintrc.spacing.json "$STYLELINT_ARCHIVE/"
  echo "  → .stylelintrc.spacing.json archived"
fi

echo "✅ Root Stylelint configs archived"

# 5. Clean test-results (should be gitignored, not committed)
echo "Cleaning test-results..."
if [ -d "test-results" ]; then
  # Keep directory but remove JSON files
  find test-results -name "*.json" -type f -delete 2>/dev/null || true
  echo "✅ test-results cleaned"
fi

echo ""
echo "✨ JSON cleanup complete!"
echo ""
echo "Current root JSON files (only these should remain):"
ls -1 *.json 2>/dev/null || echo "(none - clean!)"
echo ""
echo "Contracts directory:"
ls -1 contracts/*.json 2>/dev/null || echo "(none)"
