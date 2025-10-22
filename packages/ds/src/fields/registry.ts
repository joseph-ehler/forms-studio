/**
 * Field Registry
 * 
 * Central registry for mapping field types to React components.
 * Extensible - consumers can register custom field types.
 */

import type { FieldFactory, FieldRegistry as IFieldRegistry } from './types'

const _reg = new Map<string, FieldFactory>()

export const FieldRegistry: IFieldRegistry = {
  register: (type, factory) => _reg.set(type, factory),
  resolve: (type) => _reg.get(type),
  list: () => Array.from(_reg.keys()),
}

/**
 * Convenience: bulk register multiple field types
 */
export const registerFields = (map: Record<string, FieldFactory>) => {
  Object.entries(map).forEach(([k, f]) => FieldRegistry.register(k, f))
}
