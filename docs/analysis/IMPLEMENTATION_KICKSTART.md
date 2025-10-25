# Implementation Kickstart - First 5 Elite Wrappers

> **Concrete code to copy-paste and start building**

---

## Setup Checklist

- [x] Dependencies installed (`pnpm install` completed)
- [x] Flowbite packages available
- [x] Tokens package scaffolded
- [x] DS package updated with exports
- [ ] Build tokens package
- [ ] Create first elite wrapper
- [ ] Test in playground app

---

## Quick Start Commands

```bash
# Build tokens (if not already built)
cd packages/tokens
pnpm build

# Build DS package
cd packages/ds
pnpm build

# Start playground
cd apps/playground  # or demo-app
pnpm dev
```

---

## Elite Wrapper Template

Every elite wrapper follows this pattern:

```tsx
/**
 * [ComponentName] - Elite wrapper around Flowbite
 * 
 * Adds:
 * - Runtime contracts (required props)
 * - Auto-wiring via Context
 * - Diagnostics (data-* attrs, debugX)
 * - Systematic behavior (focus, keyboard)
 */

import { [Component], [ComponentProps] } from 'flowbite-react';
import { useEffect, useRef } from 'react';

export type Elite[Component]Props = Omit<[ComponentProps], 'show'> & {
  // Required props (contract)
  ariaLabel: string;
  open: boolean;
  onClose: () => void;
  
  // Optional enhancements
  debug?: boolean;
  telemetry?: boolean;
};

export function Elite[Component]({
  ariaLabel,
  open,
  onClose,
  debug,
  telemetry,
  children,
  ...props
}: Elite[Component]Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Runtime contract (dev mode only)
  if (process.env.NODE_ENV !== 'production') {
    if (!ariaLabel) {
      throw new Error('[Elite[Component]] ariaLabel is required for accessibility');
    }
  }

  // Debug logging
  useEffect(() => {
    if (debug || (typeof window !== 'undefined' && window.__DS_DEBUG)) {
      console.log('[Elite[Component]]', {
        ariaLabel,
        open,
        element: ref.current,
      });
    }
  }, [ariaLabel, open, debug]);

  // Telemetry (optional)
  useEffect(() => {
    if (telemetry && open) {
      // Track open event
      window.analytics?.track('[Component] Opened', { label: ariaLabel });
    }
  }, [telemetry, open, ariaLabel]);

  return (
    <div
      ref={ref}
      data-component="elite-[component]"
      data-open={open}
      data-label={ariaLabel}
    >
      <[Component]
        show={open}
        onClose={onClose}
        aria-label={ariaLabel}
        aria-modal="true"
        {...props}
      >
        {children}
      </[Component]>
    </div>
  );
}

// Re-export sub-components
Elite[Component].Body = [Component].Body;
Elite[Component].Header = [Component].Header;
Elite[Component].Footer = [Component].Footer;
```

---

## 1. EliteModal (Start Here)

**File**: `packages/ds/src/fb/EliteModal.tsx`

```tsx
import { Modal, ModalProps } from 'flowbite-react';
import { useEffect, useRef, useCallback } from 'react';

export type EliteModalProps = Omit<ModalProps, 'show' | 'onClose'> & {
  ariaLabel: string;
  open: boolean;
  onClose: () => void;
  debug?: boolean;
};

export function EliteModal({
  ariaLabel,
  open,
  onClose,
  debug,
  children,
  ...props
}: EliteModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Runtime contract
  if (process.env.NODE_ENV !== 'production' && !ariaLabel) {
    throw new Error('[EliteModal] ariaLabel is required for accessibility');
  }

  // Debug logging
  useEffect(() => {
    if (debug || (typeof window !== 'undefined' && (window as any).__DS_DEBUG)) {
      console.log('[EliteModal]', {
        ariaLabel,
        open,
        zIndex: modalRef.current
          ? getComputedStyle(modalRef.current).zIndex
          : null,
      });
    }
  }, [ariaLabel, open, debug]);

  // Focus management
  useEffect(() => {
    if (!open) return;

    // Save previous focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus first focusable element
    const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements && focusableElements.length > 0) {
      setTimeout(() => focusableElements[0].focus(), 100);
    }

    // Return focus on unmount
    return () => {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [open]);

  // Keyboard handling
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    },
    [open, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      ref={modalRef}
      data-component="elite-modal"
      data-open={open}
      data-label={ariaLabel}
    >
      <Modal
        show={open}
        onClose={onClose}
        dismissible
        {...props}
      >
        <div role="dialog" aria-label={ariaLabel} aria-modal="true">
          {children}
        </div>
      </Modal>
    </div>
  );
}

EliteModal.Body = Modal.Body;
EliteModal.Header = Modal.Header;
EliteModal.Footer = Modal.Footer;
```

