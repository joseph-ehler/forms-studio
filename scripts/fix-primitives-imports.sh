#!/bin/bash
# Fix imports in primitives/ after reorganization

set -e

echo "🔧 Fixing primitives/ imports..."
echo ""

cd packages/ds/src/primitives

# Fix lib/ references → utils/
find . -name "*.tsx" -o -name "*.ts" | while read file; do
  # layoutConfig
  sed -i '' 's|from '"'"'../lib/layoutConfig'"'"'|from '"'"'../utils/layoutConfig'"'"'|g' "$file"
  
  # semanticSizing
  sed -i '' 's|from '"'"'../lib/semanticSizing'"'"'|from '"'"'../utils/semanticSizing'"'"'|g' "$file"
  
  # toneResolver
  sed -i '' 's|from '"'"'../lib/toneResolver'"'"'|from '"'"'../white-label/toneResolver'"'"'|g' "$file"
  
  # CSS imports
  sed -i '' 's|'"'"'./ds-grid.css'"'"'|'"'"'../styles/components/ds-grid.css'"'"'|g' "$file"
  sed -i '' 's|'"'"'./ds-prose.css'"'"'|'"'"'../styles/components/ds-prose.css'"'"'|g' "$file"
  sed -i '' 's|'"'"'./ds-section.css'"'"'|'"'"'../styles/components/ds-section.css'"'"'|g' "$file"
  sed -i '' 's|'"'"'./ds-media.css'"'"'|'"'"'../styles/components/ds-media.css'"'"'|g' "$file"
  
  # typography imports
  sed -i '' 's|from '"'"'./typography'"'"'|from '"'"'../components/typography'"'"'|g' "$file"
done

echo "✅ Primitives imports fixed!"
