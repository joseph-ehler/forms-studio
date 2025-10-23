# Testing Guide - Cascade OS

## 🧪 Running Overlay Smoke Tests

### Two-Terminal Workflow

**Terminal 1** - Start dev server:
```bash
pnpm dev
# Wait for "ready on http://localhost:3000" or similar
```

**Terminal 2** - Run smoke tests:
```bash
pnpm test:overlay-smoke
```

---

## ✅ What the Tests Verify

### Mobile Viewport (375×480)

1. **Footer visible** - PickerFooter always visible at bottom
2. **Content scrolls** - Content area scrollable when needed
3. **Overlay within viewport** - Bottom edge ≤ window height
4. **Clear button works** - Clears value without closing overlay
5. **Done button works** - Closes overlay
6. **Escape closes** - Keyboard shortcut works
7. **Outside-click closes** - Clicking outside closes (desktop)

---

## 🔍 Test Output

### Success
```
Running 4 tests using 1 worker

  ✓ footer visible, content scrolls, overlay within viewport (2.3s)
  ✓ Clear clears without closing; Done closes (1.8s)
  ✓ Escape closes overlay (1.2s)
  ✓ Outside click closes overlay (desktop) (1.5s)

4 passed (6.8s)
```

### Failure
```
  ✗ footer visible, content scrolls, overlay within viewport

  Error: Timed out 2000ms waiting for expect(locator).toBeVisible()

  Locator: locator('[data-overlay="picker"]')
  Expected: visible
  Received: <element(s) not found>
```

**Action**: Check if your app has date pickers on the home page!

---

## 🛠️ Troubleshooting

### "Timed out waiting for locator"

**Cause**: Test can't find the date picker trigger

**Fix**: Update test selectors in `tests/overlay.spec.ts`:

```typescript
// Current
await page.getByText('Select date', { exact: false }).first().click();

// Try alternatives
await page.getByRole('button', { name: /date/i }).click();
await page.locator('[data-testid="date-field"]').click();
```

### "Error: page.goto: net::ERR_CONNECTION_REFUSED"

**Cause**: Dev server not running or wrong port

**Fix**:
1. Ensure `pnpm dev` is running
2. Check which port it uses (might not be 3000)
3. Update `playwright.config.ts` baseURL if different

### "Tests pass but overlay doesn't work in browser"

**Cause**: Tests passing doesn't mean the app is functional

**Action**: 
1. Open http://localhost:3000 in browser
2. Manually test the date picker
3. Use console scripts from `DEBUGGING_PLAYBOOK.md`

---

## 🎯 When to Run Tests

### Before Every PR
```bash
pnpm dev          # Terminal 1
pnpm test:overlay-smoke  # Terminal 2
```

### Weekly (Regression Check)
```bash
pnpm dev
pnpm test:overlay-smoke
```

### After Extracting a Pattern
```bash
# Ensure tests still pass after refactoring
pnpm dev
pnpm test:overlay-smoke
```

---

## 🔄 CI/CD (Future)

For CI, you'll need a specific example/demo app:

```yaml
# .github/workflows/cascade-os.yml (future enhancement)
- name: Run smoke tests
  run: |
    # Start specific demo app
    cd examples/demo && pnpm dev &
    # Wait for port
    npx wait-on http://127.0.0.1:3000
    # Run tests
    cd ../.. && pnpm test:overlay-smoke
```

---

## 📝 Test Maintenance

### Adding New Tests

```typescript
// tests/overlay.spec.ts
test('your new test', async ({ page }) => {
  await page.goto('/');
  
  // Your test logic
  
  const overlay = page.locator('[data-overlay="picker"]');
  await expect(overlay).toBeVisible();
});
```

### Updating Selectors

If your app structure changes:

```typescript
// Old
await page.getByText('Select date').click();

// New (more resilient)
await page.getByRole('button', { name: /date/i }).click();
await page.locator('[data-testid="date-picker-trigger"]').click();
```

---

## 🎓 Console Diagnostics

**Instead of waiting for tests**, debug in browser console:

```javascript
// Paste this when overlay is open
(() => {
  const el = document.querySelector('[data-overlay="picker"]');
  if (!el) return console.warn('No overlay');
  const cs=getComputedStyle(el), c=el.querySelector('[data-role="content"]'), cc=c&&getComputedStyle(c);
  console.table({
    'maxHeight(style)': el.style.maxHeight || '(none)',
    'maxHeight(computed)': cs.maxHeight,
    'content scrollHeight': c?.scrollHeight,
    'content clientHeight': c?.clientHeight,
    'content overflowY': cc?.overflowY
  });
  const bottom=el.getBoundingClientRect().bottom, vh=innerHeight;
  console.log(bottom<=vh?'✅ Within viewport':`❌ OVERFLOW by ${bottom-vh}px`);
})();
```

**Faster feedback loop than Playwright!**

---

## ✅ Summary

1. **Manual testing** - Two terminals (dev + tests)
2. **Smoke tests verify** - Footer, scroll, viewport, interactions
3. **Console scripts** - Faster than waiting for Playwright
4. **Selectors may need tuning** - Adjust to match your app

**Tests are a safety net, not a replacement for manual verification.**
