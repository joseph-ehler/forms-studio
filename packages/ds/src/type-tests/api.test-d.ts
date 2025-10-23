/**
 * Type Snapshot Tests
 * 
 * Ensures public API signatures remain stable.
 * Uses tsd (https://github.com/SamVerschueren/tsd) for type testing.
 * 
 * Run: pnpm tsd
 */

import { expectType, expectError, expectAssignable } from 'tsd';
import type { FieldComponentProps, FieldVariant, TypographyDisplay } from '../primitives';
import { Stack, Button, FormLabel } from '../primitives';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Stack API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Should accept valid spacing values
expectAssignable<Parameters<typeof Stack>[0]>({
  spacing: 'tight',
});

expectAssignable<Parameters<typeof Stack>[0]>({
  spacing: 'normal',
});

expectAssignable<Parameters<typeof Stack>[0]>({
  spacing: 'relaxed',
});

// Should reject invalid spacing values
expectError(<Stack spacing="invalid" />);

// Should accept direction
expectAssignable<Parameters<typeof Stack>[0]>({
  direction: 'column',
});

expectAssignable<Parameters<typeof Stack>[0]>({
  direction: 'row',
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Field Props
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// FieldVariant should be union of valid values
expectType<FieldVariant>('auto');
expectType<FieldVariant>('native');
expectType<FieldVariant>('custom');

// @ts-expect-error - invalid variant
expectType<FieldVariant>('invalid');

// TypographyDisplay should have all required fields
const typographyDisplay: TypographyDisplay = {
  showLabel: true,
  showDescription: false,
  showError: true,
  showRequired: false,
  showOptional: false,
};

expectType<TypographyDisplay>(typographyDisplay);

// FieldComponentProps should be generic
declare const fieldProps: FieldComponentProps;
expectType<string>(fieldProps.name);
expectType<any>(fieldProps.control);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Component Props
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// FormLabel should accept size
expectAssignable<Parameters<typeof FormLabel>[0]>({
  size: 'sm',
});

expectAssignable<Parameters<typeof FormLabel>[0]>({
  size: 'md',
});

expectAssignable<Parameters<typeof FormLabel>[0]>({
  size: 'lg',
});

// Button should accept variant
expectAssignable<Parameters<typeof Button>[0]>({
  variant: 'primary',
});

expectAssignable<Parameters<typeof Button>[0]>({
  variant: 'secondary',
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Barrel Exports
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Main barrel should export core types
import type { 
  LayoutPreset,
  DeviceType,
  FieldFactory,
  FieldRegistry,
} from '../primitives';

expectType<LayoutPreset>('narrow');
expectType<LayoutPreset>('comfortable');
expectType<LayoutPreset>('wide');

expectType<DeviceType>('mobile');
expectType<DeviceType>('tablet');
expectType<DeviceType>('desktop');

// Utils barrel should export hooks
import { useDeviceType, useMotion } from '../utils';

const deviceType = useDeviceType();
expectType<DeviceType>(deviceType);

const motion = useMotion();
expectType<number>(motion.duration.fast);
expectType<boolean>(motion.prefersReduced);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Deep Import Prevention
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Note: Deep imports are blocked at multiple levels:
// 1. Package exports (Node resolution fails)
// 2. ESLint rule (no-deep-ds-imports)
// 3. Import Doctor (violates deny rules)
// 
// Type tests would fail Import Doctor, so we verify
// the enforcement happens via ESLint and package.json instead
