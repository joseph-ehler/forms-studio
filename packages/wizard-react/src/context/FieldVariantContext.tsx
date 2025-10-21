/**
 * Field Variant Context
 * 
 * Provides global configuration for field variants.
 * Allows forms to default to 'auto', 'native', or 'custom' variants.
 */

import React, { createContext, useContext, ReactNode } from 'react'
import { useDeviceType, DeviceType } from '../hooks/useDeviceType'

export type FieldVariant = 'auto' | 'native' | 'custom'

export interface FieldVariantConfig {
  defaultVariant: FieldVariant
  deviceType: DeviceType
  forceNative: boolean
  forceCustom: boolean
}

interface FieldVariantContextValue {
  config: FieldVariantConfig
  shouldUseNative: (fieldVariant?: FieldVariant) => boolean
}

const FieldVariantContext = createContext<FieldVariantContextValue | null>(null)

interface FieldVariantProviderProps {
  children: ReactNode
  defaultVariant?: FieldVariant
  forceNative?: boolean
  forceCustom?: boolean
}

export const FieldVariantProvider: React.FC<FieldVariantProviderProps> = ({
  children,
  defaultVariant = 'auto',
  forceNative = false,
  forceCustom = false,
}) => {
  const deviceType = useDeviceType()

  const config: FieldVariantConfig = {
    defaultVariant,
    deviceType,
    forceNative,
    forceCustom,
  }

  const shouldUseNative = (fieldVariant?: FieldVariant): boolean => {
    // Force overrides
    if (forceNative) return true
    if (forceCustom) return false

    // Field-level variant
    const variant = fieldVariant || defaultVariant

    if (variant === 'native') return true
    if (variant === 'custom') return false

    // Auto detection
    return deviceType.preferNative
  }

  const value: FieldVariantContextValue = {
    config,
    shouldUseNative,
  }

  return (
    <FieldVariantContext.Provider value={value}>
      {children}
    </FieldVariantContext.Provider>
  )
}

export const useFieldVariant = (): FieldVariantContextValue => {
  const context = useContext(FieldVariantContext)
  
  if (!context) {
    // Provide default implementation if provider not used
    const deviceType = useDeviceType()
    return {
      config: {
        defaultVariant: 'auto',
        deviceType,
        forceNative: false,
        forceCustom: false,
      },
      shouldUseNative: (variant) => {
        if (variant === 'native') return true
        if (variant === 'custom') return false
        return deviceType.preferNative
      },
    }
  }

  return context
}
