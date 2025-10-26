# Sheet Debug Console Script

## **Run this in your browser console while on the BasicModal story:**

```javascript
// 1. Check if Sheet component is present
console.log('Sheet in DOM?', document.querySelector('[data-testid="sheet"]'));

// 2. Check if Modal elements are present
console.log('Modal elements:', {
  flowbiteModal: document.querySelector('[role="dialog"]'),
  modalBackdrop: document.querySelector('.ds-modal-backdrop'),
  anyBackdrop: document.querySelectorAll('[class*="backdrop"]'),
});

// 3. Check if button is clickable
const button = document.querySelector('button');
console.log('Button:', button);
console.log('Button events:', button ? getEventListeners(button) : 'No button');

// 4. Check React state (if accessible)
console.log('Open buttons:', document.querySelectorAll('button'));

// 5. Check for errors
console.log('Console errors:', console.error);

// 6. Force open modal (bypass React)
// Try clicking button programmatically
const openBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Open'));
if (openBtn) {
  console.log('Clicking button programmatically...');
  openBtn.click();
  
  setTimeout(() => {
    console.log('After click - Modal visible?', document.querySelector('[role="dialog"]'));
  }, 500);
}
```

## **What to look for:**

1. **If button has no event listener** → React not attaching events
2. **If Modal element never appears** → Sheet component not rendering
3. **If backdrop appears but content doesn't** → Flowbite Modal issue
4. **If nothing happens** → forceMode might not be working

---

## **Quick Manual Tests:**

### **Test 1: Is React working?**
Open console, type:
```javascript
document.querySelector('button').textContent
```
Should show "Open Modal"

### **Test 2: Can we see the Sheet component?**
```javascript
document.querySelector('h2').textContent
```
Should show "Basic Modal Test"

### **Test 3: What happens when we click?**
Click button, then run:
```javascript
document.querySelector('[role="dialog"]')
```
Should return an element, or null if not working

---

**Run these and tell me what you see.** Then I'll know exactly what's broken.
