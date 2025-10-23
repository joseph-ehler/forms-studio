/**
 * CheckboxField Tests
 * 
 * Validates:
 * 1. Correct primitive usage (.ds-checkbox not .ds-input)
 * 2. RHF integration (control, onChange, value)
 * 3. ARIA attributes (invalid, describedby, required)
 * 4. Label association (htmlFor)
 * 5. Error handling
 * 6. Keyboard navigation
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckboxField } from '../CheckboxField';
import '@testing-library/jest-dom';

// Test wrapper component
function TestWrapper({ 
  defaultValue = false, 
  schema,
  ...fieldProps 
}: any) {
  const { control, formState: { errors } } = useForm({
    defaultValues: { test: defaultValue },
    resolver: schema ? zodResolver(schema) : undefined,
  });

  return (
    <CheckboxField
      name="test"
      control={control}
      errors={errors}
      {...fieldProps}
    />
  );
}

describe('CheckboxField', () => {
  describe('Rendering', () => {
    it('renders checkbox with correct primitive class', () => {
      render(<TestWrapper label="Test Checkbox" />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveClass('ds-checkbox');
      expect(checkbox).not.toHaveClass('ds-input'); // Critical: NO text input class!
      expect(checkbox).not.toHaveClass('w-full'); // Checkboxes aren't full-width
    });

    it('renders label text', () => {
      render(<TestWrapper label="Accept Terms" />);
      
      expect(screen.getByText('Accept Terms')).toBeInTheDocument();
    });

    it('renders without label', () => {
      render(<TestWrapper />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('renders description helper text', () => {
      render(<TestWrapper description="This is helper text" />);
      
      expect(screen.getByText('This is helper text')).toBeInTheDocument();
    });

    it('shows required asterisk when required', () => {
      render(<TestWrapper label="Required Field" required />);
      
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('RHF Integration', () => {
    it('updates form value on change', async () => {
      const user = userEvent.setup();
      render(<TestWrapper label="Toggle me" />);
      
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
      
      await user.click(checkbox);
      expect(checkbox.checked).toBe(true);
      
      await user.click(checkbox);
      expect(checkbox.checked).toBe(false);
    });

    it('respects default value', () => {
      render(<TestWrapper label="Pre-checked" defaultValue={true} />);
      
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('can be controlled via form', () => {
      const { rerender } = render(<TestWrapper label="Controlled" defaultValue={false} />);
      
      let checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
      
      rerender(<TestWrapper label="Controlled" defaultValue={true} />);
      checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });
  });

  describe('ARIA Attributes', () => {
    it('has correct type attribute', () => {
      render(<TestWrapper label="Test" />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('type', 'checkbox');
    });

    it('connects label via htmlFor', () => {
      render(<TestWrapper label="Click Label" />);
      
      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('Click Label').closest('label');
      
      expect(label).toHaveAttribute('for', 'test');
      expect(checkbox).toHaveAttribute('id', 'test');
    });

    it('sets aria-required when required', () => {
      render(<TestWrapper label="Required" required />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-required', 'true');
    });

    it('sets aria-describedby when description present', () => {
      render(<TestWrapper label="Test" description="Helper text" />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-describedby', 'test-desc');
      
      const helperText = screen.getByText('Helper text');
      expect(helperText.parentElement).toHaveAttribute('id', 'test-desc');
    });

    it('sets aria-invalid on validation error', () => {
      const schema = z.object({
        test: z.boolean().refine((val) => val === true, {
          message: 'Must be checked',
        }),
      });

      render(<TestWrapper label="Required" required schema={schema} />);
      
      const checkbox = screen.getByRole('checkbox');
      // After validation triggers, aria-invalid should be true
      expect(checkbox).toHaveAttribute('aria-invalid');
    });
  });

  describe('Error Handling', () => {
    it('displays error message', () => {
      const schema = z.object({
        test: z.boolean().refine((val) => val === true, {
          message: 'You must accept the terms',
        }),
      });

      const { container } = render(
        <TestWrapper label="Terms" required schema={schema} />
      );

      // Error message should appear after validation
      expect(screen.getByText('You must accept the terms')).toBeInTheDocument();
    });

    it('error message has aria-live', () => {
      const schema = z.object({
        test: z.boolean().refine((val) => val === true, {
          message: 'Error text',
        }),
      });

      render(<TestWrapper label="Test" schema={schema} />);
      
      const errorText = screen.getByText('Error text');
      expect(errorText).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Keyboard Navigation', () => {
    it('can be toggled with Space key', async () => {
      const user = userEvent.setup();
      render(<TestWrapper label="Keyboard Test" />);
      
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      checkbox.focus();
      
      expect(checkbox.checked).toBe(false);
      
      await user.keyboard(' '); // Space key
      expect(checkbox.checked).toBe(true);
      
      await user.keyboard(' '); // Space key again
      expect(checkbox.checked).toBe(false);
    });

    it('is focusable', () => {
      render(<TestWrapper label="Focus Test" />);
      
      const checkbox = screen.getByRole('checkbox');
      checkbox.focus();
      
      expect(checkbox).toHaveFocus();
    });
  });

  describe('Disabled State', () => {
    it('disables checkbox when disabled prop is true', () => {
      render(<TestWrapper label="Disabled" disabled />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
    });

    it('prevents interaction when disabled', async () => {
      const user = userEvent.setup();
      render(<TestWrapper label="Disabled" disabled />);
      
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
      
      await user.click(checkbox);
      expect(checkbox.checked).toBe(false); // Should not change
    });
  });

  describe('Label Click Behavior', () => {
    it('toggles checkbox when label is clicked', async () => {
      const user = userEvent.setup();
      render(<TestWrapper label="Click My Label" />);
      
      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      const labelText = screen.getByText('Click My Label');
      
      expect(checkbox.checked).toBe(false);
      
      await user.click(labelText);
      expect(checkbox.checked).toBe(true);
    });
  });
});

describe('Refiner Contract', () => {
  it('enforces .ds-checkbox primitive (not .ds-input)', () => {
    render(<TestWrapper label="Primitive Test" />);
    
    const checkbox = screen.getByRole('checkbox');
    
    // CRITICAL: Verify correct primitive
    expect(checkbox.className).toContain('ds-checkbox');
    expect(checkbox.className).not.toContain('ds-input');
    expect(checkbox.className).not.toContain('w-full');
  });
});
