// Paste this to see ACTUAL computed values

console.clear();
console.log('🔍 ACTUAL VALUES CHECK\n');

// 1. Check button sizes
const medButton = document.querySelector('[data-size="md"]');
if (medButton) {
  const s = getComputedStyle(medButton);
  console.log('=== MEDIUM BUTTON ===');
  console.log('Actual height:', s.height);
  console.log('Min-height:', s.minHeight);
  console.log('Min-block-size:', s.minBlockSize);
  console.log('Padding:', s.padding);
  console.log('Font-size:', s.fontSize);
}

// 2. Check token values
const root = getComputedStyle(document.documentElement);
console.log('\n=== TOKEN VALUES ===');
console.log('--ds-touch-target:', root.getPropertyValue('--ds-touch-target').trim());
console.log('--ds-state-hover-bg:', root.getPropertyValue('--ds-state-hover-bg').trim());
console.log('--ds-duration-quick:', root.getPropertyValue('--ds-duration-quick').trim());

// 3. Force hover on ghost to see it
const ghost = document.querySelector('[data-variant="ghost"]');
if (ghost) {
  console.log('\n=== GHOST BUTTON TEST ===');
  const before = getComputedStyle(ghost).backgroundColor;
  console.log('Background BEFORE hover:', before);
  
  // Simulate hover
  ghost.dispatchEvent(new MouseEvent('mouseenter'));
  setTimeout(() => {
    const after = getComputedStyle(ghost).backgroundColor;
    console.log('Background AFTER hover:', after);
    console.log('Changed?', before !== after ? '✅ YES' : '❌ NO');
  }, 100);
}

// 4. Check if data-interactive exists
console.log('\n=== DATA ATTRIBUTES ===');
const btns = document.querySelectorAll('button');
btns.forEach((btn, i) => {
  console.log(`Button ${i}:`, {
    'data-interactive': btn.hasAttribute('data-interactive'),
    'data-variant': btn.getAttribute('data-variant'),
    'data-size': btn.getAttribute('data-size'),
  });
});
