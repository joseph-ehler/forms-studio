#!/bin/bash
# Cleanup DS Package Config Files
# Move multiple .eslintrc/.stylelintrc files to organized structure

set -e

DS_ROOT="packages/ds"
ESLINT_DIR="$DS_ROOT/.eslint"
STYLELINT_DIR="$DS_ROOT/.stylelint"

echo "🧹 Organizing DS package config files..."

# Create config directories
mkdir -p "$ESLINT_DIR"
mkdir -p "$STYLELINT_DIR"

# Move ESLint configs
echo "Moving ESLint configs..."
mv "$DS_ROOT/.eslintrc.a11y.json" "$ESLINT_DIR/a11y.json"
mv "$DS_ROOT/.eslintrc.button-size.json" "$ESLINT_DIR/button-size.json"
mv "$DS_ROOT/.eslintrc.density-rules.json" "$ESLINT_DIR/density-rules.json"
mv "$DS_ROOT/.eslintrc.focus-rules.json" "$ESLINT_DIR/focus-rules.json"
mv "$DS_ROOT/.eslintrc.guardrails.json" "$ESLINT_DIR/guardrails.json"
mv "$DS_ROOT/.eslintrc.media-rules.json" "$ESLINT_DIR/media-rules.json"
mv "$DS_ROOT/.eslintrc.overlay-rules.json" "$ESLINT_DIR/overlay-rules.json"
mv "$DS_ROOT/.eslintrc.semantic-sizing.json" "$ESLINT_DIR/semantic-sizing.json"
echo "✅ ESLint configs organized"

# Move Stylelint configs
echo "Moving Stylelint configs..."
mv "$DS_ROOT/.stylelintrc.token-enforcement.json" "$STYLELINT_DIR/token-enforcement.json"
# Move existing .stylelintrc.cjs to .stylelint/
mv "$DS_ROOT/.stylelintrc.cjs" "$STYLELINT_DIR/stylelintrc.cjs"
echo "✅ Stylelint configs organized"

# Create main .eslintrc.json that extends from all configs
cat > "$DS_ROOT/.eslintrc.json" <<'EOF'
{
  "$schema": "https://json.schemastore.org/eslintrc",
  "extends": [
    "./.eslint/a11y.json",
    "./.eslint/button-size.json",
    "./.eslint/density-rules.json",
    "./.eslint/focus-rules.json",
    "./.eslint/guardrails.json",
    "./.eslint/media-rules.json",
    "./.eslint/overlay-rules.json",
    "./.eslint/semantic-sizing.json"
  ]
}
EOF
echo "✅ Created unified .eslintrc.json"

# Create main .stylelintrc.json that extends from config
cat > "$DS_ROOT/.stylelintrc.json" <<'EOF'
{
  "$schema": "https://json.schemastore.org/stylelintrc",
  "extends": [
    "./.stylelint/stylelintrc.cjs",
    "./.stylelint/token-enforcement.json"
  ]
}
EOF
echo "✅ Created unified .stylelintrc.json"

echo ""
echo "✨ DS config cleanup complete!"
echo ""
echo "DS package root now has:"
ls -1 "$DS_ROOT"/*.json 2>/dev/null
echo ""
echo "Organized configs:"
echo "  .eslint/ (8 files)"
ls -1 "$ESLINT_DIR"
echo ""
echo "  .stylelint/ (2 files)"
ls -1 "$STYLELINT_DIR"
