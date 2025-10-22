#!/bin/bash
# Reorganize DS to god-tier structure

set -e

echo "🏗️  Reorganizing DS to God-Tier Structure..."
echo ""

cd packages/ds/src

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 1️⃣  PRIMITIVES (basic building blocks)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "📦 Moving primitives..."

# Layout primitives
mv components/Stack.tsx primitives/ 2>/dev/null || true
mv components/Grid.tsx primitives/ 2>/dev/null || true
mv components/Container.tsx primitives/ 2>/dev/null || true
mv components/Section.tsx primitives/ 2>/dev/null || true
mv components/Box.tsx primitives/ 2>/dev/null || true
mv components/Spacer.tsx primitives/ 2>/dev/null || true

# Content primitives
mv components/Card.tsx primitives/ 2>/dev/null || true
mv components/Prose.tsx primitives/ 2>/dev/null || true
mv components/MediaContainer.tsx primitives/ 2>/dev/null || true
mv components/Picture.tsx primitives/ 2>/dev/null || true
mv components/VideoPlayer.tsx primitives/ 2>/dev/null || true

# Typography primitives
mv components/Heading.tsx primitives/ 2>/dev/null || true
mv components/Body.tsx primitives/ 2>/dev/null || true
mv components/Display.tsx primitives/ 2>/dev/null || true
mv components/Text.tsx primitives/ 2>/dev/null || true
mv components/Label.tsx primitives/ 2>/dev/null || true

# Interactive primitives
mv components/Button.tsx primitives/ 2>/dev/null || true
mv components/FAB.tsx primitives/ 2>/dev/null || true
mv components/FABMenu.tsx primitives/ 2>/dev/null || true
mv components/FABSpeedDial.tsx primitives/ 2>/dev/null || true

# UI elements
mv components/Divider.tsx primitives/ 2>/dev/null || true
mv components/HelperText.tsx primitives/ 2>/dev/null || true

echo "  ✅ Primitives moved"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 2️⃣  PATTERNS (composed layouts)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "📐 Moving patterns..."

mv components/FormLayout.tsx patterns/ 2>/dev/null || true
mv components/FieldWrapper.tsx patterns/ 2>/dev/null || true

echo "  ✅ Patterns moved"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 3️⃣  SHELL (app shell components)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "🏠 Moving shell components..."

# Move entire shell directory
if [ -d "components/shell" ]; then
  cp -r components/shell/* shell/ 2>/dev/null || true
  rm -rf components/shell
fi

echo "  ✅ Shell moved"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 4️⃣  A11Y (accessibility layer)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "♿ Moving a11y..."

mv lib/applyA11y.ts a11y/ 2>/dev/null || true
mv lib/a11yProfiles.ts a11y/ 2>/dev/null || true
mv utils/a11y-validator.ts a11y/ 2>/dev/null || true
mv utils/sr-announce.tsx a11y/ 2>/dev/null || true
mv utils/input-modality.ts a11y/ 2>/dev/null || true

echo "  ✅ A11y moved"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 5️⃣  WHITE-LABEL (brand system)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "🎨 Moving white-label..."

mv lib/contrastValidator.ts white-label/ 2>/dev/null || true
mv lib/useContrastGuard.ts white-label/ 2>/dev/null || true
mv lib/toneResolver.ts white-label/ 2>/dev/null || true
mv components/ContrastBadge.tsx white-label/ 2>/dev/null || true

echo "  ✅ White-label moved"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 6️⃣  UTILS (pure utilities)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "🔧 Moving utils..."

mv utils/rtl.ts utils/ 2>/dev/null || true
mv utils/debug-typography.ts utils/ 2>/dev/null || true
mv lib/semanticSizing.ts utils/ 2>/dev/null || true
mv lib/densityAdapter.ts utils/ 2>/dev/null || true
mv lib/layoutConfig.ts utils/ 2>/dev/null || true
mv hooks/useMotion.ts utils/ 2>/dev/null || true

echo "  ✅ Utils moved"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 7️⃣  STYLES (CSS @layer system)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "🎨 Organizing CSS @layer system..."

# Move token CSS files
mv styles/tokens/*.vars.css styles/tokens/ 2>/dev/null || true

# Move component CSS
mv components/ds-*.css styles/components/ 2>/dev/null || true

echo "  ✅ Styles organized"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 8️⃣  CLEANUP
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo "🧹 Cleaning up empty directories..."

# Remove old directories if empty
rmdir components/typography 2>/dev/null || true
rmdir components/overlay 2>/dev/null || true
rmdir components/picker 2>/dev/null || true
rmdir components 2>/dev/null || true
rmdir lib 2>/dev/null || true
rmdir hooks 2>/dev/null || true

echo "  ✅ Cleanup complete"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DS Reorganization Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "New structure:"
echo "  📦 primitives/  - Stack, Grid, Button, Card, etc."
echo "  📐 patterns/    - FormLayout, FieldWrapper"
echo "  🏠 shell/       - TopBar, Drawer, BottomNav"
echo "  ♿ a11y/        - Accessibility layer"
echo "  🎨 white-label/ - Brand system"
echo "  🔧 utils/       - Pure utilities"
echo "  🎨 styles/      - CSS @layer system"
echo ""
echo "Next: Create barrel exports (index.ts files)"
