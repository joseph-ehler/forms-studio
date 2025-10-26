/**
 * ESLint Plugin: cascade
 * 
 * Custom ESLint rules for the Cascade design system
 * 
 * Note: SKIN completeness validation moved to TypeScript contracts
 * (see packages/ds/src/control/skin-contracts.ts)
 */

module.exports = {
  rules: {
    'no-children-on-inputs': require('./no-children-on-inputs'),
    'controlled-input-required-props': require('./controlled-input-required-props'),
    // SKIN rules removed - TypeScript now enforces completeness
    // Add other project-specific rules here as needed
  },
};
