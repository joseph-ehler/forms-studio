/**
 * Stylelint Configuration - Design System Token Enforcement
 * 
 * Philosophy: Zero hard-coded colors, radii, shadows, or spacing.
 * All visual constants must come from DS tokens (CSS custom properties).
 * 
 * This config blocks:
 * - Hex colors (#fff, #000000, etc.)
 * - RGB/RGBA/HSL functions (unless in token definitions)
 * - Named colors (red, blue, etc.)
 * - Hard-coded box-shadow values
 * - Direct color values in any color-related property
 */

module.exports = {
  extends: [
    "stylelint-config-standard"
  ],
  
  rules: {
    /* ==========================================
       COLOR ENFORCEMENT
       ========================================== */
    
    // No hex colors anywhere (use tokens only)
    "color-no-hex": [true, {
      message: "Hex colors are not allowed. Use design tokens: var(--ds-color-*)"
    }],
    
    // No named colors (red, blue, etc.) - except in token definitions
    "color-named": ["never", {
      message: "Named colors are not allowed. Use design tokens: var(--ds-color-*)",
      ignore: ["inside-function"] // Allow in rgba(), etc.
    }],
    
    /* ==========================================
       PROPERTY VALUE ENFORCEMENT
       Require var(--ds-*) for visual properties
       ========================================== */
    
    "declaration-property-value-disallowed-list": {
      // Color-related properties must use tokens
      "/^(color|background|background-color|border-color|outline-color|fill|stroke)$/": [
        // Block anything NOT starting with var(
        "/^(?!var\\(|currentColor|transparent|inherit|initial|unset|none)/",
      ],
      
      // Shadow must use tokens
      "/^(box-shadow|text-shadow)$/": [
        "/^(?!var\\(|none|inherit|initial|unset)/",
      ],
      
      // Border radius should use tokens (with exceptions for 0, 50%, 100%)
      "/^border(-top|-right|-bottom|-left)?(-top|-bottom)?(-left|-right)?-radius$/": [
        "/^(?!var\\(|0|50%|100%|inherit|initial|unset)/",
      ]
    },
    
    /* ==========================================
       EXCEPTIONS & OVERRIDES
       ========================================== */
    
    // Allow currentColor, transparent, etc. for utility classes
    "color-function-notation": null, // Don't enforce modern vs legacy
    
    // Allow rgba/hsla in token definition files only
    "function-disallowed-list": null,
    
    /* ==========================================
       BEST PRACTICES
       ========================================== */
    
    // Require quotes around font families
    "font-family-name-quotes": "always-where-recommended",
    
    // Disallow !important (use specificity or cascade)
    "declaration-no-important": [true, {
      message: "Avoid !important. Use proper specificity or cascade instead.",
      severity: "warning"
    }],
    
    // Require lowercase for selectors
    "selector-type-case": "lower",
    
    // No duplicate selectors
    "no-duplicate-selectors": true,
    
    /* ==========================================
       DISABLED RULES (Allow modern CSS)
       ========================================== */
    
    // Allow nested @media, @supports, etc.
    "at-rule-no-unknown": null,
    
    // Allow custom properties (--ds-*)
    "custom-property-pattern": null,
    
    // Allow modern CSS functions
    "function-no-unknown": null,
    
    // Allow CSS modules syntax
    "selector-pseudo-class-no-unknown": [true, {
      ignorePseudoClasses: ["global", "local", "export"]
    }]
  },
  
  /* ==========================================
     OVERRIDES FOR TOKEN DEFINITION FILES
     ========================================== */
  
  overrides: [
    {
      // Token files can define raw values (they ARE the source of truth)
      files: ["**/tokens/**/*.css", "**/tokens/**/*.vars.css"],
      rules: {
        "color-no-hex": null,
        "color-named": null,
        "declaration-property-value-disallowed-list": null,
        "color-function-notation": null
      }
    },
    {
      // Allow more flexibility in demo/test files
      files: ["**/demo/**/*.css", "**/*.test.css", "**/*.spec.css"],
      rules: {
        "declaration-no-important": null,
        "selector-type-case": null
      }
    }
  ],
  
  /* ==========================================
     IGNORE PATTERNS
     ========================================== */
  
  ignoreFiles: [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.next/**",
    "**/coverage/**"
  ]
};
