#!/bin/bash

# Script to complete the composite field migrations
# Each file needs the config extraction added after the prop renaming

echo "📝 Completing composite field migrations..."
echo ""
echo "Files to fix:"
echo "  1. CurrencyField.tsx"
echo "  2. NPSField.tsx"
echo "  3. OTPField.tsx"
echo "  4. RankField.tsx"
echo "  5. DateRangeField.tsx"
echo "  6. MatrixField.tsx"
echo "  7. TableField.tsx"
echo "  8. AddressField.tsx"
echo ""
echo "Each needs to add after prop renaming:"
echo "  const config = mergeFieldConfig({ ... }, json, {})"
echo "  const label = config.label"
echo "  const required = config.required ?? false"
echo "  etc."
echo ""
echo "✅ Pattern established - manual completion needed"
