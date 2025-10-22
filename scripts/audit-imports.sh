#!/bin/bash
# Audit imports across the monorepo to find violations

set -e

echo "🔍 Auditing Imports Across Monorepo..."
echo ""

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

violations=0

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  Checking for Relative Imports"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Find relative imports (../ or ./)
relative_imports=$(grep -rn "from ['\"]\.\./" packages/*/src --include="*.ts" --include="*.tsx" 2>/dev/null || true)

if [ -n "$relative_imports" ]; then
  echo "${RED}❌ Found relative imports (should use @intstudio/* scopes):${NC}"
  echo ""
  echo "$relative_imports"
  echo ""
  violations=$((violations + $(echo "$relative_imports" | wc -l)))
else
  echo "${GREEN}✅ No cross-package relative imports found${NC}"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  Checking for Deep Imports"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Find deep imports (@intstudio/*/src/* or @intstudio/*/dist/*)
deep_imports=$(grep -rn "from ['\"]@intstudio/[^'\"]*\\/\\(src\\|dist\\)\\/" packages/ --include="*.ts" --include="*.tsx" 2>/dev/null || true)

if [ -n "$deep_imports" ]; then
  echo "${RED}❌ Found deep imports (should import from package root):${NC}"
  echo ""
  echo "$deep_imports"
  echo ""
  violations=$((violations + $(echo "$deep_imports" | wc -l)))
else
  echo "${GREEN}✅ No deep imports found${NC}"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  Checking for Legacy Package Names"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Find old package names (@joseph*)
legacy_imports=$(grep -rn "from ['\"]@joseph" packages/ --include="*.ts" --include="*.tsx" 2>/dev/null || true)

if [ -n "$legacy_imports" ]; then
  echo "${RED}❌ Found legacy package names (should use @intstudio/*):${NC}"
  echo ""
  echo "$legacy_imports"
  echo ""
  violations=$((violations + $(echo "$legacy_imports" | wc -l)))
else
  echo "${GREEN}✅ No legacy package names found${NC}"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  Checking for Node Modules CSS Imports"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Find CSS imports from node_modules
css_imports=$(grep -rn "import ['\"].*node_modules.*\\.css" packages/ --include="*.ts" --include="*.tsx" 2>/dev/null || true)

if [ -n "$css_imports" ]; then
  echo "${RED}❌ Found node_modules CSS imports (should use centralized CSS):${NC}"
  echo ""
  echo "$css_imports"
  echo ""
  violations=$((violations + $(echo "$css_imports" | wc -l)))
else
  echo "${GREEN}✅ No node_modules CSS imports found${NC}"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $violations -eq 0 ]; then
  echo "${GREEN}✅ All imports are clean! No violations found.${NC}"
  echo ""
  exit 0
else
  echo "${RED}❌ Found $violations import violations${NC}"
  echo ""
  echo "To fix automatically, run:"
  echo "  pnpm run imports:fix"
  echo ""
  exit 1
fi
