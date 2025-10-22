/**
 * CLEAN DEMO - 100% Semantic Token Showcase
 * 
 * Demonstrates Cascade OS with full brand/theme support.
 * ZERO hardcoded colors - everything adapts automatically.
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import {
  TextField,
  EmailField,
  PasswordField,
  SelectField,
  DateField,
} from '@joseph.ehler/wizard-react';
import { BrandThemeSwitcher } from './BrandThemeSwitcher';

export default function CleanDemo() {
  const { control, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data: any) => {
    console.log('✅ Form submitted:', data);
    alert('Form submitted! Check console for data.');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--ds-color-surface-subtle)',
      padding: '32px 16px',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{
          backgroundColor: 'var(--ds-color-surface-base)',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
          border: '1px solid var(--ds-color-border-subtle)',
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            margin: '0 0 8px 0',
            color: 'var(--ds-color-text-primary)',
          }}>
            🎨 Cascade OS Demo
          </h1>
          <p style={{
            fontSize: '16px',
            margin: 0,
            color: 'var(--ds-color-text-secondary)',
          }}>
            100% semantic tokens • Multi-brand • Light/Dark themes • Zero hardcoded colors
          </p>
          <p style={{
            fontSize: '14px',
            marginTop: '12px',
            padding: '12px',
            backgroundColor: 'var(--ds-color-surface-subtle)',
            borderRadius: '6px',
            color: 'var(--ds-color-text-secondary)',
            borderLeft: '3px solid var(--ds-color-primary-bg)',
          }}>
            👉 Click the <strong style={{ color: 'var(--ds-color-text-primary)' }}>🎨 button</strong> (bottom-right) to switch brands and toggle dark mode. Watch everything adapt instantly!
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          backgroundColor: 'var(--ds-color-surface-base)',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
          border: '1px solid var(--ds-color-border-subtle)',
        }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            
            <h2 style={{
              fontSize: '20px',
              fontWeight: 600,
              margin: '0 0 24px 0',
              color: 'var(--ds-color-text-primary)',
            }}>Personal Information</h2>
            
            <div className="ds-field">
              <EmailField
                name="email"
                label="Email Address"
                description="We'll never share your email"
                required
                placeholder="user@example.com"
                control={control}
                errors={errors}
                json={{}}
              />
            </div>

            <div className="ds-field">
              <PasswordField
                name="password"
                label="Password"
                description="At least 8 characters"
                required
                placeholder="••••••••"
                control={control}
                errors={errors}
                json={{}}
              />
            </div>

            <div className="ds-field">
              <TextField
                name="username"
                label="Username"
                description="Choose a unique username"
                required
                placeholder="johndoe"
                control={control}
                errors={errors}
                json={{}}
              />
            </div>

            <h2 style={{
              fontSize: '20px',
              fontWeight: 600,
              margin: '32px 0 24px 0',
              color: 'var(--ds-color-text-primary)',
            }}>Additional Details</h2>

            <div className="ds-field">
              <SelectField
                name="country"
                label="Country"
                description="Select your country of residence"
                placeholder="Choose a country"
                control={control}
                errors={errors}
                json={{ options: ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France'] }}
              />
            </div>

            <div className="ds-field">
              <DateField
                name="birthdate"
                label="Date of Birth"
                description="We use this to send birthday wishes"
                placeholder="Select date..."
                control={control}
                errors={errors}
                json={{}}
              />
            </div>

            {/* Submit */}
            <div style={{ marginTop: '32px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button type="submit" className="ds-button">
                Submit Form
              </button>
              <button type="button" className="ds-button ds-button--secondary">
                Cancel
              </button>
            </div>

          </form>
        </div>

        {/* Button Showcase */}
        <div style={{
          backgroundColor: 'var(--ds-color-surface-base)',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
          border: '1px solid var(--ds-color-border-subtle)',
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 600,
            margin: '0 0 20px 0',
            color: 'var(--ds-color-text-primary)',
          }}>🎨 All Button Variants</h3>
          
          <p style={{
            fontSize: '14px',
            margin: '0 0 16px 0',
            color: 'var(--ds-color-text-secondary)',
          }}>Hover buttons to see brand-aware focus rings and elevation</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button className="ds-button">Primary</button>
              <button className="ds-button ds-button--secondary">Secondary</button>
              <button className="ds-button ds-button--ghost">Ghost</button>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button className="ds-button ds-button--danger">Danger</button>
              <button className="ds-button ds-button--success">Success</button>
              <button className="ds-button ds-button--warning">Warning</button>
              <button className="ds-button ds-button--link">Link Button</button>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button className="ds-button" disabled>Disabled Primary</button>
              <button className="ds-button ds-button--secondary" disabled>Disabled Secondary</button>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div style={{
          backgroundColor: 'var(--ds-color-surface-base)',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
          border: '1px solid var(--ds-color-border-subtle)',
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 600,
            margin: '0 0 20px 0',
            color: 'var(--ds-color-text-primary)',
          }}>✨ Features</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: 'var(--ds-color-surface-subtle)',
              border: '1px solid var(--ds-color-border-subtle)',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎨</div>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px', color: 'var(--ds-color-text-primary)' }}>4 Brands</div>
              <div style={{ fontSize: '12px', color: 'var(--ds-color-text-secondary)' }}>Default, ACME, TechCorp, Sunset</div>
            </div>
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: 'var(--ds-color-surface-subtle)',
              border: '1px solid var(--ds-color-border-subtle)',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌙</div>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px', color: 'var(--ds-color-text-primary)' }}>Dark Mode</div>
              <div style={{ fontSize: '12px', color: 'var(--ds-color-text-secondary)' }}>Perfect contrast guaranteed</div>
            </div>
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: 'var(--ds-color-surface-subtle)',
              border: '1px solid var(--ds-color-border-subtle)',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px', color: 'var(--ds-color-text-primary)' }}>Zero Rebuild</div>
              <div style={{ fontSize: '12px', color: 'var(--ds-color-text-secondary)' }}>Runtime brand switching</div>
            </div>
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: 'var(--ds-color-surface-subtle)',
              border: '1px solid var(--ds-color-border-subtle)',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎯</div>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px', color: 'var(--ds-color-text-primary)' }}>100% Tokens</div>
              <div style={{ fontSize: '12px', color: 'var(--ds-color-text-secondary)' }}>No hardcoded colors</div>
            </div>
          </div>
        </div>

      </div>

      {/* Brand & Theme Switcher */}
      <BrandThemeSwitcher />
    </div>
  );
}
