/**
 * CheckboxField Stories
 * 
 * Visual validation for checkbox primitive implementation
 * 
 * Test cases:
 * - Basic checkbox with label
 * - Required checkbox
 * - Checkbox with description
 * - Disabled state
 * - Error state
 * - Without label (accessible via aria-label)
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckboxField } from './CheckboxField';
import { AppProvider } from '@intstudio/ds';

const meta = {
  title: 'Fields/CheckboxField',
  component: CheckboxField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CheckboxField>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic checkbox
export const Basic: Story = {
  render: () => {
    const { control } = useForm({
      defaultValues: { agree: false },
    });

    return (
      <AppProvider>
        <CheckboxField
          name="agree"
          control={control}
          errors={{}}
          label="I agree to the terms and conditions"
        />
      </AppProvider>
    );
  },
};

// Required checkbox
export const Required: Story = {
  render: () => {
    const schema = z.object({
      terms: z.boolean().refine((val) => val === true, {
        message: 'You must accept the terms to continue',
      }),
    });

    const { control, formState: { errors } } = useForm({
      resolver: zodResolver(schema),
      defaultValues: { terms: false },
    });

    return (
      <AppProvider>
        <CheckboxField
          name="terms"
          control={control}
          errors={errors}
          label="Accept Terms & Conditions"
          required
          description="Required to proceed with registration"
        />
      </AppProvider>
    );
  },
};

// With description
export const WithDescription: Story = {
  render: () => {
    const { control } = useForm({
      defaultValues: { newsletter: false },
    });

    return (
      <AppProvider>
        <CheckboxField
          name="newsletter"
          control={control}
          errors={{}}
          label="Subscribe to newsletter"
          description="Receive weekly updates about new features and releases"
        />
      </AppProvider>
    );
  },
};

// Disabled state
export const Disabled: Story = {
  render: () => {
    const { control } = useForm({
      defaultValues: { disabled: false },
    });

    return (
      <AppProvider>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <CheckboxField
            name="disabled"
            control={control}
            errors={{}}
            label="Disabled unchecked"
            disabled
          />
          <CheckboxField
            name="disabledChecked"
            control={control}
            errors={{}}
            label="Disabled checked"
            disabled
          />
        </div>
      </AppProvider>
    );
  },
};

// Error state
export const WithError: Story = {
  render: () => {
    const schema = z.object({
      consent: z.boolean().refine((val) => val === true, {
        message: 'You must provide consent to continue',
      }),
    });

    const { control, formState: { errors }, trigger } = useForm({
      resolver: zodResolver(schema),
      defaultValues: { consent: false },
      mode: 'onChange',
    });

    React.useEffect(() => {
      trigger('consent');
    }, [trigger]);

    return (
      <AppProvider>
        <CheckboxField
          name="consent"
          control={control}
          errors={errors}
          label="I consent to data processing"
          required
          description="This checkbox demonstrates error styling"
        />
      </AppProvider>
    );
  },
};

// Without label (accessible via aria-label)
export const WithoutLabel: Story = {
  render: () => {
    const { control } = useForm({
      defaultValues: { noLabel: false },
    });

    return (
      <AppProvider>
        <CheckboxField
          name="noLabel"
          control={control}
          errors={{}}
          description="Checkbox without visible label (has aria-label for screen readers)"
        />
      </AppProvider>
    );
  },
};

// Interactive form example
export const InteractiveForm: Story = {
  render: () => {
    const schema = z.object({
      terms: z.boolean().refine((val) => val === true, {
        message: 'You must accept the terms',
      }),
      newsletter: z.boolean(),
      marketing: z.boolean(),
    });

    type FormData = z.infer<typeof schema>;

    const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        terms: false,
        newsletter: false,
        marketing: false,
      },
    });

    const [submitted, setSubmitted] = React.useState<FormData | null>(null);

    const onSubmit = (data: FormData) => {
      setSubmitted(data);
    };

    return (
      <AppProvider>
        <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: '400px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <CheckboxField
              name="terms"
              control={control}
              errors={errors}
              label="I accept the Terms & Conditions"
              required
            />

            <CheckboxField
              name="newsletter"
              control={control}
              errors={errors}
              label="Send me newsletter updates"
              description="Weekly digest of new features"
            />

            <CheckboxField
              name="marketing"
              control={control}
              errors={errors}
              label="Send me marketing emails"
              description="Product announcements and special offers"
            />

            <button
              type="submit"
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--color-primary, #3B82F6)',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
              }}
            >
              Submit
            </button>

            {submitted && (
              <pre style={{
                padding: '1rem',
                background: '#f1f5f9',
                borderRadius: '0.25rem',
                fontSize: '0.875rem',
              }}>
                {JSON.stringify(submitted, null, 2)}
              </pre>
            )}
          </div>
        </form>
      </AppProvider>
    );
  },
};
