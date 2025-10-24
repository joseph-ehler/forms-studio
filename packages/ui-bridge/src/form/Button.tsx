/**
 * Button wrapper (simple re-export for now)
 */
import { Button as FlowbiteButton, type ButtonProps as FlowbiteButtonProps } from 'flowbite-react';

export type ButtonProps = FlowbiteButtonProps;

/**
 * Button component
 * Direct passthrough to Flowbite for now
 */
export function Button(props: ButtonProps) {
  return <FlowbiteButton {...props} />;
}
