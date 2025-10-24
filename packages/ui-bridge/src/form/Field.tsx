/**
 * Field utilities
 */
import { useId } from 'react';

export function useFieldIds(id?: string) {
  const autoId = useId();
  const base = id ?? `fld-${autoId}`;
  
  return {
    id: base,
    hintId: `${base}-hint`,
    errId: `${base}-err`,
    describedBy: (hasHint?: boolean, hasErr?: boolean) => {
      const ids = [
        hasHint ? `${base}-hint` : '',
        hasErr ? `${base}-err` : '',
      ].filter(Boolean);
      return ids.length > 0 ? ids.join(' ') : undefined;
    },
  };
}
