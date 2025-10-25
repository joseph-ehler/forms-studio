// Paste in browser console to diagnose theme + button hover issues

console.clear();
console.log('🔍 Theme & Button Diagnosis\n');

// 1. Check theme attribute
const htmlEl = document.documentElement;
const currentTheme = htmlEl.getAttribute('data-theme');
console.log('=== THEME STATUS ===');
console.log('  data-theme attribute:', currentTheme || 'NOT SET ❌');
console.log('  colorScheme:', htmlEl.style.colorScheme);

// 2. Check if theme is in localStorage
const stored = localStorage.getItem('ds-theme');
console.log('  localStorage:', stored || 'NOT SET');

// 3. Check current token values
const rootStyles = getComputedStyle(htmlEl);
console.log('\n=== TOKEN VALUES ===');
console.log('  surface-base:', rootStyles.getPropertyValue('--ds-color-surface-base').trim());
console.log('  text:', rootStyles.getPropertyValue('--ds-color-text').trim());

// 4. Check all button variants hover states
console.log('\n=== BUTTON HOVER STATES ===');
const variants = ['primary', 'secondary', 'ghost', 'danger'];
variants.forEach(variant => {
  const btn = document.querySelector(`[data-variant="${variant}"]`);
  if (btn) {
    const styles = getComputedStyle(btn);
    console.log(`\n${variant}:`);
    console.log('  transition:', styles.transition.substring(0, 50));
    console.log('  transform:', styles.transform);
    
    // Trigger hover temporarily to check
    btn.classList.add('hover-test');
    btn.style.outline = '2px solid orange';
    setTimeout(() => {
      btn.classList.remove('hover-test');
      btn.style.outline = '';
    }, 2000);
  }
});

console.log('\n💡 Buttons now have orange outline for 2 seconds');
console.log('💡 Hover over them to test animation differences');
