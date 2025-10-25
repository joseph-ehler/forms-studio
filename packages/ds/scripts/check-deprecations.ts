#!/usr/bin/env tsx
/**
 * Check Deprecations Script
 * 
 * Validates deprecations.json and checks if removal dates have passed.
 * Run in CI to catch overdue deprecations.
 * 
 * Usage:
 *   pnpm check:deprecations          # Check all
 *   pnpm check:deprecations --warn   # Warn only (don't exit 1)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Deprecation = {
  component: string;
  path?: string;
  reason: string;
  since: string;
  removeIn: string;
  migration?: {
    from: string;
    to: string;
    breaking: boolean;
    notes?: string[];
  };
  migrationUrl?: string;
};

type DeprecationsFile = {
  deprecations: Deprecation[];
  removed?: Array<{
    component: string;
    removedIn: string;
    replacement?: string;
  }>;
  meta?: {
    lastUpdated: string;
    policy: string;
  };
};

// Parse semver
function parseVersion(version: string): number[] {
  return version.split('.').map(Number);
}

// Compare versions
function compareVersions(a: string, b: string): number {
  const [aMajor, aMinor, aPatch] = parseVersion(a);
  const [bMajor, bMinor, bPatch] = parseVersion(b);
  
  if (aMajor !== bMajor) return aMajor - bMajor;
  if (aMinor !== bMinor) return aMinor - bMinor;
  return aPatch - bPatch;
}

// Get current version from package.json
function getCurrentVersion(): string {
  const pkgPath = path.join(__dirname, '../package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  return pkg.version;
}

// Load deprecations.json
function loadDeprecations(): DeprecationsFile {
  const deprecationsPath = path.join(__dirname, '../deprecations.json');
  return JSON.parse(fs.readFileSync(deprecationsPath, 'utf-8'));
}

// Main check
function checkDeprecations(warnOnly: boolean = false): void {
  const currentVersion = getCurrentVersion();
  const data = loadDeprecations();
  
  console.log(`📦 Current version: v${currentVersion}\n`);
  
  let overdueCount = 0;
  let upcomingCount = 0;
  
  if (data.deprecations.length === 0) {
    console.log('✅ No active deprecations\n');
    return;
  }
  
  console.log(`📋 Active deprecations: ${data.deprecations.length}\n`);
  
  data.deprecations.forEach((dep, index) => {
    const comparison = compareVersions(currentVersion, dep.removeIn);
    const isOverdue = comparison >= 0;
    
    if (isOverdue) {
      overdueCount++;
      console.log(`❌ OVERDUE: ${dep.component}`);
      console.log(`   Scheduled for removal in: v${dep.removeIn}`);
      console.log(`   Current version: v${currentVersion}`);
      console.log(`   Action: Remove ${dep.path || 'component'} and update deprecations.json\n`);
    } else {
      upcomingCount++;
      console.log(`⏰ Upcoming: ${dep.component}`);
      console.log(`   Since: v${dep.since}`);
      console.log(`   Remove in: v${dep.removeIn}`);
      console.log(`   Reason: ${dep.reason}`);
      if (dep.migration && !dep.migration.breaking) {
        console.log(`   Migration: Non-breaking ✅`);
      }
      console.log('');
    }
  });
  
  // Summary
  console.log('─'.repeat(60));
  console.log(`Summary:`);
  console.log(`  Overdue: ${overdueCount}`);
  console.log(`  Upcoming: ${upcomingCount}`);
  console.log('─'.repeat(60));
  
  if (overdueCount > 0) {
    console.log('\n⚠️  Action required: Remove overdue deprecations\n');
    if (!warnOnly) {
      process.exit(1);
    }
  } else {
    console.log('\n✅ All deprecations on schedule\n');
  }
}

// CLI
const args = process.argv.slice(2);
const warnOnly = args.includes('--warn');

checkDeprecations(warnOnly);
