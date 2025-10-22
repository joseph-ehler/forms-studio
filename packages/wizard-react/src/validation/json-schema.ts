/**
 * JSON Schema Validation
 * 
 * Prevents security holes from untrusted JSON.
 * Blocks inline styles, className injection, and XSS vectors.
 * 
 * Philosophy:
 * - Only allow ui.* knobs that map to tokens
 * - Block all raw CSS/HTML
 * - Whitelist approach (deny by default)
 */

export interface UIConfig {
  typography?: {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  };
  spacing?: {
    labelGap?: 'xs' | 'sm' | 'md' | 'lg';
    helperGap?: 'xs' | 'sm' | 'md' | 'lg';
    fieldGap?: 'sm' | 'md' | 'lg' | 'xl';
  };
  radius?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  interactive?: {
    minHeight?: 'mobile' | 'desktop' | 'compact';
    iconSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  };
  overlay?: {
    maxHeight?: string; // e.g., "90vh"
    placement?: 'top' | 'bottom' | 'left' | 'right';
  };
  motion?: {
    duration?: 'instant' | 'fast' | 'normal' | 'slow' | 'slower';
    easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'spring';
  };
}

export interface FieldConfig {
  name: string;
  label?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  ui?: UIConfig;
  // BLOCKED: style, className, dangerouslySetInnerHTML
}

/**
 * JSON Schema for field configuration
 */
export const FIELD_CONFIG_SCHEMA = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', minLength: 1 },
    label: { type: 'string' },
    helperText: { type: 'string' },
    required: { type: 'boolean' },
    disabled: { type: 'boolean' },
    placeholder: { type: 'string' },
    ui: {
      type: 'object',
      properties: {
        typography: {
          type: 'object',
          properties: {
            size: { enum: ['xs', 'sm', 'md', 'lg', 'xl'] },
            weight: { enum: ['normal', 'medium', 'semibold', 'bold'] },
          },
          additionalProperties: false,
        },
        spacing: {
          type: 'object',
          properties: {
            labelGap: { enum: ['xs', 'sm', 'md', 'lg'] },
            helperGap: { enum: ['xs', 'sm', 'md', 'lg'] },
            fieldGap: { enum: ['sm', 'md', 'lg', 'xl'] },
          },
          additionalProperties: false,
        },
        radius: { enum: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'] },
        interactive: {
          type: 'object',
          properties: {
            minHeight: { enum: ['mobile', 'desktop', 'compact'] },
            iconSize: { enum: ['xs', 'sm', 'md', 'lg', 'xl'] },
          },
          additionalProperties: false,
        },
        overlay: {
          type: 'object',
          properties: {
            maxHeight: { type: 'string', pattern: '^\\d+(vh|px|rem)$' },
            placement: { enum: ['top', 'bottom', 'left', 'right'] },
          },
          additionalProperties: false,
        },
        motion: {
          type: 'object',
          properties: {
            duration: { enum: ['instant', 'fast', 'normal', 'slow', 'slower'] },
            easing: { enum: ['linear', 'easeIn', 'easeOut', 'easeInOut', 'spring'] },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
  // CRITICAL: Block dangerous properties
  not: {
    anyOf: [
      { required: ['style'] },
      { required: ['className'] },
      { required: ['dangerouslySetInnerHTML'] },
      { required: ['__html'] },
    ],
  },
} as const;

/**
 * Validate field configuration against schema
 */
export function validateFieldConfig(config: unknown): FieldConfig {
  // Type guard
  if (typeof config !== 'object' || config === null) {
    throw new ValidationError('Config must be an object');
  }
  
  const obj = config as Record<string, unknown>;
  
  // Check for blocked properties
  const blockedProps = ['style', 'className', 'dangerouslySetInnerHTML', '__html'];
  for (const prop of blockedProps) {
    if (prop in obj) {
      throw new SecurityError(
        `🚨 SECURITY: Property "${prop}" is blocked in JSON config`,
        `WHY: Prevents XSS and style injection attacks`,
        `FIX: Use ui.* properties that map to design tokens instead`,
      );
    }
  }
  
  // Validate required fields
  if (!obj.name || typeof obj.name !== 'string') {
    throw new ValidationError('Field "name" is required and must be a string');
  }
  
  // Validate ui config if present
  if (obj.ui) {
    validateUIConfig(obj.ui);
  }
  
  return obj as FieldConfig;
}

/**
 * Validate UI configuration
 */
function validateUIConfig(ui: unknown): UIConfig {
  if (typeof ui !== 'object' || ui === null) {
    throw new ValidationError('ui config must be an object');
  }
  
  const uiObj = ui as Record<string, unknown>;
  
  // Validate each section
  if (uiObj.typography) {
    validateSection(uiObj.typography, 'typography', {
      size: ['xs', 'sm', 'md', 'lg', 'xl'],
      weight: ['normal', 'medium', 'semibold', 'bold'],
    });
  }
  
  if (uiObj.spacing) {
    validateSection(uiObj.spacing, 'spacing', {
      labelGap: ['xs', 'sm', 'md', 'lg'],
      helperGap: ['xs', 'sm', 'md', 'lg'],
      fieldGap: ['sm', 'md', 'lg', 'xl'],
    });
  }
  
  if (uiObj.radius) {
    const validValues = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'];
    if (!validValues.includes(uiObj.radius as string)) {
      throw new ValidationError(`ui.radius must be one of: ${validValues.join(', ')}`);
    }
  }
  
  return uiObj as UIConfig;
}

/**
 * Validate a config section
 */
function validateSection(
  section: unknown,
  name: string,
  allowedValues: Record<string, string[]>,
): void {
  if (typeof section !== 'object' || section === null) {
    throw new ValidationError(`ui.${name} must be an object`);
  }
  
  const obj = section as Record<string, unknown>;
  
  for (const [key, value] of Object.entries(obj)) {
    const allowed = allowedValues[key];
    
    if (!allowed) {
      throw new ValidationError(
        `Unknown property: ui.${name}.${key}`,
        `Allowed: ${Object.keys(allowedValues).join(', ')}`,
      );
    }
    
    if (!allowed.includes(value as string)) {
      throw new ValidationError(
        `Invalid value for ui.${name}.${key}: "${value}"`,
        `Allowed: ${allowed.join(', ')}`,
      );
    }
  }
}

/**
 * Custom error classes
 */
export class ValidationError extends Error {
  constructor(message: string, public details?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class SecurityError extends Error {
  constructor(
    message: string,
    public why: string,
    public fix: string,
  ) {
    super(message);
    this.name = 'SecurityError';
  }
}

/**
 * Rate limiting for remote operations
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 1000,
  ) {}
  
  /**
   * Check if request is allowed
   */
  allow(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }
  
  /**
   * Reset rate limit for key
   */
  reset(key: string): void {
    this.requests.delete(key);
  }
}

/**
 * List virtualization trigger
 */
export function shouldVirtualize(itemCount: number): boolean {
  const VIRTUALIZE_THRESHOLD = 2000;
  return itemCount > VIRTUALIZE_THRESHOLD;
}

/**
 * Cap list size
 */
export function capListSize<T>(items: T[], maxSize: number = 2000): T[] {
  if (items.length > maxSize) {
    console.warn(
      `🚨 PERFORMANCE: List size ${items.length} exceeds max ${maxSize}. Truncating.`,
      `WHY: Large lists cause performance issues and memory leaks`,
      `FIX: Implement server-side pagination or filtering`,
    );
    return items.slice(0, maxSize);
  }
  return items;
}
