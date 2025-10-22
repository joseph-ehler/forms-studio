#!/bin/bash
# FINAL 100% DS ADOPTION CODEMOD
# Fixes ALL remaining light/dark incompatible colors

cd "$(dirname "$0")"

# Find all field files with violations
FILES=$(git grep -l "text-gray\|bg-gray\|border-gray\|text-blue\|bg-blue\|text-red\|text-green\|text-yellow" packages/wizard-react/src/fields/*.tsx packages/wizard-react/src/fields/composite/*.tsx 2>/dev/null | grep -v ".old")

echo "🔥 FINAL 100% LIGHT/DARK COMPATIBLE SWEEP"
echo "Targeting $(echo "$FILES" | wc -l | tr -d ' ') files..."
echo ""

for file in $FILES; do
  echo "Processing $(basename "$file")..."
  
  # Text colors → semantic tokens
  perl -i -pe 's/text-gray-900(?!")/ style={{ color: '\''var(--ds-color-text-primary)'\'' }}/g' "$file"
  perl -i -pe 's/text-gray-800(?!")/ style={{ color: '\''var(--ds-color-text-primary)'\'' }}/g' "$file"
  perl -i -pe 's/text-gray-700(?!")/ style={{ color: '\''var(--ds-color-text-primary)'\'' }}/g' "$file"
  perl -i -pe 's/text-gray-600(?!")/ style={{ color: '\''var(--ds-color-text-secondary)'\'' }}/g' "$file"
  perl -i -pe 's/text-gray-500(?!")/ style={{ color: '\''var(--ds-color-text-secondary)'\'' }}/g' "$file"
  perl -i -pe 's/text-gray-400(?!")/ style={{ color: '\''var(--ds-color-text-muted)'\'' }}/g' "$file"
  
  # Background colors → semantic tokens
  perl -i -pe 's/bg-gray-50(?!")/ style={{ backgroundColor: '\''var(--ds-color-surface-subtle)'\'' }}/g' "$file"
  perl -i -pe 's/bg-gray-100(?!")/ style={{ backgroundColor: '\''var(--ds-color-surface-subtle)'\'' }}/g' "$file"
  perl -i -pe 's/bg-gray-200(?!")/ style={{ backgroundColor: '\''var(--ds-color-surface-subtle)'\'' }}/g' "$file"
  perl -i -pe 's/bg-white(?!")/ style={{ backgroundColor: '\''var(--ds-color-surface-base)'\'' }}/g' "$file"
  
  # Border colors → semantic tokens
  perl -i -pe 's/border-gray-200(?!")/ style={{ borderColor: '\''var(--ds-color-border-subtle)'\'' }}/g' "$file"
  perl -i -pe 's/border-gray-300(?!")/ style={{ borderColor: '\''var(--ds-color-border-subtle)'\'' }}/g' "$file"
  
  # State colors → semantic tokens
  perl -i -pe 's/text-blue-600(?!")/ style={{ color: '\''var(--ds-color-primary-text, var(--ds-color-primary-bg))'\'' }}/g' "$file"
  perl -i -pe 's/bg-blue-50(?!")/ style={{ backgroundColor: '\''color-mix(in oklab, var(--ds-color-primary-bg), transparent 90%)'\'' }}/g' "$file"
  perl -i -pe 's/bg-blue-100(?!")/ style={{ backgroundColor: '\''color-mix(in oklab, var(--ds-color-primary-bg), transparent 85%)'\'' }}/g' "$file"
  
  perl -i -pe 's/text-red-600(?!")/ style={{ color: '\''var(--ds-color-state-danger-text)'\'' }}/g' "$file"
  perl -i -pe 's/bg-red-50(?!")/ style={{ backgroundColor: '\''var(--ds-color-state-danger-bg)'\'' }}/g' "$file"
  
  perl -i -pe 's/text-green-600(?!")/ style={{ color: '\''var(--ds-color-state-success-text)'\'' }}/g' "$file"
  perl -i -pe 's/bg-green-50(?!")/ style={{ backgroundColor: '\''var(--ds-color-state-success-bg)'\'' }}/g' "$file"
  
  perl -i -pe 's/text-yellow-700(?!")/ style={{ color: '\''var(--ds-color-state-warning-text)'\'' }}/g' "$file"
  perl -i -pe 's/bg-yellow-50(?!")/ style={{ backgroundColor: '\''var(--ds-color-state-warning-bg)'\'' }}/g' "$file"
done

echo ""
echo "✅ Complete! All simple patterns fixed."
echo ""
echo "Remaining violations (complex conditionals):"
git grep -c "text-gray\|bg-gray\|border-gray\|text-blue\|bg-blue" packages/wizard-react/src/fields/*.tsx packages/wizard-react/src/fields/composite/*.tsx 2>/dev/null | grep -v ":0$" | grep -v ".old" | wc -l
