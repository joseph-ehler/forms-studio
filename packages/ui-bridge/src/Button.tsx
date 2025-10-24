import { Button as FlowbiteButton, type ButtonProps as FlowbiteButtonProps } from 'flowbite-react';

export interface ButtonProps extends FlowbiteButtonProps {
  // Add any custom props here if needed
}

/**
 * Button wrapper around Flowbite Button
 * Can add custom defaults or behaviors here
 */
export function Button(props: ButtonProps) {
  return <FlowbiteButton {...props} />;
}
