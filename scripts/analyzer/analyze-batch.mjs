#!/usr/bin/env node
/**
 * Batch Field Analyzer - Pattern Discovery at Scale
 * 
 * Analyzes multiple field components to discover patterns, outliers, and archetypes.
 * Use this BEFORE writing specs or Refiner rules to make data-driven decisions.
 * 
 * Usage:
 *   pnpm analyze:batch "packages/forms/src/fields/**\/*.tsx"
 *   pnpm analyze:batch "packages/forms/src/fields/**\/*.tsx" > tmp/batch-report.json
 * 
 * Output:
 *   - Individual file reports
 *   - Aggregate pattern statistics
 *   - Outlier detection
 *   - Archetype suggestions
 *   - Spec generation hints
 */

import { glob } from 'glob';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const quiet = args.includes('--quiet');
const pattern = args.find(arg => !arg.startsWith('--')) || 'packages/forms/src/fields/**/*.tsx';

if (!quiet) console.error(`🔍 Analyzing batch: ${pattern}\n`);

// Find all matching files (exclude stories, tests, index)
const files = await glob(pattern, {
  ignore: [
    '**/*.stories.tsx',
    '**/*.test.tsx',
    '**/*.spec.tsx',
    '**/index.ts',
    '**/index.tsx',
  ],
});

if (!quiet) console.error(`Found ${files.length} files\n`);

// Analyze each file
const reports = [];
let analyzed = 0;

