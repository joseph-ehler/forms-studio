#!/bin/bash
# Usage Explorer - Check Design System Adoption
# 
# Scans codebase for DS class usage vs. banned utilities
# Outputs coverage percentage with stoplight chart

set -e

FIELDS_DIR="packages/wizard-react/src/fields"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🔍 Design System Coverage Analysis"
echo "=================================="
echo ""

# Count DS class usage
DS_CLASSES=$(grep -r "ds-input\|ds-button\|ds-label\|ds-helper" $FIELDS_DIR | wc -l | tr -d ' ')

# Count banned utilities
BANNED_ROUNDED=$(grep -r "rounded-md\|rounded-lg" $FIELDS_DIR | wc -l | tr -d ' ')
BANNED_MINHEIGHT=$(grep -r "min-h-\[" $FIELDS_DIR | wc -l | tr -d ' ')
BANNED_BORDERS=$(grep -r "border-gray-[0-9]" $FIELDS_DIR | wc -l | tr -d ' ')
BANNED_TOTAL=$((BANNED_ROUNDED + BANNED_MINHEIGHT + BANNED_BORDERS))

# Calculate coverage
TOTAL=$((DS_CLASSES + BANNED_TOTAL))
if [ $TOTAL -eq 0 ]; then
  COVERAGE=0
else
  COVERAGE=$(( (DS_CLASSES * 100) / TOTAL ))
fi

# Stoplight chart
if [ $COVERAGE -ge 90 ]; then
  COLOR=$GREEN
  STATUS="✅ EXCELLENT"
elif [ $COVERAGE -ge 70 ]; then
  COLOR=$YELLOW
  STATUS="⚠️  GOOD"
else
  COLOR=$RED
  STATUS="❌ NEEDS WORK"
fi

echo -e "${COLOR}Coverage: ${COVERAGE}% ${STATUS}${NC}"
echo ""
echo "DS Classes:      $DS_CLASSES"
echo "Banned Utils:    $BANNED_TOTAL"
echo "  - rounded-*:   $BANNED_ROUNDED"
echo "  - min-h-[*]:   $BANNED_MINHEIGHT"
echo "  - border-gray: $BANNED_BORDERS"
echo ""

# File breakdown
echo "Top non-compliant files:"
echo "------------------------"
grep -r "rounded-md\|rounded-lg\|min-h-\[\|border-gray-[0-9]" $FIELDS_DIR -l | head -5

echo ""
echo "💡 Goal: 100% coverage (0 banned utilities)"

# Exit code based on coverage
if [ $COVERAGE -lt 90 ]; then
  exit 1
fi
