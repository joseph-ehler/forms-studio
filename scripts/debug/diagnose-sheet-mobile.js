/**
 * Sheet Mobile Diagnostic Script
 * 
 * Paste this into browser console while viewing:
 * http://localhost:6010/?path=/story/ds-primitives-sheet--mobile
 * 
 * Checks:
 * 1. Is RSBS CSS loaded?
 * 2. Is forceMode="sheet" applied?
 * 3. Did lazy import succeed?
 * 4. Is .rsbs-root element present?
 * 5. Is drag handle visible?
 */

(function diagnoseSheetMobile() {
  console.log('🔍 Sheet Mobile Diagnostic\n=========================\n');
  
  // 1. Check if RSBS CSS is loaded
  const hasRSBSStyles = Array.from(document.styleSheets).some(sheet => {
    try {
      return sheet.href && sheet.href.includes('react-spring-bottom-sheet');
    } catch (e) {
      return false;
    }
  });
  
  console.log('1️⃣ RSBS CSS Loaded:', hasRSBSStyles ? '✅ YES' : '❌ NO');
  
  if (!hasRSBSStyles) {
    console.warn('   ⚠️  RSBS CSS not found - sheet will look like modal');
    console.log('   Fix: Ensure "import \'react-spring-bottom-sheet/dist/style.css\';" in Sheet.tsx');
  }
  
  // 2. Check data-component attribute
  const sheetContainer = document.querySelector('[data-component="sheet"]');
  console.log('\n2️⃣ Sheet Container:', sheetContainer ? '✅ FOUND' : '❌ NOT FOUND');
  
  if (sheetContainer) {
    const variant = sheetContainer.dataset.variant;
    const gestures = sheetContainer.dataset.gestures;
    console.log('   • Variant:', variant);
    console.log('   • Gestures:', gestures);
  }
  
  // 3. Check for RSBS root element
  const rsbsRoot = document.querySelector('[data-rsbs-root]') || 
                   document.querySelector('.rsbs-root') ||
                   document.querySelector('[data-rsbs-overlay]');
  
  console.log('\n3️⃣ RSBS Root Element:', rsbsRoot ? '✅ FOUND' : '❌ NOT FOUND');
  
  if (rsbsRoot) {
    console.log('   • Element:', rsbsRoot.tagName);
    console.log('   • Classes:', rsbsRoot.className);
    console.log('   • Visible:', window.getComputedStyle(rsbsRoot).display !== 'none');
  } else {
    console.warn('   ⚠️  RSBS root not found - lazy import may have failed');
    console.log('   Check console for import errors');
  }
  
  // 4. Check for Flowbite Modal (should NOT be present on mobile)
  const flowbiteModal = document.querySelector('[data-testid="flowbite-modal"]') ||
                       document.querySelector('[role="dialog"]');
  
  console.log('\n4️⃣ Flowbite Modal (should be ABSENT):', flowbiteModal ? '❌ PRESENT (bad)' : '✅ ABSENT (good)');
  
  if (flowbiteModal) {
    console.warn('   ⚠️  Modal detected on mobile viewport - forceMode not working');
    console.log('   Check: Sheet component should have forceMode="sheet" prop in story');
  }
  
  // 5. Check for drag handle
  const dragHandle = document.querySelector('[data-rsbs-drag-handle]') ||
                     document.querySelector('.rsbs-drag-handle') ||
                     document.querySelector('[data-rsbs-header]');
  
  console.log('\n5️⃣ Drag Handle:', dragHandle ? '✅ FOUND' : '❌ NOT FOUND');
  
  // 6. Check viewport
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  console.log('\n6️⃣ Viewport:', `${vw}×${vh}`);
  console.log('   • Expected: ~375×667 for mobile');
  
  // 7. Check for capability detection
  const pointer = matchMedia('(pointer: coarse)').matches ? 'coarse' : 'fine';
  console.log('\n7️⃣ Pointer Type:', pointer);
  console.log('   • Note: Storybook viewport is CSS-only, pointer stays "fine"');
  console.log('   • That\'s why we use forceMode="sheet" in stories');
  
  // Summary
  console.log('\n📊 SUMMARY\n==========');
  
  const issues = [];
  if (!hasRSBSStyles) issues.push('RSBS CSS not loaded');
  if (flowbiteModal && !rsbsRoot) issues.push('Modal rendering instead of sheet');
  if (!rsbsRoot) issues.push('RSBS root element missing');
  if (rsbsRoot && !dragHandle) issues.push('Drag handle missing');
  
  if (issues.length === 0) {
    console.log('✅ All checks passed! Sheet should be working.');
  } else {
    console.error('❌ Issues detected:', issues.join(', '));
    console.log('\n🔧 Next Steps:');
    issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
  }
  
  // Return diagnostic object
  return {
    rsbsCssLoaded: hasRSBSStyles,
    sheetContainer: !!sheetContainer,
    rsbsRoot: !!rsbsRoot,
    flowbiteModal: !!flowbiteModal,
    dragHandle: !!dragHandle,
    viewport: { width: vw, height: vh },
    pointer,
    issues,
  };
})();
