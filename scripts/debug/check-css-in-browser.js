// Run this in the browser console on Storybook
// Copy-paste this entire script

console.log('🎨 CSS Variable Debug');
console.log('==================');

const root = document.documentElement;
const computed = getComputedStyle(root);

console.log('Theme attribute:', root.getAttribute('data-theme') || 'not set');
console.log('Brand attribute:', root.getAttribute('data-brand') || 'not set');
console.log('');

console.log('Color variables:');
console.log('--ds-color-text-muted:', computed.getPropertyValue('--ds-color-text-muted').trim());
console.log('--tw-neutral-400:', computed.getPropertyValue('--tw-neutral-400').trim());
console.log('--tw-neutral-600:', computed.getPropertyValue('--tw-neutral-600').trim());
console.log('');

// Check helper text elements
const helpers = document.querySelectorAll('.ds-helper--hint');
console.log(`Found ${helpers.length} helper elements`);
if (helpers.length > 0) {
  const firstHelper = helpers[0];
  const helperStyles = getComputedStyle(firstHelper);
  console.log('First helper color:', helperStyles.color);
}
console.log('');

// Check if CSS file is loaded
const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
console.log('CSS files loaded:', cssLinks.length);
cssLinks.forEach(link => {
  if (link.href.includes('index.css') || link.href.includes('dist')) {
    console.log('  -', link.href);
  }
});
