import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { SelectField } from './SelectField.new';

const meta: Meta<typeof SelectField> = {
  title: 'Forms/SelectField',
  component: SelectField,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Custom select field with overlay, search, and keyboard navigation. Uses desktop popover and mobile sheet.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SelectField>;

// Sample data
const countries = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
  { value: 'br', label: 'Brazil' },
];

const largeList = Array.from({ length: 100 }, (_, i) => ({
  value: `option-${i}`,
  label: `Option ${i + 1}`,
}));

// ============================================
// Story 1: Basic
// ============================================

export const Basic: Story = {
  render: () => {
    const { control, formState: { errors } } = useForm();
    
    return (
      <SelectField
        name="country"
        control={control}
        errors={errors}
        label="Country"
        placeholder="Select a country"
        options={countries}
      />
    );
  },
};

// ============================================
// Story 2: Searchable (Default)
// ============================================

export const Searchable: Story = {
  render: () => {
    const { control, formState: { errors } } = useForm();
    
    return (
      <SelectField
        name="country"
        control={control}
        errors={errors}
        label="Country (with search)"
        description="Type to filter options"
        searchable={true}
        options={countries}
      />
    );
  },
};

// ============================================
// Story 3: Clearable
// ============================================

export const Clearable: Story = {
  render: () => {
    const { control, formState: { errors } } = useForm({
      defaultValues: { country: 'us' }
    });
    
    return (
      <SelectField
        name="country"
        control={control}
        errors={errors}
        label="Country (clearable)"
        description="Click the X to clear selection"
        clearable={true}
        options={countries}
      />
    );
  },
};

// ============================================
// Story 4: Required
// ============================================

export const Required: Story = {
  render: () => {
    const { control, handleSubmit, formState: { errors } } = useForm();
    
    const onSubmit = (data: any) => console.log(data);
    
    return (
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <SelectField
          name="country"
          control={control}
          errors={errors}
          label="Country *"
          required={true}
          options={countries}
        />
        <button style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px' }}>
          Submit
        </button>
      </form>
    );
  },
};

// ============================================
// Story 5: Disabled
// ============================================

export const Disabled: Story = {
  render: () => {
    const { control, formState: { errors } } = useForm({
      defaultValues: { country: 'us' }
    });
    
    return (
      <SelectField
        name="country"
        control={control}
        errors={errors}
        label="Country (disabled)"
        disabled={true}
        options={countries}
      />
    );
  },
};

// ============================================
// Story 6: With Error
// ============================================

export const WithError: Story = {
  render: () => {
    const { control, setError, formState: { errors } } = useForm();
    
    // Simulate error
    React.useEffect(() => {
      setError('country', { type: 'manual', message: 'Please select a valid country' });
    }, [setError]);
    
    return (
      <SelectField
        name="country"
        control={control}
        errors={errors}
        label="Country"
        required={true}
        options={countries}
      />
    );
  },
};

// ============================================
// Story 7: Long List (100 options)
// ============================================

export const LongList: Story = {
  render: () => {
    const { control, formState: { errors } } = useForm();
    
    return (
      <SelectField
        name="option"
        control={control}
        errors={errors}
        label="Select from 100 options"
        description="Scroll or search to find options"
        searchable={true}
        options={largeList}
      />
    );
  },
};

// ============================================
// Story 8: No Search
// ============================================

export const NoSearch: Story = {
  render: () => {
    const { control, formState: { errors } } = useForm();
    
    return (
      <SelectField
        name="country"
        control={control}
        errors={errors}
        label="Country (no search)"
        description="Use arrow keys to navigate"
        searchable={false}
        options={countries}
      />
    );
  },
};

// ============================================
// Story 9: Custom Placeholder
// ============================================

export const CustomPlaceholder: Story = {
  render: () => {
    const { control, formState: { errors } } = useForm();
    
    return (
      <SelectField
        name="country"
        control={control}
        errors={errors}
        label="Destination"
        placeholder="Where are you traveling?"
        options={countries}
      />
    );
  },
};

// ============================================
// Story 10: Searchable + Clearable + Required
// ============================================

export const FullyFeatured: Story = {
  render: () => {
    const { control, handleSubmit, watch, formState: { errors } } = useForm();
    
    const selectedValue = watch('country');
    
    const onSubmit = (data: any) => {
      console.log('Submitted:', data);
      alert(`Selected: ${data.country}`);
    };
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <SelectField
            name="country"
            control={control}
            errors={errors}
            label="Country *"
            description="Search, select, and clear if needed"
            required={true}
            searchable={true}
            clearable={true}
            options={countries}
          />
          <button style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px' }}>
            Submit
          </button>
        </form>
        
        {selectedValue && (
          <div style={{ padding: '12px', background: '#f3f4f6', borderRadius: '6px' }}>
            <strong>Selected:</strong> {countries.find(c => c.value === selectedValue)?.label}
          </div>
        )}
      </div>
    );
  },
};
