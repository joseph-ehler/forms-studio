/**
 * Class Canaries: Input
 * 
 * These tests verify behavioral contracts for Input class components.
 * They ensure that Checkbox, Radio, and Toggle behave correctly across
 * all states and interactions.
 * 
 * Run: pnpm test:canaries --class=Input
 */

import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { Checkbox } from '../../src/fb/Checkbox';
import { Radio } from '../../src/fb/Radio';
import { Toggle } from '../../src/fb/Toggle';

describe('Input Canaries: Checkbox', () => {
  test('Click toggles checked state', async () => {
    function ControlledCheckbox() {
      const [checked, setChecked] = useState(false);
      return (
        <label>
          <Checkbox 
            checked={checked} 
            onChange={(e) => setChecked(e.target.checked)}
            variant="default"
          />
          <span>Test checkbox</span>
        </label>
      );
    }

    render(<ControlledCheckbox />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    
    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  test('Keyboard Space toggles checked state', async () => {
    function ControlledCheckbox() {
      const [checked, setChecked] = useState(false);
      return (
        <Checkbox 
          checked={checked} 
          onChange={(e) => setChecked(e.target.checked)}
          variant="default"
        />
      );
    }

    render(<ControlledCheckbox />);
    
    const checkbox = screen.getByRole('checkbox');
    checkbox.focus();
    
    await userEvent.keyboard(' ');
    expect(checkbox).toBeChecked();
    
    await userEvent.keyboard(' ');
    expect(checkbox).not.toBeChecked();
  });

  test('Disabled checkbox cannot be toggled', async () => {
    const onChange = vi.fn();
    
    render(
      <Checkbox 
        checked={false} 
        onChange={onChange}
        disabled
        variant="default"
      />
    );
    
    const checkbox = screen.getByRole('checkbox');
    
    await userEvent.click(checkbox);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('Input Canaries: Radio', () => {
  test('Radio group: Exclusive selection', async () => {
    function RadioGroup() {
      const [value, setValue] = useState('');
      
      return (
        <div role="radiogroup">
          <label>
            <Radio 
              name="test-group" 
              value="option1"
              checked={value === 'option1'}
              onChange={(e) => setValue(e.target.value)}
              variant="default"
            />
            <span>Option 1</span>
          </label>
          <label>
            <Radio 
              name="test-group" 
              value="option2"
              checked={value === 'option2'}
              onChange={(e) => setValue(e.target.value)}
              variant="default"
            />
            <span>Option 2</span>
          </label>
        </div>
      );
    }

    render(<RadioGroup />);
    
    const radios = screen.getAllByRole('radio');
    const [radio1, radio2] = radios;
    
    // Initially unchecked
    expect(radio1).not.toBeChecked();
    expect(radio2).not.toBeChecked();
    
    // Select first
    await userEvent.click(radio1);
    expect(radio1).toBeChecked();
    expect(radio2).not.toBeChecked();
    
    // Select second (first should become unchecked)
    await userEvent.click(radio2);
    expect(radio1).not.toBeChecked();
    expect(radio2).toBeChecked();
  });

  test('Radio requires name for grouping', () => {
    const { container } = render(
      <>
        <Radio name="group1" value="a" checked={false} onChange={() => {}} variant="default" />
        <Radio name="group1" value="b" checked={false} onChange={() => {}} variant="default" />
      </>
    );
    
    const radios = container.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
      expect(radio.getAttribute('name')).toBe('group1');
    });
  });
});

describe('Input Canaries: Toggle', () => {
  test('Click toggles checked state', async () => {
    function ControlledToggle() {
      const [checked, setChecked] = useState(false);
      return (
        <Toggle 
          checked={checked} 
          onChange={setChecked}
          label="Test toggle"
          variant="default"
        />
      );
    }

    render(<ControlledToggle />);
    
    const toggle = screen.getByRole('checkbox'); // Toggle is a checkbox role
    expect(toggle).not.toBeChecked();
    
    await userEvent.click(toggle);
    expect(toggle).toBeChecked();
    
    await userEvent.click(toggle);
    expect(toggle).not.toBeChecked();
  });

  test('Keyboard Space toggles checked state', async () => {
    function ControlledToggle() {
      const [checked, setChecked] = useState(false);
      return (
        <Toggle 
          checked={checked} 
          onChange={setChecked}
          label="Test toggle"
          variant="default"
        />
      );
    }

    render(<ControlledToggle />);
    
    const toggle = screen.getByRole('checkbox');
    toggle.focus();
    
    await userEvent.keyboard(' ');
    expect(toggle).toBeChecked();
    
    await userEvent.keyboard(' ');
    expect(toggle).not.toBeChecked();
  });

  test('Disabled toggle cannot be toggled', async () => {
    const onChange = vi.fn();
    
    render(
      <Toggle 
        checked={false} 
        onChange={onChange}
        disabled
        label="Disabled toggle"
        variant="default"
      />
    );
    
    const toggle = screen.getByRole('checkbox');
    
    await userEvent.click(toggle);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('Input Canaries: ARIA Requirements', () => {
  test('Checkbox has proper ARIA role', () => {
    render(<Checkbox checked={false} onChange={() => {}} variant="default" />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  test('Radio has proper ARIA role', () => {
    render(<Radio name="test" checked={false} onChange={() => {}} variant="default" />);
    expect(screen.getByRole('radio')).toBeInTheDocument();
  });

  test('Toggle has proper ARIA role', () => {
    render(<Toggle checked={false} onChange={() => {}} label="Test" variant="default" />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });
});
