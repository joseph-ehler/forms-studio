/**
 * OVERLAY SCROLL DIAGNOSTIC
 * 
 * Run this in browser console when overlay is open to diagnose scroll issues
 * 
 * Usage:
 * 1. Open TestSelectField overlay
 * 2. Paste this entire script in console
 * 3. Review the diagnostic report
 */

(function() {
  console.log('%c🔍 OVERLAY SCROLL DIAGNOSTIC', 'font-size: 16px; font-weight: bold; color: #3b82f6');
  console.log('─'.repeat(80));
  
  // Find overlay elements
  const sheet = document.querySelector('[role="listbox"][style*="position: fixed"][style*="bottom: 0"]');
  const popover = document.querySelector('[role="listbox"][style*="position: absolute"]');
  const overlay = sheet || popover;
  
  if (!overlay) {
    console.error('❌ No overlay found! Make sure overlay is open.');
    return;
  }
  
  const mode = sheet ? 'SHEET (Mobile)' : 'POPOVER (Desktop)';
  console.log(`📱 Mode: %c${mode}`, 'font-weight: bold; color: #10b981');
  console.log('');
  
  // Check container
  const container = overlay;
  const containerStyle = window.getComputedStyle(container);
  
  console.group('🎯 Container (Sheet/Popover)');
  console.log('Element:', container);
  console.log('touchAction:', containerStyle.touchAction);
  console.log('overflow:', containerStyle.overflow);
  console.log('overflowY:', containerStyle.overflowY);
  console.log('display:', containerStyle.display);
  console.log('flexDirection:', containerStyle.flexDirection);
  console.groupEnd();
  console.log('');
  
  // Check content wrapper
  const contentWrapper = container.querySelector('div[style*="flex: 1"]');
  if (contentWrapper) {
    const wrapperStyle = window.getComputedStyle(contentWrapper);
    console.group('📦 Content Wrapper');
    console.log('Element:', contentWrapper);
    console.log('overflow:', wrapperStyle.overflow);
    console.log('overflowY:', wrapperStyle.overflowY);
    console.log('overflowX:', wrapperStyle.overflowX);
    console.log('flex:', wrapperStyle.flex);
    console.log('display:', wrapperStyle.display);
    console.groupEnd();
    console.log('');
  }
  
  // Check OverlayContent
  const overlayContent = container.querySelector('.ds-overlay-content, section');
  if (overlayContent) {
    const contentStyle = window.getComputedStyle(overlayContent);
    console.group('📄 OverlayContent (Should scroll)');
    console.log('Element:', overlayContent);
    console.log('overflowY:', contentStyle.overflowY);
    console.log('scrollHeight:', overlayContent.scrollHeight);
    console.log('clientHeight:', overlayContent.clientHeight);
    console.log('canScroll:', overlayContent.scrollHeight > overlayContent.clientHeight);
    console.log('scrollTop:', overlayContent.scrollTop);
    console.log('WebkitOverflowScrolling:', contentStyle.WebkitOverflowScrolling);
    console.groupEnd();
    console.log('');
  }
  
  // Check for gesture listeners
  console.group('👆 Pointer Event Listeners');
  const hasPointerDown = container.onpointerdown !== null || 
                          container.getAttribute('onpointerdown') !== null;
  const hasPointerMove = container.onpointermove !== null || 
                          container.getAttribute('onpointermove') !== null;
  console.log('onPointerDown:', hasPointerDown ? '✅ Yes' : '❌ No');
  console.log('onPointerMove:', hasPointerMove ? '✅ Yes' : '❌ No');
  console.groupEnd();
  console.log('');
  
  // Issues detected
  console.group('🐛 ISSUES DETECTED');
  const issues = [];
  
  if (containerStyle.touchAction === 'none') {
    issues.push({
      severity: 'CRITICAL',
      issue: 'touchAction: none on container',
      impact: 'Prevents ALL touch scrolling (including content)',
      fix: 'Change to touchAction: "pan-y" to allow vertical scrolling'
    });
  }
  
  if (contentWrapper && wrapperStyle && wrapperStyle.overflow === 'hidden') {
    issues.push({
      severity: 'CRITICAL',
      issue: 'overflow: hidden on content wrapper',
      impact: 'Blocks OverlayContent scroll even though it has overflowY: auto',
      fix: 'Remove overflow: hidden or change to overflow: visible'
    });
  }
  
  if (overlayContent && overlayContent.scrollHeight <= overlayContent.clientHeight) {
    issues.push({
      severity: 'INFO',
      issue: 'Content does not need to scroll',
      impact: 'Content fits within viewport',
      fix: 'No fix needed - this is fine'
    });
  }
  
  if (hasPointerDown && containerStyle.touchAction === 'none') {
    issues.push({
      severity: 'HIGH',
      issue: 'Gesture handlers conflict with scroll',
      impact: 'Sheet drag gestures capturing all pointer events',
      fix: 'Move gesture handlers to drag handle only, not entire sheet'
    });
  }
  
  if (issues.length === 0) {
    console.log('✅ No issues detected!');
  } else {
    issues.forEach((issue, i) => {
      console.group(`${i + 1}. ${issue.severity === 'CRITICAL' ? '🔴' : issue.severity === 'HIGH' ? '🟠' : '🔵'} ${issue.severity}: ${issue.issue}`);
      console.log('Impact:', issue.impact);
      console.log('Fix:', issue.fix);
      console.groupEnd();
    });
  }
  console.groupEnd();
  console.log('');
  
  console.log('─'.repeat(80));
  console.log('%c✅ Diagnostic complete', 'color: #10b981; font-weight: bold');
  
  return {
    mode,
    container,
    contentWrapper,
    overlayContent,
    issues
  };
})();
