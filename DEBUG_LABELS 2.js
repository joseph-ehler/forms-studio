// PASTE IN CONSOLE TO DEBUG LABELS

const labels = document.querySelectorAll('[data-ds="label"]:not(.ds-sr-only)');
console.log('📊 Found', labels.length, 'visible labels\n');

if (labels.length > 0) {
  const label = labels[0];
  const computed = getComputedStyle(label);
  
  console.log('First label:', label.textContent?.trim());
  console.log('Color:', computed.color);
  console.log('Font size:', computed.fontSize);
  console.log('Font weight:', computed.fontWeight);
  console.log('Classes:', Array.from(label.classList).join(' '));
  
  console.log('\n📋 Expected:');
  console.log('  Color: rgb(17, 24, 39) [gray-900, dark]');
  console.log('  Font size: 16px');
  console.log('  Font weight: 600 (semibold)');
}
