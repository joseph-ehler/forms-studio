/**
 * Check SelectField Overlay Contrast
 * 
 * Run in browser console to check actual WCAG contrast ratios
 * for hover and selected states.
 */

// Helper: Calculate relative luminance
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Helper: Calculate contrast ratio
function getContrastRatio(rgb1, rgb2) {
  const l1 = getLuminance(...rgb1);
  const l2 = getLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Helper: Parse RGB from computed style
function parseRGB(colorString) {
  const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
}

console.log('🎨 SelectField Contrast Checker\n');

// Find an option in the overlay
const options = document.querySelectorAll('button[role="option"]');

if (options.length === 0) {
  console.error('❌ No options found. Make sure SelectField overlay is open.');
} else {
  console.log(`✅ Found ${options.length} option(s)\n`);
  
  const option = options[0];
  const computed = window.getComputedStyle(option);
  
  // Get current state
  const bgColor = computed.backgroundColor;
  const textColor = computed.color;
  
  console.log('📊 Current State:');
  console.log('  Background:', bgColor);
  console.log('  Text:', textColor);
  
  const bg = parseRGB(bgColor);
  const text = parseRGB(textColor);
  
  if (bg && text) {
    const ratio = getContrastRatio(bg, text);
    console.log(`  Contrast Ratio: ${ratio.toFixed(2)}:1`);
    
    const passAA = ratio >= 4.5;
    const passAAA = ratio >= 7.0;
    
    console.log(`  WCAG AA (4.5:1): ${passAA ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  WCAG AAA (7:1): ${passAAA ? '✅ PASS' : '⚠️  FAIL'}`);
  }
  
  // Test hover state
  console.log('\n🖱️  Simulating Hover State:');
  
  // Get CSS variable value
  const surfaceSubtle = getComputedStyle(document.documentElement)
    .getPropertyValue('--ds-color-surface-subtle').trim();
  const textPrimary = getComputedStyle(document.documentElement)
    .getPropertyValue('--ds-color-text-primary').trim();
  
  console.log('  --ds-color-surface-subtle:', surfaceSubtle);
  console.log('  --ds-color-text-primary:', textPrimary);
  
  // Create test element
  const testDiv = document.createElement('div');
  testDiv.style.background = surfaceSubtle;
  testDiv.style.color = textPrimary;
  testDiv.style.position = 'absolute';
  testDiv.style.visibility = 'hidden';
  document.body.appendChild(testDiv);
  
  const testComputed = window.getComputedStyle(testDiv);
  const hoverBg = parseRGB(testComputed.backgroundColor);
  const hoverText = parseRGB(testComputed.color);
  
  document.body.removeChild(testDiv);
  
  if (hoverBg && hoverText) {
    const hoverRatio = getContrastRatio(hoverBg, hoverText);
    console.log(`  Hover Contrast Ratio: ${hoverRatio.toFixed(2)}:1`);
    
    const hoverPassAA = hoverRatio >= 4.5;
    const hoverPassAAA = hoverRatio >= 7.0;
    
    console.log(`  WCAG AA (4.5:1): ${hoverPassAA ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  WCAG AAA (7:1): ${hoverPassAAA ? '✅ PASS' : '⚠️  FAIL'}`);
    
    if (!hoverPassAA) {
      console.warn('\n⚠️  HOVER STATE FAILS WCAG AA!');
      console.warn('   Consider using --ds-color-surface-raised instead');
      console.warn('   Or increase contrast of text color');
    }
  }
  
  // Test selected state
  console.log('\n✓ Selected State:');
  const primaryBg = getComputedStyle(document.documentElement)
    .getPropertyValue('--ds-color-primary-bg').trim();
  const primaryText = getComputedStyle(document.documentElement)
    .getPropertyValue('--ds-color-primary-text').trim();
    
  console.log('  --ds-color-primary-bg:', primaryBg);
  console.log('  --ds-color-primary-text:', primaryText);
  
  const testDiv2 = document.createElement('div');
  testDiv2.style.background = primaryBg;
  testDiv2.style.color = primaryText;
  testDiv2.style.position = 'absolute';
  testDiv2.style.visibility = 'hidden';
  document.body.appendChild(testDiv2);
  
  const test2Computed = window.getComputedStyle(testDiv2);
  const selectedBg = parseRGB(test2Computed.backgroundColor);
  const selectedText = parseRGB(test2Computed.color);
  
  document.body.removeChild(testDiv2);
  
  if (selectedBg && selectedText) {
    const selectedRatio = getContrastRatio(selectedBg, selectedText);
    console.log(`  Selected Contrast Ratio: ${selectedRatio.toFixed(2)}:1`);
    
    const selectedPassAA = selectedRatio >= 4.5;
    const selectedPassAAA = selectedRatio >= 7.0;
    
    console.log(`  WCAG AA (4.5:1): ${selectedPassAA ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  WCAG AAA (7:1): ${selectedPassAAA ? '✅ PASS' : '⚠️  FAIL'}`);
  }
}

console.log('\n💡 Tip: Hover over an option to see real-time contrast changes');
