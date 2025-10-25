// Check why hover isn't working
const ghost = document.querySelector('[data-variant="ghost"]');
console.log('Ghost button:', ghost);
console.log('Matches [data-interactive]:', ghost.matches('[data-interactive]'));
console.log('Matches [data-variant="ghost"]:', ghost.matches('[data-variant="ghost"]'));

// Check all CSS rules that target this element
const matchedRules = [];
for (const sheet of document.styleSheets) {
  try {
    for (const rule of sheet.cssRules) {
      if (rule.selectorText?.includes('ghost') || rule.selectorText?.includes('data-interactive')) {
        matchedRules.push(rule.selectorText);
      }
    }
  } catch(e) {}
}
console.log('Rules with ghost or data-interactive:', matchedRules);

// Force the hover style directly
console.log('\n✅ FORCING 15% gray background...');
ghost.style.background = 'rgba(11, 11, 12, 0.15)';
console.log('Can you see it NOW?');
