/**
 * WizardRenderer Component
 * 
 * Top-level renderer that takes validated flow JSON and renders the current step.
 * One-line usage: <WizardRenderer flow={flowJson} onSubmit={...} />
 */

import React from 'react'
import { FormScreen } from './FormScreen'
import { registerDefaultFields } from '../fields/createField'

// Auto-register default fields on module load
registerDefaultFields()

type Props = {
  flow: any // validated flow json
  currentStepIndex?: number // or manage internally
  onSubmitStep?: (payload: any) => Promise<void> | void
}

export const WizardRenderer: React.FC<Props> = ({
  flow,
  currentStepIndex = 0,
  onSubmitStep,
}) => {
  const step = flow.chapters?.flatMap((c: any) => c.steps)?.[currentStepIndex]
  if (!step) return <div>Done</div>

  if (step.type?.startsWith('form')) {
    return (
      <FormScreen
        fields={step.fields}
        defaultValues={{}}
        onSubmit={async (values) => {
          await onSubmitStep?.({ stepId: step.id, values })
          // navigation belongs to your shell/footer (keep it decoupled)
        }}
      />
    )
  }

  // TODO: handle informational, processing.scene, confirm.card etc.
  return <div>Unsupported step type: {String(step.type)}</div>
}
