// Paste this in browser console to diagnose button CSS issues

console.clear();
console.log('🔍 Button CSS Diagnosis\n');

// 1. Check if tokens are loaded
const root = document.documentElement;
const computedRoot = getComputedStyle(root);

console.log('=== DESIGN TOKENS ===');
const tokens = [
  '--ds-color-surface-base',
  '--ds-color-text',
  '--ds-color-border-medium',
  '--ds-color-primary',
  '--ds-state-hover-bg',
];

tokens.forEach(token => {
  const value = computedRoot.getPropertyValue(token).trim();
  console.log(`${token}: "${value}" ${value ? '✅' : '❌ MISSING!'}`);
});

// 2. Check specific button variants
console.log('\n=== BUTTON VARIANTS ===');

const secondary = document.querySelector('[data-variant="secondary"]');
const ghost = document.querySelector('[data-variant="ghost"]');

if (secondary) {
  const secStyles = getComputedStyle(secondary);
  console.log('\nSecondary Button:');
  console.log('  background:', secStyles.background.substring(0, 50));
  console.log('  backgroundColor:', secStyles.backgroundColor);
  console.log('  color:', secStyles.color);
  console.log('  borderColor:', secStyles.borderColor);
  console.log('  borderWidth:', secStyles.borderWidth);
  console.log('  borderStyle:', secStyles.borderStyle);
}

if (ghost) {
  const ghostStyles = getComputedStyle(ghost);
  console.log('\nGhost Button:');
  console.log('  background:', ghostStyles.background);
  console.log('  backgroundColor:', ghostStyles.backgroundColor);
  console.log('  color:', ghostStyles.color);
  console.log('  opacity:', ghostStyles.opacity);
  console.log('  visibility:', ghostStyles.visibility);
  console.log('  display:', ghostStyles.display);
}

// 3. Check if Button.css rules exist
console.log('\n=== CSS RULES CHECK ===');

let foundButtonCSS = false;
let foundSecondaryRule = false;
let foundGhostRule = false;

try {
  for (const sheet of document.styleSheets) {
    try {
      const rules = Array.from(sheet.cssRules || []);
      rules.forEach(rule => {
        if (rule.selectorText) {
          if (rule.selectorText.includes('[data-component="button"]')) {
            foundButtonCSS = true;
          }
          if (rule.selectorText.includes('[data-variant="secondary"]')) {
            foundSecondaryRule = true;
          }
          if (rule.selectorText.includes('[data-variant="ghost"]')) {
            foundGhostRule = true;
          }
        }
      });
    } catch (e) {
      // CORS, skip
    }
  }
} catch (e) {
  console.error('Could not read stylesheets:', e);
}

console.log('Button base CSS found:', foundButtonCSS ? '✅' : '❌');
console.log('Secondary variant CSS found:', foundSecondaryRule ? '✅' : '❌');
console.log('Ghost variant CSS found:', foundGhostRule ? '✅' : '❌');

// 4. Highlight issue buttons
console.log('\n=== VISUAL DEBUG ===');
if (secondary) {
  secondary.style.outline = '3px solid lime';
  console.log('✅ Secondary button now has LIME outline');
}
if (ghost) {
  ghost.style.outline = '3px solid orange';
  ghost.style.backgroundColor = 'rgba(255,165,0,0.1)';
  console.log('✅ Ghost button now has ORANGE outline + light bg');
}

console.log('\n💡 Check if buttons are visible now!');
