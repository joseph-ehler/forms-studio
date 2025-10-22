#!/bin/bash
# Typography Compliance Check
# Runs in CI to catch violations

set -e

echo "🔍 Checking typography compliance..."

ERRORS=0

# Check 1: No raw <label> in fields
echo "Checking for raw <label> elements in fields..."
if git grep -nE "<label[^>]" -- "packages/**/src/fields/**/*.tsx" 2>/dev/null; then
  echo "❌ Raw <label> usage found. Use <FormLabel> from typography primitives."
  ERRORS=$((ERRORS + 1))
else
  echo "✅ No raw <label> elements found"
fi

# Check 2: No typography Tailwind classes in fields
echo "Checking for typography classes in fields..."
if git grep -nE 'className=.*\b(text-|font-|leading-)' -- "packages/**/src/fields/**/*.tsx" 2>/dev/null; then
  echo "❌ Typography classes found in fields. Use FormLabel/FormHelperText primitives."
  ERRORS=$((ERRORS + 1))
else
  echo "✅ No typography classes in fields"
fi

# Check 3: No inline font styles
echo "Checking for inline font styles..."
if git grep -nE "style=.*fontSize|fontWeight|lineHeight|fontFamily" -- "packages/**/src/fields/**/*.tsx" 2>/dev/null; then
  echo "❌ Inline typography styles found. Use TYPO_TOKENS or primitives."
  ERRORS=$((ERRORS + 1))
else
  echo "✅ No inline font styles found"
fi

# Check 4: No node_modules CSS imports (except in skins)
echo "Checking for node_modules CSS imports in fields..."
if git grep -nE "import.*node_modules.*\.css|from.*react-day-picker.*style" -- "packages/**/src/fields/**/*.tsx" 2>/dev/null; then
  echo "❌ Node modules CSS imports found in fields. Import only from DS skins."
  ERRORS=$((ERRORS + 1))
else
  echo "✅ No node_modules CSS imports in fields"
fi

# Check 5: No deep overlay imports
echo "Checking for deep overlay imports..."
if git grep -nE "from.*wizard-react.*overlay/Overlay|from.*components/overlay/Overlay" -- "packages/**/src/fields/**/*.tsx" 2>/dev/null; then
  echo "❌ Deep overlay imports found. Use barrel: import { OverlayPicker } from '../components/overlay'"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ No deep overlay imports"
fi

# Summary
echo ""
if [ $ERRORS -eq 0 ]; then
  echo "✅ All typography checks passed!"
  exit 0
else
  echo "❌ $ERRORS typography violation(s) found"
  echo ""
  echo "Fix these violations by:"
  echo "  1. Replace raw <label> with <FormLabel>"
  echo "  2. Remove typography classes, use FormLabel size prop"
  echo "  3. Remove inline styles, use TYPO_TOKENS"
  echo "  4. Import CSS only from DS skins (ds-*.css)"
  echo "  5. Use barrel imports for overlay primitives"
  exit 1
fi
