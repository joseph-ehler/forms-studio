#!/usr/bin/env node
/**
 * Barrel Watcher
 * 
 * Watches component files and auto-regenerates barrel exports on changes.
 * Run during development: pnpm dev:watch
 */

import { exec } from 'node:child_process';
import chokidar from 'chokidar';

const GLOBS = [
  // DS source files that contribute to barrels
  'packages/ds/src/primitives/**/*.tsx',
  'packages/ds/src/patterns/**/*.tsx',
  'packages/ds/src/shell/**/*.tsx',
  'packages/ds/src/a11y/**/*.tsx',
  'packages/ds/src/white-label/**/*.tsx',
  'packages/ds/src/utils/**/*.{ts,tsx}',
  
  // Forms source files that contribute to barrels
  'packages/forms/src/fields/**/*.{ts,tsx}',
  'packages/forms/src/composites/**/*.{ts,tsx}',
  'packages/forms/src/form-core/**/*.ts',
];

// files we generate (must be ignored)
const IGNORE = [
  '**/index.ts',                    // all generated barrels
  'packages/**/dist/**',
  'packages/**/generated/**',
  '**/*.stories.*',
  '**/__tests__/**',
  '**/*.spec.*',
];

const watcher = chokidar.watch(GLOBS, {
  ignoreInitial: true,
  ignored: IGNORE,
  awaitWriteFinish: { stabilityThreshold: 250, pollInterval: 50 },
});

// simple debounce + single-flight
let timer = null;
let running = false;

function schedule() {
  if (running) return; // if currently barrelizing, skip scheduling
  clearTimeout(timer);
  timer = setTimeout(run, 250); // debounce bursts of events
}

function run() {
  if (running) return;
  running = true;
  console.log('📦 components changed → barrels');
  exec('pnpm barrels', (err, stdout, stderr) => {
    running = false;
    if (err) {
      console.error('❌ barrelize failed:', stderr || err.message);
      return;
    }
    console.log('✅ barrels updated');
  });
}

watcher.on('add', schedule)
       .on('change', schedule)
       .on('unlink', schedule);

console.log('👀 Watching component files...');
