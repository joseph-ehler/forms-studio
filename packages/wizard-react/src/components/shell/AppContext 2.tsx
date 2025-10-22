/**
 * AppContext - Tenant-Aware Layout System
 * 
 * INTELLIGENT: Automatically adapts layout based on tenant type.
 * 
 * B2C (Consumer):
 * - Readable content widths (65ch, ~700px-1280px)
 * - Typography-focused layouts
 * - Marketing, blogs, articles
 * 
 * B2B (Business):
 * - Full-width dashboards up to ultrawide
 * - Data-dense layouts
 * - Tables, charts, analytics
 * 
 * Usage:
 *   <AppProvider tenantType="b2c">
 *     <App />
 *   </AppProvider>
 */

import React, { createContext, useContext } from 'react'

export type TenantType = 'b2c' | 'b2b'
export type ThemeMode = 'light' | 'dark' | 'system'

interface AppContextValue {
  tenantType: TenantType
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
}

const AppContext = createContext<AppContextValue>({
  tenantType: 'b2c',
  theme: 'system',
  setTheme: () => {},
})

export const useApp = () => useContext(AppContext)

interface AppProviderProps {
  tenantType?: TenantType
  theme?: ThemeMode
  onThemeChange?: (theme: ThemeMode) => void
  children: React.ReactNode
}

export const AppProvider: React.FC<AppProviderProps> = ({
  tenantType = 'b2c',
  theme: controlledTheme = 'system',
  onThemeChange,
  children,
}) => {
  const [internalTheme, setInternalTheme] = React.useState<ThemeMode>(controlledTheme)
  
  const theme = controlledTheme
  const setTheme = onThemeChange ?? setInternalTheme
  
  // Apply theme to document + track OS changes
  React.useEffect(() => {
    const root = document.documentElement
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    
    const applyTheme = () => {
      if (theme === 'system') {
        root.setAttribute('data-theme', mql.matches ? 'dark' : 'light')
      } else {
        root.setAttribute('data-theme', theme)
      }
    }
    
    // Initial apply
    applyTheme()
    
    // Listen for OS theme changes (only if theme === 'system')
    if (theme === 'system') {
      mql.addEventListener('change', applyTheme)
      return () => mql.removeEventListener('change', applyTheme)
    }
  }, [theme])
  
  // Apply tenant type to document for CSS targeting
  React.useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-tenant', tenantType)
  }, [tenantType])
  
  return (
    <AppContext.Provider value={{ tenantType, theme, setTheme }}>
      {children}
    </AppContext.Provider>
  )
}

/**
 * Hook to check if current tenant is B2B
 */
export const useIsB2B = () => {
  const { tenantType } = useApp()
  return tenantType === 'b2b'
}

/**
 * Hook to check if current tenant is B2C
 */
export const useIsB2C = () => {
  const { tenantType } = useApp()
  return tenantType === 'b2c'
}

/**
 * Hook to get appropriate max-width for tenant type
 */
export const useTenantMaxWidth = (override?: string) => {
  const { tenantType } = useApp()
  
  if (override) return override
  
  // B2C: Readable content width
  // B2B: Wide dashboard width
  return tenantType === 'b2c' 
    ? 'var(--ds-content-b2c-max)'
    : 'var(--ds-content-b2b-max)'
}
