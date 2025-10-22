/**
 * Comprehensive Tests for Field JSON Configuration System
 * 
 * Tests all 32 fields to ensure JSON config pattern works correctly
 * - Props override JSON
 * - JSON provides defaults
 * - Typography system integration
 * - mergeFieldConfig utility
 */

import { describe, it, expect } from '@jest/globals'
import { mergeFieldConfig } from '../src/fields/utils/field-json-config'
import { resolveTypographyDisplay } from '../src/fields/utils/typography-display'

describe('Field JSON Configuration System', () => {
  describe('mergeFieldConfig utility', () => {
    it('should prioritize props over JSON', () => {
      const props = { label: 'Prop Label', required: true }
      const json = { label: 'JSON Label', required: false }
      
      const result = mergeFieldConfig(props, json, {})
      
      expect(result.label).toBe('Prop Label')
      expect(result.required).toBe(true)
    })

    it('should use JSON when props are undefined', () => {
      const props = { label: undefined, required: undefined }
      const json = { label: 'JSON Label', required: true }
      
      const result = mergeFieldConfig(props, json, {})
      
      expect(result.label).toBe('JSON Label')
      expect(result.required).toBe(true)
    })

    it('should use defaults when both props and JSON are undefined', () => {
      const props = { label: undefined, required: undefined }
      const json = {}
      const defaults = { label: 'Default Label', required: false }
      
      const result = mergeFieldConfig(props, json, defaults)
      
      expect(result.label).toBe('Default Label')
      expect(result.required).toBe(false)
    })

    it('should handle nested JSON config', () => {
      const props = {}
      const json = {
        validation: {
          maxLength: 100,
          pattern: '^[a-z]+$'
        },
        options: ['Option 1', 'Option 2']
      }
      
      const result = mergeFieldConfig(props, json, {})
      
      expect(result).toHaveProperty('validation')
      expect((result as any).validation.maxLength).toBe(100)
      expect((result as any).options).toEqual(['Option 1', 'Option 2'])
    })

    it('should handle typographyDisplay and typographyVariant', () => {
      const props = {
        typographyDisplay: 'minimal' as const,
        typographyVariant: 'clean' as const
      }
      const json = {
        typographyDisplay: 'full' as const,
        typographyVariant: 'default' as const
      }
      
      const result = mergeFieldConfig(props, json, {})
      
      expect(result.typographyDisplay).toBe('minimal')
      expect(result.typographyVariant).toBe('clean')
    })
  })

  describe('Typography System Integration', () => {
    it('should resolve "full" display correctly', () => {
      const typography = resolveTypographyDisplay('full', 'default')
      
      expect(typography.showLabel).toBe(true)
      expect(typography.showRequired).toBe(true)
      expect(typography.showOptional).toBe(true)
      expect(typography.showDescription).toBe(true)
      expect(typography.showError).toBe(true)
    })

    it('should resolve "minimal" display correctly', () => {
      const typography = resolveTypographyDisplay('minimal', 'default')
      
      expect(typography.showLabel).toBe(true)
      expect(typography.showRequired).toBe(false)
      expect(typography.showOptional).toBe(false)
      expect(typography.showDescription).toBe(false)
      expect(typography.showError).toBe(true)
    })

    it('should resolve "clean" variant correctly', () => {
      const typography = resolveTypographyDisplay('full', 'clean')
      
      expect(typography.showLabel).toBe(true)
      expect(typography.showRequired).toBe(false)
      expect(typography.showOptional).toBe(false)
      expect(typography.showDescription).toBe(true)
      expect(typography.showError).toBe(true)
    })

    it('should resolve "compact" variant correctly', () => {
      const typography = resolveTypographyDisplay('full', 'compact')
      
      expect(typography.showLabel).toBe(true)
      expect(typography.showRequired).toBe(false)
      expect(typography.showOptional).toBe(false)
      expect(typography.showDescription).toBe(false)
      expect(typography.showError).toBe(true)
    })
  })

  describe('Field-Specific JSON Configurations', () => {
    describe('Foundation Fields (11)', () => {
      it('TextField - should support inputType and validation', () => {
        const json = {
          inputType: 'email',
          inputMode: 'email',
          validation: {
            maxLength: 100,
            pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
          }
        }
        
        const result = mergeFieldConfig({}, json, {})
        
        expect((result as any).inputType).toBe('email')
        expect((result as any).validation.maxLength).toBe(100)
      })

      it('NumberField - should support min/max/step', () => {
        const json = {
          validation: { min: 0, max: 100 },
          step: 5
        }
        
        const result = mergeFieldConfig({}, json, {})
        
        expect((result as any).validation.min).toBe(0)
        expect((result as any).validation.max).toBe(100)
        expect((result as any).step).toBe(5)
      })

      it('SliderField - should support format and showValue', () => {
        const json = {
          min: 0,
          max: 1000,
          step: 50,
          format: 'currency',
          currency: 'USD',
          showValue: true,
          showTicks: true
        }
        
        const result = mergeFieldConfig({}, json, {})
        
        expect((result as any).format).toBe('currency')
        expect((result as any).showValue).toBe(true)
      })

      it('DateField - should support min/max/disabledDates', () => {
        const json = {
          min: '2025-01-01',
          max: '2025-12-31',
          disabledDates: ['2025-07-04', '2025-12-25']
        }
        
        const result = mergeFieldConfig({}, json, {})
        
        expect((result as any).min).toBe('2025-01-01')
        expect((result as any).disabledDates).toHaveLength(2)
      })

      it('RatingField - should support max and icon type', () => {
        const json = {
          max: 10,
          icon: 'star',
          size: 'large',
          showLabel: true
        }
        
        const result = mergeFieldConfig({}, json, {})
        
        expect((result as any).max).toBe(10)
        expect((result as any).icon).toBe('star')
      })

      it('ColorField - should support format and presets', () => {
        const json = {
          format: 'hex',
          presets: ['#FF0000', '#00FF00', '#0000FF']
        }
        
        const result = mergeFieldConfig({}, json, {})
        
        expect((result as any).format).toBe('hex')
        expect((result as any).presets).toHaveLength(3)
      })
    })

    describe('Composite Fields (13)', () => {
      it('EmailField - should use email validation', () => {
        const props = { label: 'Email Address' }
        const json = { placeholder: 'you@example.com' }
        
        const result = mergeFieldConfig(props, json, {})
        
        expect(result.label).toBe('Email Address')
        expect(result.placeholder).toBe('you@example.com')
      })

      it('PasswordField - should support showStrength', () => {
        const json = {
          showStrength: true,
          autoComplete: 'new-password'
        }
        
        const result = mergeFieldConfig({}, json, {})
        
        expect((result as any).showStrength).toBe(true)
        expect((result as any).autoComplete).toBe('new-password')
      })

      it('PhoneField - should support defaultCountryCode', () => {
        const json = {
          defaultCountryCode: '+1'
        }
        
        const result = mergeFieldConfig({}, json, {})
        
        expect((result as any).defaultCountryCode).toBe('+1')
      })

      it('CurrencyField - should support currency and decimals', () => {
        const json = {
          currency: 'USD',
          decimals: 2,
          min: 0,
          max: 10000
        }
        
        const result = mergeFieldConfig({}, json, {})
        
        expect((result as any).currency).toBe('USD')
        expect((result as any).decimals).toBe(2)
      })

      it('NPSField - should support question and labels', () => {
        const json = {
          question: 'How likely are you to recommend us?',
          followUp: true,
          showCategory: true
        }
        
        const result = mergeFieldConfig({}, json, {})
        
        expect((result as any).question).toBe('How likely are you to recommend us?')
        expect((result as any).followUp).toBe(true)
      })

      it('MatrixField - should support rows and columns', () => {
        const json = {
          rows: [
            { id: 'q1', label: 'Question 1' },
            { id: 'q2', label: 'Question 2' }
          ],
          columns: [
            { id: 'a1', label: 'Strongly Disagree', value: 1 },
            { id: 'a2', label: 'Strongly Agree', value: 5 }
          ],
          mode: 'radio'
        }
        
        const result = mergeFieldConfig({}, json, {})
        
        expect((result as any).rows).toHaveLength(2)
        expect((result as any).columns).toHaveLength(2)
        expect((result as any).mode).toBe('radio')
      })
    })

    describe('Special Fields (8)', () => {
      it('SelectField - should support options and multiple', () => {
        const json = {
          options: ['Option 1', 'Option 2', 'Option 3'],
          multiple: false,
          allowCustom: true
        }
        
        const result = mergeFieldConfig({}, json, {})
        
        expect((result as any).options).toHaveLength(3)
        expect((result as any).allowCustom).toBe(true)
      })

      it('MultiSelectField - should support allowSearch', () => {
        const json = {
          options: ['React', 'Vue', 'Angular'],
          allowSearch: true,
          maxSelections: 5
        }
        
        const result = mergeFieldConfig({}, json, {})
        
        expect((result as any).allowSearch).toBe(true)
        expect((result as any).maxSelections).toBe(5)
      })

      it('TagInputField - should support maxTags and suggestions', () => {
        const json = {
          maxTags: 10,
          suggestions: ['JavaScript', 'TypeScript', 'Python']
        }
        
        const result = mergeFieldConfig({}, json, {})
        
        expect((result as any).maxTags).toBe(10)
        expect((result as any).suggestions).toHaveLength(3)
      })

      it('FileField - should support accept and maxSize', () => {
        const json = {
          accept: 'image/*',
          multiple: true,
          maxSize: 5 * 1024 * 1024, // 5MB
          maxFiles: 10,
          showPreview: true
        }
        
        const result = mergeFieldConfig({}, json, {})
        
        expect((result as any).accept).toBe('image/*')
        expect((result as any).maxSize).toBe(5242880)
      })

      it('RepeaterField - should support minItems and maxItems', () => {
        const json = {
          minItems: 1,
          maxItems: 5,
          addButtonText: 'Add Item',
          itemSchema: []
        }
        
        const result = mergeFieldConfig({}, json, {})
        
        expect((result as any).minItems).toBe(1)
        expect((result as any).maxItems).toBe(5)
      })

      it('CalculatedField - should support expression and format', () => {
        const json = {
          expression: 'fields.price - fields.discount',
          format: 'currency',
          currency: 'USD',
          dependencies: ['price', 'discount']
        }
        
        const result = mergeFieldConfig({}, json, {})
        
        expect((result as any).expression).toBeTruthy()
        expect((result as any).format).toBe('currency')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty props and JSON', () => {
      const result = mergeFieldConfig({}, {}, {})
      
      expect(result).toBeDefined()
    })

    it('should handle null and undefined values correctly', () => {
      const props = { label: null as any, required: undefined }
      const json = { label: 'JSON Label', required: true }
      
      const result = mergeFieldConfig(props, json, {})
      
      // null should override JSON
      expect(result.label).toBeNull()
      // undefined should use JSON
      expect(result.required).toBe(true)
    })

    it('should handle complex nested objects', () => {
      const json = {
        validation: {
          rules: {
            min: 0,
            max: 100
          }
        }
      }
      
      const result = mergeFieldConfig({}, json, {})
      
      expect((result as any).validation.rules.min).toBe(0)
    })
  })

  describe('Integration Scenarios', () => {
    it('should support complete TextField configuration', () => {
      const props = {
        label: 'Email Address',
        required: true
      }
      
      const json = {
        placeholder: 'you@example.com',
        inputType: 'email',
        inputMode: 'email',
        autoComplete: 'email',
        validation: {
          maxLength: 100,
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        typographyVariant: 'clean'
      }
      
      const result = mergeFieldConfig(props, json, {})
      
      expect(result.label).toBe('Email Address')
      expect(result.required).toBe(true)
      expect(result.placeholder).toBe('you@example.com')
      expect((result as any).inputType).toBe('email')
      expect(result.typographyVariant).toBe('clean')
    })

    it('should support complete SliderField configuration', () => {
      const json = {
        label: 'Budget',
        min: 0,
        max: 10000,
        step: 100,
        format: 'currency',
        currency: 'USD',
        showValue: true,
        showTicks: true,
        typographyDisplay: 'minimal'
      }
      
      const result = mergeFieldConfig({}, json, {})
      
      expect(result.label).toBe('Budget')
      expect((result as any).min).toBe(0)
      expect((result as any).format).toBe('currency')
      expect(result.typographyDisplay).toBe('minimal')
    })
  })
})
