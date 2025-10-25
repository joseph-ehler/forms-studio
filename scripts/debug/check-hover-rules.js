// Find ALL CSS rules that apply to ghost button on hover
const ghost = document.querySelector('[data-variant="ghost"]');

console.log('=== ALL HOVER RULES FOR GHOST ===');

// Get all stylesheets
const allRules = [];
for (const sheet of document.styleSheets) {
  try {
    for (const rule of sheet.cssRules) {
      if (rule.selectorText?.includes('ghost') && rule.selectorText?.includes('hover')) {
        allRules.push({
          selector: rule.selectorText,
          background: rule.style.background || rule.style.backgroundColor,
          href: sheet.href || 'inline',
        });
      }
    }
  } catch(e) {}
}

console.table(allRules);

// Check computed style on hover
ghost.addEventListener('mouseenter', () => {
  const computed = getComputedStyle(ghost);
  console.log('\n=== ON HOVER ===');
  console.log('Computed background:', computed.backgroundColor);
  console.log('Computed background (full):', computed.background);
});

console.log('\n💡 Now hover over a ghost button...');
