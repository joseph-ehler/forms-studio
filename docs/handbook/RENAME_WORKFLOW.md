# Safe Rename Workflow

**TL;DR**: Use `pnpm refactor:rename` for all file/directory renames. It updates imports + barrels automatically.

---

## Why We Need This

**The Problem:**
- Manual renames break imports
- Barrels go stale
- macOS case-insensitivity masks issues until CI
- TypeScript only catches errors after the damage is done

**The Solution:**
- One command that does: rename + update imports + regenerate barrels + typecheck
- CI guardrails that prevent bad renames from merging
- Protected golden sources (flowbite-react-blocks)

---

## The Safe Rename Command

### Usage

```bash
pnpm refactor:rename <from-path> <to-path>
```

### Example

```bash
# Renaming a directory
pnpm refactor:rename packages/ds/src/routes/FlowScaffold packages/ds/src/routes/flow-scaffold

# Renaming a file
pnpm refactor:rename packages/ds/src/utils/oldName.ts packages/ds/src/utils/new-name.ts
```

### What It Does

1. **git mv** (preserves history)
2. **Updates imports** using ts-morph (finds all references)
3. **Regenerates barrels** (auto-generated index.ts files)
4. **Runs typecheck** (verifies everything still works)

### Output

```
🔄 Safe rename starting...

📦 Step 1: Moving packages/ds/src/routes/FlowScaffold → packages/ds/src/routes/flow-scaffold
✅ Path moved

📝 Step 2: Updating imports...
✅ Updated imports in 12 files

🔨 Step 3: Regenerating barrels...
✅ Barrels regenerated

🔍 Step 4: Type checking...
✅ Type check passed

✅✅✅ Rename complete!
```

---

## Step-by-Step Workflow

### 1. **Plan**
- Decide the new path (use kebab-case for directories)
- Search for usage: `rg "OldName"` or use IDE search
- Estimate impact (how many files reference this?)

### 2. **Run the Command**
```bash
pnpm refactor:rename <from> <to>
```

### 3. **Review Changes**
```bash
git status
git diff
```

Check:
- ✅ Path renamed
- ✅ Imports updated
- ✅ Barrels regenerated
- ✅ No unexpected changes

### 4. **Commit**
```bash
git add -A
git commit -m "refactor: rename FlowScaffold → flow-scaffold

- Updated all imports
- Regenerated barrels
- All typechecks passing"
```

### 5. **Open PR**
Include in PR description:
- What was renamed (from → to)
- Number of files affected
- Link to diff if large change

---

## Rollback

If something goes wrong:

```bash
# Undo everything
git reset --hard HEAD

# Or undo just the last commit
git reset HEAD~1
```

---

## Local Validation

Before pushing, run:

```bash
pnpm doctor:rename
```

This runs:
- Rename sanity checks (no dangling imports, no PascalCase dirs)
- Full typecheck

---

## CI Guardrails

Our CI runs `validate-renames.mjs` which blocks PRs if:

1. **Dangling imports** - references to old paths
2. **Illegal filenames** - spaces or `* 2.*` duplicates
3. **PascalCase directories** under `routes/` (use kebab-case)
4. **Case-sensitivity issues** that break on Linux

---

## Protected Golden Sources

**Cannot be deleted** (without explicit approval):
- `flowbite-react-blocks-1.8.0-beta/`

These contain reference patterns for DS development.

If you try to delete:
```
❌ BLOCKED: Attempting to delete golden source!

Protected: flowbite-react-blocks-1.8.0-beta/

This directory contains reference patterns needed for DS development.
```

To override (emergency only):
```bash
git commit --no-verify  # DON'T DO THIS without team approval
```

---

## Naming Conventions

### Files
- React components: **PascalCase** (`Button.tsx`, `FlowScaffold.tsx`)
- Other files: **kebab-case** (`button-utils.ts`, `use-sub-flow.ts`)
- No spaces, no special characters

### Directories
- Under `src/routes/`: **kebab-case** (`flow-scaffold/`, `full-screen-route/`)
- Component folders: Match component name (`Button/`, `FlowScaffold/`)
- Utilities: **kebab-case** (`utils/`, `hooks/`, `form-core/`)

### Why kebab-case for routes?
- Consistent with URL slugs
- No macOS case-sensitivity traps
- Easier to type

---

## Common Scenarios

### Renaming a Route Component

```bash
# Before
packages/ds/src/routes/FlowScaffold/
  FlowScaffold.tsx
  useSubFlow.ts
  index.ts

# Command
pnpm refactor:rename packages/ds/src/routes/FlowScaffold packages/ds/src/routes/flow-scaffold

# After
packages/ds/src/routes/flow-scaffold/
  FlowScaffold.tsx  # Component keeps PascalCase
  useSubFlow.ts
  index.ts
```

### Renaming a Utility File

```bash
# Command
pnpm refactor:rename packages/ds/src/utils/oldName.ts packages/ds/src/utils/new-name.ts
```

### Moving Between Packages

```bash
# Command
pnpm refactor:rename packages/core/src/util.ts packages/ds/src/utils/util.ts

# Note: Also update package.json dependencies if needed
```

---

## Troubleshooting

### "Path not found"
- Check the path exists: `ls -la <path>`
- Use absolute or relative-from-root paths

### "Target already exists"
- Delete the target first, or choose a different name
- Check for case-insensitive collisions

### Imports Still Broken After Rename
```bash
# Manually regenerate barrels
pnpm barrels

# Check for missed imports
rg "OldName" packages/

# Fix manually if needed, then commit
```

### TypeScript Errors Persist
```bash
# Clear TypeScript cache
rm -rf packages/*/dist
rm -rf node_modules/.cache

# Rebuild
pnpm -r build
pnpm typecheck
```

---

## FAQ

**Q: Can I use git mv directly?**  
A: Yes, but you'll need to manually update imports and regenerate barrels. Use `pnpm refactor:rename` to do it all at once.

**Q: What if I renamed something manually already?**  
A: Run `pnpm barrels && pnpm typecheck` to fix barrels and catch import errors. Fix imports manually if needed.

**Q: Does this work for multiple renames at once?**  
A: No, rename one thing at a time. It's safer and easier to review.

**Q: Can I rename across packages?**  
A: Yes, but also check `package.json` dependencies between packages.

---

## Related

- [WHERE-TO-EDIT.md](./WHERE-TO-EDIT.md) - Where files live
- [`.policy/roots-allowlist.json`](../../.policy/roots-allowlist.json) - Protected sources
- [`scripts/refactor-rename.mts`](../../scripts/refactor-rename.mts) - Implementation
- [`scripts/validate-renames.mjs`](../../scripts/validate-renames.mjs) - CI checks
