#!/usr/bin/env bash
##
# Bundle Sanity Check - Verify Lazy Loading
#
# Ensures that heavy mobile-only libraries are NOT in the main bundle.
# Desktop users should never download react-spring-bottom-sheet.
#
# Usage:
#   ./scripts/check-bundle-lazy-load.sh
#
# Exit codes:
#   0 - Pass (lazy loading working)
#   1 - Fail (mobile libs found in main bundle)
##

set -e

DIST_DIR="packages/ds/dist"
MAIN_CHUNK="index.js"

echo "🔍 Checking bundle for lazy-load correctness..."
echo ""

if [ ! -d "$DIST_DIR" ]; then
  echo "❌ Build dist not found. Run 'pnpm build' first."
  exit 1
fi

# Check if main bundle contains mobile-only libraries
FOUND_IN_MAIN=0

echo "Checking main bundle: $DIST_DIR/$MAIN_CHUNK"
echo ""

# These should NOT be in the main chunk (should be lazy-loaded)
FORBIDDEN_IMPORTS=(
  "react-spring-bottom-sheet"
  "BottomSheet"
  "@use-gesture/react"
)

for import in "${FORBIDDEN_IMPORTS[@]}"; do
  if grep -q "$import" "$DIST_DIR/$MAIN_CHUNK" 2>/dev/null; then
    echo "❌ FAIL: Found '$import' in main bundle"
    echo "   This library should be lazy-loaded, not in main chunk"
    FOUND_IN_MAIN=1
  else
    echo "✅ PASS: '$import' not in main bundle (correctly lazy-loaded)"
  fi
done

echo ""

if [ $FOUND_IN_MAIN -eq 1 ]; then
  echo "❌ Bundle check FAILED"
  echo ""
  echo "Mobile-only libraries found in main bundle."
  echo "Desktop users will download unnecessary code."
  echo ""
  echo "Fix: Ensure dynamic import() is used for mobile engines:"
  echo "  import('react-spring-bottom-sheet').then(mod => ...)"
  echo ""
  exit 1
fi

echo "✅ Bundle check PASSED"
echo ""
echo "Lazy loading working correctly:"
echo "  - Desktop bundle stays lean"
echo "  - Mobile engines loaded on-demand"
echo ""
exit 0
