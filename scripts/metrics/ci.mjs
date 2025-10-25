#!/usr/bin/env node
/**
 * scripts/metrics/ci.mjs
 * Time `pnpm doctor` (or any argv command) and write a dated JSON snapshot under /reports.
 *
 * Usage:
 *   node scripts/metrics/ci.mjs                    # times `pnpm doctor` 
 *   node scripts/metrics/ci.mjs "pnpm typecheck"   # custom command
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const pexec = promisify(exec);
const REPORTS_DIR = resolve(process.cwd(), 'reports');
const TODAY = new Date().toISOString().slice(0, 10);

const cmd = process.argv[2] || 'pnpm doctor';

async function run() {
  const start = Date.now();
  let ok = true;
  let stderr = '';
  try {
    const { stderr: se } = await pexec(cmd, { maxBuffer: 10 * 1024 * 1024 });
    stderr = se || '';
  } catch (e) {
    ok = false;
    stderr = (e && e.stderr) ? e.stderr.toString() : String(e);
  }
  const end = Date.now();

  const payload = {
    date: TODAY,
    command: cmd,
    ok,
    durationMs: end - start,
    stderrSample: stderr.slice(0, 1000),
  };

  await mkdir(REPORTS_DIR, { recursive: true });
  const out = resolve(REPORTS_DIR, `ci-${TODAY}.json`);
  await writeFile(out, JSON.stringify(payload, null, 2));

  /* eslint-disable no-console */
  console.log(`🧪 CI metrics -> ${out}`);
  console.log(`   ok=${ok} durationMs=${payload.durationMs}`);
  if (!ok) process.exit(1);
}

run().catch((e) => {
  console.error('metrics:ci failed', e);
  process.exit(1);
});