for (const file of files) {
  try {
    // Run single-file analyzer
    const result = execSync(
      `node scripts/analyzer/field-analyzer.mjs "${file}"`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
    
    const report = JSON.parse(result);
    reports.push(report);
    analyzed++;
    
    // Progress indicator
    if (!quiet && analyzed % 5 === 0) {
      console.error(`Analyzed ${analyzed}/${files.length} files...`);
    }
  } catch (error) {
    console.error(`⚠️  Failed to analyze ${file}: ${error.message}`);
  }
}

if (!quiet) {
  console.error(`\n✅ Analyzed ${files.length} files\n`);
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// ============================================
// AGGREGATE ANALYSIS
// ============================================

const aggregate = {
  totals: {
    filesAnalyzed: reports.length,
    usesController: reports.filter(r => r.analysis.rhf.usesController).length,
    usesRHF: reports.filter(r => r.analysis.rhf.usesController).length,
    hasDSPrimitives: reports.filter(r => r.analysis.ui.dsPrimitives.length > 0).length,
    hasInlineStyles: reports.filter(r => r.analysis.patterns.hasInlineStyles).length,
    hasErrorHandling: reports.filter(r => r.analysis.patterns.hasErrorHandling).length,
    hasLabel: reports.filter(r => r.analysis.patterns.hasLabel).length,
    hasDescription: reports.filter(r => r.analysis.patterns.hasDescription).length,
  },
  
  compliance: {
    fullCompliance: reports.filter(r => 
      Object.values(r.compliance).every(v => v === '✅')
    ).length,
    rhfIntegration: reports.filter(r => r.compliance.rhfIntegration === '✅').length,
    dsComponents: reports.filter(r => r.compliance.dsComponents === '✅').length,
    ariaLabels: reports.filter(r => r.compliance.ariaLabels === '✅').length,
    ariaDescriptions: reports.filter(r => r.compliance.ariaDescriptions === '✅').length,
    ariaInvalid: reports.filter(r => r.compliance.ariaInvalid === '✅').length,
    errorHandling: reports.filter(r => r.compliance.errorHandling === '✅').length,
    noInlineStyles: reports.filter(r => r.compliance.noInlineStyles === '✅').length,
  },
  
  patterns: {
    domElements: frequency(reports.flatMap(r => r.analysis.ui.domElements)),
    dsPrimitives: frequency(reports.flatMap(r => r.analysis.ui.dsPrimitives)),
    rhfImports: frequency(reports.flatMap(r => r.analysis.rhf.imports)),
    fieldTypes: frequency(reports.map(r => r.analysis.ui.guessedType)),
    commonProps: frequency(reports.flatMap(r => r.analysis.props)),
  },
  
  outliers: {
    noController: reports.filter(r => !r.analysis.rhf.usesController).map(r => ({
      file: r.file,
      component: r.component,
      issue: 'Not using RHF Controller',
    })),
    inlineStyles: reports.filter(r => r.analysis.patterns.hasInlineStyles).map(r => ({
      file: r.file,
      component: r.component,
      issue: 'Has inline styles',
    })),
    missingHtmlFor: reports.filter(r => !r.analysis.aria.hasHtmlFor && r.analysis.patterns.hasLabel).map(r => ({
      file: r.file,
      component: r.component,
      issue: 'FormLabel missing htmlFor',
    })),
    missingErrorHandling: reports.filter(r => !r.analysis.patterns.hasErrorHandling).map(r => ({
      file: r.file,
      component: r.component,
      issue: 'No error handling detected',
    })),
    noDSPrimitives: reports.filter(r => r.analysis.ui.dsPrimitives.length === 0).map(r => ({
      file: r.file,
      component: r.component,
      issue: 'Not using DS primitives',
    })),
  },
  
  archetypes: identifyArchetypes(reports),
  
  recommendations: generateRecommendations(reports),
};

// ============================================
// OUTPUT
// ============================================

const output = {
  metadata: {
    pattern,
    filesFound: files.length,
    filesAnalyzed: reports.length,
    timestamp: new Date().toISOString(),
    version: '1.0',
  },
  aggregate,
  reports,
};

console.log(JSON.stringify(output, null, 2));

// ============================================
// HELPER FUNCTIONS
// ============================================

function frequency(arr) {
  const map = new Map();
  arr.forEach(item => {
    map.set(item, (map.get(item) || 0) + 1);
  });
  
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({ key, count, percentage: ((count / arr.length) * 100).toFixed(1) + '%' }));
}

function identifyArchetypes(reports) {
  const archetypes = {
    simpleText: [],
    simpleBoolean: [],
    select: [],
    composite: [],
    custom: [],
  };
  
  reports.forEach(report => {
    const type = report.analysis.ui.guessedType;
    const domElements = report.analysis.ui.domElements;
    
    if (domElements.includes('input') && !domElements.includes('select')) {
      archetypes.simpleText.push({
        component: report.component,
        type,
        file: report.file,
      });
    } else if (domElements.includes('select')) {
      archetypes.select.push({
        component: report.component,
        type,
        file: report.file,
      });
    } else if (domElements.includes('input') && domElements.length > 2) {
      archetypes.composite.push({
        component: report.component,
        type,
        file: report.file,
      });
    } else if (report.analysis.ui.dsPrimitives.length > 3) {
      archetypes.custom.push({
        component: report.component,
        type,
        file: report.file,
      });
    }
  });
  
  return {
    simpleText: { count: archetypes.simpleText.length, examples: archetypes.simpleText.slice(0, 3) },
    simpleBoolean: { count: archetypes.simpleBoolean.length, examples: archetypes.simpleBoolean.slice(0, 3) },
    select: { count: archetypes.select.length, examples: archetypes.select.slice(0, 3) },
    composite: { count: archetypes.composite.length, examples: archetypes.composite.slice(0, 3) },
    custom: { count: archetypes.custom.length, examples: archetypes.custom.slice(0, 3) },
  };
}

function generateRecommendations(reports) {
  const recs = [];
  
  const outlierCount = Object.values({
    noController: reports.filter(r => !r.analysis.rhf.usesController).length,
    inlineStyles: reports.filter(r => r.analysis.patterns.hasInlineStyles).length,
    missingHtmlFor: reports.filter(r => !r.analysis.aria.hasHtmlFor && r.analysis.patterns.hasLabel).length,
  }).reduce((sum, count) => sum + count, 0);
  
  if (outlierCount > 0) {
    recs.push({
      priority: 'high',
      category: 'quality',
      action: `Run Refiner to fix ${outlierCount} compliance issues`,
      command: 'pnpm refine:run --scope="packages/forms/src/fields/**/*.tsx"',
    });
  }
  
  const noDSCount = reports.filter(r => r.analysis.ui.dsPrimitives.length === 0).length;
  if (noDSCount > 0) {
    recs.push({
      priority: 'medium',
      category: 'architecture',
      action: `${noDSCount} fields not using DS primitives - consider refactoring`,
      command: 'Review and migrate to FormLabel, Stack, FormHelperText',
    });
  }
  
  const noErrorHandling = reports.filter(r => !r.analysis.patterns.hasErrorHandling).length;
  if (noErrorHandling > 0) {
    recs.push({
      priority: 'medium',
      category: 'ux',
      action: `${noErrorHandling} fields missing error handling`,
      command: 'Add errors prop and error message rendering',
    });
  }
  
  return recs;
}
