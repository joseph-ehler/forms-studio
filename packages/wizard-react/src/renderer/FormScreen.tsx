/**
 * FormScreen Component
 * 
 * Renders a form step with fields mapped from JSON → React components.
 */

import React from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '../rhf/zodResolver'
import { FieldRegistry } from '../fields/registry'
import { buildFormSchema } from '../validation/mapJsonValidationToZod'

type Props = {
  fields: any[] // JSON fields for this step
  defaultValues?: Record<string, any>
  onSubmit: (values: any) => void
  onChange?: (values: any) => void
}

export const FormScreen: React.FC<Props> = ({
  fields,
  defaultValues,
  onSubmit,
  onChange,
}) => {
  const schema = React.useMemo(
    () => buildFormSchema(fields) as z.ZodType<any>,
    [fields]
  )
  const methods = useForm({
    defaultValues,
    resolver: zodResolver(schema),
    mode: 'onSubmit',
  })
  const { handleSubmit, control, formState, watch } = methods

  // optional live change
  React.useEffect(() => {
    if (!onChange) return
    const sub = watch((v) => onChange(v))
    return () => sub.unsubscribe()
  }, [watch, onChange])

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((f) => {
          const factory = FieldRegistry.resolve(f.type)
          if (!factory) {
            return (
              <div
                key={f.id}
                className="text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded"
              >
                Unsupported field type: <code>{f.type}</code>
              </div>
            )
          }
          const Comp = factory(f)
          const name = f.bind || f.id
          return (
            <Comp
              key={name}
              name={name}
              label={f.label}
              description={f.description}
              placeholder={f.placeholder}
              required={!!f.validation?.required}
              disabled={!!f.disabled}
              defaultValue={f.defaultValue}
              json={f}
              control={control}
              errors={formState.errors as any}
            />
          )
        })}
        {/* submit handled by outer Footer; you can also render a button here */}
      </form>
    </FormProvider>
  )
}
