#!/bin/bash
# Migrate imports from @joseph.ehler/wizard-react to @intstudio/ds

set -e

echo "🔄 Migrating imports to @intstudio/ds..."

# Find all TypeScript/TSX files in demo
find packages/wizard-react/demo/src -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
  echo "  Processing: $file"
  
  # Replace the import
  sed -i '' "s/@joseph\.ehler\/wizard-react/@intstudio\/ds/g" "$file"
done

echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "1. pnpm install (update lockfile)"
echo "2. cd packages/wizard-react && pnpm build"
echo "3. cd demo && pnpm dev (test demo)"
