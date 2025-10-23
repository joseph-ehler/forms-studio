import * as React from 'react';
import { Stack } from '../primitives/Stack';

export type FlexProps = React.ComponentProps<typeof Stack> & {
  gap?: 'sm' | 'md' | 'lg' | string;
  justify?: React.CSSProperties['justifyContent'];
};

export function Flex({ gap, justify, style, ...props }: FlexProps) {
  // Map legacy "Flex" to Stack in row direction
  // Map gap values to Stack spacing
  const spacing = gap === 'sm' ? 'tight' 
    : gap === 'lg' ? 'relaxed' 
    : 'normal'; // md or default
  
  const mergedStyle = {
    ...(justify && { justifyContent: justify }),
    ...style,
  };
  
  return <Stack direction="row" spacing={spacing} style={mergedStyle} {...props} />;
}
