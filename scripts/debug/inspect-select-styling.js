/**
 * Inspect SelectField Styling
 * 
 * Run in browser console to check:
 * - Applied classes
 * - Computed styles
 * - CSS source
 */

// Find the select trigger button
const selectTrigger = document.querySelector('button[aria-haspopup="listbox"]');

if (!selectTrigger) {
  console.error('❌ SelectField trigger not found');
} else {
  console.log('✅ SelectField trigger found:', selectTrigger);
  
  // Check classes
  console.log('\n📋 Classes:', selectTrigger.className);
  console.log('Has ds-input:', selectTrigger.classList.contains('ds-input'));
  
  // Check computed styles
  const computed = window.getComputedStyle(selectTrigger);
  console.log('\n🎨 Computed Styles:');
  console.log('  border:', computed.border);
  console.log('  border-radius:', computed.borderRadius);
  console.log('  padding:', computed.padding);
  console.log('  min-height:', computed.minHeight);
  console.log('  background:', computed.backgroundColor);
  console.log('  font-size:', computed.fontSize);
  
  // Check if ds-input CSS is loaded
  const sheets = Array.from(document.styleSheets);
  let foundDsInput = false;
  
  try {
    sheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        rules.forEach(rule => {
          if (rule.selectorText && rule.selectorText.includes('.ds-input')) {
            foundDsInput = true;
            console.log('\n📄 Found .ds-input rule:', rule.cssText.substring(0, 200));
          }
        });
      } catch (e) {
        // CORS blocked stylesheet
      }
    });
  } catch (e) {
    console.warn('Could not inspect stylesheets:', e.message);
  }
  
  if (!foundDsInput) {
    console.warn('\n⚠️  .ds-input CSS rule not found in loaded stylesheets');
  }
  
  // Compare with a regular input
  const regularInput = document.querySelector('input.ds-input');
  if (regularInput) {
    const regularComputed = window.getComputedStyle(regularInput);
    console.log('\n🔍 Comparison with regular .ds-input:');
    console.log('  Select border:', computed.border);
    console.log('  Input border:', regularComputed.border);
    console.log('  Match:', computed.border === regularComputed.border);
  }
}
