/**
 * ESLint Plugin: cascade
 * 
 * Custom rules for forms-studio monorepo
 */

module.exports = {
  rules: {
    // Sheet system rules
    'sheet-no-panel-on-dialog': require('./sheet-no-panel-on-dialog'),
    
    // Route system rules
    'routes-require-aria-label': require('./routes-require-aria-label'),
    
    // Existing rules would be here...
  },
};
