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
  type FlowDef,
  type ChapterDef,
  type StepDef,
  type FieldDef,
  type ValidationLogic,
  type DataSourceDef,
} from './flow-schema'

export {
  validateFlow,
  type ValidationResult,
  type ValidationIssue,
} from './flow-validator'
