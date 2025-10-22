#!/bin/bash
# Reorganize to Intelligence Studio structure

set -e

echo "🏗️  Reorganizing to Intelligence Studio..."
echo ""

# Step 1: Rename wizard-react → ds
echo "📦 Step 1: Renaming wizard-react/ → ds/"
if [ -d "packages/wizard-react" ]; then
  mv packages/wizard-react packages/ds
  echo "   ✅ Renamed to packages/ds/"
else
  echo "   ⚠️  packages/wizard-react not found, skipping..."
fi

# Step 2: Remove empty directories
echo ""
echo "🗑️  Step 2: Removing empty directories"
for dir in packages/demo-b2c packages/react packages/schema packages/validator; do
  if [ -d "$dir" ]; then
    if [ -z "$(ls -A $dir)" ]; then
      rm -rf "$dir"
      echo "   ✅ Removed empty $dir"
    fi
  fi
done

# Step 3: Update package names in package.json files
echo ""
echo "📝 Step 3: Updating package names to @intstudio scope"

# Update ds/package.json (already @intstudio/ds)
echo "   ✅ packages/ds/package.json already @intstudio/ds"

# Update core/package.json
if [ -f "packages/core/package.json" ]; then
  sed -i '' 's/"@joseph\.ehler\/wizard-core"/"@intstudio\/core"/g' packages/core/package.json
  echo "   ✅ packages/core/package.json → @intstudio/core"
fi

# Update datasources/package.json
if [ -f "packages/datasources/package.json" ]; then
  sed -i '' 's/"@joseph\.ehler\/datasources"/"@intstudio\/datasources"/g' packages/datasources/package.json
  echo "   ✅ packages/datasources/package.json → @intstudio/datasources"
fi

# Update eslint-plugin-cascade/package.json
if [ -f "packages/eslint-plugin-cascade/package.json" ]; then
  sed -i '' 's/"@joseph\.ehler\/eslint-plugin-cascade"/"@intstudio\/eslint-plugin-cascade"/g' packages/eslint-plugin-cascade/package.json
  echo "   ✅ packages/eslint-plugin-cascade/package.json → @intstudio/eslint-plugin-cascade"
fi

# Step 4: Update dependencies in all package.json files
echo ""
echo "🔗 Step 4: Updating dependencies across all packages"

# Find all package.json files
find packages -name "package.json" -type f | while read file; do
  # Update core references
  sed -i '' 's/"@joseph\.ehler\/wizard-core"/"@intstudio\/core"/g' "$file"
  
  # Update datasources references  
  sed -i '' 's/"@joseph\.ehler\/datasources"/"@intstudio\/datasources"/g' "$file"
  
  # Update eslint-plugin references
  sed -i '' 's/"@joseph\.ehler\/eslint-plugin-cascade"/"@intstudio\/eslint-plugin-cascade"/g' "$file"
  
  # wizard-react is already migrated to @intstudio/ds
done

echo "   ✅ Updated all package dependencies"

# Step 5: Update repository URLs
echo ""
echo "🔗 Step 5: Updating repository URLs"

find packages -name "package.json" -type f | while read file; do
  sed -i '' 's|github.com/joseph-ehler/forms-studio|github.com/joseph-ehler/intelligence-studio|g' "$file"
done

echo "   ✅ Updated all repository URLs"

# Step 6: Update demo-app dependency
echo ""
echo "📦 Step 6: Updating demo-app to use @intstudio/ds"
if [ -f "packages/demo-app/package.json" ]; then
  sed -i '' 's/"@joseph-ehler\/wizard-react"/"@intstudio\/ds"/g' packages/demo-app/package.json
  echo "   ✅ packages/demo-app/package.json updated"
fi

echo ""
echo "✅ Reorganization complete!"
echo ""
echo "📋 Summary:"
echo "   • Renamed packages/wizard-react/ → packages/ds/"
echo "   • Scoped all packages under @intstudio/*"
echo "   • Updated all cross-package dependencies"
echo "   • Updated repository URLs"
echo "   • Removed empty directories"
echo ""
echo "🔄 Next steps:"
echo "   1. pnpm install (update lockfile)"
echo "   2. pnpm -w build (rebuild all packages)"
echo "   3. Test packages/ds/demo (pnpm dev)"
echo "   4. Update README.md"
echo ""
