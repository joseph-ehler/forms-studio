import * as React from 'react';

/**
 * Contract rule: validates component props in dev mode
 */
export type ContractRule<P> = (props: P) => void;

/**
 * Higher-order component that enforces contract rules in development
 * Throws descriptive errors when contracts are violated
 * 
 * @example
 * ```tsx
 * const Modal = withContract(ModalCore, [requireAriaLabel], 'Modal');
 * ```
 */
export function withContract<P extends object>(
  Comp: React.ComponentType<P>,
  rules: ContractRule<P>[],
  displayName?: string
) {
  const Wrapped = (props: P) => {
    if (process.env.NODE_ENV !== 'production') {
      for (const rule of rules) {
        rule(props);
      }
    }
    return <Comp {...props} />;
  };
  
  Wrapped.displayName = displayName ?? Comp.displayName ?? Comp.name;
  return Wrapped;
}

/**
 * Contract: require ariaLabel prop for accessibility
 * Used on dialogs, overlays, and other ARIA landmarks
 */
export const requireAriaLabel = <P extends { ariaLabel?: string }>(props: P) => {
  if (!props.ariaLabel) {
    throw new Error('[DS Contract] ariaLabel is required for accessibility');
  }
};

/**
 * Contract: require id prop for form elements
 * Ensures proper label association
 */
export const requireId = <P extends { id?: string }>(props: P) => {
  if (!props.id) {
    throw new Error('[DS Contract] id is required for form field association');
  }
};

/**
 * Contract: validate ARIA describedBy references exist
 * Ensures aria-describedby points to actual DOM elements
 */
export const validateAriaDescribedBy = <P extends { 'aria-describedby'?: string }>(props: P) => {
  if (props['aria-describedby'] && typeof document !== 'undefined') {
    const ids = props['aria-describedby'].split(' ');
    const missing = ids.filter(id => !document.getElementById(id));
    if (missing.length > 0) {
      console.warn(`[DS Contract] aria-describedby references missing elements: ${missing.join(', ')}`);
    }
  }
};
