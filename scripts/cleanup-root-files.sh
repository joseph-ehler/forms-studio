#!/bin/bash
# Emergency Root Cleanup
# Moves stray files to docs/archive and removes duplicates

set -e

ROOT=$(pwd)
ARCHIVE="$ROOT/docs/archive"

echo "🧹 Cleaning up root directory..."

# Create archive if doesn't exist
mkdir -p "$ARCHIVE"

# 1. Remove duplicate files (ending with " 2")
echo "Removing duplicates..."
find . -maxdepth 1 -name "* 2.*" -type f -delete
echo "✅ Duplicates removed"

# 2. Move stray markdown files to archive (except README, AUTONOMOUS_SETUP)
echo "Moving stray markdown files..."
find . -maxdepth 1 -name "*.md" -type f \
  ! -name "README.md" \
  ! -name "AUTONOMOUS_SETUP.md" \
  -exec mv {} "$ARCHIVE/" \;
echo "✅ Markdown files archived"

# 3. Move debug JS files to archive
echo "Moving debug JS files..."
find . -maxdepth 1 -name "DEBUG_*.js" -type f -exec mv {} "$ARCHIVE/" \;
find . -maxdepth 1 -name "DIAGNOSTIC_*.js" -type f -exec mv {} "$ARCHIVE/" \;
echo "✅ Debug files archived"

# 4. Move debug HTML files to archive
echo "Moving debug HTML files..."
find . -maxdepth 1 -name "*.html" -type f -exec mv {} "$ARCHIVE/" \;
echo "✅ HTML files archived"

# 5. Move stray shell scripts to archive (except cleanup scripts)
echo "Moving stray shell scripts..."
find . -maxdepth 1 -name "*.sh" -type f \
  ! -name "cleanup-*.sh" \
  -exec mv {} "$ARCHIVE/" \;
echo "✅ Shell scripts archived"

# 6. Move stray JS files (codemods, etc)
echo "Moving stray JS files..."
find . -maxdepth 1 -name "*-codemod.js" -type f -exec mv {} "$ARCHIVE/" \;
echo "✅ Codemod files archived"

# 7. Remove duplicate eslintrc files
echo "Removing duplicate eslintrc files..."
find . -maxdepth 1 -name ".eslintrc.*2.json" -type f -delete
echo "✅ Duplicate configs removed"

# 8. Remove duplicate stylelintrc files
echo "Removing duplicate stylelintrc files..."
find . -maxdepth 1 -name ".stylelintrc.*2.json" -type f -delete
echo "✅ Duplicate configs removed"

echo ""
echo "✨ Root cleanup complete!"
echo "📁 Archived files moved to: docs/archive/"
echo ""
echo "Remaining root files:"
ls -1 | grep -E '\.(md|js|sh|html|json)$' | grep -v node_modules || echo "(none - clean!)"
