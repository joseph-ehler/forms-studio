/**
 * COMPREHENSIVE DIAGNOSTIC - PASTE IN CONSOLE
 * 
 * This will show us EVERYTHING that's wrong
 */

console.clear();
console.log('🔍 COMPLETE SYSTEM DIAGNOSTIC\n');
console.log('='.repeat(60));

// 1. CHECK CSS FILES LOADED
console.log('\n1️⃣ CSS FILES LOADED:');
const styleSheets = Array.from(document.styleSheets);
const cssFiles = styleSheets.map(sheet => {
  try {
    return sheet.href ? sheet.href.split('/').pop() : 'inline';
  } catch (e) {
    return 'cross-origin';
  }
});
console.log('  Files:', cssFiles);

const hasTypoCSS = styleSheets.some(sheet => {
  try {
    const rules = Array.from(sheet.cssRules || []);
    return rules.some(r => r.cssText?.includes('ds-label'));
  } catch (e) {
    return false;
  }
});

const hasSpacingCSS = styleSheets.some(sheet => {
  try {
    const rules = Array.from(sheet.cssRules || []);
    return rules.some(r => r.cssText?.includes('ds-field'));
  } catch (e) {
    return false;
  }
});

console.log('  Typography CSS:', hasTypoCSS ? '✅ LOADED' : '❌ MISSING');
console.log('  Spacing CSS:', hasSpacingCSS ? '✅ LOADED' : '❌ MISSING');

// 2. CHECK LABELS
console.log('\n2️⃣ LABELS:');
const labels = document.querySelectorAll('[data-ds="label"]:not(.ds-sr-only)');
console.log('  Found:', labels.length);

if (labels.length > 0) {
  const l = labels[0];
  const cs = getComputedStyle(l);
  console.log('  First label:', l.textContent?.trim());
  console.log('  Classes:', Array.from(l.classList).join(', '));
  console.log('  Color:', cs.color, '(expected: rgb(17, 24, 39))');
  console.log('  Font size:', cs.fontSize, '(expected: 16px)');
  console.log('  Font weight:', cs.fontWeight, '(expected: 600)');
  console.log('  Margin bottom:', cs.marginBottom, '(expected: 6px)');
}

// 3. CHECK HELPERS
console.log('\n3️⃣ HELPER TEXT:');
const helpers = document.querySelectorAll('[data-ds="helper"]');
console.log('  Found:', helpers.length);

const helperColors = {
  success: 0,
  error: 0,
  warning: 0,
  hint: 0,
  wrong: 0
};

helpers.forEach(h => {
  const color = getComputedStyle(h).color;
  const classes = Array.from(h.classList);
  
  if (color.includes('22, 163, 74')) helperColors.success++;
  else if (color.includes('220, 38, 38')) helperColors.error++;
  else if (color.includes('234, 179, 8')) helperColors.warning++;
  else if (color.includes('107, 114, 128')) helperColors.hint++;
  else helperColors.wrong++;
});

console.log('  Colors:');
console.log('    ✅ Success (green):', helperColors.success);
console.log('    ✅ Error (red):', helperColors.error);
console.log('    ✅ Warning (yellow):', helperColors.warning);
console.log('    ✅ Hint (gray):', helperColors.hint);
console.log('    ❌ WRONG COLOR:', helperColors.wrong);

// 4. CHECK FIELD SPACING
console.log('\n4️⃣ FIELD SPACING:');
const fields = document.querySelectorAll('.ds-field');
console.log('  Fields with .ds-field class:', fields.length);

// Check actual spacing between labels
const allLabels = Array.from(document.querySelectorAll('[data-ds="label"]:not(.ds-sr-only)'));
if (allLabels.length > 1) {
  const l1 = allLabels[0];
  const l2 = allLabels[1];
  const gap = l2.getBoundingClientRect().top - l1.getBoundingClientRect().bottom;
  console.log('  Gap between first 2 fields:', Math.round(gap) + 'px', '(expected: ~70px)');
}

// 5. CHECK WHAT'S OVERRIDING
console.log('\n5️⃣ STYLE CONFLICTS:');
if (labels.length > 0) {
  const l = labels[0];
  const styles = window.getComputedStyle(l);
  
  // Check all style sources
  console.log('  Label color sources:');
  const allRules = [];
  styleSheets.forEach(sheet => {
    try {
      Array.from(sheet.cssRules || []).forEach(rule => {
        if (rule.style && rule.selectorText?.includes('label')) {
          allRules.push({
            selector: rule.selectorText,
            color: rule.style.color,
            sheet: sheet.href?.split('/').pop() || 'inline'
          });
        }
      });
    } catch (e) {}
  });
  
  allRules.slice(0, 5).forEach(r => {
    console.log('   ', r.selector, '→', r.color || 'none', `(${r.sheet})`);
  });
}

// 6. SUMMARY
console.log('\n' + '='.repeat(60));
console.log('📋 SUMMARY:');
console.log('='.repeat(60));

const issues = [];
if (!hasTypoCSS) issues.push('❌ Typography CSS not loaded');
if (!hasSpacingCSS) issues.push('❌ Spacing CSS not loaded');
if (helperColors.wrong > 0) issues.push(`❌ ${helperColors.wrong} helpers have wrong color`);
if (fields.length === 0) issues.push('❌ No fields using .ds-field class');

if (issues.length === 0) {
  console.log('✅ Everything looks good!');
} else {
  console.log('ISSUES FOUND:');
  issues.forEach(i => console.log('  ' + i));
}

console.log('\n🎯 Next: Share this output!');