**Export**: `packages/ds/src/fb/index.ts`

```tsx
export { EliteModal } from './EliteModal';
export type { EliteModalProps } from './EliteModal';
```

---

## 2. useModal Hook

**File**: `packages/ds/src/hooks/useModal.ts`

```tsx
import { useState, useCallback } from 'react';

export type UseModalOptions = {
  initialOpen?: boolean;
  onAfterOpen?: () => void;
  onAfterClose?: () => void;
};

export type UseModalReturn = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  toggle: () => void;
  props: {
    open: boolean;
    onClose: () => void;
  };
};

export function useModal(options: UseModalOptions = {}): UseModalReturn {
  const { initialOpen = false, onAfterOpen, onAfterClose } = options;
  const [open, setOpen] = useState(initialOpen);

  const onOpen = useCallback(() => {
    setOpen(true);
    onAfterOpen?.();
  }, [onAfterOpen]);

  const onClose = useCallback(() => {
    setOpen(false);
    onAfterClose?.();
  }, [onAfterClose]);

  const toggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        onAfterOpen?.();
      } else {
        onAfterClose?.();
      }
      return next;
    });
  }, [onAfterOpen, onAfterClose]);

  return {
    open,
    onOpen,
    onClose,
    toggle,
    props: {
      open,
      onClose,
    },
  };
}
```

**Export**: `packages/ds/src/hooks/index.ts`

```tsx
export { useModal } from './useModal';
export type { UseModalOptions, UseModalReturn } from './useModal';
```

---

## 3. Field Wrapper

**File**: `packages/ds/src/fb/Field.tsx`

```tsx
import { Label } from 'flowbite-react';
import { ReactNode } from 'react';

export type FieldProps = {
  label: string;
  id: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
};

export function Field({
  label,
  id,
  required,
  error,
  hint,
  children,
  className,
}: FieldProps) {
  // Runtime contract
  if (process.env.NODE_ENV !== 'production' && !id) {
    throw new Error('[Field] id is required for htmlFor accessibility');
  }

  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;

  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={className} data-component="field" data-field-id={id}>
      <Label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
        {required && (
          <span className="ml-1 text-danger" aria-label="required">
            *
          </span>
        )}
      </Label>

      {hint && (
        <p id={hintId} className="mb-2 text-sm text-text-subtle">
          {hint}
        </p>
      )}

      <div data-field-control>
        {/* Clone children and add aria attributes */}
        {typeof children === 'object' && children !== null && 'props' in children
          ? {
              ...children,
              props: {
                ...children.props,
                'aria-invalid': error ? true : undefined,
                'aria-describedby': describedBy,
              },
            }
          : children}
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-2 text-sm text-danger"
          data-field-error
        >
          {error}
        </p>
      )}
    </div>
  );
}
```

**Export**: Add to `packages/ds/src/fb/index.ts`

```tsx
export { Field } from './Field';
export type { FieldProps } from './Field';
```

---

## 4. Test Page (Playground)

**File**: `apps/playground/src/pages/test-elite.tsx` (or similar)

```tsx
import { useState } from 'react';
import { Button, TextInput } from 'flowbite-react';
import { EliteModal, Field, useModal } from '@intstudio/ds/fb';

export default function TestElitePage() {
  const createModal = useModal({
    onAfterOpen: () => console.log('Modal opened'),
    onAfterClose: () => console.log('Modal closed'),
  });

  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log('Form submitted:', formData);
    createModal.onClose();
  };

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Elite Components Test</h1>

      <Button onClick={createModal.onOpen}>Create Product</Button>

      <EliteModal
        ariaLabel="Create Product"
        {...createModal.props}
        debug
      >
        <EliteModal.Header>Create Product</EliteModal.Header>
        <EliteModal.Body>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="Product Name"
              id="product-name"
              required
              error={errors.name}
              hint="Enter a unique product name"
            >
              <TextInput
                id="product-name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Type product name"
              />
            </Field>

            <Field
              label="Email"
              id="email"
              required
              error={errors.email}
            >
              <TextInput
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </Field>

            <div className="flex gap-4">
              <Button type="submit">Submit</Button>
              <Button color="gray" onClick={createModal.onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </EliteModal.Body>
      </EliteModal>
    </div>
  );
}
```

