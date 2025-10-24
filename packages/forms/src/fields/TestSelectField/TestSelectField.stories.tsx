import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useForm, FormProvider } from 'react-hook-form';
import { TestSelectField } from './TestSelectField';

const meta: Meta<typeof TestSelectField> = {
  title: 'Forms/TestSelectField (Recipe-Based)',
  component: TestSelectField,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '🎉 **PROOF OF CONCEPT** - First field generated via recipe system! Uses SimpleListRecipe with ResponsiveOverlay (desktop popover, mobile sheet). Fully tokenized and themeable.'
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof TestSelectField>;

// ============================================
// Story 1: Basic Usage
// ============================================

export const Basic: Story = {
  render: () => {
    const methods = useForm();

    return (
      <FormProvider {...methods}>
        <div style={{ padding: '20px', maxWidth: '400px' }}>
          <TestSelectField
            name="testSelect"
            label="Choose Option"
            description="Test field for recipe-based generation"
          />
        </div>
      </FormProvider>
    );
  }
};

// ============================================
// Story 2: With Default Value
// ============================================

export const WithDefaultValue: Story = {
  render: () => {
    const methods = useForm({
      defaultValues: {
        testSelect: 'option-2'
      }
    });

    return (
      <FormProvider {...methods}>
        <div style={{ padding: '20px', maxWidth: '400px' }}>
          <TestSelectField
            name="testSelect"
            label="Choose Option"
            description="Option 2 is pre-selected"
          />
        </div>
      </FormProvider>
    );
  }
};

// ============================================
// Story 3: Required Field
// ============================================

export const Required: Story = {
  render: () => {
    const methods = useForm();

    const onSubmit = (data: any) => {
      console.log('Submitted:', data);
      alert(`Selected: ${data.testSelect}`);
    };

    return (
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} style={{ padding: '20px', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <TestSelectField
            name="testSelect"
            label="Choose Option *"
            description="This field is required"
            required={true}
          />
          
          <button 
            type="submit"
            style={{
              padding: '10px 20px',
              background: 'var(--ds-color-primary-bg)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--ds-radius-md)',
              cursor: 'pointer'
            }}
          >
            Submit
          </button>
        </form>
      </FormProvider>
    );
  }
};

// ============================================
// Story 4: Disabled
// ============================================

export const Disabled: Story = {
  render: () => {
    const methods = useForm({
      defaultValues: {
        testSelect: 'option-3'
      }
    });

    return (
      <FormProvider {...methods}>
        <div style={{ padding: '20px', maxWidth: '400px' }}>
          <TestSelectField
            name="testSelect"
            label="Choose Option"
            description="This field is disabled"
            disabled={true}
          />
        </div>
      </FormProvider>
    );
  }
};

// ============================================
// Story 5: With Error
// ============================================

export const WithError: Story = {
  render: () => {
    const methods = useForm();

    React.useEffect(() => {
      methods.setError('testSelect', {
        type: 'manual',
        message: 'Please select a valid option'
      });
    }, [methods]);

    return (
      <FormProvider {...methods}>
        <div style={{ padding: '20px', maxWidth: '400px' }}>
          <TestSelectField
            name="testSelect"
            label="Choose Option"
            description="Error state demonstration"
            required={true}
          />
        </div>
      </FormProvider>
    );
  }
};

// ============================================
// Story 6: Dark Mode Test
// ============================================

export const DarkMode: Story = {
  render: () => {
    const methods = useForm();

    return (
      <div data-theme="dark" style={{ background: '#1a1a1a', minHeight: '400px', padding: '20px' }}>
        <FormProvider {...methods}>
          <div style={{ maxWidth: '400px' }}>
            <TestSelectField
              name="testSelect"
              label="Choose Option"
              description="Testing dark mode theming"
            />
          </div>
        </FormProvider>
      </div>
    );
  }
};

// ============================================
// Story 7: Recipe System Showcase
// ============================================

export const RecipeShowcase: Story = {
  render: () => {
    const methods = useForm();
    const selectedValue = methods.watch('testSelect');

    return (
      <FormProvider {...methods}>
        <div style={{ padding: '20px', maxWidth: '500px' }}>
          <div style={{
            padding: '16px',
            background: 'var(--ds-color-surface-subtle)',
            borderRadius: 'var(--ds-radius-md)',
            marginBottom: '20px',
            border: '1px solid var(--ds-color-border-subtle)'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>
              🎉 Recipe System Success!
            </h3>
            <ul style={{ margin: '8px 0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
              <li>✅ Generated from YAML spec</li>
              <li>✅ Uses SimpleListRecipe</li>
              <li>✅ ResponsiveOverlay (popover/sheet)</li>
              <li>✅ Fully tokenized (no hard-coded values)</li>
              <li>✅ Light/dark mode automatic</li>
              <li>✅ Keyboard navigation built-in</li>
            </ul>
          </div>

          <TestSelectField
            name="testSelect"
            label="Choose Option"
            description="Click to open overlay - try on desktop (popover) and mobile (sheet)"
          />

          {selectedValue && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: 'var(--ds-color-surface-raised)',
              borderRadius: 'var(--ds-radius-md)',
              fontSize: '14px'
            }}>
              <strong>Selected:</strong> {selectedValue}
            </div>
          )}
        </div>
      </FormProvider>
    );
  }
};

// ============================================
// Story 8: Mobile Viewport Test
// ============================================

export const MobileViewport: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    }
  },
  render: () => {
    const methods = useForm();

    return (
      <FormProvider {...methods}>
        <div style={{ padding: '20px' }}>
          <div style={{
            padding: '12px',
            background: '#fef3c7',
            borderRadius: 'var(--ds-radius-md)',
            marginBottom: '16px',
            fontSize: '13px'
          }}>
            📱 Mobile viewport - should show bottom sheet
          </div>
          
          <TestSelectField
            name="testSelect"
            label="Choose Option"
            description="Should open as bottom sheet"
          />
        </div>
      </FormProvider>
    );
  }
};
