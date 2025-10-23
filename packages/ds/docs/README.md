# Design System Documentation

This directory contains the living documentation for the `@intstudio/ds` package.

## Structure

```
docs/
├── README.md                    (this file)
├── DEBUGGING_PLAYBOOK.md        (debug scripts & techniques)
├── guides/                      (how-to guides)
│   ├── FIELD_JSON_COMPATIBILITY_GUIDE.md
│   ├── INCREMENTAL_MIGRATION_GUIDE.md
│   ├── MIGRATION_CHECKLIST.md
│   └── OVERLAY_FIELD_AUTHORS_GUIDE.md
├── patterns/                    (design patterns & architecture)
│   ├── DESIGN_SYSTEM_PATTERNS.md
│   ├── FIELD_TYPOGRAPHY_PATTERN.md
│   ├── OVERLAY_1000_PERCENT.md
│   ├── OVERLAY_DEBUG_SCRIPTS.md
│   ├── OVERLAY_EVENT_SHIELDING_FIX.md
│   ├── OVERLAY_HARDENING.md
│   ├── OVERLAY_SYSTEM_PLAN.md
│   └── OVERLAY_VERIFICATION_MATRIX.md
└── archive/                     (historical session summaries)
    └── (47 files)
```

## Active Documentation

### Guides
Developer-facing how-to guides for working with the design system:
- Field JSON compatibility
- Migration strategies
- Overlay field authoring

### Patterns
Architecture patterns and implementation details:
- Design system patterns
- Overlay system architecture
- Typography patterns
- Field patterns

### Debugging Playbook
Console scripts and debugging techniques for:
- Overlay positioning
- Event handling
- Focus management
- Responsive behavior

## Archive

Historical session summaries and completion docs moved from the package root. These are kept for:
- Historical reference
- Architecture decision context
- Pattern evolution tracking

Can be safely deleted after 6 months or major version releases.

## Package Root

The `packages/ds/` root should ONLY contain:
- `README.md` (package overview)
- `package.json` (package manifest)
- `tsconfig.json` (TypeScript config)
- `api-extractor.json` (API tracking)
- `tsd.json` (type test config)
- Config files (`.eslintrc.*.json`, `.stylelintrc.cjs`)

**Never create docs in package root!** Use this `docs/` directory instead.

## Cleanup

If package root gets polluted again, run:
```bash
pnpm packages:cleanup
```

This will move files to the correct locations in this docs structure.
