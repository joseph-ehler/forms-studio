// PASTE THIS IN CONSOLE RIGHT NOW
// This will tell us exactly what's wrong

console.clear();
console.log('🔍 SHOWCASE DIAGNOSIS\n');

// 1. Check if new styles are loaded
const sheets = Array.from(document.styleSheets);
const loaded = {
  tokens: sheets.some(s => s.href?.includes('tokens.css')),
  accessibility: sheets.some(s => s.href?.includes('accessibility-prefs')),
  interactions: sheets.some(s => s.href?.includes('ds-interactions')),
  focusRings: sheets.some(s => s.href?.includes('focus-rings')),
};

console.log('=== STYLESHEETS LOADED ===');
Object.entries(loaded).forEach(([name, isLoaded]) => {
  console.log(`${name}: ${isLoaded ? '✅' : '❌ MISSING!'}`);
});

// 2. Check actual token values
const root = getComputedStyle(document.documentElement);
console.log('\n=== TOKEN VALUES ===');
console.log('Ghost hover bg:', root.getPropertyValue('--ds-state-hover-bg').trim() || '❌ NOT SET');
console.log('Duration quick:', root.getPropertyValue('--ds-duration-quick').trim() || '❌ NOT SET');
console.log('Press scale:', root.getPropertyValue('--ds-press-scale').trim() || '❌ NOT SET');

// 3. Check button sizes
console.log('\n=== BUTTON SIZES ===');
const medButton = document.querySelector('[data-size="md"]');
if (medButton) {
  const s = getComputedStyle(medButton);
  console.log('Medium button height:', s.minHeight || s.minBlockSize);
  console.log('Should be: 44px (--ds-touch-target)');
}

// 4. Check ghost button hover
console.log('\n=== GHOST BUTTON ===');
const ghost = document.querySelector('[data-variant="ghost"]');
if (ghost) {
  const s = getComputedStyle(ghost);
  console.log('Current bg:', s.backgroundColor);
  console.log('Has data-interactive?', ghost.hasAttribute('data-interactive') ? '✅' : '❌');
  
  // Temporarily force hover to see what it should look like
  ghost.style.background = 'rgba(11, 11, 12, 0.10)';
  console.log('✅ I just forced 10% hover - is it visible now?');
  
  setTimeout(() => {
    ghost.style.background = '';
    console.log('(Removed forced style)');
  }, 3000);
}

// 5. Check focus rings
console.log('\n=== FOCUS RINGS ===');
const btn = document.querySelector('[data-interactive]');
if (btn) {
  btn.focus();
  setTimeout(() => {
    const s = getComputedStyle(btn);
    console.log('Box shadow on focus:', s.boxShadow === 'none' ? '❌ NO RING!' : s.boxShadow.substring(0, 50));
  }, 100);
}

// 6. Check if modality detection is running
console.log('\n=== MODALITY DETECTION ===');
console.log('data-input on <html>:', document.documentElement.dataset.input || '❌ NOT SET');

console.log('\n💡 NEXT: Tell me what you see for each section');
