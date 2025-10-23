import * as React from 'react';
import { Stack } from '../primitives/Stack';

export type FlexProps = React.ComponentProps<typeof Stack>;

export function Flex(props: FlexProps) {
  // Map legacy "Flex" to Stack in row direction
  return <Stack direction="row" {...props} />;
}
