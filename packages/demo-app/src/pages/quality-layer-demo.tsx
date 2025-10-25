import { Button, Field, Modal, TextInput, useModal } from '@intstudio/ds/fb';
import { useState } from 'react';

/**
 * Quality Layer Demo - Validates the wrapped Flowbite components
 * 
 * Tests:
 * - Modal with required ariaLabel (throws if missing in dev)
 * - useModal hook (2-line usage)
 * - Field with auto-wired ARIA (describedby, invalid, required)
 * - Button variants (semantic, not color strings)
 * - Focus management (auto-focus, return focus)
 * - Keyboard (Escape closes modal)
 * - Diagnostics (data-* attributes)
 */
export default function QualityLayerDemo() {
  const createModal = useModal({
    onAfterOpen: () => console.log('[Demo] Modal opened'),
    onAfterClose: () => console.log('[Demo] Modal closed'),
  });

  const [formData, setFormData] = useState({ name: '', email: '', category: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.category) newErrors.category = 'Category is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log('[Demo] Form submitted:', formData);
    alert(`Success! Product "${formData.name}" created.`);
    createModal.onClose();
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', category: '' });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-3xl font-bold text-text">
          Quality Layer Demo
        </h1>
        
        <div className="mb-8 rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-xl font-semibold">What's Being Tested</h2>
          <ul className="space-y-2 text-sm text-text-subtle">
            <li>✅ <strong>Modal</strong>: Required ariaLabel (throws in dev if missing)</li>
            <li>✅ <strong>useModal</strong>: 2-line state management</li>
            <li>✅ <strong>Field</strong>: Auto-wired ARIA (describedby, invalid, required)</li>
            <li>✅ <strong>Button</strong>: Semantic variants (primary, secondary)</li>
            <li>✅ <strong>Focus</strong>: Auto-focus first input, return focus on close</li>
            <li>✅ <strong>Keyboard</strong>: Escape closes modal</li>
            <li>✅ <strong>Diagnostics</strong>: data-component, data-state attributes</li>
          </ul>
        </div>

        <div className="space-y-4">
          <Button variant="primary" onClick={createModal.onOpen}>
            Create Product
          </Button>

          <Button variant="secondary" onClick={() => console.log('[Demo] Secondary clicked')}>
            Secondary Action
          </Button>

          <Button variant="ghost" onClick={() => console.log('[Demo] Ghost clicked')}>
            Ghost Action
          </Button>

          <Button variant="danger" onClick={() => console.log('[Demo] Danger clicked')}>
            Danger Action
          </Button>
        </div>

        <div className="mt-8 rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-4 text-xl font-semibold">Debug Console</h2>
          <p className="mb-4 text-sm text-text-subtle">
            Open browser console and run:
          </p>
          <pre className="rounded bg-background p-4 text-xs">
            <code>{`// Enable global debug mode
window.__DS_DEBUG = true;

// Inspect modal state
document.querySelector('[data-component="modal"]');

// Inspect field state
document.querySelectorAll('[data-component="field"]').forEach(el => {
  console.log({
    fieldId: el.dataset.fieldId,
    hasError: !!el.querySelector('[data-field-error]'),
    control: el.querySelector('[data-field-control] input')
  });
});`}</code>
          </pre>
        </div>
      </div>

      <Modal
        ariaLabel="Create Product"
        {...createModal.props}
        size="md"
      >
        <Modal.Header>Create Product</Modal.Header>
        <Modal.Body>
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
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setErrors({ ...errors, name: '' });
                }}
                placeholder="Type product name"
              />
            </Field>

            <Field
              label="Email"
              id="email"
              required
              error={errors.email}
              hint="We'll use this for notifications"
            >
              <TextInput
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setErrors({ ...errors, email: '' });
                }}
                placeholder="email@example.com"
              />
            </Field>

            <Field
              label="Category"
              id="category"
              required
              error={errors.category}
            >
              <TextInput
                id="category"
                name="category"
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value });
                  setErrors({ ...errors, category: '' });
                }}
                placeholder="Electronics, Clothing, etc."
              />
            </Field>

            <div className="flex gap-4">
              <Button type="submit" variant="primary">
                Submit
              </Button>
              <Button type="button" variant="secondary" onClick={handleReset}>
                Reset
              </Button>
              <Button type="button" variant="ghost" onClick={createModal.onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
