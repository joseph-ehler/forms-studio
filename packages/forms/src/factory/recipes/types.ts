/**
 * Recipe System Types
 * 
 * Recipes own the "inside" of overlays - content, behavior, interaction.
 * The DS owns the shell (positioning, focus trap, animation).
 */

import type { Control, ControllerRenderProps, FieldValues } from 'react-hook-form';

/* ===== Ports (External Dependencies) ===== */

export interface OptionItem {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: string;
  description?: string;
  group?: string;
}

export interface OptionSourcePort {
  fetch(
    query: string,
    page?: number,
    signal?: AbortSignal
  ): Promise<{
    items: OptionItem[];
    hasMore?: boolean;
    total?: number;
  }>;
}

export interface TelemetryPort {
  track(event: string, properties?: Record<string, any>): void;
}

/* ===== Field Spec (from YAML) ===== */

export interface FieldSpec {
  name: string;
  type: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  
  // Options (for select-type fields)
  options?: OptionItem[];
  
  // UI behavior
  ui?: {
    behavior?: 'default' | 'async-search' | 'tag-select' | 'user-picker';
    searchable?: boolean;
    focusSearchOnOpen?: boolean;
    multiple?: boolean;
    clearable?: boolean;
    inlineThreshold?: number;
    virtualizeThreshold?: number;
    groupBy?: string;
    showRecent?: boolean;
    emptyState?: {
      title?: string;
      description?: string;
      actions?: Array<'clear' | 'create' | 'support'>;
    };
  };
  
  // Validation
  validation?: {
    required?: string;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: string;
  };
  
  // Telemetry
  telemetry?: {
    enabled?: boolean;
    events?: string[];
  };
}

export interface FactoryOverlays {
  // Global overlay defaults
  virtualizeThreshold?: number;
  focusSearchOnOpen?: boolean;
  // ... other global overlay config
}

/* ===== Recipe Context ===== */

export interface RecipeContext {
  /** Parsed field spec from YAML */
  spec: FieldSpec;
  
  /** Global overlay configuration */
  overlays: FactoryOverlays;
  
  /** External dependencies (data sources, analytics) */
  ports?: {
    optionSource?: OptionSourcePort;
    telemetry?: TelemetryPort;
  };
  
  /** Environment detection */
  env: {
    isMobile: boolean;
  };
  
  /** React Hook Form control */
  control: Control<FieldValues>;
}

/* ===== Recipe Render Output ===== */

export interface TriggerProps {
  field: ControllerRenderProps<FieldValues, string>;
  hasError?: boolean;
  disabled?: boolean;
}

export interface OverlayProps {
  open: boolean;
  onClose: () => void;
  field: ControllerRenderProps<FieldValues, string>;
}

export interface RecipeRender {
  /** Component that renders the trigger (button/input) */
  Trigger: React.FC<TriggerProps>;
  
  /** Component that renders the overlay content */
  Overlay: React.FC<OverlayProps>;
}

/* ===== Recipe Function Signature ===== */

export type Recipe = (ctx: RecipeContext) => RecipeRender;

/* ===== Recipe Registry (for generator dispatch) ===== */

export type RecipeType = 
  | 'simple-list'
  | 'async-search'
  | 'multi-select'
  | 'date-picker'
  | 'date-range'
  | 'tag-select'
  | 'user-picker'
  | 'command-palette';

export interface RecipeMetadata {
  name: string;
  type: RecipeType;
  description: string;
  recipe: Recipe;
}
