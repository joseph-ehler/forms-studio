#!/bin/bash
#
# Root File Organization Script
# 
# Moves 255+ stray files from roots into proper directories:
# - Monorepo root → docs/archive/
# - packages/ds → packages/ds/docs/archive/
# - Debug scripts → scripts/debug/
# - Cleanup scripts → scripts/cleanup/
#
# Usage:
#   ./scripts/cleanup/organize-root-files.sh --dry-run  # Preview
#   ./scripts/cleanup/organize-root-files.sh            # Execute
#

set -euo pipefail

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "🔍 DRY RUN MODE - No files will be moved"
  echo ""
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

# Create target directories
mkdir -p docs/archive
mkdir -p scripts/debug
mkdir -p scripts/cleanup
mkdir -p packages/ds/docs/archive

moved_count=0
duplicate_count=0

# Function to move file
move_file() {
  local file="$1"
  local dest="$2"
  
  if [[ ! -f "$file" ]]; then
    return
  fi
  
  # Check for duplicates (files ending with " 2")
  if [[ "$file" =~ \ 2\.(md|js|html|txt|sh)$ ]]; then
    echo "🗑️  DELETE (duplicate): $file"
    if [[ "$DRY_RUN" == "false" ]]; then
      rm "$file"
    fi
    ((duplicate_count++))
    return
  fi
  
  echo "📦 MOVE: $file → $dest"
  if [[ "$DRY_RUN" == "false" ]]; then
    mv "$file" "$dest"
  fi
  ((moved_count++))
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧹 CLEANING MONOREPO ROOT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Keep these files in root (allowed list)
ALLOWED_IN_ROOT=(
  "README.md"
  "AUTONOMOUS_SETUP.md"
  "package.json"
  "pnpm-workspace.yaml"
  "pnpm-lock.yaml"
  "turbo.json"
  "tsconfig.json"
  "tsconfig.base.json"
  "renovate.json"
  "cspell.json"
  "playwright.config.ts"
  "eslint.config.js"
  "dangerfile.mjs"
  "dangerfile.ts"
  ".gitignore"
  ".markdownlint.json"
  ".remarkrc.json"
  "factory.config.json"
  "factory-overlays.yaml"
  "repo.imports.yaml"
  "PUBLISH_V0.2.0.sh"
  "LAUNCH.md"
  "STATUS.md"
  "SHIPLIST.md"
  "VICTORY.md"
  "NAMING_CONVENTIONS.md"
  "IMPORT_HYGIENE.md"
  "ENGINEERING_PRINCIPLES.md"
  "TESTING_GUIDE.md"
)

# Move session summaries and completion docs
for file in *.md; do
  [[ ! -f "$file" ]] && continue
  
  # Check if allowed
  is_allowed=false
  for allowed in "${ALLOWED_IN_ROOT[@]}"; do
    if [[ "$file" == "$allowed" ]]; then
      is_allowed=true
      break
    fi
  done
  
  if [[ "$is_allowed" == "true" ]]; then
    continue
  fi
  
  # Move to archive
  move_file "$file" "docs/archive/$file"
done

# Move debug scripts
for file in DEBUG_*.js debug-*.html DIAGNOSTIC_*.js; do
  [[ ! -f "$file" ]] && continue
  move_file "$file" "scripts/debug/$file"
done

# Move cleanup scripts (except this one)
for file in *cleanup*.sh; do
  [[ ! -f "$file" ]] && continue
  [[ "$file" == "organize-root-files.sh" ]] && continue
  move_file "$file" "scripts/cleanup/$file"
done

# Move codemod scripts
for file in *codemod*.js *codemod*.sh; do
  [[ ! -f "$file" ]] && continue
  move_file "$file" "scripts/codemods/$file"
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧹 CLEANING packages/ds ROOT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd packages/ds

# Allowed in DS package root
ALLOWED_IN_DS=(
  "README.md"
  "CHANGELOG.md"
  "package.json"
  "tsconfig.json"
  "api-extractor.json"
  "tsd.json"
  "tsup.config.ts"
)

# Move all stray docs to archive
for file in *.md; do
  [[ ! -f "$file" ]] && continue
  
  # Check if allowed
  is_allowed=false
  for allowed in "${ALLOWED_IN_DS[@]}"; do
    if [[ "$file" == "$allowed" ]]; then
      is_allowed=true
      break
    fi
  done
  
  if [[ "$is_allowed" == "true" ]]; then
    continue
  fi
  
  # Move to DS archive
  move_file "$file" "docs/archive/$file"
done

# Move debug scripts
for file in DEBUG_*.js debug-*.html; do
  [[ ! -f "$file" ]] && continue
  move_file "$file" "../../scripts/debug/ds-$file"
done

cd "$REPO_ROOT"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Files moved: $moved_count"
echo "Duplicates deleted: $duplicate_count"
echo ""

if [[ "$DRY_RUN" == "true" ]]; then
  echo "⚠️  DRY RUN - No changes made"
  echo "Run without --dry-run to execute"
else
  echo "✅ Cleanup complete!"
  echo ""
  echo "Next steps:"
  echo "  git status"
  echo "  git add -A"
  echo "  git commit -m 'chore: organize 255+ stray files into proper directories'"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
