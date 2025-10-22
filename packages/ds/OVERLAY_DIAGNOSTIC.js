/**
 * Overlay Diagnostic Tool
 * 
 * Paste this in DevTools console while overlay is OPEN to verify:
 * - maxHeight is being set correctly
 * - Content is scrollable
 * - Footer is present
 * - CSS vars are exposed
 */

(() => {
  const floating = document.querySelector('[data-overlay="picker"]');
  if (!floating) {
    console.warn('❌ No overlay found. Make sure overlay is OPEN before running this.');
    return;
  }

  const cs = getComputedStyle(floating);
  const content = floating.querySelector('.flex-1, .overflow-auto');
  const ccs = content ? getComputedStyle(content) : null;

  console.log('=== OVERLAY DIAGNOSTICS ===\n');
  
  console.table({
    '✓ Floating maxHeight (style)': floating.style.maxHeight || '(none)',
    '✓ Floating maxHeight (computed)': cs.maxHeight,
    '✓ CSS var --overlay-max-h': cs.getPropertyValue('--overlay-max-h') || '(none)',
    '✓ data-max-h attribute': floating.getAttribute('data-max-h') || '(none)',
    '✓ Content element exists': !!content,
    '✓ Content height (computed)': ccs?.height || '(none)',
    '✓ Content overflowY': ccs?.overflowY || '(none)',
    '✓ Footer present': !!floating.querySelector('.border-t, [class*="footer"]'),
  });

  console.log('\n=== EXPECTED VALUES ===');
  console.log('✓ maxHeight should be a pixel value (e.g., 352px)');
  console.log('✓ --overlay-max-h should match maxHeight');
  console.log('✓ data-max-h should be a number');
  console.log('✓ Content overflowY should be "auto" or "scroll"');
  console.log('✓ Footer should be present (true)');

  console.log('\n=== COLLISION TEST ===');
  const viewportHeight = window.innerHeight;
  const overlayRect = floating.getBoundingClientRect();
  const isWithinViewport = overlayRect.bottom <= viewportHeight;
  
  console.log(`Viewport height: ${viewportHeight}px`);
  console.log(`Overlay bottom: ${overlayRect.bottom}px`);
  console.log(`${isWithinViewport ? '✅' : '❌'} Overlay ${isWithinViewport ? 'IS' : 'IS NOT'} within viewport`);

  if (!isWithinViewport) {
    console.warn(`❌ OVERFLOW: Overlay extends ${overlayRect.bottom - viewportHeight}px beyond viewport!`);
  }
})();
