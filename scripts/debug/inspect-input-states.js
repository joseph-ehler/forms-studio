/**
 * Inspect Input States - Debug validation styling
 * 
 * Run in browser console to see what's actually happening
 */

console.log('🔍 Input State Inspector\n');

// Find all inputs
const inputs = document.querySelectorAll('.ds-input');

if (inputs.length === 0) {
  console.error('❌ No .ds-input elements found - CSS not applied?');
} else {
  console.log(`✅ Found ${inputs.length} input(s)\n`);
  
  inputs.forEach((input, i) => {
    const computed = window.getComputedStyle(input);
    const label = input.closest('div')?.querySelector('label')?.textContent || `Input ${i + 1}`;
    
    console.group(`${i + 1}. ${label}`);
    console.log('Element:', input);
    console.log('Value:', input.value || '(empty)');
    console.log('Type:', input.type);
    
    // Check validation states
    console.log('\n📋 HTML5 Validation:');
    console.log('  :valid:', input.matches(':valid'));
    console.log('  :invalid:', input.matches(':invalid'));
    console.log('  :placeholder-shown:', input.matches(':placeholder-shown'));
    console.log('  :focus:', input.matches(':focus'));
    
    // Check ARIA
    console.log('\n🎭 ARIA:');
    console.log('  aria-invalid:', input.getAttribute('aria-invalid'));
    console.log('  aria-required:', input.getAttribute('aria-required'));
    
    // Check classes
    console.log('\n🎨 Classes:');
    console.log('  ds-input:', input.classList.contains('ds-input'));
    console.log('  ds-input--error:', input.classList.contains('ds-input--error'));
    console.log('  ds-input--success:', input.classList.contains('ds-input--success'));
    console.log('  ds-input--warning:', input.classList.contains('ds-input--warning'));
    
    // Check computed styles
    console.log('\n💅 Computed Styles:');
    console.log('  border-color:', computed.borderColor);
    console.log('  border-style:', computed.borderStyle);
    console.log('  background:', computed.backgroundColor);
    
    // Check if CSS rules are loaded
    const sheets = Array.from(document.styleSheets);
    let foundRule = false;
    
    try {
      sheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          rules.forEach(rule => {
            if (rule.selectorText && rule.selectorText.includes('.ds-input:valid')) {
              foundRule = true;
            }
          });
        } catch (e) {
          // CORS blocked
        }
      });
    } catch (e) {}
    
    console.log('\n📄 CSS Loaded:');
    console.log('  .ds-input:valid rule found:', foundRule);
    
    console.groupEnd();
    console.log('');
  });
  
  // Check for CSS file load
  console.group('📦 CSS Files Loaded');
  const links = document.querySelectorAll('link[rel="stylesheet"]');
  links.forEach(link => {
    console.log('-', link.href);
  });
  console.groupEnd();
}
