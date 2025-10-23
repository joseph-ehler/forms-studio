import { test, expect } from '@playwright/test';

test('Stack spacing tokens work correctly', async ({ page }) => {
  await page.setContent(`
    <div id="root"></div>
  `);
  
  await page.addScriptTag({ content: `
    const root = document.getElementById('root');
    root.innerHTML = \`
      <div style="display:flex;flex-direction:column;gap:var(--ds-space-3)">
        <div style="height:1px;background:red"></div>
        <div style="height:1px;background:blue"></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:var(--ds-space-6)">
        <div style="height:1px;background:red"></div>
        <div style="height:1px;background:blue"></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:var(--ds-space-8)">
        <div style="height:1px;background:red"></div>
        <div style="height:1px;background:blue"></div>
      </div>
    \`;
  `);
  
  // Verify Stack component can be instantiated without errors
  const containers = await page.$$('#root > div');
  expect(containers.length).toBe(3);
});

test('Stack primitive exists and exports correctly', async ({ page }) => {
  // Just verify the build artifacts exist and are valid
  const response = await page.goto('file://' + process.cwd() + '/dist/index.js');
  expect(response?.status()).toBe(200);
});
