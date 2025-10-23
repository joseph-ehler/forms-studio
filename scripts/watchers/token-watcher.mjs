#!/usr/bin/env node
/**
 * Token Watcher
 * 
 * Watches token source files and auto-regenerates CSS + TypeScript on changes.
 * Run during development: pnpm dev:watch
 */

import { exec } from 'node:child_process';
import chokidar from 'chokidar';

const watcher = chokidar.watch('packages/ds/src/tokens/**/*.ts', {
  ignoreInitial: true,
  ignored: ['packages/**/generated/**', 'packages/**/dist/**'],
  awaitWriteFinish: { stabilityThreshold: 250, pollInterval: 50 },
});

let timer = null;
let running = false;

function schedule() {
  if (running) return; // if currently generating, skip scheduling
  clearTimeout(timer);
  timer = setTimeout(run, 250); // debounce bursts of events
}

function run() {
  if (running) return;
  running = true;
  console.log('🎨 tokens changed → codegen');
  exec('pnpm tokens:codegen', (err) => {
    running = false;
    if (err) {
      console.error('❌ tokens:codegen failed');
      return;
    }
    console.log('✅ tokens generated');
  });
}

watcher.on('all', schedule);

console.log('👀 Watching token sources...');
