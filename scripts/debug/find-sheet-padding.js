// Console script: Find where .ds-sheet-content-slot padding is coming from
// Copy this into DevTools console while Sheet is open

(function findSheetPadding() {
  console.clear();
  console.log('🔍 DEBUGGING SHEET PADDING LEAK\n');
  
  // Find the element
  const slot = document.querySelector('.ds-sheet-content-slot');
  
  if (!slot) {
    console.error('❌ No .ds-sheet-content-slot found. Is the sheet open?');
    return;
  }
  
  console.log('✅ Found element:', slot);
  console.log('');
  
  // Get computed styles
  const computed = window.getComputedStyle(slot);
  const padding = computed.padding;
  const paddingTop = computed.paddingTop;
  const paddingRight = computed.paddingRight;
  const paddingBottom = computed.paddingBottom;
  const paddingLeft = computed.paddingLeft;
  
  console.log('📏 COMPUTED PADDING:');
  console.log('  padding:', padding);
  console.log('  padding-top:', paddingTop);
  console.log('  padding-right:', paddingRight);
  console.log('  padding-bottom:', paddingBottom);
  console.log('  padding-left:', paddingLeft);
  console.log('');
  
  // Find all matching CSS rules
  console.log('📋 ALL CSS RULES MATCHING .ds-sheet-content-slot:');
  console.log('');
  
  const sheets = Array.from(document.styleSheets);
  let ruleCount = 0;
  
  sheets.forEach((sheet, sheetIndex) => {
    try {
      const rules = Array.from(sheet.cssRules || sheet.rules || []);
      
      rules.forEach((rule, ruleIndex) => {
        if (rule.selectorText && rule.selectorText.includes('ds-sheet-content-slot')) {
          ruleCount++;
          console.log(`RULE #${ruleCount}:`);
          console.log(`  Selector: ${rule.selectorText}`);
          console.log(`  From: ${sheet.href || 'inline'}`);
          console.log(`  CSS Text: ${rule.cssText}`);
          
          // Check for padding in this rule
          if (rule.style.padding || 
              rule.style.paddingTop || 
              rule.style.paddingRight || 
              rule.style.paddingBottom || 
              rule.style.paddingLeft) {
            console.log('  ⚠️  HAS PADDING PROPERTY!');
            console.log('     padding:', rule.style.padding || 'none');
            console.log('     padding-top:', rule.style.paddingTop || 'none');
            console.log('     padding-right:', rule.style.paddingRight || 'none');
            console.log('     padding-bottom:', rule.style.paddingBottom || 'none');
            console.log('     padding-left:', rule.style.paddingLeft || 'none');
          }
          console.log('');
        }
      });
    } catch (e) {
      // CORS - can't access
    }
  });
  
  console.log(`\n📊 SUMMARY: Found ${ruleCount} CSS rules for .ds-sheet-content-slot`);
  
  // Check inline styles
  if (slot.style.padding || slot.style.paddingTop || slot.style.paddingRight || 
      slot.style.paddingBottom || slot.style.paddingLeft) {
    console.log('\n⚠️  INLINE STYLES DETECTED:');
    console.log('  padding:', slot.style.padding || 'none');
    console.log('  padding-top:', slot.style.paddingTop || 'none');
    console.log('  padding-right:', slot.style.paddingRight || 'none');
    console.log('  padding-bottom:', slot.style.paddingBottom || 'none');
    console.log('  padding-left:', slot.style.paddingLeft || 'none');
  }
  
  // Show all classes on the element
  console.log('\n🏷️  CLASSES ON ELEMENT:', Array.from(slot.classList).join(', '));
  
  console.log('\n✅ DONE - Check rules above for padding sources');
})();
