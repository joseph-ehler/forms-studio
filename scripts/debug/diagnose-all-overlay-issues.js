/**
 * COMPREHENSIVE OVERLAY DIAGNOSTIC
 * 
 * Checks ALL reported issues:
 * 1. Popover width (full screen vs constrained)
 * 2. Sheet backdrop visibility
 * 3. Popover anchoring to trigger
 * 4. Scroll behavior on open
 * 
 * Usage: Open overlay, paste in console
 */

(function() {
  console.log('%c🔍 COMPREHENSIVE OVERLAY DIAGNOSTIC', 'font-size: 18px; font-weight: bold; color: #ef4444');
  console.log('═'.repeat(80));
  
  // Find overlays
  const sheet = document.querySelector('[role="listbox"][style*="position: fixed"][style*="bottom"]');
  const popover = document.querySelector('[role="listbox"][style*="position: absolute"]');
  const backdrop = document.querySelector('[style*="position: fixed"][style*="inset: 0"]');
  
  const overlay = sheet || popover;
  const mode = sheet ? 'SHEET' : popover ? 'POPOVER' : 'NONE';
  
  if (!overlay) {
    console.error('❌ No overlay found! Make sure overlay is open.');
    return;
  }
  
  console.log(`📱 Mode: %c${mode}`, 'font-weight: bold; color: #10b981');
  console.log('');
  
  // ISSUE 1: Popover Width
  if (popover) {
    console.group('🔴 ISSUE 1: Popover Width');
    const trigger = document.querySelector('button[aria-haspopup="listbox"]');
    const popoverWidth = popover.offsetWidth;
    const triggerWidth = trigger ? trigger.offsetWidth : 0;
    const viewportWidth = window.innerWidth;
    
    console.log('Popover width:', popoverWidth + 'px');
    console.log('Trigger width:', triggerWidth + 'px');
    console.log('Viewport width:', viewportWidth + 'px');
    console.log('');
    
    if (popoverWidth > triggerWidth * 1.5) {
      console.error('❌ PROBLEM: Popover is WAY wider than trigger');
      console.log('Expected:', triggerWidth + 'px (match trigger)');
      console.log('Actual:', popoverWidth + 'px');
      console.log('Ratio:', (popoverWidth / triggerWidth).toFixed(2) + 'x trigger width');
    } else if (popoverWidth > viewportWidth * 0.8) {
      console.error('❌ PROBLEM: Popover is nearly full viewport width');
      console.log('Taking up', ((popoverWidth / viewportWidth) * 100).toFixed(1) + '% of screen');
    } else {
      console.log('✅ Width looks reasonable');
    }
    
    // Check CSS
    const style = window.getComputedStyle(popover);
    console.log('');
    console.log('CSS Properties:');
    console.log('  width:', style.width);
    console.log('  minWidth:', style.minWidth);
    console.log('  maxWidth:', style.maxWidth);
    
    if (style.maxWidth === 'none') {
      console.error('  ❌ No maxWidth! Can grow infinitely');
    }
    
    console.groupEnd();
    console.log('');
  }
  
  // ISSUE 2: Sheet Backdrop
  if (sheet) {
    console.group('🔴 ISSUE 2: Sheet Backdrop Visibility');
    
    if (!backdrop) {
      console.error('❌ CRITICAL: Backdrop element NOT FOUND in DOM!');
      console.log('Expected: <div> with position: fixed, inset: 0, before sheet');
      console.log('Sheet might be rendering without backdrop sibling');
    } else {
      const backdropStyle = window.getComputedStyle(backdrop);
      console.log('✅ Backdrop element exists');
      console.log('');
      console.log('Backdrop properties:');
      console.log('  display:', backdropStyle.display);
      console.log('  opacity:', backdropStyle.opacity);
      console.log('  background:', backdropStyle.background);
      console.log('  zIndex:', backdropStyle.zIndex);
      console.log('  pointerEvents:', backdropStyle.pointerEvents);
      
      if (backdropStyle.display === 'none') {
        console.error('  ❌ display: none - backdrop hidden!');
      }
      if (parseFloat(backdropStyle.opacity) < 0.1) {
        console.error('  ❌ opacity too low - nearly invisible!');
      }
      if (backdropStyle.background === 'rgba(0, 0, 0, 0)' || backdropStyle.background === 'transparent') {
        console.error('  ❌ transparent background - invisible!');
      }
    }
    
    console.groupEnd();
    console.log('');
  }
  
  // ISSUE 3: Popover Anchoring
  if (popover && trigger) {
    console.group('🔴 ISSUE 3: Popover Anchoring to Trigger');
    
    const triggerRect = trigger.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();
    
    console.log('Trigger position:', {
      top: triggerRect.top,
      left: triggerRect.left,
      bottom: triggerRect.bottom,
      right: triggerRect.right
    });
    console.log('');
    console.log('Popover position:', {
      top: popoverRect.top,
      left: popoverRect.left,
      bottom: popoverRect.bottom,
      right: popoverRect.right
    });
    console.log('');
    
    const horizontalDiff = Math.abs(popoverRect.left - triggerRect.left);
    const verticalGap = popoverRect.top - triggerRect.bottom;
    
    if (horizontalDiff > 20) {
      console.error('❌ PROBLEM: Popover not aligned with trigger');
      console.log('Horizontal offset:', horizontalDiff + 'px');
    } else {
      console.log('✅ Horizontally aligned with trigger');
    }
    
    if (verticalGap < 0) {
      console.error('❌ PROBLEM: Popover overlapping trigger');
    } else if (verticalGap > 50) {
      console.warn('⚠️ WARNING: Large gap between trigger and popover');
      console.log('Gap:', verticalGap + 'px');
    } else {
      console.log('✅ Positioned near trigger');
    }
    
    console.groupEnd();
    console.log('');
  }
  
  // ISSUE 4: Page Scroll
  console.group('🔴 ISSUE 4: Page Scroll Behavior');
  
  const scrollY = window.scrollY || window.pageYOffset;
  const bodyHeight = document.body.scrollHeight;
  const viewportHeight = window.innerHeight;
  
  console.log('Current scroll position:', scrollY + 'px');
  console.log('Page height:', bodyHeight + 'px');
  console.log('Viewport height:', viewportHeight + 'px');
  console.log('');
  
  if (popover) {
    const popoverRect = popover.getBoundingClientRect();
    const popoverBottom = popoverRect.bottom;
    
    if (popoverBottom > viewportHeight) {
      console.error('❌ PROBLEM: Popover extends below viewport');
      console.log('Popover bottom:', popoverBottom + 'px');
      console.log('Viewport height:', viewportHeight + 'px');
      console.log('Overflow:', (popoverBottom - viewportHeight) + 'px below fold');
      console.log('');
      console.log('This likely causes auto-scroll when opening!');
    } else {
      console.log('✅ Popover fits within viewport');
    }
  }
  
  console.groupEnd();
  console.log('');
  
  // SUMMARY
  console.log('═'.repeat(80));
  console.log('%c📋 SUMMARY', 'font-size: 16px; font-weight: bold');
  console.log('');
  
  const issues = [];
  
  if (popover && popover.offsetWidth > (trigger?.offsetWidth || 0) * 1.5) {
    issues.push('🔴 Popover width unconstrained');
  }
  
  if (sheet && !backdrop) {
    issues.push('🔴 Sheet backdrop missing');
  }
  
  if (popover && trigger && Math.abs(popover.getBoundingClientRect().left - trigger.getBoundingClientRect().left) > 20) {
    issues.push('🔴 Popover not anchored to trigger');
  }
  
  if (popover && popover.getBoundingClientRect().bottom > window.innerHeight) {
    issues.push('🔴 Popover causes page scroll');
  }
  
  if (issues.length === 0) {
    console.log('%c✅ All checks passed!', 'color: #10b981; font-weight: bold');
  } else {
    console.error(`Found ${issues.length} issue(s):`);
    issues.forEach(issue => console.log('  ' + issue));
  }
  
  console.log('');
  console.log('═'.repeat(80));
  
  return {
    mode,
    overlay,
    backdrop,
    trigger,
    issues,
    details: {
      popoverWidth: popover?.offsetWidth,
      triggerWidth: trigger?.offsetWidth,
      backdropExists: !!backdrop,
      popoverRect: popover?.getBoundingClientRect(),
      triggerRect: trigger?.getBoundingClientRect()
    }
  };
})();
