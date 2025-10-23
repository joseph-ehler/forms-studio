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
