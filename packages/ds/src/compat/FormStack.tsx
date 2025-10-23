import * as React from 'react';
import { Stack } from '../primitives/Stack';

export type FormStackProps = React.ComponentProps<typeof Stack>;

export function FormStack({ spacing = 'normal', ...rest }: FormStackProps) {
  return <Stack spacing={spacing} {...rest} />;
}
