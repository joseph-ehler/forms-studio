/**
 * Debug Radius & Height Issues
 * PASTE IN CONSOLE
 */

console.clear();
console.log('🔍 Debugging Radius & Height\n');

// 1. Check button radius
const buttons = document.querySelectorAll('button[type="submit"], button[type="button"], .ds-button');
if (buttons.length > 0) {
  const btn = buttons[0];
  const computed = getComputedStyle(btn);
  console.log('BUTTON:');
  console.log('  Border Radius:', computed.borderRadius);
  console.log('  Min Height:', computed.minHeight);
  console.log('  Height:', computed.height);
  console.log('  Padding:', computed.padding);
  console.log('  Box Sizing:', computed.boxSizing);
}

// 2. Check input radius
const inputs = document.querySelectorAll('input[type="text"], input[type="email"], .ds-input');
if (inputs.length > 0) {
  const inp = inputs[0];
  const computed = getComputedStyle(inp);
  console.log('\nINPUT:');
  console.log('  Border Radius:', computed.borderRadius);
  console.log('  Min Height:', computed.minHeight);
  console.log('  Height:', computed.height);
  console.log('  Padding:', computed.padding);
  console.log('  Box Sizing:', computed.boxSizing);
}

// 3. Check if there are CSS conflicts
console.log('\nCHECKING FOR CONFLICTS:');
const style = document.getElementById('ds-override-style');
if (style) {
  console.log('  Override style exists:', style.textContent.substring(0, 200));
} else {
  console.log('  ❌ No override style found!');
}

// 4. Check actual element height
if (buttons.length > 0) {
  const btn = buttons[0];
  const rect = btn.getBoundingClientRect();
  console.log('\nACTUAL BUTTON DIMENSIONS:');
  console.log('  Width:', Math.round(rect.width) + 'px');
  console.log('  Height:', Math.round(rect.height) + 'px');
  console.log('  (For 100% round, radius should be half of height)');
}

console.log('\n📋 Share this output!');
