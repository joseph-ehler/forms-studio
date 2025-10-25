#!/bin/bash
# Lint helper - uses correct ESLint version

ESLINT_BIN="node_modules/.pnpm/eslint-plugin-import@2.32.0_@typescript-eslint+parser@8.46.2_eslint@8.57.1_typescript@5.8.2___ckwz6j7dwsywcq3fzl67gzdu3y/node_modules/eslint-plugin-import/node_modules/.bin/eslint"

if [ ! -f "$ESLINT_BIN" ]; then
  echo "❌ ESLint not found. Run: pnpm install"
  exit 1
fi

$ESLINT_BIN --config .eslintrc.import-hygiene.cjs --ignore-pattern "**/flowbite-react-blocks*/**" "packages/**/*.{ts,tsx,js,jsx}"
