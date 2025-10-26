#!/bin/bash
# Flowbite Component Research Helper
# Usage: ./scripts/research-flowbite.sh <ComponentName>

set -e

COMPONENT=$1

if [ -z "$COMPONENT" ]; then
  echo "❌ Usage: ./scripts/research-flowbite.sh <ComponentName>"
  echo "   Example: ./scripts/research-flowbite.sh Checkbox"
  exit 1
fi

echo ""
echo "🔍 Researching Flowbite: $COMPONENT"
echo "========================================="
echo ""

# Check if component exists
echo "📦 Step 1: Checking if component exists..."
if [ -d "node_modules/flowbite-react/dist/types/components/$COMPONENT" ]; then
  echo "✅ Found: $COMPONENT"
else
  echo "❌ Not found: $COMPONENT"
  echo ""
  echo "Available components:"
  ls node_modules/flowbite-react/dist/types/components/ | head -20
  exit 1
fi

echo ""

# Read type definition
echo "📄 Step 2: Reading type definition..."
if [ -f "node_modules/flowbite-react/dist/types/components/$COMPONENT/$COMPONENT.d.ts" ]; then
  echo ""
  cat "node_modules/flowbite-react/dist/types/components/$COMPONENT/$COMPONENT.d.ts" | head -30
else
  echo "⚠️  No .d.ts file found"
fi

echo ""
echo "========================================="
echo ""

# Check exports
echo "📤 Step 3: Checking exports..."
if [ -f "node_modules/flowbite-react/dist/types/components/$COMPONENT/index.d.ts" ]; then
  cat "node_modules/flowbite-react/dist/types/components/$COMPONENT/index.d.ts"
fi

echo ""
echo "========================================="
echo ""

# Extract key info
echo "🔑 Step 4: Key Information..."
echo ""

# Check if it extends input
if grep -q "ComponentProps<\"input\">" "node_modules/flowbite-react/dist/types/components/$COMPONENT/$COMPONENT.d.ts" 2>/dev/null; then
  echo "🎯 Type: INPUT ELEMENT (self-closing)"
  echo "   → No children prop"
  echo "   → Needs label wrapper"
  echo ""
fi

# Check for required props
if grep -q "required" "node_modules/flowbite-react/dist/types/components/$COMPONENT/$COMPONENT.d.ts" 2>/dev/null; then
  echo "⚠️  Has required props - check definition above"
  echo ""
fi

# Suggest docs
echo "📚 Step 5: Check Flowbite docs:"
echo "   https://flowbite-react.com/docs/components/$(echo $COMPONENT | tr '[:upper:]' '[:lower:]')"
echo ""

# Suggest next steps
echo "========================================="
echo "📝 Next Steps:"
echo ""
echo "1. Document findings in: docs/handbook/flowbite-components/${COMPONENT}.md"
echo "2. Update generator mapping in: scripts/ds-new.mjs (if name differs)"
echo "3. Generate component: pnpm ds:new $COMPONENT"
echo ""
echo "✅ Research complete!"
echo ""