---

## 5. Build & Test

```bash
# Terminal 1: Build tokens
cd packages/tokens
pnpm build --watch

# Terminal 2: Build DS
cd packages/ds
pnpm build --watch

# Terminal 3: Run playground
cd apps/playground
pnpm dev

# Navigate to http://localhost:3000/test-elite
```

---

## Validation Checklist

Open the test page and verify:

### EliteModal
- [ ] Click "Create Product" → modal opens
- [ ] Focus automatically goes to first input
- [ ] Press Escape → modal closes
- [ ] Console shows debug log (if debug prop set)
- [ ] Click outside → modal closes
- [ ] Focus returns to button after close

### Field Component
- [ ] Label has `for` attribute matching input id
- [ ] Required indicator (*) shows when required=true
- [ ] Hint text appears below label
- [ ] Error message appears below input
- [ ] Input has `aria-invalid` when error present
- [ ] Input has `aria-describedby` pointing to hint/error

### useModal Hook
- [ ] onOpen callback fires
- [ ] onClose callback fires
- [ ] toggle() switches state
- [ ] props.open reflects current state

---

## Console Debug Commands

Open browser console and try:

```javascript
// Enable global debug mode
window.__DS_DEBUG = true;

// Inspect all modals
document.querySelectorAll('[data-component="elite-modal"]').forEach(el => {
  console.log({
    label: el.dataset.label,
    open: el.dataset.open,
    zIndex: getComputedStyle(el).zIndex
  });
});

// Inspect all fields
document.querySelectorAll('[data-component="field"]').forEach(el => {
  const control = el.querySelector('[data-field-control] input, [data-field-control] select');
  console.log({
    fieldId: el.dataset.fieldId,
    hasError: !!el.querySelector('[data-field-error]'),
    ariaInvalid: control?.getAttribute('aria-invalid'),
    ariaDescribedby: control?.getAttribute('aria-describedby')
  });
});
```

---

## Next Components to Build

Once EliteModal + Field work:

1. **EliteButton** (loading states, variants)
2. **EliteInput** (error states, icons)
3. **TableRowActions** (dropdown menu)
4. **Stack** (layout primitive)
5. **usePagination** (table pagination)

Each follows the same template pattern above.

---

## Common Issues & Fixes

### Issue: Modal doesn't open

```tsx
// ❌ Wrong - using Flowbite API
<Modal show={showModal}>

// ✅ Correct - using Elite API
<EliteModal open={modal.open}>
```

### Issue: Field validation doesn't show

```tsx
// ❌ Wrong - not using Field wrapper
<Label htmlFor="name">Name</Label>
<TextInput id="name" />

// ✅ Correct - using Field wrapper
<Field label="Name" id="name" error={errors.name}>
  <TextInput id="name" />
</Field>
```

### Issue: Build errors

```bash
# Clear node_modules and rebuild
rm -rf node_modules
pnpm install
pnpm -r build
```

### Issue: Types not found

```bash
# Rebuild with types
cd packages/ds
pnpm build
```

---

## Success Criteria

You've successfully built the elite layer when:

✅ EliteModal requires ariaLabel (throws error if missing)  
✅ Focus automatically goes to modal content  
✅ Escape key closes modal  
✅ Focus returns after close  
✅ Debug logging works  
✅ Field enforces htmlFor contract  
✅ Error states work automatically  
✅ ARIA attributes added automatically  
✅ Console scripts reveal component state  
✅ Test page demonstrates all features

---

## What's Next

After validating these 5 components:

1. **Expand coverage** - Add 5 more elite wrappers
2. **Extract patterns** - Build TableRowActions, Stack
3. **Add tests** - Playwright + unit tests
4. **Write docs** - Usage guide + API reference
5. **Migrate app** - Replace old patterns with elite

**You're ready to build**. Start with EliteModal and test it in the playground.
