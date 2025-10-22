---
to: packages/wizard-react/src/fields/<%= name %>.tsx
---
import React from 'react'
import { OverlayPickerCore } from '@/components/overlay/OverlayPickerCore'
import { OverlayPicker } from '@/components/overlay/OverlayPicker'
import { OverlaySheet } from '@/components/overlay/OverlaySheet'
import { PickerFooter } from '@/components/overlay/PickerFooter'
<% if (type === 'date') { %>import { CalendarSkin } from '@/components/overlay/CalendarSkin'<% } %>
<% if (type === 'select') { %>import { SelectListSkin } from '@/components/select/SelectListSkin'<% } %>

interface <%= name %>Props {
  value?: any
  onChange?: (value: any) => void
  placeholder?: string
  disabled?: boolean
}

export const <%= name %>: React.FC<<%= name %>Props> = ({
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false
}) => {
  const isMobile = window.innerWidth < 768 // Or use useDeviceType()

  return (
    <OverlayPickerCore defaultOpen={false}>
      {({ isOpen, open, close, triggerRef }) => (
        <>
          <button
            ref={triggerRef}
            type="button"
            onClick={() => !disabled && open()}
            disabled={disabled}
            className="w-full min-h-[48px] border border-gray-300 rounded-md px-3 py-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {value ? String(value) : placeholder}
          </button>

          {/* Mobile Sheet */}
          {isMobile && isOpen && (
            <OverlaySheet
              open={isOpen}
              onClose={() => close('outside')}
              maxHeight={560}
              footer={
                <PickerFooter
                  onClear={() => onChange?.(null)}
                  onDone={() => close('select')}
                />
              }
            >
              <div className="p-4">
                <% if (type === 'date') { %><CalendarSkin
                  mode="single"
                  selected={value}
                  onSelect={(date) => {
                    onChange?.(date)
                    close('select')
                  }}
                /><% } else if (type === 'select') { %><SelectListSkin
                  options={[/* TODO: add options */]}
                  value={value}
                  onChange={(val) => {
                    onChange?.(val)
                    close('select')
                  }}
                /><% } else { %>{/* TODO: Add custom content */}<% } %>
              </div>
            </OverlaySheet>
          )}

          {/* Desktop Popover */}
          {!isMobile && isOpen && (
            <OverlayPicker
              open={isOpen}
              anchor={triggerRef.current}
              onOpenChange={(open) => {
                if (!open) close('outside')
              }}
              placement="bottom-start"
              sameWidth
              hardMaxHeight={560}
              content={
                <div className="p-4">
                  <% if (type === 'date') { %><CalendarSkin
                    mode="single"
                    selected={value}
                    onSelect={(date) => {
                      onChange?.(date)
                      close('select')
                    }}
                  /><% } else if (type === 'select') { %><SelectListSkin
                    options={[/* TODO: add options */]}
                    value={value}
                    onChange={(val) => {
                      onChange?.(val)
                      close('select')
                    }}
                  /><% } else { %>{/* TODO: Add custom content */}<% } %>
                </div>
              }
              footer={
                <PickerFooter
                  onClear={() => onChange?.(null)}
                  onDone={() => close('select')}
                />
              }
            />
          )}
        </>
      )}
    </OverlayPickerCore>
  )
}
