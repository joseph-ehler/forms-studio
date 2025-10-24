#!/usr/bin/env bash
#
# Responsibility Boundary Enforcement
# 
# Validates DS vs Forms separation:
# - DS owns: positioning, portals, gestures, focus, tokens
# - Forms own: data, search, selection, telemetry
#
# Usage: ./scripts/audit/responsibility-check.sh
# Exit codes: 0 = clean, 1 = violations found

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Checking DS vs Forms responsibility boundaries..."
echo ""

VIOLATIONS=0

# =============================================================================
# Check 1: Forms should NOT have positioning/portal code
# =============================================================================

echo "📋 Check 1: Forms should not handle positioning/portals"

FORMS_DIR="packages/core/src/fields"
if [ ! -d "$FORMS_DIR" ]; then
  FORMS_DIR="packages/ds/src/fields"
fi

# Search for forbidden patterns in Forms
FORBIDDEN_IN_FORMS=(
  "position:\s*(fixed|absolute|sticky)"
  "z-index:"
  "createPortal"
  "transform:\s*translate"
  "overflow:\s*hidden"
  "inset(Inline|Block)?"
  "top:\s*[0-9]"
  "left:\s*[0-9]"
  "bottom:\s*[0-9]"
  "right:\s*[0-9]"
  "overscroll-behavior:"
  "touch-action:"
  "pointer-events:\s*none"
)

for pattern in "${FORBIDDEN_IN_FORMS[@]}"; do
  MATCHES=$(grep -rn --include="*.tsx" --include="*.ts" -E "$pattern" "$FORMS_DIR" 2>/dev/null || true)
  
  if [ -n "$MATCHES" ]; then
    echo -e "${RED}❌ Found forbidden pattern in Forms: $pattern${NC}"
    echo "$MATCHES"
    echo ""
    ((VIOLATIONS++))
  fi
done

if [ $VIOLATIONS -eq 0 ]; then
  echo -e "${GREEN}✅ No positioning/portal code in Forms${NC}"
fi

echo ""

# =============================================================================
# Check 2: DS should NOT have data/business logic
# =============================================================================

echo "📋 Check 2: DS should not have data/business logic"

DS_DIR="packages/ds/src/components"

FORBIDDEN_IN_DS=(
  "react-hook-form"
  "Controller"
  "useFormContext"
  "optionSource"
  "telemetry"
  "analytics"
  "fetch\("
  "axios"
  "assignee"
  "orderId"
  "customerId"
)

for pattern in "${FORBIDDEN_IN_DS[@]}"; do
  MATCHES=$(grep -rn --include="*.tsx" --include="*.ts" "$pattern" "$DS_DIR" 2>/dev/null || true)
  
  if [ -n "$MATCHES" ]; then
    echo -e "${RED}❌ Found forbidden pattern in DS: $pattern${NC}"
    echo "$MATCHES"
    echo ""
    ((VIOLATIONS++))
  fi
done

if [ $VIOLATIONS -eq 0 ]; then
  echo -e "${GREEN}✅ No business logic in DS components${NC}"
fi

echo ""

# =============================================================================
# Check 3: Inline styles should use tokens (not magic values)
# =============================================================================

echo "📋 Check 3: No magic numbers in inline styles"

MAGIC_PATTERNS=(
  "style=\{\{[^}]*:\s*['\"]?\d+px"
  "style=\{\{[^}]*color:\s*['\"]#[0-9a-fA-F]+"
  "style=\{\{[^}]*rgba?\("
)

ALL_DIRS=("$DS_DIR" "$FORMS_DIR")

for dir in "${ALL_DIRS[@]}"; do
  for pattern in "${MAGIC_PATTERNS[@]}"; do
    MATCHES=$(grep -rn --include="*.tsx" -P "$pattern" "$dir" 2>/dev/null || true)
    
    # Filter out acceptable patterns (var() usage, etc.)
    MATCHES=$(echo "$MATCHES" | grep -v "var(--" || true)
    
    if [ -n "$MATCHES" ]; then
      echo -e "${YELLOW}⚠️  Magic values found (should use tokens): $dir${NC}"
      echo "$MATCHES" | head -5
      echo ""
      ((VIOLATIONS++))
    fi
  done
done

echo ""

# =============================================================================
# Check 4: Multiple scroll lock sources
# =============================================================================

echo "📋 Check 4: Single scroll lock source"

SCROLL_LOCK_LOCATIONS=$(grep -rn --include="*.tsx" --include="*.ts" \
  -E "(documentElement|body)\.style\.overflow\s*=\s*['\"]hidden" \
  packages/ 2>/dev/null || true)

LOCK_COUNT=$(echo "$SCROLL_LOCK_LOCATIONS" | grep -c "overflow.*hidden" || true)

if [ "$LOCK_COUNT" -gt 1 ]; then
  echo -e "${RED}❌ Multiple scroll lock sources found ($LOCK_COUNT):${NC}"
  echo "$SCROLL_LOCK_LOCATIONS"
  echo ""
  echo "Expected: Single source in OverlayPickerCore or useScrollLock hook"
  ((VIOLATIONS++))
else
  echo -e "${GREEN}✅ Single scroll lock source${NC}"
fi

echo ""

# =============================================================================
# Check 5: Portal usage (should all be in DS)
# =============================================================================

echo "📋 Check 5: Portal usage centralized in DS"

PORTAL_IN_FORMS=$(grep -rn --include="*.tsx" "createPortal" "$FORMS_DIR" 2>/dev/null || true)

if [ -n "$PORTAL_IN_FORMS" ]; then
  echo -e "${RED}❌ createPortal found in Forms (should be in DS only):${NC}"
  echo "$PORTAL_IN_FORMS"
  echo ""
  ((VIOLATIONS++))
else
  echo -e "${GREEN}✅ Portals only in DS${NC}"
fi

echo ""

# =============================================================================
# Summary
# =============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $VIOLATIONS -eq 0 ]; then
  echo -e "${GREEN}✅ ALL CHECKS PASSED${NC}"
  echo "DS vs Forms boundaries are clean."
  exit 0
else
  echo -e "${RED}❌ FOUND $VIOLATIONS VIOLATIONS${NC}"
  echo ""
  echo "Responsibility Matrix:"
  echo "  DS owns:    positioning, portals, gestures, focus, tokens"
  echo "  Forms own:  data, search, selection, telemetry"
  echo ""
  echo "See docs/debug/OVERLAY_SHEET_BUG_AUDIT.md for guidelines."
  exit 1
fi
