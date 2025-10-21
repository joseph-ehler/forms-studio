/**
 * FormTabs Component
 * 
 * Tabbed sections for complex forms.
 * Switch between different form sections.
 * 
 * Features:
 * - Horizontal tab bar
 * - Active state indicator
 * - Keyboard navigation
 * - Controlled or uncontrolled
 */

import React, { useState } from 'react'
import { getConfigFromJSON, mergeConfig } from './utils/json-config'

interface TabItem {
  id: string
  label: string
  icon?: React.ReactNode
}

interface FormTabsProps {
  tabs: TabItem[]
  defaultTab?: string
  activeTab?: string
  onTabChange?: (tabId: string) => void
  children: React.ReactNode
  className?: string
  json?: any
}

export const FormTabs: React.FC<FormTabsProps> = ({
  tabs: propTabs,
  defaultTab: propDefaultTab,
  activeTab: controlledActiveTab,
  onTabChange,
  children,
  className = '',
  json,
}) => {
  const jsonConfig = getConfigFromJSON(json, ['tabs', 'defaultTab'])
  const config = mergeConfig(
    { tabs: propTabs, defaultTab: propDefaultTab },
    jsonConfig,
    {}
  )
  const tabs = config.tabs || []
  const defaultTab = config.defaultTab || tabs[0]?.id

  const [uncontrolledActiveTab, setUncontrolledActiveTab] = useState(
    defaultTab
  )

  const activeTab = controlledActiveTab ?? uncontrolledActiveTab

  const handleTabClick = (tabId: string) => {
    if (!controlledActiveTab) {
      setUncontrolledActiveTab(tabId)
    }
    onTabChange?.(tabId)
  }

  return (
    <div className={className}>
      {/* Tab Bar */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          {tabs.map((tab: TabItem) => {
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3
                  border-b-2 font-medium text-base
                  transition-colors
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-4">{children}</div>
    </div>
  )
}

// Tab Panel helper component
interface FormTabPanelProps {
  tabId: string
  activeTab: string
  children: React.ReactNode
}

export const FormTabPanel: React.FC<FormTabPanelProps> = ({
  tabId,
  activeTab,
  children,
}) => {
  if (tabId !== activeTab) return null

  return <div>{children}</div>
}
