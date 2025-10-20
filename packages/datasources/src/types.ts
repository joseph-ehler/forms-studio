/**
 * Canonical Data Source Types
 * 
 * Discriminated union with 'kind' discriminant for type-safe narrowing.
 * 
 * @packageDocumentation
 */

export type BackoffKind = 'exponential' | 'linear' | 'fixed';

export interface RetryConfig {
  retries?: number;             // 0-5
  backoff?: BackoffKind;        // default: exponential
  baseMs?: number;              // default: 300
  maxMs?: number;               // default: 5000
  onRetryEventName?: string;    // analytics hook name
}

export interface CacheConfig {
  ttlMs?: number;               // 1000..604800000
  key?: string;                 // template "vin:{{fields.vin.value}}"
  staleWhileRevalidate?: boolean;
}

export interface PrivacyConfig {
  classification?: 'PUBLIC' | 'OPERATIONAL' | 'PSEUDONYMIZED' | 'SENSITIVE';
  allowInAI?: boolean;          // default false
  doNotTrain?: boolean;
  needsConsent?: boolean;
  maskInLogs?: boolean;
}

export interface AnalyticsConfig {
  namespace?: string;           // e.g., "forms-studio"
  flow?: string;                // e.g., "vehicle-onboarding"
  onStart?: string;             // ds_start
  onSuccess?: string;           // ds_success
  onFail?: string;              // ds_fail
  onCacheHit?: string;          // ds_cache_hit
}

export type TemplateObject = Record<string, unknown>;
export type HeadersTemplate = Record<string, string>;

// ---- Variants ----------------------------------------------------

export interface HttpGetDef {
  kind: 'http.get';
  url: string;                  // supports templates
  headers?: HeadersTemplate;    // supports templates
  timeoutMs?: number;           // 1000..30000
  idempotent?: true;            // always true for GET
  cache?: CacheConfig;
  retry?: RetryConfig;
  privacy?: PrivacyConfig;
  analytics?: AnalyticsConfig;
  // mapResponse writes into context from response data
  mapResponse?: TemplateObject; // ex: { "vehicle.make": "{{data.make}}" }
}

export interface HttpPostDef {
  kind: 'http.post';
  url: string;
  headers?: HeadersTemplate;
  timeoutMs?: number;
  // for safe retries, at least one must be set:
  idempotent?: boolean;         // explicit guarantee from server
  dedupeKey?: string;           // template: "vin:{{fields.vin.value}}"
  cache?: CacheConfig;
  retry?: RetryConfig;
  privacy?: PrivacyConfig;
  analytics?: AnalyticsConfig;
  // Request mapping + response mapping
  mapRequest?: TemplateObject;  // ex: { "vin": "{{fields.vin.value}}" }
  mapResponse?: TemplateObject; // ex: { "vehicle.make": "{{data.make}}" }
}

export interface ComputedDef {
  kind: 'computed';
  compute: string;              // expression string (ctx-aware)
  cache?: CacheConfig;
  privacy?: PrivacyConfig;
  analytics?: AnalyticsConfig;
  mapResponse?: TemplateObject; // ex: { "flags.highMileage": "{{data}}" }
}

export interface ChainDef {
  kind: 'chain';
  steps: string[];              // ordered names of other sources
  cache?: CacheConfig;
  privacy?: PrivacyConfig;
  analytics?: AnalyticsConfig;
  mapResponse?: TemplateObject; // ex: { "form": "{{merge(data[0], data[1])}}" }
}

// ---- Union + Registry --------------------------------------------

export type DataSourceDef = HttpGetDef | HttpPostDef | ComputedDef | ChainDef;

// Named variant (with name field for manager)
export type NamedDataSourceDef = DataSourceDef & { name: string };

// Legacy: Support both 'kind' and 'type' during migration
export type DataSourceDefWithType = DataSourceDef & { type?: string };

// name → def lookup
export type DataSourceRegistry = Record<string, DataSourceDef>;

// fetch options from runtime
export interface FetchOptions {
  signal?: AbortSignal;         // cancel on navigation
  force?: boolean;              // bypass cache
  silent?: boolean;             // no logs/toasts
  traceId?: string;             // trace correlation
}

// minimal context shape; your manager resolves templates against this
export interface ExecutionContext {
  ctx: Record<string, any>;
  fields: Record<string, { value: any; valid?: boolean; error?: string; validating?: boolean }>;
  data?: Record<string, any>;
}

// Legacy type aliases for compatibility
export type EvalContext = ExecutionContext;

// Fetch result types
export interface FetchResult<T = any> {
  data: T;
  cached?: boolean;
  cacheMeta?: CacheMeta;
  duration?: number;
  retries?: number;
}

export interface CacheMeta {
  key: string;
  age: number;
  stale?: boolean;
  ttl: number;
}

// Event types
export type DataSourceEvent =
  | { type: 'fetch-start'; source: string }
  | { type: 'fetch-success'; source: string; duration: number; cached: boolean }
  | { type: 'fetch-error'; source: string; error: string }
  | { type: 'retry'; source: string; attempt: number; delay: number }
  | { type: 'cache-hit'; source: string }
  | { type: 'cache-miss'; source: string }
  | { type: 'breaker-open'; source: string }
  | { type: 'breaker-half-open'; source: string }
  | { type: 'breaker-closed'; source: string };
