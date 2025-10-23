/**
 * Deep Imports → Barrel Imports
 * 
 * Transforms deep package imports to canonical barrel exports.
 * 
 * Before:
 *   import { Button } from '@intstudio/ds/src/primitives/Button'
 *   import { useDeviceType } from '../../hooks/useDeviceType'
 * 
 * After:
 *   import { Button } from '@intstudio/ds/primitives'
 *   import { useDeviceType } from '@intstudio/ds/utils'
 */

export default function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  
  // Map of deep import patterns to barrel imports
  const importMappings = [
    // Package deep imports
    { from: /^@intstudio\/ds\/src\/primitives\//, to: '@intstudio/ds/primitives' },
    { from: /^@intstudio\/ds\/src\/patterns\//, to: '@intstudio/ds/patterns' },
    { from: /^@intstudio\/ds\/src\/shell\//, to: '@intstudio/ds/shell' },
    { from: /^@intstudio\/ds\/src\/a11y\//, to: '@intstudio/ds/a11y' },
    { from: /^@intstudio\/ds\/src\/white-label\//, to: '@intstudio/ds/white-label' },
    { from: /^@intstudio\/ds\/src\/utils\//, to: '@intstudio/ds/utils' },
    { from: /^@intstudio\/ds\/src\//, to: '@intstudio/ds' },
    
    // Relative imports within DS (context-dependent)
    { from: /^\.\.\/primitives\//, to: '@intstudio/ds/primitives' },
    { from: /^\.\.\/patterns\//, to: '@intstudio/ds/patterns' },
    { from: /^\.\.\/shell\//, to: '@intstudio/ds/shell' },
    { from: /^\.\.\/utils\//, to: '@intstudio/ds/utils' },
    { from: /^\.\.\/hooks\//, to: '@intstudio/ds/utils' },
  ];
  
  let didModify = false;
  
  // Transform import declarations
  root.find(j.ImportDeclaration).forEach(path => {
    const source = path.node.source.value;
    
    for (const { from, to } of importMappings) {
      if (from.test(source)) {
        path.node.source.value = to;
        didModify = true;
        break;
      }
    }
  });
  
  // Transform dynamic imports
  root.find(j.CallExpression, {
    callee: { type: 'Import' }
  }).forEach(path => {
    const arg = path.node.arguments[0];
    
    if (arg && arg.type === 'Literal') {
      const source = arg.value;
      
      for (const { from, to } of importMappings) {
        if (from.test(source)) {
          arg.value = to;
          didModify = true;
          break;
        }
      }
    }
  });
  
  return didModify ? root.toSource() : null;
}
