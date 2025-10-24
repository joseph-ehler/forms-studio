/**
 * TestSelectField - Generated from spec with select recipe
 * 
 * This field uses the recipe system for overlay behavior.
 * DO NOT edit directly - regenerate from spec!
 * 
 * Generator: v2.6 (recipe-based)
 */

import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import { SimpleListRecipe } from '../../factory/recipes/SimpleListRecipe';

export interface TestSelectFieldProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  control?: Control;
  defaultValue?: string;
}

export const TestSelectField: React.FC<TestSelectFieldProps> = ({
  name,
  label = "Choose Option",
  description = "Test field for recipe-based generation",
  required = false,
  disabled = false,
  control: externalControl,
  defaultValue
}) => {
  const formContext = useFormContext();
  const control = externalControl || formContext?.control;
  const [isOpen, setIsOpen] = React.useState(false);
  
  if (!control) {
    throw new Error('TestSelectField must be used within a form context or receive control prop');
  }
  
  // Create recipe context
  const recipeCtx = {
    spec: {
      "ui": {
        "variant": "default",
        "density": "cozy",
        "size": "md",
        "searchable": true,
        "behavior": "default" as const,
        "focusSearchOnOpen": true,
        "multiple": false,
        "placeholder": "Select an option...",
        "clearable": true,
        "emptyState": {
          "message": "No options available",
          "icon": "search"
        }
      },
      "validation": {
        "sync": {
          "required": false
        },
        "required": false
      },
      "accessibility": {
        "label": true,
        "description": true
      },
      "performance": {
        "virtualizeAt": 50
      },
      "name": "TestSelectField",
      "type": "select",
      "label": "Choose Option",
      "description": "Test field for recipe-based generation",
      "required": false,
      "disabled": false,
      "options": [
        {
          "value": "option-1",
          "label": "First Option",
          "description": "This is the first option"
        },
        {
          "value": "option-2",
          "label": "Second Option",
          "description": "This is the second option"
        },
        {
          "value": "option-3",
          "label": "Third Option",
          "description": "This is the third option",
          "disabled": true
        },
        {
          "value": "option-4",
          "label": "Fourth Option"
        },
        {
          "value": "option-5",
          "label": "Fifth Option"
        }
      ],
      "value": {
        "default": ""
      },
      "aria": {
        "label": "Choose Option",
        "describedby": ""
      },
      "telemetry": {
        "enabled": false
      },
      "security": {
        "sanitize": false
      },
      "factory": {
        "version": "2.6",
        "recipe": "auto",
        "ignoreTransforms": []
      }
    },
    overlays: {},
    ports: {},
    env: { isMobile: false },
    control
  };
  
  // Get recipe components
  const { Trigger, Overlay } = SimpleListRecipe(recipeCtx as any);
  
  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      rules={{ required: required ? 'This field is required' : undefined }}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState.error;
        
        return (
          <div className="field-wrapper">
            {label && (
              <label htmlFor={name} className="ds-label">
                {label}{required && <span aria-label="required"> *</span>}
              </label>
            )}
            
            <Trigger 
              field={field}
              hasError={hasError}
              disabled={disabled}
            />
            
            <Overlay
              open={isOpen}
              onClose={() => setIsOpen(false)}
              field={field}
            />
            
            {description && (
              <p className="ds-helper-text">{description}</p>
            )}
            
            {hasError && fieldState.error?.message && (
              <p className="ds-error-text" role="alert">
                {fieldState.error.message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
};
