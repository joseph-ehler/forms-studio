/**
 * Spacing Tokens - Single Source of Truth for Layout
 * 
 * ALL spacing/gap values live here.
 * Prevents magic numbers and ensures consistency.
 */

export const SPACING_TOKENS = {
  // Base spacing scale (8px base unit)
  px: {
    0: '0px',
    1: '4px',    // 0.25rem
    2: '8px',    // 0.5rem
    3: '12px',   // 0.75rem
    4: '16px',   // 1rem
    5: '20px',   // 1.25rem
    6: '24px',   // 1.5rem
    8: '32px',   // 2rem
    10: '40px',  // 2.5rem
    12: '48px',  // 3rem
    16: '64px',  // 4rem
  },
  
  // Semantic spacing for forms
  form: {
    // Label to input gap
    labelGap: '6px',          // 0.375rem - tight coupling
    
    // Between fields (vertical stack)
    fieldGap: '20px',         // 1.25rem - clear separation
    
    // Section to content
    sectionGap: '16px',       // 1rem - moderate separation
    
    // Large section breaks
    sectionBreak: '32px',     // 2rem - major separation
    
    // Helper text to input
    helperGap: '6px',         // 0.375rem - tight coupling
    
    // Between field groups
    groupGap: '24px',         // 1.5rem - group separation
  },
  
  // Component-specific
  component: {
    // Inside cards/containers
    cardPadding: '16px',
    
    // Between buttons
    buttonGap: '12px',
    
    // Radio/checkbox to label
    checkboxGap: '8px',
  },
} as const;

export type SpacingKey = keyof typeof SPACING_TOKENS.px;
export type FormSpacingKey = keyof typeof SPACING_TOKENS.form;

export const getSpacing = (size: SpacingKey): string => SPACING_TOKENS.px[size];
export const getFormSpacing = (key: FormSpacingKey): string => SPACING_TOKENS.form[key];
