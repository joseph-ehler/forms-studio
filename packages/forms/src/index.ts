/**
 * @intstudio/forms - Public API
 * 
 * Pattern: Same as DS layer (barrel exports)
 * - Contracts (types)
 * - Registry (field types)
 * - FormRenderer (schema → fields)
 * - Fields (opt-in exports)
 */

// Public API for forms layer
export * from './control/field-contracts';
export * from './FormRenderer';
export * from './registry/field-types';

// Field exports (opt-in by consumers or subpath)
export * from './fields/SelectField';
