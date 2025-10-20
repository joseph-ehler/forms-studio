/**
 * @intelligence-studio/wizard-core
 * 
 * Headless wizard engine with expression evaluation, flow validation, and runtime.
 * 
 * @packageDocumentation
 */

// Expression Engine
export {
  evaluateExpression,
  type ExpressionContext,
  type ExpressionResult,
  type FieldState,
} from './expression-engine'

// Flow Schema & Validation
export {
  FlowSchema,
  ChapterSchema,
  StepSchema,
  FieldSchema,
  ValidationLogicSchema,
  DataSourceSchema,
  type FlowConfig,
  type ChapterConfig,
  type StepConfig,
  type FieldConfig,
  type PrivacyConfig,
  type DataSourceConfig,
} from './flow-schema'

export {
  validateFlow,
  type ValidationResult,
} from './flow-validator'
