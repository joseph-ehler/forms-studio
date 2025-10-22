/**
 * Dependency Cruiser Configuration
 * 
 * Enforces clean architecture boundaries between packages:
 * - DS is standalone (no dependencies on forms/core)
 * - Forms can depend on DS + Core
 * - Core is truly core (no UI/theming)
 */

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'ds-cannot-depend-on-forms',
      severity: 'error',
      comment: 'Design System must remain standalone and not depend on forms',
      from: {
        path: '^packages/ds',
      },
      to: {
        path: '^packages/(core|datasources)',
      },
    },
    {
      name: 'ds-cannot-depend-on-forms-2',
      severity: 'error',
      comment: 'Design System must remain standalone',
      from: {
        path: '^packages/ds',
      },
      to: {
        path: '@intstudio/(core|datasources|forms)',
      },
    },
    {
      name: 'core-cannot-depend-on-ui',
      severity: 'error',
      comment: 'Core must be headless (no UI dependencies)',
      from: {
        path: '^packages/core',
      },
      to: {
        path: '^packages/ds',
      },
    },
    {
      name: 'core-cannot-depend-on-ui-2',
      severity: 'error',
      comment: 'Core must be headless (no UI dependencies)',
      from: {
        path: '^packages/core',
      },
      to: {
        path: '@intstudio/ds',
      },
    },
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'No circular dependencies between packages',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment: 'No orphaned modules (unreachable code)',
      from: {
        orphan: true,
        pathNot: [
          '\\.d\\.ts$',
          '(^|/)\\.[^/]+\\.(js|cjs|mjs|ts|json)$',
          '\\.config\\.ts$',
          '\\.spec\\.ts$',
          '\\.test\\.ts$',
        ],
      },
      to: {},
    },
    {
      name: 'no-deep-imports',
      severity: 'error',
      comment: 'Use barrel exports only (no deep imports like @intstudio/ds/src/...)',
      from: {},
      to: {
        path: '@intstudio/(ds|core|datasources|forms)/src',
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+',
      },
      archi: {
        collapsePattern: '^(packages|src|lib|app|bin|test(s?)|spec(s?))/[^/]+|node_modules/[^/]+',
      },
      text: {
        highlightFocused: true,
      },
    },
  },
};
