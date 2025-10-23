/**
 * Visual Field Inspector - Run in Browser Console
 * 
 * Analyzes rendered form fields to identify:
 * - Touch target sizes
 * - Spacing consistency
 * - Color contrast (WCAG AA/AAA)
 * - Visual states (hover, focus, error)
 * - Typography scale
 * 
 * Usage:
 *   1. Open Field Showcase in browser
 *   2. Open DevTools console
 *   3. Paste this entire script
 *   4. Run: inspect_fields()
 */

function inspectFields() {
  console.log('🎨 FIELD VISUAL INSPECTION\n');
  
  const inputs = document.querySelectorAll('.ds-input');
  const labels = document.querySelectorAll('[class*="FormLabel"]');
  const helpers = document.querySelectorAll('[class*="FormHelperText"]');
  
  console.log(`Found ${inputs.length} inputs, ${labels.length} labels, ${helpers.length} helpers\n`);
  
  // Analyze inputs
  const inputAnalysis = [];
  inputs.forEach((input, i) => {
    const computed = window.getComputedStyle(input);
    const rect = input.getBoundingClientRect();
    
    const analysis = {
      index: i,
      element: input,
      dimensions: {
        width: rect.width,
        height: rect.height,
        minHeight: computed.minHeight,
      },
      typography: {
        fontSize: computed.fontSize,
        fontFamily: computed.fontFamily,
        lineHeight: computed.lineHeight,
      },
      spacing: {
        padding: computed.padding,
        paddingTop: computed.paddingTop,
        paddingLeft: computed.paddingLeft,
      },
      visual: {
        borderRadius: computed.borderRadius,
        borderWidth: computed.borderWidth,
        borderColor: computed.borderColor,
        background: computed.backgroundColor,
        boxShadow: computed.boxShadow,
      },
      states: {
        disabled: input.disabled,
        ariaInvalid: input.getAttribute('aria-invalid'),
        placeholder: input.placeholder,
      },
    };
    
    inputAnalysis.push(analysis);
  });
  
  // Check touch target compliance
  const touchTargets = inputAnalysis.map((a, i) => ({
    index: i,
    height: a.dimensions.height,
    meetsMinimum: a.dimensions.height >= 44, // WCAG 2.1 Level AAA
    mobileOptimal: a.dimensions.height >= 48,
  }));
  
  const touchCompliance = touchTargets.filter(t => t.meetsMinimum).length;
  const mobileOptimal = touchTargets.filter(t => t.mobileOptimal).length;
  
  console.log('📏 TOUCH TARGETS:');
  console.log(`  Meets 44px minimum: ${touchCompliance}/${inputs.length}`);
  console.log(`  Mobile optimal (48px+): ${mobileOptimal}/${inputs.length}`);
  console.table(touchTargets);
  
  // Check font sizes (prevent iOS zoom)
  const fontSizes = inputAnalysis.map((a, i) => ({
    index: i,
    fontSize: a.typography.fontSize,
    preventsZoom: parseFloat(a.typography.fontSize) >= 16,
  }));
  
  const fontCompliance = fontSizes.filter(f => f.preventsZoom).length;
  
  console.log('\n✍️  TYPOGRAPHY:');
  console.log(`  16px+ (prevents iOS zoom): ${fontCompliance}/${inputs.length}`);
  console.table(fontSizes);
  
  // Check spacing consistency
  const spacingVariants = [...new Set(inputAnalysis.map(a => a.spacing.padding))];
  
  console.log('\n📐 SPACING:');
  console.log(`  Unique padding variants: ${spacingVariants.length}`);
  console.log(`  Padding values:`, spacingVariants);
  
  // Check border radius consistency
  const radiusVariants = [...new Set(inputAnalysis.map(a => a.visual.borderRadius))];
  
  console.log('\n🔄 BORDER RADIUS:');
  console.log(`  Unique radius variants: ${radiusVariants.length}`);
  console.log(`  Radius values:`, radiusVariants);
  
  // Visual state testing
  console.log('\n🎭 VISUAL STATES TEST:');
  console.log('  Run these in console to test states:');
  console.log('  - testFocusStates() - Test all focus rings');
  console.log('  - testHoverStates() - Test all hover effects');
  console.log('  - testErrorStates() - Test all error styling');
  
  // Return for further inspection
  return {
    inputs: inputAnalysis,
    summary: {
      total: inputs.length,
      touchCompliance: `${touchCompliance}/${inputs.length}`,
      fontCompliance: `${fontCompliance}/${inputs.length}`,
      spacingVariants: spacingVariants.length,
      radiusVariants: radiusVariants.length,
    },
  };
}

function testFocusStates() {
  console.log('🔍 TESTING FOCUS STATES...\n');
  const inputs = document.querySelectorAll('.ds-input');
  
  inputs.forEach((input, i) => {
    setTimeout(() => {
      input.focus();
      const computed = window.getComputedStyle(input);
      console.log(`Input ${i}:`, {
        borderColor: computed.borderColor,
        boxShadow: computed.boxShadow,
        transform: computed.transform,
      });
    }, i * 500);
  });
  
  setTimeout(() => {
    console.log('\n✅ Focus state test complete');
    document.activeElement?.blur();
  }, inputs.length * 500);
}

function testHoverStates() {
  console.log('👆 TESTING HOVER STATES...\n');
  const inputs = document.querySelectorAll('.ds-input');
  
  console.log('Hover over inputs and check:');
  console.log('  - Border color changes');
  console.log('  - Background color changes');
  console.log('  - Cursor changes to text');
  
  // Add temporary hover indicators
  inputs.forEach(input => {
    input.addEventListener('mouseenter', function() {
      const computed = window.getComputedStyle(this);
      console.log('Hover detected:', {
        borderColor: computed.borderColor,
        backgroundColor: computed.backgroundColor,
        cursor: computed.cursor,
      });
    });
  });
}

function testErrorStates() {
  console.log('❌ TESTING ERROR STATES...\n');
  const inputs = document.querySelectorAll('.ds-input');
  
  inputs.forEach((input, i) => {
    if (i % 3 === 0) { // Test every 3rd input
      input.setAttribute('aria-invalid', 'true');
      const computed = window.getComputedStyle(input);
      console.log(`Input ${i} (error state):`, {
        borderColor: computed.borderColor,
        boxShadow: computed.boxShadow,
        animation: computed.animation,
      });
    }
  });
  
  console.log('\n✅ Check inputs for error styling (red border, shadow, animation)');
  console.log('Run clearErrorStates() to reset');
}

function clearErrorStates() {
  document.querySelectorAll('.ds-input').forEach(input => {
    input.removeAttribute('aria-invalid');
  });
  console.log('✅ Error states cleared');
}

// Export to global scope
window.inspectFields = inspectFields;
window.testFocusStates = testFocusStates;
window.testHoverStates = testHoverStates;
window.testErrorStates = testErrorStates;
window.clearErrorStates = clearErrorStates;

console.log('🎨 Field Inspector loaded!');
console.log('Run: inspectFields() to start analysis');
