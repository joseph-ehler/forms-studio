# @intelligence-studio/wizard-core

Headless wizard engine with expression evaluation, flow validation, and runtime.

## Features

- ✅ **Expression Engine** - Safe, allowlisted expression evaluation
- ✅ **Flow Schema** - Zod-based validation for wizard flows
- ✅ **Flow Validator** - Strict validation with machine-readable errors
- ✅ **100% Tested** - Complete test coverage

## Installation

```bash
npm install @intelligence-studio/wizard-core zod
```

## Usage

### Expression Engine

```typescript
import { evaluateExpression } from '@intelligence-studio/wizard-core'

const result = evaluateExpression(
  'ctx.vehicle.mileage > 100000',
  {
    ctx: { vehicle: { mileage: 150000 } },
    fields: {}
  }
)

console.log(result.value) // true
```

### Flow Validation

```typescript
import { validateFlow, FlowSchema } from '@intelligence-studio/wizard-core'

const flow = {
  version: '1.0.0',
  chapters: [/* ... */],
  // ...
}

const result = validateFlow(flow)

if (!result.valid) {
  console.error(result.issues)
}
```

## API

### `evaluateExpression(expression, context)`

Evaluates a safe expression with allowlisted operations.

### `validateFlow(flow, options?)`

Validates a flow against the schema.

## License

Apache-2.0
