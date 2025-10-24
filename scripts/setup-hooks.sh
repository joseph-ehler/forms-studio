#!/bin/bash
# Setup Git hooks for documentation validation
# Enhanced version with staged-file support

HOOK_DIR=".git/hooks"
HOOK_FILE="$HOOK_DIR/pre-commit"

echo "🔧 Setting up Git hooks..."

if [ ! -d ".git" ]; then
  echo "❌ Error: Not a Git repository"
  exit 1
fi

cat > "$HOOK_FILE" << 'EOF'
#!/bin/sh
# Pre-commit hook: Validate documentation placement (staged files only)
#
# Fast validation - only checks files being committed
# Full scan runs in CI
#
# To bypass (emergency only): git commit --no-verify

echo "🔍 Validating documentation placement..."

# Get staged .md files
CHANGED=$(git diff --cached --name-only --diff-filter=ACMR | grep '\.md$' | tr '\n' ' ')

if [ -z "$CHANGED" ]; then
  echo "✅ No markdown files staged"
  exit 0
fi

echo "📄 Checking $(echo $CHANGED | wc -w) staged file(s)..."

# Validate staged files only (fast)
node scripts/validate-docs.mjs --paths "$CHANGED"
STATUS=$?

if [ $STATUS -ne 0 ]; then
  echo ""
  echo "❌ Commit blocked: Documentation placement violations"
  echo ""
  echo "Fix the violations above, then try again."
  echo "Emergency bypass: git commit --no-verify (not recommended)"
  exit 1
fi

echo "✅ Documentation validation passed"
exit 0
EOF

chmod +x "$HOOK_FILE"

echo "✅ Git hooks installed!"
echo ""
echo "Pre-commit hook will:"
echo "  • Validate staged .md files only (fast)"
echo "  • Run automatically before commits"
echo "  • Block commits with violations"
echo ""
echo "CI runs full repo scan on PRs (bulletproof)"
