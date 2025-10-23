export function resolveTypographyDisplay(label?: string) {
  return label ?? '';
}

export function getTypographyFromJSON(x?: unknown) {
  return typeof x === 'string' ? x : '';
}
