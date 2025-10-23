import type { FieldRenderProps } from '../../form-core/types';

export function getAriaProps(opts: {
  id: string;
  hasError?: boolean;
  describedById?: string;
}): FieldRenderProps {
  const { id, hasError, describedById } = opts;
  return {
    id,
    'aria-invalid': hasError ? true : undefined,
    'aria-describedby': describedById,
  };
}

export const getLabelProps = (id: string) => ({ htmlFor: id });
export const getDescriptionProps = (id: string) => ({ id });
