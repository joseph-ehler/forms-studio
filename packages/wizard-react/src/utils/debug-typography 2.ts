/**
 * Typography Diagnostics - One-Line Truth
 * 
 * Paste debugTypography() in console to audit compliance.
 */

export interface TypographyAuditResult {
  dsLabels: number;
  rawLabels: number;
  dsHelpers: number;
  badClasses: number;
  violations: {
    rawLabels: Element[];
    badClasses: Element[];
  };
}

/**
 * debugTypography - Audit typography compliance
 * 
 * Checks for:
 * - DS labels vs raw labels
 * - DS helpers present
 * - Forbidden typography classes
 * 
 * Usage:
 * ```javascript
 * // Paste in browser console:
 * debugTypography()
 * ```
 */
export function debugTypography(): TypographyAuditResult {
  const dsLabels = document.querySelectorAll('[data-ds="label"]');
  const rawLabels = document.querySelectorAll('label:not([data-ds="label"])');
  const dsHelpers = document.querySelectorAll('[data-ds="helper"]');
  
  // Check for forbidden typography classes on DS elements
  const badClasses = Array.from(document.querySelectorAll('[data-ds="label"]')).filter(
    (el) => {
      const classes = el.className || '';
      return /\b(text-|font-|leading-)/.test(classes);
    }
  );

  const result: TypographyAuditResult = {
    dsLabels: dsLabels.length,
    rawLabels: rawLabels.length,
    dsHelpers: dsHelpers.length,
    badClasses: badClasses.length,
    violations: {
      rawLabels: Array.from(rawLabels),
      badClasses: badClasses,
    },
  };

  console.group('📝 Typography Audit');
  console.table({
    'DS Labels': result.dsLabels,
    'Raw Labels (❌)': result.rawLabels,
    'DS Helpers': result.dsHelpers,
    'Bad Classes (❌)': result.badClasses,
  });

  if (result.rawLabels > 0) {
    console.warn('❌ Raw <label> elements found (should use FormLabel):', result.violations.rawLabels);
  }

  if (result.badClasses > 0) {
    console.warn('❌ Typography classes on DS elements:', result.violations.badClasses);
  }

  if (result.rawLabels === 0 && result.badClasses === 0) {
    console.log('✅ All typography checks passed!');
  }

  console.groupEnd();

  return result;
}

// Expose globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugTypography = debugTypography;
}
