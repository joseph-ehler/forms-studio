/**
 * Debug Nested Sheets Positioning
 * 
 * Paste this in the browser console while viewing nested-sheets-demo.html
 * Opens both dialogs and inspects their actual positions
 */

console.clear();
console.log('🔍 Nested Sheets Debug\n');

// Get elements (use unique variable names)
const debugDialog1 = document.getElementById('dialog1');
const debugDialog2 = document.getElementById('dialog2');

if (!debugDialog1 || !debugDialog2) {
  console.error('❌ Dialogs not found');
} else {
  console.log('📊 Initial State (Both Closed)\n');
  
  // Open Dialog 1
  document.getElementById('openDialog1').click();
  
  setTimeout(() => {
    console.log('📊 Dialog 1 Open\n');
    const d1Rect = debugDialog1.getBoundingClientRect();
    const d1Styles = window.getComputedStyle(debugDialog1);
    
    console.log('Dialog 1:');
    console.log('  - Bottom:', d1Styles.bottom);
    console.log('  - Height:', d1Styles.height);
    console.log('  - Transform:', d1Styles.transform);
    console.log('  - Top position:', d1Rect.top, 'px from viewport top');
    console.log('  - Bottom position:', d1Rect.bottom, 'px from viewport top');
    console.log('  - Has underlay class:', debugDialog1.classList.contains('ds-sheet--underlay'));
    console.log('');
    
    // Click a task to open Dialog 2
    document.querySelector('.item[data-task]').click();
    
    setTimeout(() => {
      console.log('📊 Dialog 2 Open (Nested)\n');
      
      const d1RectNested = debugDialog1.getBoundingClientRect();
      const d1StylesNested = window.getComputedStyle(debugDialog1);
      const d2Rect = debugDialog2.getBoundingClientRect();
      const d2Styles = window.getComputedStyle(debugDialog2);
      
      console.log('Dialog 1 (Underlying):');
      console.log('  - Bottom:', d1StylesNested.bottom);
      console.log('  - Height:', d1StylesNested.height);
      console.log('  - Transform:', d1StylesNested.transform);
      console.log('  - Top position:', d1RectNested.top, 'px from viewport top');
      console.log('  - Bottom position:', d1RectNested.bottom, 'px from viewport top');
      console.log('  - Has underlay class:', debugDialog1.classList.contains('ds-sheet--underlay'));
      console.log('  - data-sheet-depth:', debugDialog1.getAttribute('data-sheet-depth'));
      console.log('');
      
      console.log('Dialog 2 (Topmost):');
      console.log('  - Bottom:', d2Styles.bottom);
      console.log('  - Height:', d2Styles.height);
      console.log('  - Transform:', d2Styles.transform);
      console.log('  - Top position:', d2Rect.top, 'px from viewport top');
      console.log('  - Bottom position:', d2Rect.bottom, 'px from viewport top');
      console.log('  - data-sheet-depth:', debugDialog2.getAttribute('data-sheet-depth'));
      console.log('');
      
      console.log('🎯 Analysis:');
      const gap = d2Rect.top - d1RectNested.top;
      console.log('  - Gap between dialog tops:', gap, 'px');
      
      if (gap >= 14 && gap <= 18) {
        console.log('  ✅ Context peek is working! (~16px gap)');
      } else if (gap < 0) {
        console.log('  ❌ Dialog 2 is ABOVE Dialog 1 (should be below)');
      } else if (gap < 14) {
        console.log('  ⚠️ Gap too small (should be ~16px)');
      } else {
        console.log('  ⚠️ Gap too large (should be ~16px)');
      }
      
      console.log('');
      console.log('🔍 Visual Check:');
      console.log('  - Dialog 1 top should be VISIBLE above Dialog 2');
      console.log('  - Expected peek: ~16px (1rem)');
      console.log('  - Actual measurements above show if it\'s working');
      
    }, 400);
  }, 400);
}
