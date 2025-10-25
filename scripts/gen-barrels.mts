#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import fg from 'fast-glob';

type BarrelTarget = {
  dir: string;             // absolute path to folder to barrelize
  outfile: string;         // absolute path to index.ts to write
  patterns?: string[];     // globs relative to dir
  ignore?: string[];       // globs to ignore
};

const repo = resolve(process.cwd());
const rel = (p: string) => p.replace(repo + '/', '');

const targets: BarrelTarget[] = [
  {
    dir: resolve(repo, 'packages/ds/src/fb'),
    outfile: resolve(repo, 'packages/ds/src/fb/index.ts'),
    patterns: ['**/*.ts', '**/*.tsx'],
    ignore: ['**/*.stories.tsx', '**/__tests__/**', '**/*.spec.*', '**/*.test.*', '**/*.template.*', 'index.ts'],
  },
  {
    dir: resolve(repo, 'packages/ds/src/routes'),
    outfile: resolve(repo, 'packages/ds/src/routes/index.ts'),
    patterns: ['**/*.ts', '**/*.tsx'],
    ignore: ['**/*.stories.tsx', '**/__tests__/**', '**/*.spec.*', '**/*.test.*', '**/*.template.*', 'index.ts'],
  },
  {
    dir: resolve(repo, 'packages/ds/src/hooks'),
    outfile: resolve(repo, 'packages/ds/src/hooks/index.ts'),
    patterns: ['**/*.ts', '**/*.tsx'],
    ignore: ['**/*.stories.tsx', '**/__tests__/**', '**/*.spec.*', '**/*.test.*', '**/*.template.*', 'index.ts'],
  },
];

const header =
  `/* AUTO-GENERATED FILE. DO NOT EDIT.
 * Run: pnpm barrels
 */\n\n`;

async function buildBarrel(t: BarrelTarget) {
  // 1) gather files
  const files = await fg(t.patterns ?? ['**/*.ts', '**/*.tsx'], {
    cwd: t.dir,
    ignore: t.ignore ?? [],
    absolute: true,
  });

  // 2) compute export lines
  const lines: string[] = [];
  const seen = new Set<string>();

  for (const abs of files.sort()) {
    const base = basename(abs);
    if (base === 'index.ts' || base === 'index.tsx') continue;

    const relPath = './' + rel(abs).replace(rel(t.dir) + '/', '').replace(/\.(tsx?|d\.ts)$/, '');
    const exportName = basename(relPath).replace(/\W+/g, '_');
    const line = `export * from '${relPath}';`;

    if (!seen.has(line)) {
      lines.push(line);
      seen.add(line);
    }
  }

  const content = header + lines.join('\n') + (lines.length ? '\n' : '');
  // 3) write only if changed
  let current = '';
  try { current = await fs.readFile(t.outfile, 'utf8'); } catch {}
  if (current !== content) {
    await fs.mkdir(dirname(t.outfile), { recursive: true });
    await fs.writeFile(t.outfile, content, 'utf8');
  }
  return { outfile: t.outfile, changed: current !== content, count: lines.length };
}

(async () => {
  const results = await Promise.all(targets.map(buildBarrel));
  const changed = results.filter(r => r.changed);
  if (changed.length) {
    console.log('Updated barrels:\n' + changed.map(r => `  - ${rel(r.outfile)} (${r.count} exports)`).join('\n'));
  } else {
    console.log('✅ Barrels up to date.');
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
