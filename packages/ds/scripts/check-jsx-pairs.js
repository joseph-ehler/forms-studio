#!/usr/bin/env node
/**
 * JSX Tag Pair Sanity Checker
 * 
 * Parses TSX files and validates that opening/closing tags match
 * for: Stack, Flex, Grid, Section, div
 * 
 * Usage: node scripts/check-jsx-pairs.js src/fields/**\/*.tsx
 */

const fs = require('fs');
const path = require('path');

const TAGS_TO_CHECK = ['Stack', 'Flex', 'Grid', 'Section', 'div'];

function checkJSXPairs(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // Simple regex-based tag matching (not a full parser, but catches most issues)
  const stack = [];
  const errors = [];
  
  // Match opening tags: <Stack>, <Flex>, etc.
  const openingTagRe = /<(Stack|Flex|Grid|Section|div)(?:\s|>|\/)/g;
  // Match closing tags: </Stack>, </Flex>, etc.
  const closingTagRe = /<\/(Stack|Flex|Grid|Section|div)>/g;
  // Match self-closing: <div />
  const selfClosingRe = /<(Stack|Flex|Grid|Section|div)[^>]*\/>/g;
  
  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    
    // Remove self-closing tags first (they don't need matching)
    let processedLine = line.replace(selfClosingRe, '');
    
    // Find opening tags
    let match;
    const opensInLine = [];
    const closesInLine = [];
    
    while ((match = openingTagRe.exec(processedLine)) !== null) {
      opensInLine.push({ tag: match[1], line: lineNum, col: match.index });
    }
    
    // Reset regex
    openingTagRe.lastIndex = 0;
    
    // Find closing tags
    while ((match = closingTagRe.exec(processedLine)) !== null) {
      closesInLine.push({ tag: match[1], line: lineNum, col: match.index });
    }
    
    // Reset regex
    closingTagRe.lastIndex = 0;
    
    // Process opens
    opensInLine.forEach(open => {
      stack.push(open);
    });
    
    // Process closes
    closesInLine.forEach(close => {
      if (stack.length === 0) {
        errors.push({
          line: close.line,
          message: `Closing </${close.tag}> without matching opening tag`
        });
        return;
      }
      
      const lastOpen = stack[stack.length - 1];
      
      if (lastOpen.tag !== close.tag) {
        errors.push({
          line: close.line,
          message: `Mismatched tags: <${lastOpen.tag}> at line ${lastOpen.line} closed by </${close.tag}>`
        });
      }
      
      stack.pop();
    });
  });
  
  // Check for unclosed tags
  stack.forEach(open => {
    errors.push({
      line: open.line,
      message: `Unclosed <${open.tag}> tag`
    });
  });
  
  return errors;
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: node check-jsx-pairs.js <file1.tsx> [file2.tsx ...]');
    process.exit(1);
  }
  
  let totalErrors = 0;
  
  args.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return;
    }
    
    const errors = checkJSXPairs(filePath);
    
    if (errors.length > 0) {
      console.log(`\n❌ ${path.basename(filePath)}:`);
      errors.forEach(err => {
        console.log(`  Line ${err.line}: ${err.message}`);
      });
      totalErrors += errors.length;
    }
  });
  
  if (totalErrors === 0) {
    console.log('✅ All JSX tag pairs match!');
    process.exit(0);
  } else {
    console.log(`\n❌ Found ${totalErrors} tag mismatch(es)`);
    process.exit(1);
  }
}

main();
