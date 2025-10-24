/** @refiner(filter-dom-props@1.1.0 applied 2025-10-24) */
import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { ToggleField } from './ToggleField';

const meta: Meta<typeof ToggleField> = {
  title: 'Forms/ToggleField',
  component: ToggleField,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'A toggle switch field using the `.ds-toggle` primitive. Semantically uses `<input type="checkbox" role="switch">` for proper screen reader support.'
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof ToggleField>;

// ============================================
// Story 1: Basic Toggle
// ============================================

export const Basic: Story = {
  render: () => {
    const { control, formState: { errors } } = useForm();

    return (
      <ToggleField
        name="darkMode"
        control={control}
        errors={errors}
        label="Dark Mode"
        description="Enable dark theme" />);


  }
};

// ============================================
// Story 2: Default On
// ============================================

export const DefaultOn: Story = {
  render: () => {
    const { control, formState: { errors } } = useForm({
      defaultValues: {
        notifications: true
      }
    });

    return (
      <ToggleField
        name="notifications"
        control={control}
        errors={errors}
        label="Email Notifications"
        description="Receive email notifications for new messages" />);


  }
};

// ============================================
// Story 3: Required Toggle
// ============================================

export const Required: Story = {
  render: () => {
    const { control, formState: { errors } } = useForm();

    return (
      <ToggleField
        name="termsAccepted"
        control={control}
        errors={errors}
        label="Accept Terms & Conditions"
        description="You must accept the terms to continue"
        required />);


  }
};

// ============================================
// Story 4: Disabled Toggle
// ============================================

export const Disabled: Story = {
  render: () => {
    const { control, formState: { errors } } = useForm();

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <ToggleField
          name="disabledOff"
          control={control}
          errors={errors}
          label="Disabled (Off)"
          description="This toggle is disabled"
          disabled />

        
        <ToggleField
          name="disabledOn"
          control={control}
          errors={errors}
          label="Disabled (On)"
          description="This toggle is disabled and checked"
          disabled />

      </div>);

  }
};

// ============================================
// Story 5: With Error
// ============================================

export const WithError: Story = {
  render: () => {
    const { control, formState: { errors }, setError } = useForm();

    // Simulate error
    React.useEffect(() => {
      setError('agreement', {
        type: 'required',
        message: 'You must accept the agreement to continue'
      });
    }, [setError]);

    return (
      <ToggleField
        name="agreement"
        control={control}
        errors={errors}
        label="I agree to the terms"
        required />);


  }
};

// ============================================
// Story 6: Size Variants (if supported)
// ============================================

export const SizeVariants: Story = {
  render: () => {
    const { control, formState: { errors } } = useForm();

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Small</h3>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input type="checkbox" role="switch" className="ds-toggle ds-toggle ds-toggle--sm" />
            <span>Small toggle (32×18px)</span>
          </label>
        </div>
        
        <div>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Medium (Default)</h3>
          <ToggleField
            name="mediumToggle"
            control={control}
            errors={errors}
            label="Medium toggle (40×22px)" />

        </div>
        
        <div>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>Large</h3>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input type="checkbox" role="switch" className="ds-toggle ds-toggle ds-toggle--lg" />
            <span>Large toggle (48×26px)</span>
          </label>
        </div>
      </div>);

  }
};

// ============================================
// Story 7: Without Label (Accessibility Warning)
// ============================================

export const WithoutLabel: Story = {
  render: () => {
    const { control, formState: { errors } } = useForm();

    return (
      <div>
        <p style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--ds-color-warning-bg, #FEF3C7)', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
          ⚠️ <strong>Accessibility Warning:</strong> Toggles without visible labels should use <code>aria-label</code> for screen readers.
        </p>
        
        <label style={{ display: 'inline-flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            role="switch"
            className="ds-toggle ds-toggle"
            aria-label="Enable notifications" />

        </label>
      </div>);

  }
};

// ============================================
// Story 8: Interactive Form
// ============================================

export const InteractiveForm: Story = {
  render: () => {
    const { control, handleSubmit, watch, formState: { errors } } = useForm({
      defaultValues: {
        autoSave: false,
        notifications: true,
        newsletter: false
      }
    });

    const [submitted, setSubmitted] = React.useState<any>(null);
    const watchAll = watch();

    const onSubmit = (data: any) => {
      console.log('Form submitted:', data);
      setSubmitted(data);
    };

    return (
      <form style={{ maxWidth: '400px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <ToggleField
            name="autoSave"
            control={control}
            errors={errors}
            label="Auto Save"
            description="Automatically save your work every 5 minutes" />

          
          <ToggleField
            name="notifications"
            control={control}
            errors={errors}
            label="Email Notifications"
            description="Get notified about important updates" />

          
          <ToggleField
            name="newsletter"
            control={control}
            errors={errors}
            label="Newsletter"
            description="Receive our monthly newsletter" />

          
          <ToggleField
            name="termsAccepted"
            control={control}
            errors={errors}
            label="Accept Terms & Conditions"
            required />

          
          <button

            style={{
              padding: '0.5rem 1rem',
              background: 'var(--ds-color-primary-bg)',
              color: 'var(--ds-color-primary-text)',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}>

            Submit
          </button>
          
          {submitted &&
          <pre style={{
            padding: '1rem',
            background: 'var(--ds-color-neutral-100, #F5F5F5)',
            borderRadius: '0.25rem',
            fontSize: '0.75rem',
            overflow: 'auto'
          }}>
              {JSON.stringify(submitted, null, 2)}
            </pre>
          }
          
          <div style={{
            padding: '0.75rem',
            background: 'var(--ds-color-neutral-100, #F5F5F5)',
            borderRadius: '0.25rem',
            fontSize: '0.875rem'
          }}>
            <strong>Current Values:</strong>
            <pre style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
              {JSON.stringify(watchAll, null, 2)}
            </pre>
          </div>
        </div>
      </form>);

  }
};

// Add React import for useEffect
import React from 'react';