/**
 * FormProgress Component
 * 
 * Multi-step form progress indicator.
 * Shows current step with visual progress bar.
 * 
 * Features:
 * - Numbered steps
 * - Step labels
 * - Visual progress line
 * - Completed/current/upcoming states
 * - Click to navigate (optional)
 */

import React from 'react'
import { getConfigFromJSON, mergeConfig } from './utils/json-config'

interface FormProgressProps {
  steps: string[]
  currentStep: number // 0-indexed
  onStepClick?: (step: number) => void
  allowClickPrevious?: boolean
  className?: string
  json?: any
}

export const FormProgress: React.FC<FormProgressProps> = ({
  steps,
  currentStep,
  onStepClick,
  allowClickPrevious = true,
  className = '',
  json,
}) => {
  const jsonConfig = getConfigFromJSON(json, ['steps', 'currentStep', 'onStepClick', 'allowClickPrevious'])
  const config = mergeConfig(
    { steps, currentStep, onStepClick, allowClickPrevious },
    jsonConfig,
    {}
  )
  const handleStepClick = (index: number) => {
    if (onStepClick && (allowClickPrevious ? index <= currentStep : index === currentStep)) {
      onStepClick(index)
    }
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isClickable = onStepClick && (allowClickPrevious ? index <= currentStep : false)

          return (
            <React.Fragment key={index}>
              {/* Step */}
              <div className="flex flex-col items-center flex-1">
                <button
                  type="button"
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  className={`
                    flex items-center justify-center
                    min-w-[48px] min-h-[48px] rounded-full
                    font-semibold text-base
                    transition-all
                    ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : 'bg-gray-200 text-gray-600'
                    }
                    ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                  `}
                >
                  {isCompleted ? (
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </button>
                
                <span
                  className={`
                    mt-2 text-sm font-medium text-center
                    ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}
                  `}
                >
                  {step}
                </span>
              </div>

              {/* Progress Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-2 mb-6">
                  <div
                    className={`h-full rounded-full transition-all ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
