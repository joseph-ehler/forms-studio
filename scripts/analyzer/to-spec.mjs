#!/usr/bin/env node
/**
 * Analyzer to Spec Converter
 * 
 * Converts field analyzer JSON output to YAML spec format.
 * 
 * Usage:
 *   node scripts/analyzer/to-spec.mjs <analysis.json>
 *   
 * Example:
 *   node scripts/analyzer/field-analyzer.mjs TextField.tsx > analysis.json
 *   node scripts/analyzer/to-spec.mjs analysis.json > specs/fields/TextField.yaml
 */

import fs from 'node:fs';
import yaml from 'yaml';

const jsonPath = process.argv[2];

if (!jsonPath) {
  console.error('Usage: node to-spec.mjs <analysis.json>');
  process.exit(1);
}

const analysisData = fs.readFileSync(jsonPath, 'utf8');
const analysis = JSON.parse(analysisData);

// Build spec from analysis
const spec = {
  name: analysis.component,
  specVersion: analysis.suggestedSpec.specVersion,
  ui: {
    behavior: analysis.suggestedSpec.ui.behavior,
    inputType: analysis.suggestedSpec.ui.inputType,
    label: analysis.analysis.patterns.hasLabel ? 'Default Label' : undefined,
    placeholder: 'Enter value...',
  },
  validation: {
    required: analysis.analysis.patterns.hasRequired,
    rules: {},
  },
  telemetry: {
    enabled: false,
    events: ['focus', 'blur', 'validate'],
    pii: 'hash',
    comment: 'Set enabled: true to activate telemetry for this field',
  },
  accessibility: {
    label: analysis.analysis.patterns.hasLabel,
    description: analysis.analysis.patterns.hasDescription,
    ariaLabel: analysis.analysis.aria.hasAriaLabel ? 'Accessible name' : undefined,
  },
  performance: {
    debounce: 0,
    lazy: false,
  },
};

// Add comments based on issues
let output = '# Generated spec from field analysis\n';
output += `# Source: ${analysis.file}\n`;
output += `# Generated: ${new Date().toISOString()}\n\n`;

if (analysis.issues.length > 0) {
  output += '# Issues found:\n';
  analysis.issues.forEach(issue => {
    output += `# ${issue.severity.toUpperCase()}: ${issue.message}\n`;
    output += `#   Fix: ${issue.fix}\n`;
  });
  output += '\n';
}

if (analysis.recommendations.length > 0) {
  output += '# Recommendations:\n';
  analysis.recommendations.forEach(rec => {
    output += `# - ${rec}\n`;
  });
  output += '\n';
}

output += yaml.stringify(spec, {
  indent: 2,
  lineWidth: 0,
});

console.log(output);
