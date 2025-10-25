#!/usr/bin/env node
/**
 * scripts/metrics/adoption.mjs
 * Scan repo for Flowbite vs DS wrapper adoption and output a dated JSON/CSV snapshot.
 *
 * Counts:
 *  - Raw flowbite-react (direct component imports)
 *  - flowbite CSS/JS usage
 *  - DS wrappers: @intstudio/ds/fb/*
 *
 * Output:
 *  - reports/adoption-YYYY-MM-DD.json
 *  - reports/adoption-YYYY-MM-DD.csv
 */

import { globby } from 'globby';
import { readFile } from 'node:fs/promises';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const REPORTS_DIR = resolve(ROOT, 'reports');
const TODAY = new Date().toISOString().slice(0, 10);

const SRC_GLOBS = [
  'packages/**/src/**/*.{ts,tsx,js,jsx}',
  '!**/*.stories.*',
  '!**/node_modules/**',
  '!**/dist/**'
];

/** Simple import detectors (fast regex, stable enough) */
const reImport = (id) => new RegExp(
  String.raw`(^|\n|\r)\s*import\s+[^;]*['"]${id}(/[^'"]*)?['"];?`,
  'g'
);

const DETECTORS = [
  { key: 'flowbiteReact', label: 'flowbite-react imports', regex: reImport('flowbite-react') },
  { key: 'flowbiteCss',   label: 'flowbite CSS/JS',       regex: reImport('flowbite') }, // catches 'flowbite' css/js
  { key: 'dsWrappers',    label: '@intstudio/ds/fb/*',    regex: reImport('@intstudio/ds/fb') },
];

function countMatches(source, regex) {
  let count = 0;
  for (const _ of source.matchAll(regex)) count += 1;
  return count;
}

async function run() {
  const files = await globby(SRC_GLOBS, { gitignore: true });
  const perFile = [];
  let totals = { flowbiteReact: 0, flowbiteCss: 0, dsWrappers: 0 };

  for (const file of files) {
    const code = await readFile(file, 'utf8');
    const counts = Object.fromEntries(DETECTORS.map(d => [d.key, countMatches(code, d.regex)]));
    if (Object.values(counts).some(v => v > 0)) {
      perFile.push({ file, ...counts });
      totals.flowbiteReact += counts.flowbiteReact;
      totals.flowbiteCss   += counts.flowbiteCss;
      totals.dsWrappers    += counts.dsWrappers;
    }
  }

  const summary = {
    date: TODAY,
    totals,
    ratio: {
      dsToFlowbite:
        (totals.dsWrappers) /
        Math.max(1, totals.flowbiteReact + totals.flowbiteCss),
    },
    filesWithMatches: perFile.length,
  };

  await mkdir(REPORTS_DIR, { recursive: true });

  // JSON
  const jsonPath = resolve(REPORTS_DIR, `adoption-${TODAY}.json`);
  await writeFile(jsonPath, JSON.stringify({ summary, perFile }, null, 2));
  // CSV
  const csvHead = 'file,flowbiteReact,flowbiteCss,dsWrappers\n';
  const csvRows = perFile
    .map(r => `${r.file},${r.flowbiteReact},${r.flowbiteCss},${r.dsWrappers}`)
    .join('\n');
  const csvPath = resolve(REPORTS_DIR, `adoption-${TODAY}.csv`);
  await writeFile(csvPath, csvHead + csvRows);

  // Console summary
  /* eslint-disable no-console */
  console.log('📈 Adoption snapshot');
  console.log(`  date: ${TODAY}`);
  console.log(`  flowbite-react: ${totals.flowbiteReact}`);
  console.log(`  flowbite css/js: ${totals.flowbiteCss}`);
  console.log(`  DS wrappers:     ${totals.dsWrappers}`);
  console.log(`  dsToFlowbite:    ${summary.ratio.dsToFlowbite.toFixed(2)}`);
  console.log(`  filesWithMatches:${summary.filesWithMatches}`);
  console.log(`  wrote: ${jsonPath}`);
  console.log(`  wrote: ${csvPath}`);
}

run().catch((e) => {
  console.error('metrics:adoption failed', e);
  process.exit(1);
});
