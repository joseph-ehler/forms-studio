#!/bin/bash
# Clean up duplicate files and organize repository

set -e

echo "🧹 Cleaning Up Repository..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

cleaned=0

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  Finding Duplicate Files (with ' 2' suffix)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Find files with " 2" in their name (likely duplicates)
duplicates=$(find packages -type f -name "* 2.*" 2>/dev/null || true)

if [ -n "$duplicates" ]; then
  echo "${YELLOW}Found duplicate files:${NC}"
  echo ""
  echo "$duplicates" | while read file; do
    echo "  • $file"
  done
  echo ""
  
  read -p "Delete these files? (y/N) " -n 1 -r
  echo ""
  
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "$duplicates" | while read file; do
      rm "$file"
      echo "${GREEN}✅ Deleted: $file${NC}"
      cleaned=$((cleaned + 1))
    done
    echo ""
  else
    echo "${YELLOW}⏭️  Skipped duplicate cleanup${NC}"
    echo ""
  fi
else
  echo "${GREEN}✅ No duplicate files found${NC}"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  Finding Empty Directories"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Find empty directories
empty_dirs=$(find packages -type d -empty 2>/dev/null || true)

if [ -n "$empty_dirs" ]; then
  echo "${YELLOW}Found empty directories:${NC}"
  echo ""
  echo "$empty_dirs" | while read dir; do
    echo "  • $dir"
  done
  echo ""
  
  read -p "Delete these directories? (y/N) " -n 1 -r
  echo ""
  
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "$empty_dirs" | while read dir; do
      rmdir "$dir"
      echo "${GREEN}✅ Deleted: $dir${NC}"
      cleaned=$((cleaned + 1))
    done
    echo ""
  else
    echo "${YELLOW}⏭️  Skipped empty directory cleanup${NC}"
    echo ""
  fi
else
  echo "${GREEN}✅ No empty directories found${NC}"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  Finding Old Build Artifacts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Find dist directories (can be rebuilt)
dist_size=$(du -sh packages/*/dist 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")

if [ "$dist_size" != "0" ]; then
  echo "${YELLOW}Found build artifacts in dist/ directories${NC}"
  echo "Total size: ${dist_size}"
  echo ""
  
  read -p "Clean all dist/ directories? (y/N) " -n 1 -r
  echo ""
  
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    find packages -type d -name "dist" -exec rm -rf {} + 2>/dev/null || true
    echo "${GREEN}✅ Cleaned all dist/ directories${NC}"
    echo ""
  else
    echo "${YELLOW}⏭️  Skipped dist cleanup${NC}"
    echo ""
  fi
else
  echo "${GREEN}✅ No build artifacts found${NC}"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  Finding Orphaned node_modules"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Find node_modules in packages (should only be at root)
package_modules=$(find packages -type d -name "node_modules" 2>/dev/null || true)

if [ -n "$package_modules" ]; then
  echo "${YELLOW}Found orphaned node_modules:${NC}"
  echo ""
  echo "$package_modules" | while read dir; do
    size=$(du -sh "$dir" 2>/dev/null | awk '{print $1}')
    echo "  • $dir ($size)"
  done
  echo ""
  
  read -p "Delete orphaned node_modules? (y/N) " -n 1 -r
  echo ""
  
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "$package_modules" | while read dir; do
      rm -rf "$dir"
      echo "${GREEN}✅ Deleted: $dir${NC}"
    done
    echo ""
  else
    echo "${YELLOW}⏭️  Skipped node_modules cleanup${NC}"
    echo ""
  fi
else
  echo "${GREEN}✅ No orphaned node_modules found${NC}"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "${GREEN}✅ Cleanup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. pnpm install (if you cleaned node_modules)"
echo "  2. pnpm -w build (if you cleaned dist/)"
echo ""
