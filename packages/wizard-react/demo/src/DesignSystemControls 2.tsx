/**
 * Design System Controls - Live Tuning Playground
 * 
 * Interactive sliders to adjust typography and spacing in real-time.
 * Changes are applied via CSS variables instantly.
 */

import React, { useState, useEffect } from 'react';

export const DesignSystemControls: React.FC = () => {
  // Typography
  const [labelSize, setLabelSize] = useState(16);
  const [labelWeight, setLabelWeight] = useState(600);
  const [helperSize, setHelperSize] = useState(14);
  
  // Spacing
  const [labelGap, setLabelGap] = useState(6);
  const [helperGap, setHelperGap] = useState(6);
  const [fieldGap, setFieldGap] = useState(20);
  const [sectionBreak, setSectionBreak] = useState(32);
  
  // Radius
  const [inputRadius, setInputRadius] = useState(6);
  const [buttonRadius, setButtonRadius] = useState(8);
  
  // Interactive
  const [inputHeight, setInputHeight] = useState(48);
  const [buttonHeight, setButtonHeight] = useState(48);
  const [iconSize, setIconSize] = useState(20);
  
  // Colors (using HSL for easy manipulation)
  const [primaryHue, setPrimaryHue] = useState(217); // Blue
  const [successHue, setSuccessHue] = useState(142); // Green
  const [errorHue, setErrorHue] = useState(0);      // Red
  
  // Shadows
  const [shadowIntensity, setShadowIntensity] = useState(0.1); // 0-1
  
  // Transitions
  const [transitionSpeed, setTransitionSpeed] = useState(200); // ms
  
  const [isOpen, setIsOpen] = useState(false);

  // Export token configuration
  const exportTokens = () => {
    const tokenConfig = {
      version: '0.2.0',
      generatedAt: new Date().toISOString(),
      source: 'playground',
      tokens: {
        typography: {
          size: {
            label: `${labelSize}px`,
            helper: `${helperSize}px`,
          },
          weight: {
            label: labelWeight,
          },
        },
        spacing: {
          form: {
            labelGap: `${labelGap}px`,
            helperGap: `${helperGap}px`,
            fieldGap: `${fieldGap}px`,
            sectionBreak: `${sectionBreak}px`,
          },
        },
        radius: {
          input: `${inputRadius}px`,
          button: `${buttonRadius}px`,
        },
        interactive: {
          minHeight: {
            input: `${inputHeight}px`,
            button: `${buttonHeight}px`,
          },
          iconSize: {
            md: `${iconSize}px`,
          },
        },
        colors: {
          primary: {
            hue: primaryHue,
            css: `hsl(${primaryHue}, 83%, 53%)`,
          },
          success: {
            hue: successHue,
            css: `hsl(${successHue}, 76%, 36%)`,
          },
          error: {
            hue: errorHue,
            css: `hsl(${errorHue}, 72%, 51%)`,
          },
        },
        effects: {
          shadowIntensity: shadowIntensity,
          transitionSpeed: `${transitionSpeed}ms`,
        },
      },
    };
    
    // Download as JSON
    const blob = new Blob([JSON.stringify(tokenConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cascade-tokens-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Also copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(tokenConfig, null, 2));
    
    alert('✅ Tokens exported!\n\n📋 Copied to clipboard\n💾 Downloaded as JSON\n\n👉 Create a PR with these tokens to update the design system');
  };

  // Apply changes to CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty('--ds-label-size', `${labelSize}px`);
    document.documentElement.style.setProperty('--ds-label-weight', `${labelWeight}`);
    document.documentElement.style.setProperty('--ds-helper-size', `${helperSize}px`);
    document.documentElement.style.setProperty('--ds-label-gap', `${labelGap}px`);
    document.documentElement.style.setProperty('--ds-helper-gap', `${helperGap}px`);
    document.documentElement.style.setProperty('--ds-field-gap', `${fieldGap}px`);
    document.documentElement.style.setProperty('--ds-section-break', `${sectionBreak}px`);
    
    // Apply to actual classes
    const style = document.getElementById('ds-override-style') || document.createElement('style');
    style.id = 'ds-override-style';
    style.textContent = `
      /* Typography */
      .ds-label--md {
        font-size: ${labelSize}px !important;
        font-weight: ${labelWeight} !important;
      }
      .ds-label {
        margin-bottom: ${labelGap}px !important;
      }
      .ds-helper--sm {
        font-size: ${helperSize}px !important;
        margin-top: ${helperGap}px !important;
      }
      
      /* Spacing */
      .ds-field {
        margin-bottom: ${fieldGap}px !important;
      }
      .ds-section-heading {
        margin-top: ${sectionBreak}px !important;
      }
      
      /* Radius - Inputs only (not buttons/sliders/radio/checkbox) */
      input[type="text"],
      input[type="email"],
      input[type="password"],
      input[type="tel"],
      input[type="date"],
      input[type="time"],
      input[type="number"],
      input[type="search"],
      select,
      textarea,
      .ds-input {
        border-radius: ${inputRadius}px !important;
      }
      
      /* Radius - Buttons only (form actions, not field components) */
      form > button[type="submit"],
      form > div button[type="submit"],
      form button[type="submit"],
      .ds-button,
      button.ds-button,
      input[type="submit"],
      input[type="button"] {
        border-radius: ${buttonRadius}px !important;
      }
      
      /* Interactive Sizing - Inputs only (not buttons/sliders/radio/checkbox) */
      input[type="text"],
      input[type="email"],
      input[type="password"],
      input[type="tel"],
      input[type="date"],
      input[type="time"],
      input[type="number"],
      input[type="search"],
      select,
      .ds-input {
        min-height: ${inputHeight}px !important;
        height: auto !important;
        box-sizing: border-box !important;
      }
      
      /* Interactive Sizing - Buttons only (form actions, not field components) */
      form > button[type="submit"],
      form > div button[type="submit"],
      form button[type="submit"],
      .ds-button,
      button.ds-button,
      input[type="submit"],
      input[type="button"] {
        min-height: ${buttonHeight}px !important;
        height: auto !important;
        box-sizing: border-box !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
      }
      .ds-icon--md, svg {
        width: ${iconSize}px !important;
        height: ${iconSize}px !important;
      }
      
      /* Colors - Primary (buttons, focus) - Only non-variant buttons */
      .ds-button:not([class*="--"]) {
        background-color: hsl(${primaryHue}, 83%, 53%) !important;
      }
      .ds-button:not([class*="--"]):hover {
        background-color: hsl(${primaryHue}, 83%, 43%) !important;
      }
      .ds-input:focus {
        border-color: hsl(${primaryHue}, 83%, 60%) !important;
        box-shadow: 0 0 0 3px hsla(${primaryHue}, 83%, 60%, 0.1) !important;
      }
      
      /* Colors - Semantic */
      .ds-helper--success, [data-ds="helper"].ds-helper--success {
        color: hsl(${successHue}, 76%, 36%) !important;
      }
      .ds-helper--error, [data-ds="helper"].ds-helper--error {
        color: hsl(${errorHue}, 72%, 51%) !important;
      }
      .ds-helper--warning, [data-ds="helper"].ds-helper--warning {
        color: hsl(45, 93%, 47%) !important;
      }
      .ds-helper--hint, [data-ds="helper"].ds-helper--hint {
        color: rgb(107, 114, 128) !important;
      }
      
      /* Shadows - Flat by default, elevation on hover */
      .ds-input {
        box-shadow: none !important; /* FLAT always */
      }
      .ds-button:not([class*="--"]) {
        box-shadow: none !important; /* FLAT at rest */
      }
      .ds-button:not([class*="--"]):hover {
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, ${shadowIntensity * 1.6}), 0 8px 16px -4px rgba(0, 0, 0, ${shadowIntensity * 1.2}) !important;
        transform: translateY(-1px) !important;
      }
      .ds-button:not([class*="--"]):active {
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, ${shadowIntensity * 1.2}), 0 4px 8px -2px rgba(0, 0, 0, ${shadowIntensity * 0.8}) !important;
        transform: translateY(0px) !important;
      }
      
      /* Transitions */
      .ds-input, .ds-button {
        transition: all ${transitionSpeed}ms cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
    `;
    
    if (!document.head.contains(style)) {
      document.head.appendChild(style);
    }
  }, [labelSize, labelWeight, helperSize, labelGap, helperGap, fieldGap, sectionBreak, inputRadius, buttonRadius, inputHeight, buttonHeight, iconSize, primaryHue, successHue, errorHue, shadowIntensity, transitionSpeed]);

  const reset = () => {
    setLabelSize(16);
    setLabelWeight(600);
    setHelperSize(14);
    setLabelGap(6);
    setHelperGap(6);
    setFieldGap(20);
    setSectionBreak(32);
    setInputRadius(6);
    setButtonRadius(8);
    setInputHeight(48);
    setButtonHeight(48);
    setIconSize(20);
    setPrimaryHue(217);
    setSuccessHue(142);
    setErrorHue(0);
    setShadowIntensity(0.1);
    setTransitionSpeed(200);
  };

  const exportValues = () => {
    const config = {
      typography: {
        label: { size: labelSize, weight: labelWeight },
        helper: { size: helperSize },
      },
      spacing: {
        labelGap,
        helperGap,
        fieldGap,
        sectionBreak,
      },
      radius: {
        input: inputRadius,
        button: buttonRadius,
      },
      interactive: {
        inputHeight,
        buttonHeight,
        iconSize,
      }
    };
    
    console.log('Design System Config:', config);
    console.log('\n// Copy to tokens:');
    console.log(`RADIUS_TOKENS.md = '${inputRadius}px'`);
    console.log(`RADIUS_TOKENS.lg = '${buttonRadius}px'`);
    console.log(`INTERACTIVE_TOKENS.minHeight.mobile = '${inputHeight}px'`);
    alert('Config exported to console! Check DevTools.');
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '16px 20px',
          backgroundColor: 'rgb(37, 99, 235)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontWeight: 600,
          fontSize: '14px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 10000,
        }}
      >
        🎛️ Design System Controls {isOpen ? '▼' : '▲'}
      </button>

      {/* Control Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            width: '400px',
            maxHeight: '600px',
            overflowY: 'auto',
            backgroundColor: 'white',
            border: '1px solid rgb(209, 213, 219)',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            padding: '20px',
            zIndex: 9999,
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 700 }}>
            🎛️ Live Design System
          </h3>
          
          <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'rgb(107, 114, 128)' }}>
            Adjust values and see changes instantly!
          </p>

          {/* Typography Section */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'rgb(55, 65, 81)' }}>
              Typography
            </h4>
            
            <Slider
              label="Label Size"
              value={labelSize}
              onChange={setLabelSize}
              min={12}
              max={24}
              unit="px"
            />
            
            <Slider
              label="Label Weight"
              value={labelWeight}
              onChange={setLabelWeight}
              min={400}
              max={700}
              step={100}
            />
            
            <Slider
              label="Helper Size"
              value={helperSize}
              onChange={setHelperSize}
              min={10}
              max={18}
              unit="px"
            />
          </div>

          {/* Spacing Section */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'rgb(55, 65, 81)' }}>
              Spacing
            </h4>
            
            <Slider
              label="Label → Input Gap"
              value={labelGap}
              onChange={setLabelGap}
              min={0}
              max={16}
              unit="px"
            />
            
            <Slider
              label="Input → Helper Gap"
              value={helperGap}
              onChange={setHelperGap}
              min={0}
              max={16}
              unit="px"
            />
            
            <Slider
              label="Field → Field Gap"
              value={fieldGap}
              onChange={setFieldGap}
              min={8}
              max={40}
              unit="px"
            />
            
            <Slider
              label="Section Break"
              value={sectionBreak}
              onChange={setSectionBreak}
              min={16}
              max={64}
              unit="px"
            />
          </div>

          {/* Radius Section */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'rgb(55, 65, 81)' }}>
              Border Radius
            </h4>
            
            <Slider
              label="Input Radius"
              value={inputRadius}
              onChange={setInputRadius}
              min={0}
              max={30}
              unit="px"
            />
            {inputRadius >= 24 && (
              <div style={{ fontSize: '11px', color: 'rgb(37, 99, 235)', marginTop: '-8px', marginBottom: '12px' }}>
                💊 Pill mode (fully rounded)
              </div>
            )}
            
            <Slider
              label="Button Radius"
              value={buttonRadius}
              onChange={setButtonRadius}
              min={0}
              max={30}
              unit="px"
            />
            {buttonRadius >= 24 && (
              <div style={{ fontSize: '11px', color: 'rgb(37, 99, 235)', marginTop: '-8px', marginBottom: '12px' }}>
                💊 Pill mode (fully rounded)
              </div>
            )}
          </div>

          {/* Interactive Section */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'rgb(55, 65, 81)' }}>
              Interactive Sizing
            </h4>
            
            <Slider
              label="Input Height"
              value={inputHeight}
              onChange={setInputHeight}
              min={28}
              max={72}
              unit="px"
            />
            
            <Slider
              label="Button Height"
              value={buttonHeight}
              onChange={setButtonHeight}
              min={28}
              max={72}
              unit="px"
            />
            
            <Slider
              label="Icon Size"
              value={iconSize}
              onChange={setIconSize}
              min={12}
              max={32}
              unit="px"
            />
            
            {/* Touch Target Indicator */}
            <div style={{ 
              marginTop: '12px', 
              padding: '8px 12px', 
              backgroundColor: inputHeight >= 44 && buttonHeight >= 44 ? 'rgb(220, 252, 231)' : 'rgb(254, 242, 242)',
              borderRadius: '6px',
              fontSize: '12px',
              color: inputHeight >= 44 && buttonHeight >= 44 ? 'rgb(22, 101, 52)' : 'rgb(153, 27, 27)',
            }}>
              {inputHeight >= 44 && buttonHeight >= 44 ? '✓' : '✗'} Touch Target: {inputHeight >= 44 && buttonHeight >= 44 ? 'WCAG AA' : 'Too Small'}
            </div>
          </div>

          {/* Colors Section */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'rgb(55, 65, 81)' }}>
              Colors (Hue)
            </h4>
            
            <Slider
              label="Primary (Blue)"
              value={primaryHue}
              onChange={setPrimaryHue}
              min={0}
              max={360}
              unit="°"
            />
            <div style={{ height: '20px', borderRadius: '4px', background: `hsl(${primaryHue}, 83%, 53%)`, marginBottom: '12px' }} />
            
            <Slider
              label="Success (Green)"
              value={successHue}
              onChange={setSuccessHue}
              min={0}
              max={360}
              unit="°"
            />
            <div style={{ height: '20px', borderRadius: '4px', background: `hsl(${successHue}, 76%, 36%)`, marginBottom: '12px' }} />
            
            <Slider
              label="Error (Red)"
              value={errorHue}
              onChange={setErrorHue}
              min={0}
              max={360}
              unit="°"
            />
            <div style={{ height: '20px', borderRadius: '4px', background: `hsl(${errorHue}, 72%, 51%)`, marginBottom: '12px' }} />
          </div>

          {/* Shadows Section */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'rgb(55, 65, 81)' }}>
              Shadows
            </h4>
            
            <Slider
              label="Shadow Intensity"
              value={Math.round(shadowIntensity * 100)}
              onChange={(val) => setShadowIntensity(val / 100)}
              min={0}
              max={50}
              unit="%"
            />
          </div>

          {/* Transitions Section */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'rgb(55, 65, 81)' }}>
              Transitions
            </h4>
            
            <Slider
              label="Transition Speed"
              value={transitionSpeed}
              onChange={setTransitionSpeed}
              min={0}
              max={500}
              unit="ms"
            />
            <div style={{ fontSize: '11px', color: 'rgb(107, 114, 128)', marginTop: '-8px' }}>
              {transitionSpeed === 0 ? 'Instant' : transitionSpeed < 150 ? 'Very Fast' : transitionSpeed < 250 ? 'Fast' : transitionSpeed < 350 ? 'Normal' : 'Slow'}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={exportTokens}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'rgb(37, 99, 235)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              📤 Publish Tokens
            </button>
          </div>

          {/* Current Values */}
          <div style={{ marginTop: '20px', padding: '12px', backgroundColor: 'rgb(243, 244, 246)', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgb(55, 65, 81)', lineHeight: 1.6 }}>
              <div><strong>Typography:</strong> {labelSize}px / {helperSize}px</div>
              <div><strong>Sizing:</strong> {inputHeight}px × {buttonHeight}px</div>
              <div><strong>Radius:</strong> {inputRadius}px / {buttonRadius}px</div>
              <div><strong>Colors:</strong> h{primaryHue}° / h{successHue}° / h{errorHue}°</div>
              <div><strong>Effects:</strong> {Math.round(shadowIntensity * 100)}% shadow / {transitionSpeed}ms</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Slider Component
interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}

const Slider: React.FC<SliderProps> = ({ label, value, onChange, min, max, step = 1, unit = '' }) => {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <label style={{ fontSize: '13px', fontWeight: 500, color: 'rgb(75, 85, 99)' }}>
          {label}
        </label>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgb(37, 99, 235)' }}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          height: '6px',
          borderRadius: '3px',
          outline: 'none',
          WebkitAppearance: 'none',
          background: `linear-gradient(to right, rgb(37, 99, 235) 0%, rgb(37, 99, 235) ${((value - min) / (max - min)) * 100}%, rgb(229, 231, 235) ${((value - min) / (max - min)) * 100}%, rgb(229, 231, 235) 100%)`,
        }}
      />
    </div>
  );
};
