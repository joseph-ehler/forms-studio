#!/usr/bin/env node
/**
 * DOM Prop Filter Transform
 * 
 * Removes custom (non-HTML) props from being spread onto DOM elements.
 * Only props in the html-allowlist.json should touch the DOM.
 * 
 * Example:
 *   Before: <input {...field} separator={separator} maxTags={maxTags} />
 *   After:  <input {...field} />  // separator/maxTags used in logic only
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ALLOWLIST_PATH = path.join(__dirname, '../maps/html-allowlist.json');

let allowlistCache = null;

/**
 * Load HTML attribute allowlist
 */
function loadAllowlist() {
  if (!allowlistCache) {
    allowlistCache = JSON.parse(fs.readFileSync(ALLOWLIST_PATH, 'utf8'));
  }
  return allowlistCache;
}

/**
 * Get allowed props for a given input type
 */
export function getAllowedProps(inputType) {
  const allowlist = loadAllowlist();
  const typeSpecific = allowlist.byType[inputType] || [];
  return [...allowlist.common, ...typeSpecific];
}

/**
 * Filter props object to only include HTML-valid attributes
 */
export function filterProps(props, inputType) {
  const allowed = getAllowedProps(inputType);
  const filtered = {};
  const custom = {};
  
  for (const [key, value] of Object.entries(props)) {
    if (allowed.includes(key)) {
      filtered[key] = value;
    } else {
      custom[key] = value;
    }
  }
  
  return { filtered, custom };
}

/**
 * Refiner transform: analyze file and detect prop leakage
 */
export function filterDomProps({ htmlAllowlistByTypePath } = {}) {
  return {
    name: 'filter-dom-props',
    version: '1.0.0',
    
    async apply({ file, code }) {
      // Skip non-field files
      if (!file.includes('/fields/') || !file.endsWith('.tsx')) {
        return { changed: false, code };
      }
      
      // Simple heuristic: look for lines with type="..." and custom props on same element
      // This is a basic version - full AST parsing would be more robust
      const lines = code.split('\n');
      let changed = false;
      const issues = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Detect input elements with potential custom props
        if (line.includes('<input') || line.includes('<textarea') || line.includes('<select')) {
          // Extract type if present
          const typeMatch = line.match(/type=["']([^"']+)["']/);
          const inputType = typeMatch ? typeMatch[1] : 'text';
          
          // Check for suspicious props (common custom props we've seen)
          const suspiciousProps = ['separator', 'maxTags', 'minBound', 'maxBound'];
          for (const prop of suspiciousProps) {
            if (line.includes(`${prop}=`)) {
              issues.push({
                line: i + 1,
                prop,
                type: inputType,
                suggestion: `Remove ${prop} from DOM element (use in logic only)`
              });
            }
          }
        }
      }
      
      // For now, just report issues (manual fix mode)
      // TODO: Implement AST-based auto-fix
      if (issues.length > 0) {
        console.log(`\n⚠️  ${file}: Found ${issues.length} prop leakage issue(s):`);
        issues.forEach(issue => {
          console.log(`   Line ${issue.line}: "${issue.prop}" should not be on <input type="${issue.type}">`);
        });
      }
      
      return { changed, code, issues };
    }
  };
}

export default filterDomProps;
