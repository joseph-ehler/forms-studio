/**
 * PASTE THIS IN BROWSER CONSOLE NOW
 * 
 * This will show exactly what's happening with your typography
 */

console.clear();
console.log('🔍 TYPOGRAPHY DEBUG - LIVE INSPECTION\n');

// 1. Check if CSS is loaded
const styleSheets = Array.from(document.styleSheets);
const hasTypographyCSS = styleSheets.some(sheet => {
  try {
    const rules = Array.from(sheet.cssRules || []);
    return rules.some(rule => rule.cssText?.includes('ds-helper--error'));
  } catch (e) {
    return false;
  }
});

console.log('1️⃣ CSS LOADED:', hasTypographyCSS ? '✅ YES' : '❌ NO');

// 2. Check helper elements
const helpers = document.querySelectorAll('[data-ds="helper"]');
console.log('\n2️⃣ HELPER ELEMENTS FOUND:', helpers.length);

if (helpers.length === 0) {
  console.warn('❌ No helper text found. Make sure validation messages are visible.');
} else {
  helpers.forEach((el, i) => {
    const computed = getComputedStyle(el);
    const classes = Array.from(el.classList);
    
    console.log(`\nHelper ${i + 1}:`);
    console.log('  Text:', el.textContent?.trim().substring(0, 50));
    console.log('  Classes:', classes.join(' '));
    console.log('  Color:', computed.color);
    console.log('  Font Size:', computed.fontSize);
    console.log('  Display:', computed.display);
  });
}

// 3. Check labels
const labels = document.querySelectorAll('[data-ds="label"]:not(.ds-sr-only)');
console.log('\n3️⃣ LABELS FOUND:', labels.length);

if (labels.length > 0) {
  const label = labels[0];
  const computed = getComputedStyle(label);
  console.log('  First label text:', label.textContent?.trim());
  console.log('  Font Size:', computed.fontSize);
  console.log('  Font Weight:', computed.fontWeight);
  console.log('  Color:', computed.color);
}

// 4. Check what's actually in the DOM
console.log('\n4️⃣ DOM STRUCTURE:');
const firstHelper = helpers[0];
if (firstHelper) {
  console.log('  HTML:', firstHelper.outerHTML.substring(0, 200));
}

// 5. Check if ds-typography.css rules exist
console.log('\n5️⃣ CHECKING CSS RULES:');
try {
  const foundRules = [];
  styleSheets.forEach(sheet => {
    try {
      const rules = Array.from(sheet.cssRules || []);
      rules.forEach(rule => {
        if (rule.cssText?.includes('ds-helper--error') || 
            rule.cssText?.includes('ds-helper--success') ||
            rule.cssText?.includes('ds-helper--warning')) {
          foundRules.push(rule.cssText);
        }
      });
    } catch (e) {}
  });
  
  if (foundRules.length > 0) {
    console.log('✅ Found typography CSS rules:', foundRules.length);
    foundRules.forEach(rule => console.log('  ', rule.substring(0, 100)));
  } else {
    console.warn('❌ No typography CSS rules found!');
    console.log('   This means ds-typography.css is NOT loaded');
  }
} catch (e) {
  console.error('Error checking CSS:', e);
}

console.log('\n' + '='.repeat(50));
console.log('📋 SUMMARY:');
console.log('  CSS Loaded:', hasTypographyCSS ? '✅' : '❌ MISSING!');
console.log('  Helpers Found:', helpers.length);
console.log('  Labels Found:', labels.length);
console.log('='.repeat(50));

// NEXT STEPS
console.log('\n🎯 NEXT: Share this output with me!');
