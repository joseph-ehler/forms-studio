#!/bin/bash
# Batch 3 - Scaffold All Fields in Sequence
# Run: bash scripts/process/batch-3-scaffold-all.sh

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 BATCH 3 - SCAFFOLDING 5 FIELDS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "1️⃣  TextField (text)..."
node scripts/process/scaffold-field.mjs TextField text
echo "   ✅ TextField scaffolded"
echo ""

echo "2️⃣  RatingField (simple stars/radio)..."
node scripts/process/scaffold-field.mjs RatingField text
echo "   ✅ RatingField scaffolded"
echo ""

echo "3️⃣  SelectField (native select)..."
node scripts/process/scaffold-field.mjs SelectField select
echo "   ✅ SelectField scaffolded"
echo ""

echo "4️⃣  DateField (native date picker)..."
node scripts/process/scaffold-field.mjs DateField date
echo "   ✅ DateField scaffolded"
echo ""

echo "5️⃣  TimeField (native time picker)..."
node scripts/process/scaffold-field.mjs TimeField time
echo "   ✅ TimeField scaffolded"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ALL 5 FIELDS SCAFFOLDED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 NEXT STEPS (per field):"
echo "   1. Customize implementation (follow NumberField)"
echo "   2. pnpm -F @intstudio/forms build"
echo "   3. Add DS façade (packages/ds/src/fields/<Name>.ts)"
echo "   4. pnpm -F @intstudio/ds build"
echo "   5. Repeat for next field!"
echo ""
echo "🎯 ORDER: TextField → RatingField → SelectField → DateField → TimeField"
echo ""
