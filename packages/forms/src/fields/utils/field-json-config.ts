export function mergeFieldConfig<T extends object>(base: T, overrides?: Partial<T>): T {
  return { ...base, ...(overrides ?? {}) };
}
