/**
 * Form component with Zod + React Hook Form integration
 */
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export type FormProps<TSchema extends z.ZodTypeAny> = {
  schema: TSchema;
  defaultValues?: Partial<z.infer<TSchema>>;
  onSubmit: (data: z.infer<TSchema>) => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
};

/**
 * Schema-first form with automatic validation
 * 
 * @example
 * ```tsx
 * <Form
 *   schema={CreateProjectSchema}
 *   defaultValues={{ visibility: 'private' }}
 *   onSubmit={(data) => console.log(data)}
 * >
 *   <Input name="name" label="Name" required />
 *   <Button type="submit">Create</Button>
 * </Form>
 * ```
 */
export function Form<TSchema extends z.ZodTypeAny>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
}: FormProps<TSchema>) {
  const methods = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
    mode: 'onSubmit',
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={className}>
        {children}
      </form>
    </FormProvider>
  );
}
