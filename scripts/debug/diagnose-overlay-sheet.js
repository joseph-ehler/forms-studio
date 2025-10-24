/**
 * Comprehensive Overlay/Sheet Diagnostic Script
 * 
 * Observes:
 * - Sheet positioning (fixed to bottom?)
 * - Scroll lock state
 * - Input padding (search icon overlap?)
 * - List item spacing/styling
 * - PickerSearch structure
 * - All potential layout bugs
 * 
 * Usage: Copy/paste into browser console while overlay is open
 */

(function diagnoseOverlaySheet() {
  console.log('🔍 OVERLAY/SHEET COMPREHENSIVE DIAGNOSTIC\n');
  
  // 1. Find the sheet
  const sheet = document.querySelector('[role="dialog"][aria-modal="true"]');
  if (!sheet) {
    console.warn('❌ No overlay/sheet found. Open a SelectField first.');
    return;
  }
  
  console.log('✅ Sheet found:', sheet);
  console.log('\n📍 SHEET POSITIONING:');
  const sheetStyles = window.getComputedStyle(sheet);
  console.log({
    position: sheetStyles.position,
    bottom: sheetStyles.bottom,
    left: sheetStyles.left,
    right: sheetStyles.right,
    top: sheetStyles.top,
    transform: sheetStyles.transform,
    maxHeight: sheetStyles.maxHeight,
    height: sheetStyles.height,
    display: sheetStyles.display,
    flexDirection: sheetStyles.flexDirection,
  });
  
  // 2. Check scroll lock
  console.log('\n🔒 SCROLL LOCK STATE:');
  const html = document.documentElement;
  const body = document.body;
  const htmlStyles = window.getComputedStyle(html);
  const bodyStyles = window.getComputedStyle(body);
  console.log({
    html: {
      overflow: htmlStyles.overflow,
      overscrollBehaviorY: htmlStyles.overscrollBehaviorY,
      position: htmlStyles.position,
    },
    body: {
      overflow: bodyStyles.overflow,
      paddingRight: bodyStyles.paddingRight,
    }
  });
  
  // 3. Find PickerSearch input
  console.log('\n🔍 SEARCH INPUT ANALYSIS:');
  const searchInput = sheet.querySelector('input[type="search"]');
  if (searchInput) {
    const inputStyles = window.getComputedStyle(searchInput);
    console.log('Input element:', searchInput);
    console.log({
      paddingLeft: inputStyles.paddingLeft,
      paddingRight: inputStyles.paddingRight,
      width: inputStyles.width,
      textIndent: inputStyles.textIndent,
      classes: searchInput.className,
    });
    
    // Check for search icon
    const searchWrapper = searchInput.closest('div');
    const searchIcon = searchWrapper?.querySelector('svg');
    if (searchIcon) {
      const iconParent = searchIcon.parentElement;
      const iconParentStyles = window.getComputedStyle(iconParent);
      console.log('\nSearch icon container:', iconParent);
      console.log({
        position: iconParentStyles.position,
        left: iconParentStyles.left,
        paddingLeft: iconParentStyles.paddingLeft,
        pointerEvents: iconParentStyles.pointerEvents,
      });
    }
  } else {
    console.log('No search input found');
  }
  
  // 4. List items analysis
  console.log('\n📋 LIST ITEMS ANALYSIS:');
  const listItems = sheet.querySelectorAll('[role="option"]');
  console.log(`Found ${listItems.length} list items`);
  
  if (listItems.length > 0) {
    const firstItem = listItems[0];
    const itemStyles = window.getComputedStyle(firstItem);
    console.log('First item styles:', {
      display: itemStyles.display,
      padding: itemStyles.padding,
      minHeight: itemStyles.minHeight,
      backgroundColor: itemStyles.backgroundColor,
      fontSize: itemStyles.fontSize,
      lineHeight: itemStyles.lineHeight,
      alignItems: itemStyles.alignItems,
    });
    
    // Check spacing between items
    if (listItems.length > 1) {
      const firstRect = listItems[0].getBoundingClientRect();
      const secondRect = listItems[1].getBoundingClientRect();
      const gap = secondRect.top - firstRect.bottom;
      console.log(`Gap between items: ${gap}px`);
    }
  }
  
  // 5. Check PickerList container
  console.log('\n📦 PICKER LIST CONTAINER:');
  const pickerList = sheet.querySelector('[role="listbox"]');
  if (pickerList) {
    const listStyles = window.getComputedStyle(pickerList);
    console.log({
      padding: listStyles.padding,
      margin: listStyles.margin,
      overflow: listStyles.overflow,
    });
  }
  
  // 6. Header/Content/Footer structure
  console.log('\n🏗️ SHEET STRUCTURE:');
  const header = sheet.querySelector('[data-role="header"]');
  const content = sheet.querySelector('[data-role="content"]') || 
                  sheet.querySelector('.overflow-y-auto');
  const footer = sheet.querySelector('[data-role="footer"]');
  
  console.log({
    hasHeader: !!header,
    hasContent: !!content,
    hasFooter: !!footer,
  });
  
  if (content) {
    const contentStyles = window.getComputedStyle(content);
    console.log('Content area:', {
      display: contentStyles.display,
      flex: contentStyles.flex,
      minHeight: contentStyles.minHeight,
      maxHeight: contentStyles.maxHeight,
      overflow: contentStyles.overflow,
      overflowY: contentStyles.overflowY,
    });
  }
  
  // 7. Visual viewport tracking (mobile keyboard)
  console.log('\n📱 VISUAL VIEWPORT:');
  if (window.visualViewport) {
    console.log({
      height: window.visualViewport.height,
      offsetTop: window.visualViewport.offsetTop,
      pageTop: window.visualViewport.pageTop,
      scale: window.visualViewport.scale,
    });
  } else {
    console.log('Visual Viewport API not supported');
  }
  
  // 8. Z-index stack
  console.log('\n📚 Z-INDEX STACK:');
  const backdrop = document.querySelector('.fixed.inset-0');
  if (backdrop) {
    const backdropStyles = window.getComputedStyle(backdrop);
    console.log('Backdrop z-index:', backdropStyles.zIndex);
  }
  console.log('Sheet z-index:', sheetStyles.zIndex);
  
  // 9. Potential bugs detection
  console.log('\n⚠️ POTENTIAL BUGS DETECTED:');
  const bugs = [];
  
  // Bug 1: Sheet not fixed to bottom
  if (sheetStyles.position !== 'fixed' || sheetStyles.bottom !== '0px') {
    bugs.push('❌ Sheet is not fixed to bottom of viewport');
  }
  
  // Bug 2: Input padding insufficient for icon
  if (searchInput) {
    const paddingLeft = parseInt(inputStyles.paddingLeft);
    if (paddingLeft < 40) {
      bugs.push(`❌ Search input paddingLeft (${paddingLeft}px) too small - will overlap icon`);
    }
  }
  
  // Bug 3: Scroll lock not active
  if (htmlStyles.overflow !== 'hidden') {
    bugs.push('❌ HTML overflow not locked (should be "hidden")');
  }
  
  // Bug 4: List items too small for touch
  if (listItems.length > 0) {
    const firstItemHeight = listItems[0].getBoundingClientRect().height;
    if (firstItemHeight < 44) {
      bugs.push(`❌ List items too small for touch (${firstItemHeight}px < 44px WCAG minimum)`);
    }
  }
  
  // Bug 5: Content not scrollable
  if (content) {
    const contentOverflow = contentStyles.overflowY;
    if (contentOverflow !== 'auto' && contentOverflow !== 'scroll') {
      bugs.push(`❌ Content overflow-y is "${contentOverflow}" (should be "auto" or "scroll")`);
    }
  }
  
  if (bugs.length === 0) {
    console.log('✅ No critical bugs detected!');
  } else {
    bugs.forEach(bug => console.log(bug));
  }
  
  console.log('\n✅ Diagnostic complete! Check findings above.');
  
  return {
    sheet,
    sheetStyles,
    searchInput,
    listItems,
    bugs,
  };
})();
