import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { ToggleField } from '../field/ToggleField';

// Test wrapper component
function TestWrapper({ 
  defaultValues = {}, 
  children, 
  onSubmit = () => {} 
}: { 
  defaultValues?: any; 
  children: (props: any) => React.ReactNode;
  onSubmit?: (data: any) => void;
}) {
  const { control, handleSubmit, formState: { errors }, setError } = useForm({ defaultValues });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {children({ control, errors, setError })}
    </form>
  );
}

describe('ToggleField', () => {
  // ============================================
  // Primitive Class Tests
  // ============================================
  
  describe('Primitive Class', () => {
    it('should use .ds-toggle class (not .ds-input)', () => {
      render(
        <TestWrapper>
          {({ control, errors }) => (
            <ToggleField
              name="testToggle"
              control={control}
              errors={errors}
              label="Test Toggle"
            />
          )}
        </TestWrapper>
      );
      
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveClass('ds-toggle');
      expect(toggle).not.toHaveClass('ds-input');
      expect(toggle).not.toHaveClass('ds-checkbox');
    });
    
    it('should not have w-full class', () => {
      render(
        <TestWrapper>
          {({ control, errors }) => (
            <ToggleField
              name="testToggle"
              control={control}
              errors={errors}
              label="Test Toggle"
            />
          )}
        </TestWrapper>
      );
      
      const toggle = screen.getByRole('switch');
      expect(toggle).not.toHaveClass('w-full');
    });
  });
  
  // ============================================
  // Semantic HTML Tests
  // ============================================
  
  describe('Semantic HTML', () => {
    it('should render as checkbox with switch role', () => {
      render(
        <TestWrapper>
          {({ control, errors }) => (
            <ToggleField
              name="testToggle"
              control={control}
              errors={errors}
              label="Test Toggle"
            />
          )}
        </TestWrapper>
      );
      
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('type', 'checkbox');
      expect(toggle).toHaveAttribute('role', 'switch');
    });
    
    it('should render label element wrapping input', () => {
      render(
        <TestWrapper>
          {({ control, errors }) => (
            <ToggleField
              name="testToggle"
              control={control}
              errors={errors}
              label="Test Label"
            />
          )}
        </TestWrapper>
      );
      
      const label = screen.getByText('Test Label').closest('label');
      expect(label).toBeInTheDocument();
      
      const toggle = screen.getByRole('switch');
      expect(label).toContainElement(toggle);
    });
  });
  
  // ============================================
  // ARIA Attributes Tests
  // ============================================
  
  describe('ARIA Attributes', () => {
    it('should have aria-checked reflecting state', () => {
      render(
        <TestWrapper defaultValues={{ testToggle: false }}>
          {({ control, errors }) => (
            <ToggleField
              name="testToggle"
              control={control}
              errors={errors}
              label="Test Toggle"
            />
          )}
        </TestWrapper>
      );
      
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'false');
    });
    
    it('should have aria-describedby when description provided', () => {
      render(
        <TestWrapper>
          {({ control, errors }) => (
            <ToggleField
              name="testToggle"
              control={control}
              errors={errors}
              label="Test Toggle"
              description="Test description"
            />
          )}
        </TestWrapper>
      );
      
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-describedby', 'testToggle-desc');
      
      const description = screen.getByText('Test description');
      expect(description.parentElement).toHaveAttribute('id', 'testToggle-desc');
    });
    
    it('should have aria-required when required', () => {
      render(
        <TestWrapper>
          {({ control, errors }) => (
            <ToggleField
              name="testToggle"
              control={control}
              errors={errors}
              label="Test Toggle"
              required
            />
          )}
        </TestWrapper>
      );
      
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-required', 'true');
    });
    
    it('should have aria-invalid when error present', async () => {
      render(
        <TestWrapper>
          {({ control, errors, setError }) => {
            React.useEffect(() => {
              setError('testToggle', { type: 'required', message: 'Required field' });
            }, [setError]);
            
            return (
              <ToggleField
                name="testToggle"
                control={control}
                errors={errors}
                label="Test Toggle"
              />
            );
          }}
        </TestWrapper>
      );
      
      await waitFor(() => {
        const toggle = screen.getByRole('switch');
        expect(toggle).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });
  
  // ============================================
  // RHF Integration Tests
  // ============================================
  
  describe('React Hook Form Integration', () => {
    it('should register with RHF and update value', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();
      
      render(
        <TestWrapper onSubmit={onSubmit}>
          {({ control, errors }) => (
            <>
              <ToggleField
                name="testToggle"
                control={control}
                errors={errors}
                label="Test Toggle"
              />
              <button type="submit">Submit</button>
            </>
          )}
        </TestWrapper>
      );
      
      const toggle = screen.getByRole('switch');
      const submitButton = screen.getByText('Submit');
      
      // Initial value should be false
      await user.click(submitButton);
      expect(onSubmit).toHaveBeenCalledWith({ testToggle: false }, expect.anything());
      
      // Toggle on
      await user.click(toggle);
      await user.click(submitButton);
      expect(onSubmit).toHaveBeenCalledWith({ testToggle: true }, expect.anything());
      
      // Toggle off
      await user.click(toggle);
      await user.click(submitButton);
      expect(onSubmit).toHaveBeenCalledWith({ testToggle: false }, expect.anything());
    });
    
    it('should respect default value', () => {
      render(
        <TestWrapper defaultValues={{ testToggle: true }}>
          {({ control, errors }) => (
            <ToggleField
              name="testToggle"
              control={control}
              errors={errors}
              label="Test Toggle"
            />
          )}
        </TestWrapper>
      );
      
      const toggle = screen.getByRole('switch') as HTMLInputElement;
      expect(toggle.checked).toBe(true);
    });
    
    it('should show error message when validation fails', async () => {
      render(
        <TestWrapper>
          {({ control, errors, setError }) => {
            React.useEffect(() => {
              setError('testToggle', { 
                type: 'required', 
                message: 'You must accept the terms' 
              });
            }, [setError]);
            
            return (
              <ToggleField
                name="testToggle"
                control={control}
                errors={errors}
                label="Accept Terms"
                required
              />
            );
          }}
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByText('You must accept the terms')).toBeInTheDocument();
      });
    });
  });
  
  // ============================================
  // Keyboard Interaction Tests
  // ============================================
  
  describe('Keyboard Interaction', () => {
    it('should toggle with Space key', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          {({ control, errors }) => (
            <ToggleField
              name="testToggle"
              control={control}
              errors={errors}
              label="Test Toggle"
            />
          )}
        </TestWrapper>
      );
      
      const toggle = screen.getByRole('switch') as HTMLInputElement;
      
      expect(toggle.checked).toBe(false);
      
      toggle.focus();
      await user.keyboard(' ');
      
      expect(toggle.checked).toBe(true);
    });
    
    it('should toggle with Enter key', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          {({ control, errors }) => (
            <ToggleField
              name="testToggle"
              control={control}
              errors={errors}
              label="Test Toggle"
            />
          )}
        </TestWrapper>
      );
      
      const toggle = screen.getByRole('switch') as HTMLInputElement;
      
      expect(toggle.checked).toBe(false);
      
      toggle.focus();
      await user.keyboard('{Enter}');
      
      expect(toggle.checked).toBe(true);
    });
    
    it('should be keyboard focusable', () => {
      render(
        <TestWrapper>
          {({ control, errors }) => (
            <ToggleField
              name="testToggle"
              control={control}
              errors={errors}
              label="Test Toggle"
            />
          )}
        </TestWrapper>
      );
      
      const toggle = screen.getByRole('switch');
      toggle.focus();
      
      expect(toggle).toHaveFocus();
    });
  });
  
  // ============================================
  // Disabled State Tests
  // ============================================
  
  describe('Disabled State', () => {
    it('should render as disabled when disabled prop is true', () => {
      render(
        <TestWrapper>
          {({ control, errors }) => (
            <ToggleField
              name="testToggle"
              control={control}
              errors={errors}
              label="Test Toggle"
              disabled
            />
          )}
        </TestWrapper>
      );
      
      const toggle = screen.getByRole('switch');
      expect(toggle).toBeDisabled();
    });
    
    it('should not toggle when disabled', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          {({ control, errors }) => (
            <ToggleField
              name="testToggle"
              control={control}
              errors={errors}
              label="Test Toggle"
              disabled
            />
          )}
        </TestWrapper>
      );
      
      const toggle = screen.getByRole('switch') as HTMLInputElement;
      
      expect(toggle.checked).toBe(false);
      
      await user.click(toggle);
      
      expect(toggle.checked).toBe(false);
    });
    
    it('should have not-allowed cursor when disabled', () => {
      render(
        <TestWrapper>
          {({ control, errors }) => (
            <ToggleField
              name="testToggle"
              control={control}
              errors={errors}
              label="Test Toggle"
              disabled
            />
          )}
        </TestWrapper>
      );
      
      const label = screen.getByText('Test Toggle').closest('label');
      expect(label).toHaveStyle({ cursor: 'not-allowed' });
    });
  });
  
  // ============================================
  // Label Interaction Tests
  // ============================================
  
  describe('Label Interaction', () => {
    it('should toggle when label is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          {({ control, errors }) => (
            <ToggleField
              name="testToggle"
              control={control}
              errors={errors}
              label="Click Me"
            />
          )}
        </TestWrapper>
      );
      
      const toggle = screen.getByRole('switch') as HTMLInputElement;
      const label = screen.getByText('Click Me');
      
      expect(toggle.checked).toBe(false);
      
      await user.click(label);
      
      expect(toggle.checked).toBe(true);
    });
    
    it('should show required asterisk when required', () => {
      render(
        <TestWrapper>
          {({ control, errors }) => (
            <ToggleField
              name="testToggle"
              control={control}
              errors={errors}
              label="Required Field"
              required
            />
          )}
        </TestWrapper>
      );
      
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });
  
  // ============================================
  // Touch Target Tests
  // ============================================
  
  describe('Touch Target', () => {
    it('should have minimum 44px height for touch target', () => {
      render(
        <TestWrapper>
          {({ control, errors }) => (
            <ToggleField
              name="testToggle"
              control={control}
              errors={errors}
              label="Test Toggle"
            />
          )}
        </TestWrapper>
      );
      
      const label = screen.getByText('Test Toggle').closest('label');
      expect(label).toHaveStyle({ minHeight: '44px' });
    });
  });
});

// Add React import
import React from 'react';
