# Codemods

Automated code transformations for breaking changes and migrations.

## Structure

```
codemods/
  /<changeset-id>/       # One folder per breaking change
    transform.mjs        # jscodeshift/ts-morph transform
    README.md            # What it does, examples
    test.spec.mjs        # Transform tests
```

## Usage

```bash
# Run a specific codemod
pnpm codemod <changeset-id>

# Dry run (show changes without applying)
pnpm codemod <changeset-id> --dry

# Run on specific paths
pnpm codemod <changeset-id> packages/demo-app/
```

## Creating a Codemod

1. Create changeset with breaking change:
   ```bash
   pnpm changeset
   # Select "major" for breaking change
   ```

2. Create codemod folder:
   ```bash
   mkdir -p scripts/codemods/<changeset-id>
   ```

3. Add `transform.mjs`:
   ```js
   export default function transform(file, api) {
     const j = api.jscodeshift;
     const root = j(file.source);
     
     // Your transformation logic
     
     return root.toSource();
   }
   ```

4. Link in changeset:
   ```md
   ---
   "@intstudio/ds": major
   ---
   
   Breaking: Renamed `spacing` prop to `gap`
   
   **Migration:** Run `pnpm codemod spacing-to-gap`
   ```

5. CI will post this migration command in PR comments automatically.

## Examples

### Rename prop

```js
// Before
<Stack spacing="compact">

// After
<Stack gap="compact">
```

Transform:
```js
export default function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  
  root.findJSXElements('Stack')
    .find(j.JSXAttribute, { name: { name: 'spacing' } })
    .forEach(path => {
      j(path).replaceWith(
        j.jsxAttribute(
          j.jsxIdentifier('gap'),
          path.node.value
        )
      );
    });
  
  return root.toSource();
}
```

### Update import path

```js
// Before
import { Button } from '@intstudio/ds/src/primitives/Button';

// After
import { Button } from '@intstudio/ds/primitives';
```

Transform:
```js
export default function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  
  root.find(j.ImportDeclaration)
    .filter(path => path.node.source.value.startsWith('@intstudio/ds/src/primitives'))
    .forEach(path => {
      path.node.source.value = '@intstudio/ds/primitives';
    });
  
  return root.toSource();
}
```

### Replace deprecated token

Uses `deprecations.json`:
```js
import deprecations from '../tokens/deprecations.json';

export default function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  
  // Replace CSS variable references
  root.find(j.Literal)
    .filter(path => typeof path.node.value === 'string')
    .forEach(path => {
      const value = path.node.value;
      for (const [oldToken, newToken] of Object.entries(deprecations)) {
        const oldVar = `var(--ds-${oldToken.replace(/\./g, '-')})`;
        const newVar = `var(--ds-${newToken.replace(/\./g, '-')})`;
        if (value.includes(oldVar)) {
          path.node.value = value.replace(oldVar, newVar);
        }
      }
    });
  
  return root.toSource();
}
```

## Best Practices

1. **Idempotent**: Running twice should produce same result
2. **Tested**: Include test cases in `test.spec.mjs`
3. **Documented**: Explain what changes in README
4. **Scoped**: One codemod per breaking change
5. **Safe**: Preserve formatting, comments where possible
