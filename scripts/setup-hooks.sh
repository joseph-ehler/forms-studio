#!/bin/bash
# Setup Git hooks for documentation validation
#
# This script installs the pre-commit hook that validates
# documentation placement automatically.

HOOK_DIR=".git/hooks"
HOOK_FILE="$HOOK_DIR/pre-commit"

echo "🔧 Setting up Git hooks..."

# Check if .git exists
if [ ! -d ".git" ]; then
  echo "❌ Error: Not a Git repository"
  echo "   Run this from the repository root"
  exit 1
fi

# Create hook
cat > "$HOOK_FILE" << 'EOF'
#!/bin/sh
# Pre-commit hook: Validate documentation placement
#
# This prevents markdown files from being committed to root directories.
# Runs automatically before every commit.
#
# To bypass (emergency only): git commit --no-verify

echo "🔍 Validating documentation placement..."

# Run validation
node scripts/validate-docs.mjs

# Check exit code
if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Commit blocked: Documentation placement violations found"
  echo ""
  echo "Fix the violations above, then try again."
  echo "Emergency bypass: git commit --no-verify (not recommended)"
  exit 1
fi

echo "✅ Documentation validation passed"
exit 0
EOF

# Make executable
chmod +x "$HOOK_FILE"

echo "✅ Git hooks installed successfully!"
echo ""
echo "Pre-commit hook will now:"
echo "  • Validate docs placement before every commit"
echo "  • Block commits with root-level markdown files"
echo "  • Run automatically (set it and forget it)"
echo ""
echo "To bypass (emergency): git commit --no-verify"
