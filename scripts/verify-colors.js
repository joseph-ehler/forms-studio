#!/usr/bin/env node
/**
 * Console script to verify typography colors are working
 * 
 * Paste this in browser console when viewing forms with validation states.
 * It will check if helper text has correct contextual colors.
 */

console.log('🎨 Typography Color Verification\n');

const helpers = document.querySelectorAll('[data-ds="helper"]');

if (helpers.length === 0) {
  console.warn('❌ No helper text found. Make sure you have validation messages visible.');
} else {
  console.log(`Found ${helpers.length} helper text element(s)\n`);
  
  const results = Array.from(helpers).map(el => {
    const computedColor = getComputedStyle(el).color;
    const fontSize = getComputedStyle(el).fontSize;
    const classes = Array.from(el.classList);
    const variant = classes.find(c => c.includes('ds-helper--')) || 'unknown';
    
    return {
      text: el.textContent?.trim().substring(0, 40) + '...',
      variant: variant.replace('ds-helper--', ''),
      color: computedColor,
      fontSize: fontSize,
      expectedColor: getExpectedColor(variant)
    };
  });
  
  console.table(results);
  
  // Check if colors match expectations
  const issues = results.filter(r => {
    if (!r.expectedColor) return false;
    return !r.color.includes(r.expectedColor);
  });
  
  if (issues.length === 0) {
    console.log('\n✅ All helper text colors are correct!');
  } else {
    console.warn(`\n⚠️  ${issues.length} helper text(s) have incorrect colors:`);
    console.table(issues);
  }
  
  // Check label sizes
  const labels = document.querySelectorAll('[data-ds="label"]:not(.ds-sr-only)');
  if (labels.length > 0) {
    const labelSizes = Array.from(labels).map(el => ({
      text: el.textContent?.trim().substring(0, 30),
      fontSize: getComputedStyle(el).fontSize,
      fontWeight: getComputedStyle(el).fontWeight,
    }));
    
    console.log('\n📏 Label Sizes:');
    console.table(labelSizes);
    
    const has16px = labelSizes.some(l => l.fontSize === '16px');
    if (has16px) {
      console.log('✅ Labels using correct size (16px)');
    } else {
      console.warn('⚠️  Labels may be too small (expected 16px)');
    }
  }
}

function getExpectedColor(variant) {
  const map = {
    'ds-helper--error': '220, 38, 38',
    'ds-helper--success': '22, 163, 74',
    'ds-helper--warning': '234, 179, 8',
    'ds-helper--hint': '107, 114, 128',
  };
  return map[variant];
}
