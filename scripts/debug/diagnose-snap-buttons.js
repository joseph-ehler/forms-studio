// Diagnose why snap control buttons aren't working
// Run in Storybook console (SnapPoints story)

const iframe = document.querySelector('iframe#storybook-preview-iframe');
const doc = iframe.contentDocument;

console.group('🔍 Snap Buttons Diagnostic');

// 1. Check if storybook-root is inert
const sbRoot = doc.getElementById('storybook-root');
console.log('1. Storybook root inert?', sbRoot?.hasAttribute('inert'));
console.log('   Storybook root aria-hidden?', sbRoot?.getAttribute('aria-hidden'));

// 2. Find the control buttons
const buttons = Array.from(doc.querySelectorAll('button')).filter(b => 
  b.textContent.includes('Peek') || b.textContent.includes('Half') || b.textContent.includes('Full')
);
console.log('2. Found snap control buttons:', buttons.length);
buttons.forEach(b => console.log('   -', b.textContent, 'disabled?', b.disabled, 'inert ancestor?', b.closest('[inert]')));

// 3. Check if buttons are inside inert container
const firstButton = buttons[0];
if (firstButton) {
  const inertAncestor = firstButton.closest('[inert]');
  console.log('3. Buttons inside inert container?', !!inertAncestor);
  if (inertAncestor) {
    console.log('   Inert container:', inertAncestor.id || inertAncestor.className);
  }
}

// 4. Check sheet state
const sheet = doc.querySelector('.ds-sheet-content');
console.log('4. Sheet in DOM?', !!sheet);
console.log('   Sheet z-index:', sheet ? getComputedStyle(sheet).zIndex : 'N/A');

// 5. Check overlay scrim
const overlay = doc.querySelector('.ds-sheet-overlay');
console.log('5. Overlay opacity:', overlay ? getComputedStyle(overlay).opacity : 'N/A');
console.log('   Overlay pointer-events:', overlay ? getComputedStyle(overlay).pointerEvents : 'N/A');

console.groupEnd();

console.log('\n💡 SOLUTION: Buttons are in #storybook-root, which we inert when sheet opens!');
console.log('   We need to NOT inert the root in Storybook stories.');
