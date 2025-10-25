import { useState } from 'react';
import { Button, Modal, Field } from '@intstudio/ds/fb';
import { useDisclosure } from '@intstudio/ds/hooks';
import { TextInput, Label } from 'flowbite-react';

/**
 * Golden Demo - Quality Layer Validation
 * 
 * Tests all contracts and diagnostics:
 * - Modal: focus trap, Esc closes, focus returns
 * - Field: error/hint ARIA wiring
 * - Button: variants + loading state
 * - Diagnostics: data-* attributes, __DS_DEBUG logging
 * 
 * DoD:
 * ✅ Open → first focusable receives focus
 * ✅ Esc closes; focus returns to opener
 * ✅ Submit empty → errors show; aria-invalid, aria-describedby correct
 * ✅ data-component, data-state visible in Elements panel
 * ✅ Console logs when window.__DS_DEBUG = true
 */
export function QualityLayerDemo() {
  const modal = useDisclosure();
  const [formData, setFormData] = useState({ name: '', email: '', description: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (formData.email && !formData.email.includes('@')) {
      newErrors.email = 'Email must be valid';
    }
    
    setErrors(newErrors);
    
    // If valid, simulate save
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLoading(false);
      modal.onClose();
      alert(`Product created: ${formData.name}`);
      setFormData({ name: '', email: '', description: '' });
    }
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', description: '' });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quality Layer Demo</h1>
          <p className="mt-2 text-gray-600">
            Validate contracts, diagnostics, and DX for Flowbite wrappers
          </p>
        </header>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Validation Checklist</h2>
          
          <div className="space-y-4">
            <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
              <h3 className="font-medium text-blue-900">How to Test</h3>
              <ul className="mt-2 space-y-1 text-sm text-blue-800">
                <li>1. Open DevTools → Console → Run: <code className="rounded bg-blue-100 px-1">window.__DS_DEBUG = true</code></li>
                <li>2. Click "Create Product" → Modal opens, focus goes to first input</li>
                <li>3. Press Escape → Modal closes, focus returns to button</li>
                <li>4. Click Submit without filling → Errors show with proper ARIA</li>
                <li>5. Inspect modal element → Check <code className="rounded bg-blue-100 px-1">data-component</code> and <code className="rounded bg-blue-100 px-1">data-state</code></li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button variant="primary" onClick={modal.onOpen}>
                Create Product
              </Button>
              
              <Button variant="secondary" onClick={() => alert('Secondary action')}>
                Secondary Action
              </Button>
              
              <Button variant="ghost" onClick={() => alert('Ghost action')}>
                Ghost Action
              </Button>
              
              <Button variant="danger" onClick={() => confirm('Delete everything?')}>
                Danger Zone
              </Button>
            </div>

            <div className="mt-4">
              <Button 
                variant="primary" 
                loading={loading}
                loadingText="Processing..."
                onClick={async () => {
                  setLoading(true);
                  await new Promise(r => setTimeout(r, 2000));
                  setLoading(false);
                }}
              >
                Test Loading State
              </Button>
            </div>
          </div>
        </div>

        <Modal ariaLabel="Create Product" {...modal.props} size="md">
          <Modal.Header>Create New Product</Modal.Header>
          <Modal.Body>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field
                label="Product Name"
                id="product-name"
                required
                error={errors.name}
                hint="Enter a descriptive product name"
              >
                <TextInput
                  id="product-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Premium Widget"
                  aria-invalid={!!errors.name}
                  aria-describedby={
                    [
                      'product-name-hint',
                      errors.name ? 'product-name-error' : undefined
                    ].filter(Boolean).join(' ') || undefined
                  }
                />
              </Field>

              <Field
                label="Contact Email"
                id="contact-email"
                required
                error={errors.email}
                hint="We'll use this for order confirmations"
              >
                <TextInput
                  id="contact-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={
                    [
                      'contact-email-hint',
                      errors.email ? 'contact-email-error' : undefined
                    ].filter(Boolean).join(' ') || undefined
                  }
                />
              </Field>

              <div>
                <Label htmlFor="description" value="Description (optional)" />
                <textarea
                  id="description"
                  rows={3}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell us more about this product..."
                />
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" loading={loading} onClick={handleSubmit}>
              {loading ? 'Creating...' : 'Create Product'}
            </Button>
            <Button variant="ghost" onClick={handleReset} disabled={loading}>
              Reset
            </Button>
            <Button variant="secondary" onClick={modal.onClose} disabled={loading}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>

        <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="font-medium text-gray-900">Developer Tools</h3>
          <div className="mt-2 space-y-2 text-sm text-gray-600">
            <p>
              <code className="rounded bg-gray-200 px-1 text-xs">window.debugModal()</code> - Debug modal state
            </p>
            <p>
              <code className="rounded bg-gray-200 px-1 text-xs">window.debugField()</code> - Debug field ARIA wiring
            </p>
            <p>
              <code className="rounded bg-gray-200 px-1 text-xs">window.__DS_DEBUG = true</code> - Enable verbose logging
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
