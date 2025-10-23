#!/usr/bin/env node
/**
 * Beautification Audit - Design System Compliance
 * 
 * Analyzes field components for visual design opportunities:
 * - Mobile-first patterns
 * - DS primitive usage
 * - Touch target sizing
 * - Visual consistency
 * - Spacing/layout patterns
 * 
 * Usage:
 *   node scripts/analyzer/beautify-audit.mjs
 */

import { glob } from 'glob';
import fs from 'node:fs';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';

console.error('🎨 BEAUTIFICATION AUDIT\n');

// Find all field files
const files = await glob('packages/forms/src/fields/**/*.tsx', {
  ignore: ['**/*.stories.tsx', '**/*.test.tsx', '**/index.ts'],
});

console.error(`Analyzing ${files.length} fields...\n`);

const audit = {
  fields: [],
  summary: {
    totalFields: files.length,
    usesStack: 0,
    usesFlexbox: 0,
    usesGrid: 0,
    hasCustomSpacing: 0,
    hasInlineClasses: 0,
    usesW_full: 0,
    hasTouchTargets: 0,
    usesResponsiveClasses: 0,
  },
  opportunities: [],
};

for (const file of files) {
  const code = fs.readFileSync(file, 'utf8');
  const fieldName = file.split('/').pop().replace('.tsx', '');
  
  try {
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });
    
    const field = {
      name: fieldName,
      file,
      primitives: [],
      classNames: [],
      styling: {
        usesStack: false,
        usesFlexbox: false,
        usesGrid: false,
        hasTouchTargets: false,
        hasResponsive: false,
        hasCustom: false,
      },
      opportunities: [],
    };
    
    // Analyze JSX
    traverse.default(ast, {
      JSXElement(path) {
        const name = path.node.openingElement.name.name;
        
        // Track DS primitives
        if (['Stack', 'FormLabel', 'FormHelperText', 'Grid', 'Flex'].includes(name)) {
          field.primitives.push(name);
          if (name === 'Stack') field.styling.usesStack = true;
          if (name === 'Flex') field.styling.usesFlexbox = true;
          if (name === 'Grid') field.styling.usesGrid = true;
        }
        
        // Extract className attributes
        path.node.openingElement.attributes.forEach(attr => {
          if (attr.name?.name === 'className' && attr.value?.value) {
            const classes = attr.value.value.split(' ');
            field.classNames.push(...classes);
            
            // Check for responsive classes
            if (classes.some(c => c.includes('md:') || c.includes('lg:'))) {
              field.styling.hasResponsive = true;
            }
            
            // Check for custom spacing
            if (classes.some(c => c.match(/^(m|p)(t|b|l|r|x|y)?-\d+$/))) {
              field.styling.hasCustom = true;
            }
          }
        });
      },
    });
    
    // Identify opportunities
    if (!field.styling.usesStack && !field.styling.usesFlexbox) {
      field.opportunities.push({
        type: 'layout',
        priority: 'high',
        message: 'Consider using Stack primitive for consistent spacing',
      });
    }
    
    if (!field.classNames.includes('w-full') && field.classNames.includes('ds-input')) {
      field.opportunities.push({
        type: 'sizing',
        priority: 'medium',
        message: 'Input should have w-full for mobile responsiveness',
      });
    }
    
    if (field.styling.hasCustom) {
      field.opportunities.push({
        type: 'spacing',
        priority: 'medium',
        message: 'Custom spacing detected - consider using Stack spacing prop',
      });
    }
    
    if (!field.styling.hasResponsive && field.classNames.length > 0) {
      field.opportunities.push({
        type: 'responsive',
        priority: 'low',
        message: 'No responsive classes found - ensure mobile-first design',
      });
    }
    
    // Update summary
    if (field.styling.usesStack) audit.summary.usesStack++;
    if (field.styling.usesFlexbox) audit.summary.usesFlexbox++;
    if (field.styling.usesGrid) audit.summary.usesGrid++;
    if (field.styling.hasCustom) audit.summary.hasCustomSpacing++;
    if (field.classNames.length > 0) audit.summary.hasInlineClasses++;
    if (field.classNames.includes('w-full')) audit.summary.usesW_full++;
    if (field.styling.hasResponsive) audit.summary.usesResponsiveClasses++;
    
    audit.fields.push(field);
    audit.opportunities.push(...field.opportunities.map(o => ({ ...o, field: fieldName })));
    
  } catch (error) {
    console.error(`⚠️  Failed to analyze ${fieldName}: ${error.message}`);
  }
}

// Calculate scores
audit.summary.layoutScore = Math.round((audit.summary.usesStack / audit.summary.totalFields) * 100);
audit.summary.responsiveScore = Math.round((audit.summary.usesResponsiveClasses / audit.summary.totalFields) * 100);

// Group opportunities by priority
const grouped = {
  high: audit.opportunities.filter(o => o.priority === 'high'),
  medium: audit.opportunities.filter(o => o.priority === 'medium'),
  low: audit.opportunities.filter(o => o.priority === 'low'),
};

console.log(JSON.stringify({
  summary: audit.summary,
  opportunities: grouped,
  fields: audit.fields.map(f => ({
    name: f.name,
    primitives: [...new Set(f.primitives)],
    classNames: [...new Set(f.classNames)],
    styling: f.styling,
    opportunityCount: f.opportunities.length,
  })),
}, null, 2));

console.error(`\n✅ Audit complete!`);
console.error(`Layout Score: ${audit.summary.layoutScore}% using Stack`);
console.error(`Responsive Score: ${audit.summary.responsiveScore}% with responsive classes`);
console.error(`\nOpportunities found: ${audit.opportunities.length}`);
console.error(`  High priority: ${grouped.high.length}`);
console.error(`  Medium priority: ${grouped.medium.length}`);
console.error(`  Low priority: ${grouped.low.length}`);
