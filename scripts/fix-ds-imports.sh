#!/bin/bash
# Fix imports after DS reorganization

set -e

echo "🔧 Fixing DS imports after reorganization..."
echo ""

cd packages/ds/src

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Fix imports in components/ (remaining files)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "1️⃣  Fixing components/ imports..."

# DSShims needs primitives
if [ -f "components/DSShims.tsx" ]; then
  sed -i '' 's|from '"'"'./Stack'"'"'|from '"'"'../primitives/Stack'"'"'|g' components/DSShims.tsx
  sed -i '' 's|from '"'"'./Grid'"'"'|from '"'"'../primitives/Grid'"'"'|g' components/DSShims.tsx
  echo "  ✅ Fixed DSShims.tsx"
fi

# Typography components need CSS from styles/components
find components/typography -name "*.tsx" -type f 2>/dev/null | while read file; do
  sed -i '' 's|'"'"'../ds-typography.css'"'"'|'"'"'../../styles/components/ds-typography.css'"'"'|g' "$file"
  echo "  ✅ Fixed $(basename $file)"
done

# Components index needs CSS from styles/components
if [ -f "components/index.ts" ]; then
  sed -i '' 's|'"'"'./ds-typography.css'"'"'|'"'"'../styles/components/ds-typography.css'"'"'|g' components/index.ts
  sed -i '' 's|'"'"'./ds-inputs.css'"'"'|'"'"'../styles/components/ds-inputs.css'"'"'|g' components/index.ts
  sed -i '' 's|'"'"'./ds-grid.css'"'"'|'"'"'../styles/components/ds-grid.css'"'"'|g' components/index.ts
  sed -i '' 's|'"'"'./ds-form-layout.css'"'"'|'"'"'../styles/components/ds-form-layout.css'"'"'|g' components/index.ts
  sed -i '' 's|'"'"'./ds-media.css'"'"'|'"'"'../styles/components/ds-media.css'"'"'|g' components/index.ts
  sed -i '' 's|'"'"'./ds-section.css'"'"'|'"'"'../styles/components/ds-section.css'"'"'|g' components/index.ts
  sed -i '' 's|'"'"'./ds-prose.css'"'"'|'"'"'../styles/components/ds-prose.css'"'"'|g' components/index.ts
  sed -i '' 's|'"'"'./ds-fab.css'"'"'|'"'"'../styles/components/ds-fab.css'"'"'|g' components/index.ts
  sed -i '' 's|'"'"'./ds-icons.css'"'"'|'"'"'../styles/components/ds-icons.css'"'"'|g' components/index.ts
  echo "  ✅ Fixed components/index.ts"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Fix imports in a11y/
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "2️⃣  Fixing a11y/ imports..."

if [ -f "a11y/applyA11y.ts" ]; then
  sed -i '' 's|from '"'"'./densityAdapter'"'"'|from '"'"'../utils/densityAdapter'"'"'|g' a11y/applyA11y.ts
  echo "  ✅ Fixed applyA11y.ts"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Fix imports in fields/ (they reference components)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "3️⃣  Fixing fields/ imports..."

# Fields import from old components/ need to import from primitives/
find fields -name "*.tsx" -type f 2>/dev/null | while read file; do
  # Stack, Grid from primitives
  sed -i '' 's|from '"'"'../components/Stack'"'"'|from '"'"'../primitives/Stack'"'"'|g' "$file"
  sed -i '' 's|from '"'"'../components/Grid'"'"'|from '"'"'../primitives/Grid'"'"'|g' "$file"
  sed -i '' 's|from '"'"'../components/Button'"'"'|from '"'"'../primitives/Button'"'"'|g' "$file"
  sed -i '' 's|from '"'"'../components/Container'"'"'|from '"'"'../primitives/Container'"'"'|g' "$file"
done

echo ""
echo "✅ Import fixes complete!"
echo ""
echo "Next: Run pnpm build to verify"
