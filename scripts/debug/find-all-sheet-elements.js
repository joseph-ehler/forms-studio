// Find ALL elements with "sheet" in the class name
(function() {
  console.clear();
  console.log('🔍 FINDING ALL SHEET ELEMENTS\n');
  
  const allElements = document.querySelectorAll('[class*="sheet"]');
  
  console.log(`Found ${allElements.length} elements with "sheet" in class name:\n`);
  
  allElements.forEach((el, index) => {
    console.log(`#${index + 1}:`, el);
    console.log('  Tag:', el.tagName);
    console.log('  Classes:', Array.from(el.classList).join(', '));
    console.log('  Text (first 50 chars):', el.textContent.substring(0, 50).trim());
    
    const computed = window.getComputedStyle(el);
    const padding = computed.padding;
    
    if (padding !== '0px') {
      console.log('  ⚠️  HAS PADDING:', padding);
    }
    console.log('');
  });
  
  // Also check for Vaul drawer classes
  console.log('\n🔍 CHECKING FOR VAUL DRAWER CLASSES:\n');
  
  const vaulElements = document.querySelectorAll('[class*="vaul"]');
  console.log(`Found ${vaulElements.length} Vaul elements\n`);
  
  vaulElements.forEach((el, index) => {
    console.log(`Vaul #${index + 1}:`, el);
    console.log('  Classes:', Array.from(el.classList).join(', '));
    const computed = window.getComputedStyle(el);
    if (computed.padding !== '0px') {
      console.log('  ⚠️  PADDING:', computed.padding);
    }
    console.log('');
  });
})();
