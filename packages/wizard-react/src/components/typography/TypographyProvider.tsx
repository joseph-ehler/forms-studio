/**
 * Typography Context - Auto-Wire Defaults
 * 
 * Provides default typography settings to all descendants.
 * Fields consume via useTypography() - never manual prop drilling.
 */

import React, { createContext, useContext } from 'react';
import type { LabelSize } from '../../tokens/typography';

export interface TypographyContextValue {
  size: LabelSize;
  density: 'cozy' | 'compact';
}

const TypographyContext = createContext<TypographyContextValue>({
  size: 'md',
  density: 'cozy',
});

export interface TypographyProviderProps {
  size?: LabelSize;
  density?: 'cozy' | 'compact';
  children: React.ReactNode;
}

/**
 * TypographyProvider - Provides default typography settings
 * 
 * Wrap your app/form with this to set defaults.
 * Fields auto-consume via useTypography().
 * 
 * @example
 * <TypographyProvider size="md" density="cozy">
 *   <MyForm />
 * </TypographyProvider>
 */
export const TypographyProvider: React.FC<TypographyProviderProps> = ({
  size = 'md',
  density = 'cozy',
  children,
}) => {
  return (
    <TypographyContext.Provider value={{ size, density }}>
      {children}
    </TypographyContext.Provider>
  );
};

/**
 * useTypography - Hook to consume typography context
 * 
 * Returns default size and density from nearest TypographyProvider.
 * Primitives use this to auto-wire defaults.
 */
export const useTypography = (): TypographyContextValue => {
  return useContext(TypographyContext);
};
