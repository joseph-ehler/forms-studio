/**
 * Debug Button Rendering Issue
 * 
 * Paste this in browser console to diagnose why buttons aren't showing
 */

console.clear();
console.log('🔍 Button Rendering Debug\n');

// 1. Check if buttons exist in DOM
const buttons = document.querySelectorAll('[data-component="button"]');
console.log(`Found ${buttons.length} button elements`);

if (buttons.length === 0) {
  console.error('❌ No buttons found! React components may not be rendering.');
  console.log('\nCheck:');
  console.log('  1. Are there any React errors in console?');
  console.log('  2. Does root element exist?', document.getElementById('root'));
  console.log('  3. Run: window.location.reload()');
} else {
  console.log('✅ Buttons exist in DOM\n');
  
  // 2. Check first button's styles
  const btn = buttons[0];
  const computed = getComputedStyle(btn);
  
  console.log('First button attributes:');
  console.log('  data-variant:', btn.getAttribute('data-variant'));
  console.log('  data-size:', btn.getAttribute('data-size'));
  console.log('  className:', btn.className);
  console.log('  children:', btn.children.length);
  console.log('  textContent:', btn.textContent.trim());
  
  console.log('\nComputed styles:');
  console.log('  display:', computed.display);
  console.log('  visibility:', computed.visibility);
  console.log('  opacity:', computed.opacity);
  console.log('  width:', computed.width);
  console.log('  height:', computed.height);
  console.log('  background:', computed.background.substring(0, 50));
  console.log('  color:', computed.color);
  console.log('  border:', computed.border);
  console.log('  padding:', computed.padding);
  
  // 3. Check if CSS is loaded
  const stylesheets = Array.from(document.styleSheets);
  const hasButtonCSS = stylesheets.some(sheet => {
    try {
      const rules = Array.from(sheet.cssRules || []);
      return rules.some(rule => 
        rule.selectorText && rule.selectorText.includes('data-component="button"')
      );
    } catch (e) {
      return false;
    }
  });
  
  console.log('\nCSS Status:');
  console.log('  Button.css loaded:', hasButtonCSS ? '✅' : '❌');
  console.log('  Total stylesheets:', stylesheets.length);
  
  // 4. Check for CSS custom properties
  const root = document.documentElement;
  const rootStyles = getComputedStyle(root);
  
  console.log('\nDS Tokens:');
  console.log('  --ds-color-primary:', rootStyles.getPropertyValue('--ds-color-primary'));
  console.log('  --ds-color-text:', rootStyles.getPropertyValue('--ds-color-text'));
  console.log('  --ds-space-control-y:', rootStyles.getPropertyValue('--ds-space-control-y'));
  console.log('  --ds-radius-control:', rootStyles.getPropertyValue('--ds-radius-control'));
  
  // 5. Visual inspection helper
  console.log('\n📍 First button bounding box:');
  const rect = btn.getBoundingClientRect();
  console.log('  x:', rect.x, 'y:', rect.y);
  console.log('  width:', rect.width, 'height:', rect.height);
  console.log('  Is visible?', rect.width > 0 && rect.height > 0);
  
  // 6. Highlight first button for visual check
  btn.style.outline = '3px solid red';
  console.log('\n🎯 First button now has RED OUTLINE for visual check');
}
