/**
 * ESLint Plugin - Design System Rules
 */

module.exports = {
  rules: {
    // Existing rules
    'no-margin-on-atoms': require('./no-margin-on-atoms'),
    
    // Sheet system rules (added Day 3)
    'no-sheet-dialog-drag-dismiss': require('./no-sheet-dialog-drag-dismiss'),
    'panel-no-modal-props': require('./panel-no-modal-props'),
    'no-manual-overlay-zindex': require('./no-manual-overlay-zindex'),
  },
}
