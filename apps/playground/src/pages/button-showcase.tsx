/**
 * Button Showcase - God-Tier Validation
 * 
 * Shows all variants, sizes, and states
 */

import { Button } from '@intstudio/ds/fb';
import { ThemeToggle } from '@intstudio/ds';

export function ButtonShowcase() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="mx-auto max-w-6xl space-y-12">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Button System</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Token-only, production-grade implementation
            </p>
          </div>
          <ThemeToggle showLabels />
        </header>

        {/* Variant Matrix */}
        <section className="rounded-lg bg-white dark:bg-gray-800 p-8 shadow">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">All Variants × Sizes</h2>
          
          <div className="space-y-8">
            {/* Primary */}
            <div>
              <h3 className="mb-4 text-lg font-medium text-gray-700 dark:text-gray-300">Primary:</h3>
              <div className="flex items-center gap-4">
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="md">Medium</Button>
                <Button variant="primary" size="lg">Large</Button>
                <Button variant="primary" disabled>Disabled</Button>
                <Button variant="primary" loading loadingText="Loading...">Loading</Button>
              </div>
            </div>

            {/* Secondary */}
            <div>
              <h3 className="mb-4 text-lg font-medium text-gray-700 dark:text-gray-300">Secondary:</h3>
              <div className="flex items-center gap-4">
                <Button variant="secondary" size="sm">Small</Button>
                <Button variant="secondary" size="md">Medium</Button>
                <Button variant="secondary" size="lg">Large</Button>
                <Button variant="secondary" disabled>Disabled</Button>
                <Button variant="secondary" loading loadingText="Loading...">Loading</Button>
              </div>
            </div>

            {/* Ghost */}
            <div>
              <h3 className="mb-4 text-lg font-medium text-gray-700 dark:text-gray-300">Ghost:</h3>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm">Small</Button>
                <Button variant="ghost" size="md">Medium</Button>
                <Button variant="ghost" size="lg">Large</Button>
                <Button variant="ghost" disabled>Disabled</Button>
                <Button variant="ghost" loading loadingText="Loading...">Loading</Button>
              </div>
            </div>

            {/* Danger */}
            <div>
              <h3 className="mb-4 text-lg font-medium text-gray-700 dark:text-gray-300">Danger:</h3>
              <div className="flex items-center gap-4">
                <Button variant="danger" size="sm">Small</Button>
                <Button variant="danger" size="md">Medium</Button>
                <Button variant="danger" size="lg">Large</Button>
                <Button variant="danger" disabled>Disabled</Button>
                <Button variant="danger" loading loadingText="Loading...">Loading</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Test */}
        <section className="rounded-lg bg-white dark:bg-gray-800 p-8 shadow">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">Interactive Test</h2>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Hover, click, and tab through these buttons to test interactions:
            </p>
            <div className="flex gap-4">
              <Button variant="primary" onClick={() => alert('Primary clicked!')}>
                Click Me
              </Button>
              <Button variant="secondary" onClick={() => alert('Secondary clicked!')}>
                Or Me
              </Button>
              <Button variant="ghost" onClick={() => alert('Ghost clicked!')}>
                Or Me
              </Button>
              <Button variant="danger" onClick={() => confirm('Are you sure?')}>
                Danger!
              </Button>
            </div>
          </div>
        </section>

        {/* Diagnostics */}
        <section className="rounded-lg bg-white dark:bg-gray-800 p-8 shadow">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">Diagnostics</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Open DevTools and inspect any button. You'll see:
            </p>
            <ul className="list-inside list-disc space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><code className="rounded bg-gray-100 px-2 py-1">data-component="button"</code></li>
              <li><code className="rounded bg-gray-100 px-2 py-1">data-variant="primary"</code> (or secondary/ghost/danger)</li>
              <li><code className="rounded bg-gray-100 px-2 py-1">data-size="md"</code> (or sm/lg)</li>
              <li><code className="rounded bg-gray-100 px-2 py-1">aria-busy="true"</code> when loading</li>
            </ul>
            <div className="mt-4">
              <Button variant="primary">Inspect This Button</Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
