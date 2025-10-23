#!/bin/bash
# Cleanup Package Roots
# Moves stray files from package roots (especially packages/ds)

set -e

echo "🧹 Cleaning up package roots..."

# DS package cleanup
DS_ROOT="packages/ds"
DS_DOCS="$DS_ROOT/docs"
DS_ARCHIVE="$DS_DOCS/archive"

# Create docs structure
mkdir -p "$DS_ARCHIVE"
mkdir -p "$DS_DOCS/guides"
mkdir -p "$DS_DOCS/patterns"

echo "📦 Cleaning DS package root..."

# Move session summaries to archive
find "$DS_ROOT" -maxdepth 1 -name "*_COMPLETE.md" -type f -exec mv {} "$DS_ARCHIVE/" \;
find "$DS_ROOT" -maxdepth 1 -name "*_SUMMARY.md" -type f -exec mv {} "$DS_ARCHIVE/" \;
find "$DS_ROOT" -maxdepth 1 -name "*_STATUS.md" -type f -exec mv {} "$DS_ARCHIVE/" \;
find "$DS_ROOT" -maxdepth 1 -name "SESSION_*.md" -type f -exec mv {} "$DS_ARCHIVE/" \;
find "$DS_ROOT" -maxdepth 1 -name "PHASE_*.md" -type f -exec mv {} "$DS_ARCHIVE/" \;
find "$DS_ROOT" -maxdepth 1 -name "WEEK_*.md" -type f -exec mv {} "$DS_ARCHIVE/" \;
find "$DS_ROOT" -maxdepth 1 -name "V0.*.md" -type f -exec mv {} "$DS_ARCHIVE/" \;
find "$DS_ROOT" -maxdepth 1 -name "VICTORY.md" -type f -exec mv {} "$DS_ARCHIVE/" \;
find "$DS_ROOT" -maxdepth 1 -name "SHIP_*.md" -type f -exec mv {} "$DS_ARCHIVE/" \;

# Move guides to docs/guides
find "$DS_ROOT" -maxdepth 1 -name "*_GUIDE.md" -type f -exec mv {} "$DS_DOCS/guides/" \;
find "$DS_ROOT" -maxdepth 1 -name "MIGRATION_*.md" -type f -exec mv {} "$DS_DOCS/guides/" \;
find "$DS_ROOT" -maxdepth 1 -name "INCREMENTAL_*.md" -type f -exec mv {} "$DS_DOCS/guides/" \;

# Move patterns to docs/patterns
find "$DS_ROOT" -maxdepth 1 -name "*_PATTERNS.md" -type f -exec mv {} "$DS_DOCS/patterns/" \;
find "$DS_ROOT" -maxdepth 1 -name "*_PATTERN.md" -type f -exec mv {} "$DS_DOCS/patterns/" \;

# Move overlay docs to docs/patterns
find "$DS_ROOT" -maxdepth 1 -name "OVERLAY_*.md" -type f -exec mv {} "$DS_DOCS/patterns/" \;

# Move debugging docs to docs/
find "$DS_ROOT" -maxdepth 1 -name "DEBUGGING_*.md" -type f -exec mv {} "$DS_DOCS/" \;

# Move remaining docs to archive
find "$DS_ROOT" -maxdepth 1 -name "*.md" -type f \
  ! -name "README.md" \
  -exec mv {} "$DS_ARCHIVE/" \;

# Move debug JS to scripts
find "$DS_ROOT" -maxdepth 1 -name "*.js" -type f -exec mv {} "$DS_ROOT/scripts/debug/" \; 2>/dev/null || true

# Move shell scripts to scripts
find "$DS_ROOT" -maxdepth 1 -name "*.sh" -type f -exec mv {} "$DS_ROOT/scripts/" \; 2>/dev/null || true

echo "✅ DS package cleaned"

# Check other packages
for pkg in packages/*/; do
  if [ "$pkg" == "packages/ds/" ]; then
    continue
  fi
  
  PKG_NAME=$(basename "$pkg")
  
  # Move stray markdown files to package docs
  if compgen -G "${pkg}*.md" > /dev/null 2>&1; then
    mkdir -p "${pkg}docs"
    find "$pkg" -maxdepth 1 -name "*.md" -type f \
      ! -name "README.md" \
      ! -name "CHANGELOG.md" \
      -exec mv {} "${pkg}docs/" \; 2>/dev/null || true
    echo "✅ $PKG_NAME cleaned"
  fi
done

echo ""
echo "✨ Package root cleanup complete!"
echo ""
echo "DS docs structure:"
tree -L 2 "$DS_ROOT/docs" 2>/dev/null || ls -la "$DS_ROOT/docs"
