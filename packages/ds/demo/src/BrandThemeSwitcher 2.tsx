/**
 * Brand & Theme Switcher
 * 
 * Runtime brand/theme switching without rebuilds.
 * Demonstrates Tailwind palette integration with semantic tokens.
 */

import React, { useState, useEffect } from 'react';
import { BRAND_PRESETS, type BrandKey } from '../../src/tokens/color.brand-presets';

export const BrandThemeSwitcher: React.FC = () => {
  const [brand, setBrand] = useState<BrandKey>('default');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isOpen, setIsOpen] = useState(false);
  
  // Apply to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-brand', brand);
    document.documentElement.setAttribute('data-theme', theme);
  }, [brand, theme]);
  
  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          backgroundColor: 'var(--ds-color-primary-bg)',
          color: 'var(--ds-color-primary-text)',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          fontSize: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        title="Brand & Theme Settings"
      >
        🎨
      </button>
      
      {/* Settings panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '320px',
            backgroundColor: 'var(--ds-color-surface-base)',
            border: `1px solid var(--ds-color-border-subtle)`,
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            padding: '20px',
            zIndex: 1000,
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ 
              margin: '0 0 12px 0', 
              fontSize: '16px', 
              fontWeight: 600,
              color: 'var(--ds-color-text-primary)',
            }}>
              🎨 Brand & Theme
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: '13px', 
              color: 'var(--ds-color-text-secondary)',
            }}>
              Switch brands and themes in real-time. No rebuild required!
            </p>
          </div>
          
          {/* Brand selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px', 
              fontWeight: 500,
              color: 'var(--ds-color-text-primary)',
            }}>
              Brand
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {Object.entries(BRAND_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => setBrand(key as BrandKey)}
                  style={{
                    padding: '12px',
                    backgroundColor: brand === key 
                      ? 'var(--ds-color-primary-bg)' 
                      : 'var(--ds-color-surface-subtle)',
                    color: brand === key 
                      ? 'var(--ds-color-primary-text)' 
                      : 'var(--ds-color-text-primary)',
                    border: `1px solid ${brand === key ? 'transparent' : 'var(--ds-color-border-subtle)'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                    textAlign: 'left',
                  }}
                >
                  <div>{preset.name}</div>
                  <div style={{ 
                    fontSize: '11px', 
                    opacity: brand === key ? 0.9 : 0.6,
                    marginTop: '4px',
                  }}>
                    {preset.brandHue}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Theme toggle */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px', 
              fontWeight: 500,
              color: 'var(--ds-color-text-primary)',
            }}>
              Theme
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '8px',
              backgroundColor: 'var(--ds-color-surface-subtle)',
              padding: '4px',
              borderRadius: '8px',
            }}>
              <button
                onClick={() => setTheme('light')}
                style={{
                  padding: '8px',
                  backgroundColor: theme === 'light' 
                    ? 'var(--ds-color-surface-base)' 
                    : 'transparent',
                  color: 'var(--ds-color-text-primary)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  boxShadow: theme === 'light' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                ☀️ Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                style={{
                  padding: '8px',
                  backgroundColor: theme === 'dark' 
                    ? 'var(--ds-color-surface-base)' 
                    : 'transparent',
                  color: 'var(--ds-color-text-primary)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  boxShadow: theme === 'dark' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                🌙 Dark
              </button>
            </div>
          </div>
          
          {/* Current config */}
          <div style={{ 
            marginTop: '20px', 
            padding: '12px', 
            backgroundColor: 'var(--ds-color-surface-subtle)',
            borderRadius: '8px',
          }}>
            <div style={{ 
              fontSize: '11px', 
              fontFamily: 'monospace',
              color: 'var(--ds-color-text-secondary)',
            }}>
              <div><strong>data-brand</strong>: "{brand}"</div>
              <div><strong>data-theme</strong>: "{theme}"</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
