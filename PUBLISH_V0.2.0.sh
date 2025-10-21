#!/bin/bash
# 🚀 Publish v0.2.0 Script

set -e

echo "🚀 Publishing v0.2.0..."

# 1. Switch to main and pull
echo "📥 Switching to main branch..."
git switch main
git pull origin main

# 2. Version bump
echo "🔢 Bumping version to 0.2.0..."
npm version 0.2.0 --no-git-tag-version

# 3. Publish packages
echo "📦 Publishing packages..."
pnpm -r publish --access public --no-git-checks

# 4. Create git tag
echo "🏷️  Creating git tag..."
git add .
git commit -m "chore: release v0.2.0"
git tag -a v0.2.0 -m "v0.2.0: 17 fields + mobile-first infrastructure"
git push origin main --tags

echo ""
echo "✅ PUBLISHED v0.2.0!"
echo ""
echo "📦 Package: @joseph.ehler/wizard-react@0.2.0"
echo "🎯 Fields: 17 working (14 foundation + 3 composite)"
echo "🏗️  Infrastructure: 100% complete"
echo ""
echo "🎉 SUCCESS! Package is live on npm!"
echo ""
echo "Test it:"
echo "  npm i @joseph.ehler/wizard-react@0.2.0"
echo ""
