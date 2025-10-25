// Check what's blocking the background
const ghost = document.querySelector('[data-variant="ghost"]');
const computed = getComputedStyle(ghost);

console.log('=== COMPUTED STYLES ===');
console.log('background:', computed.background);
console.log('backgroundColor:', computed.backgroundColor);
console.log('backgroundImage:', computed.backgroundImage);

console.log('\n=== INLINE STYLE ===');
console.log('inline background:', ghost.style.background);

console.log('\n=== CLASSES ===');
console.log('classes:', ghost.className);

console.log('\n=== ALL BACKGROUND-RELATED RULES ===');
for (const sheet of document.styleSheets) {
  try {
    for (const rule of sheet.cssRules) {
      if (rule.style?.background || rule.style?.backgroundColor) {
        const matches = ghost.matches(rule.selectorText);
        if (matches) {
          console.log('MATCHES:', rule.selectorText, '→', rule.style.background || rule.style.backgroundColor);
        }
      }
    }
  } catch(e) {}
}

console.log('\n🔥 FORCE WITH !IMPORTANT:');
ghost.style.setProperty('background', 'rgba(11, 11, 12, 0.15)', 'important');
console.log('NOW can you see it?');
