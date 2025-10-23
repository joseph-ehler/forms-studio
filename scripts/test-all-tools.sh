#!/bin/bash
# Test All Housekeeping Tools
# Comprehensive diagnostic to verify all automation is working

echo "🔍 Testing All Housekeeping Tools"
echo "=================================="
echo ""

PASS=0
FAIL=0
WARN=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_tool() {
  local name=$1
  local command=$2
  local expect_success=${3:-true}
  
  echo "Testing: $name"
  if eval "$command" > /tmp/tool-test.log 2>&1; then
    if [ "$expect_success" = "true" ]; then
      echo -e "${GREEN}✅ PASS${NC}: $name"
      ((PASS++))
    else
      echo -e "${RED}❌ FAIL${NC}: $name (expected to fail but passed)"
      ((FAIL++))
    fi
  else
    if [ "$expect_success" = "false" ]; then
      echo -e "${GREEN}✅ PASS${NC}: $name (correctly failed)"
      ((PASS++))
    else
      echo -e "${RED}❌ FAIL${NC}: $name"
      cat /tmp/tool-test.log
      ((FAIL++))
    fi
  fi
  echo ""
}

echo "1️⃣ Core Guard Tools"
echo "-------------------"
test_tool "Repo Steward" "pnpm repo:steward"
test_tool "Import Doctor" "pnpm imports:check"
test_tool "Dependency Graph" "pnpm depgraph:check"
test_tool "Guard (all three)" "pnpm guard"

echo ""
echo "2️⃣ Code Generation"
echo "------------------"
test_tool "Token Codegen" "pnpm tokens:codegen"
test_tool "Barrel Generator" "pnpm barrels"
test_tool "API Extractor" "pnpm api:extract"

echo ""
echo "3️⃣ Documentation"
echo "----------------"
test_tool "Docs Linting" "pnpm docs:lint"
test_tool "Docs Auto-stow" "pnpm docs:autostow"

echo ""
echo "4️⃣ Name & File Hygiene"
echo "----------------------"
test_tool "Name Police" "pnpm name-police"

echo ""
echo "5️⃣ ESLint Rules"
echo "----------------"
test_tool "ESLint" "pnpm --filter @intstudio/ds lint" false

echo ""
echo "=================================="
echo "📊 Test Results Summary"
echo "=================================="
echo -e "${GREEN}✅ Passed: $PASS${NC}"
echo -e "${RED}❌ Failed: $FAIL${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARN${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}🎉 All tools are working!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  Some tools need attention${NC}"
  exit 1
fi
