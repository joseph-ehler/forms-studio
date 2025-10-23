import fs from 'node:fs';
import path from 'node:path';

const jsEsm = path.join('dist', 'index.js');
const cssEsm = path.join('dist', 'index.css');

const js = fs.existsSync(jsEsm) ? fs.statSync(jsEsm).size : 0;
const css = fs.existsSync(cssEsm) ? fs.statSync(cssEsm).size : 0;

// Budgets (tune as you like)
const JS_MAX = 750 * 1024;   // 750 KB
const CSS_MAX = 120 * 1024;  // 120 KB

let fail = false;
if (js > JS_MAX) { 
  console.error(`❌ DS ESM JS too large: ${(js / 1024).toFixed(2)} KB (limit: ${JS_MAX / 1024} KB)`); 
  fail = true; 
}
if (css > CSS_MAX) { 
  console.error(`❌ DS ESM CSS too large: ${(css / 1024).toFixed(2)} KB (limit: ${CSS_MAX / 1024} KB)`); 
  fail = true; 
}

if (fail) process.exit(1);

console.log(`✅ Size check passed!`);
console.log(`   JS:  ${(js / 1024).toFixed(2)} KB / ${JS_MAX / 1024} KB`);
console.log(`   CSS: ${(css / 1024).toFixed(2)} KB / ${CSS_MAX / 1024} KB`);
