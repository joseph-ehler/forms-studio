/**
 * JSON Configuration Utilities for Design System Components
 * 
 * Enables all design system components to accept JSON configuration.
 * Priority: Props → JSON → Defaults
 * 
 * Pattern:
 * 1. Component receives both props and json
 * 2. getConfigFromJSON() extracts relevant config from json
 * 3. Props override JSON values
 * 4. Component uses merged config
 */

/**
 * Extract configuration from JSON for any component
 * 
 * @param json - Raw JSON configuration
 * @param keys - Array of config keys to extract
 * @returns Extracted configuration object
 */
export function getConfigFromJSON<T extends Record<string, any>>(
  json: any,
  keys: (keyof T)[]
): Partial<T> {
  if (!json || typeof json !== 'object') return {}
  
  const config: Partial<T> = {}
  
  for (const key of keys) {
    if (key in json) {
      config[key] = json[key]
    }
  }
  
  return config
}

/**
 * Merge props with JSON config (props take priority)
 * 
 * @param props - Component props
 * @param jsonConfig - Config extracted from JSON
 * @param defaults - Default values (can be partial)
 * @returns Merged configuration
 */
export function mergeConfig<T extends Record<string, any>>(
  props: Partial<T>,
  jsonConfig: Partial<T>,
  defaults: Partial<T> = {}
): Partial<T> {
  return {
    ...defaults,
    ...jsonConfig,
    ...props,
  }
}

/**
 * Helper to resolve a single config value with priority
 * 
 * @param propValue - Value from props
 * @param jsonValue - Value from JSON
 * @param defaultValue - Default value
 * @returns Resolved value (priority: props → JSON → default)
 */
export function resolveValue<T>(
  propValue: T | undefined,
  jsonValue: T | undefined,
  defaultValue: T
): T {
  if (propValue !== undefined) return propValue
  if (jsonValue !== undefined) return jsonValue
  return defaultValue
}
