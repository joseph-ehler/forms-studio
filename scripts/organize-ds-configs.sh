#!/bin/bash
# Organize DS Package Config Files
# Move lint configs to organized structure

set -e

DS_ROOT="packages/ds"
CONFIG_DIR="$DS_ROOT/config"

echo "🧹 Organizing DS package config files..."

# Create config directory
mkdir -p "$CONFIG_DIR/eslint"
mkdir -p "$CONFIG_DIR/stylelint"

# Move ESLint rule configs (these are rule definitions, not active configs)
echo "Moving ESLint rule configs..."
for file in "$DS_ROOT"/.eslintrc.*.json; do
  if [ -f "$file" ]; then
    basename=$(basename "$file" | sed 's/\.eslintrc\.//')
    mv "$file" "$CONFIG_DIR/eslint/$basename"
    echo "  → $(basename "$file") → config/eslint/$basename"
  fi
done
echo "✅ ESLint configs organized"

# Move Stylelint configs
echo "Moving Stylelint configs..."
if [ -f "$DS_ROOT/.stylelintrc.token-enforcement.json" ]; then
  mv "$DS_ROOT/.stylelintrc.token-enforcement.json" "$CONFIG_DIR/stylelint/token-enforcement.json"
  echo "  → .stylelintrc.token-enforcement.json → config/stylelint/token-enforcement.json"
fi

if [ -f "$DS_ROOT/.stylelintrc.cjs" ]; then
  mv "$DS_ROOT/.stylelintrc.cjs" "$CONFIG_DIR/stylelint/stylelintrc.cjs"
  echo "  → .stylelintrc.cjs → config/stylelint/stylelintrc.cjs"
fi
echo "✅ Stylelint configs organized"

# Create README explaining the structure
cat > "$CONFIG_DIR/README.md" <<'EOF'
# DS Package Configuration

This directory contains linter configurations for the design system.

## Structure

```
config/
├── eslint/          # ESLint rule definitions
│   ├── a11y.json           # Accessibility rules
│   ├── button-size.json    # Button sizing rules
│   ├── density-rules.json  # Spacing density rules
│   ├── focus-rules.json    # Focus state rules
│   ├── guardrails.json     # General guardrails
│   ├── media-rules.json    # Media query rules
│   ├── overlay-rules.json  # Overlay component rules
│   └── semantic-sizing.json # Semantic sizing rules
│
└── stylelint/       # Stylelint configurations
    ├── stylelintrc.cjs          # Main Stylelint config
    └── token-enforcement.json    # Token usage enforcement
```

## Usage

These are rule definitions used by the eslint-plugin-ds and stylelint-plugin-ds packages.

They are **not** meant to be extended directly. Instead, they are packaged into the plugins and consumed via:

```json
{
  "extends": ["plugin:@intstudio/cascade/ds"]
}
```

## Active Linting

The DS package uses the root workspace ESLint/Stylelint configs, which extend from the plugin configs.

See: `../../.eslintrc.json` and root Stylelint config.
EOF

echo "✅ Created config/README.md"

echo ""
echo "✨ DS config organization complete!"
echo ""
echo "DS package root JSON files:"
ls -1 "$DS_ROOT"/*.json 2>/dev/null
echo ""
echo "Organized config directory:"
tree "$CONFIG_DIR" 2>/dev/null || find "$CONFIG_DIR" -type f
