import * as React from 'react';
import { Grid } from '../primitives/Grid';

export type FormGridProps = React.ComponentProps<typeof Grid>;

export function FormGrid({ gap = 'md', ...rest }: FormGridProps) {
  return <Grid gap={gap} {...rest} />;
}
