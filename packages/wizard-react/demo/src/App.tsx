import React from 'react'
import { useForm } from 'react-hook-form'
import {
  TextField, TextareaField, NumberField, SelectField, MultiSelectField, TagInputField, ChipsField, ToggleField,
  DateField, TimeField, DateTimeField, SliderField, RatingField, RepeaterField,
  SignatureField, FileField, CalculatedField, ColorField, RangeField,
  EmailField, PasswordField, PhoneField, SearchField, RadioGroupField, AddressField,
  DateRangeField, NPSField, MatrixField, CurrencyField, OTPField, RankField, TableField,
  // Complete Design System (21 components)
  FormStack, FormSection, FormGrid, FormDivider, FormMessage, FormActions, FormButton,
  FormCard, FormProgress, FormBadge, FormTooltip, FormAccordion, FormTabs, FormTabPanel,
  FormSkeleton, FormEmpty,
  // Typography
  FormHelperText, FormCode,
} from '@joseph.ehler/wizard-react'

export default function Demo() {
  const { control, handleSubmit, formState: { errors } } = useForm()
  const [activeTab, setActiveTab] = React.useState('tab1')

  const onSubmit = (data: any) => {
    console.log('📋 Form Data:', data)
    alert('✅ Form submitted! Check console for data.')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎨 Forms Studio - JSON-Driven Design System
          </h1>
          <p className="text-gray-600 mb-4">
            32 Field Types • 21 Design System Components • JSON-Configurable Typography • Unified Overlay System 🚀
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">32 Fields</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">21 Components</span>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">🎛️ JSON Control</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">✅ Phase 3b Complete!</span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">Mobile-First 📱</span>
            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full font-medium">📅 Date/Time Unified</span>
          </div>
        </div>

          <form onSubmit={handleSubmit(onSubmit)}>
          <FormStack spacing="2xl">
          
          {/* JSON-Configurable Typography */}
          <FormCard variant="outlined" padding="lg">
            <FormSection
              title="🎛️ JSON-Configurable Typography System"
              description="Control labels, descriptions, errors via JSON - foolproof and flexible"
              divider="bottom"
            >
              <FormMessage type="success" title="New! Typography Control System">
                Every field can now control typography visibility via JSON. Everything visible by default (safe), hide what you don't need!
              </FormMessage>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold mb-3">Default: Show Everything (Safest)</h4>
                  <TextField
                    name="default_example"
                    label="Email Address"
                    description="We'll never share your email with anyone"
                    required
                    placeholder="user@example.com"
                    control={control}
                    errors={errors}
                    json={{}}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    <code className="bg-gray-100 px-1 rounded">json: {'{}'}</code> - Shows label, description, required indicator, and errors
                  </p>
                </div>

                <FormDivider />

                <div>
                  <h4 className="text-sm font-semibold mb-3">Variant: "minimal" - Label + Errors Only</h4>
                  <TextField
                    name="minimal_example"
                    label="Password"
                    description="At least 8 characters"
                    required
                    placeholder="••••••••"
                    control={control}
                    errors={errors}
                    json={{
                      typographyVariant: 'minimal'
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    <code className="bg-gray-100 px-1 rounded">{`typographyVariant: "minimal"`}</code> - Description hidden, clean look
                  </p>
                </div>

                <FormDivider />

                <div>
                  <h4 className="text-sm font-semibold mb-3">Variant: "compact" - Label Only</h4>
                  <TextField
                    name="compact_example"
                    label="Username"
                    description="Choose a unique username"
                    required
                    placeholder="johndoe"
                    control={control}
                    errors={errors}
                    json={{
                      typographyVariant: 'compact'
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    <code className="bg-gray-100 px-1 rounded">{`typographyVariant: "compact"`}</code> - No description, no required indicator
                  </p>
                </div>

                <FormDivider />

                <div>
                  <h4 className="text-sm font-semibold mb-3">Variant: "hidden" - Input Only</h4>
                  <TextField
                    name="hidden_example"
                    label="Search"
                    description="Search our database"
                    placeholder="Search..."
                    control={control}
                    errors={errors}
                    json={{
                      typographyVariant: 'hidden'
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    <code className="bg-gray-100 px-1 rounded">{`typographyVariant: "hidden"`}</code> - Perfect for search bars and filters
                  </p>
                </div>

                <FormDivider />

                <div>
                  <h4 className="text-sm font-semibold mb-3">Fine-Grained Control: Hide Specific Elements</h4>
                  <TextField
                    name="custom_example"
                    label="API Key"
                    description="Found in your account settings"
                    required
                    placeholder="sk_live_..."
                    control={control}
                    errors={errors}
                    json={{
                      typographyDisplay: {
                        showLabel: true,
                        showDescription: false,
                        showError: true,
                        showRequired: false
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    <code className="bg-gray-100 px-1 rounded">typographyDisplay: {`{ showDescription: false, showRequired: false }`}</code>
                  </p>
                </div>

                <FormMessage type="info">
                  <strong>5 Variants:</strong> default, minimal, compact, hidden, error-only<br />
                  <strong>Priority:</strong> Props → JSON → Defaults (everything visible)
                </FormMessage>
              </div>
            </FormSection>
          </FormCard>

          {/* Helper Text & States */}
          <FormCard variant="outlined" padding="lg">
            <FormSection
              title="💬 Helper Text & Validation States"
              description="FormHelperText supports 4 variants for different contexts"
              divider="bottom"
            >
              <FormMessage type="info" title="Helper Text Types">
                Use helper text to guide users, show validation feedback, and provide context
              </FormMessage>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold mb-3">1. Default Helper (Instructions)</h4>
                  <TextField
                    name="username_helper"
                    label="Username"
                    description="Must be 3-20 characters, letters and numbers only"
                    placeholder="johndoe123"
                    control={control}
                    errors={errors}
                    json={{}}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    <code className="bg-gray-100 px-1 rounded">description</code> prop shows as default helper text
                  </p>
                </div>

                <FormDivider />

                <div>
                  <h4 className="text-sm font-semibold mb-3">2. Success State (Validation Passed)</h4>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Email Address *</label>
                    <input
                      type="email"
                      defaultValue="user@example.com"
                      className="w-full rounded-md border border-green-300 px-3 py-3 text-base shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 min-h-[44px]"
                    />
                    <FormHelperText variant="success">
                      Email is available and valid!
                    </FormHelperText>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    JSON: <code className="bg-gray-100 px-1 rounded">{`{ "validationState": "success", "successMessage": "..." }`}</code>
                  </p>
                </div>

                <FormDivider />

                <div>
                  <h4 className="text-sm font-semibold mb-3">3. Warning State (Soft Validation)</h4>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Password *</label>
                    <input
                      type="password"
                      defaultValue="pass123"
                      className="w-full rounded-md border border-yellow-300 px-3 py-3 text-base shadow-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 min-h-[44px]"
                    />
                    <FormHelperText variant="warning">
                      Password is weak. Consider adding special characters.
                    </FormHelperText>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    JSON: <code className="bg-gray-100 px-1 rounded">{`{ "validationState": "warning", "warningMessage": "..." }`}</code>
                  </p>
                </div>

                <FormDivider />

                <div>
                  <h4 className="text-sm font-semibold mb-3">4. Error State (Validation Failed)</h4>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                    <input
                      type="tel"
                      defaultValue="123"
                      className="w-full rounded-md border border-red-300 px-3 py-3 text-base shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[44px]"
                      aria-invalid="true"
                    />
                    <FormHelperText variant="error">
                      Phone number must be at least 10 digits
                    </FormHelperText>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Automatic from <code className="bg-gray-100 px-1 rounded">errors</code> object
                  </p>
                </div>

                <FormDivider />

                <div>
                  <h4 className="text-sm font-semibold mb-3">5. Character Counter</h4>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <div className="relative">
                      <textarea
                        rows={3}
                        defaultValue="I love building apps"
                        maxLength={100}
                        className="w-full rounded-md border border-gray-300 px-3 py-3 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                        20/100
                      </div>
                    </div>
                    <FormHelperText>
                      Describe yourself in a few words
                    </FormHelperText>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    JSON: <code className="bg-gray-100 px-1 rounded">{`{ "maxLength": 100, "showCounter": true }`}</code>
                  </p>
                </div>

                <FormMessage type="warning" title="Best Practice">
                  <strong>Always show helper text by default</strong> (showDescription: true).<br />
                  Hide only when space is extremely limited or context is obvious.
                </FormMessage>
              </div>
            </FormSection>
          </FormCard>

          {/* Real-World JSON Examples */}
          <FormCard variant="filled" padding="lg">
            <FormSection
              title="📋 Real-World JSON Examples"
              description="Common form patterns with complete JSON configuration"
              divider="bottom"
            >
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold mb-3">Login Form (Minimal)</h4>
                  <FormCode variant="block">{`{
  "fields": [
    {
      "type": "email",
      "name": "email",
      "label": "Email",
      "placeholder": "you@company.com",
      "required": true,
      "typographyVariant": "minimal"
    },
    {
      "type": "password",
      "name": "password",
      "label": "Password",
      "required": true,
      "typographyVariant": "minimal"
    }
  ]
}`}</FormCode>
                </div>

                <FormDivider />

                <div>
                  <h4 className="text-sm font-semibold mb-3">Registration Form (Default with Hints)</h4>
                  <FormCode variant="block">{`{
  "fields": [
    {
      "type": "text",
      "name": "username",
      "label": "Username",
      "description": "3-20 characters, letters and numbers only",
      "required": true,
      "validation": {
        "minLength": 3,
        "maxLength": 20,
        "pattern": "^[a-zA-Z0-9]+$"
      }
    },
    {
      "type": "email",
      "name": "email",
      "label": "Email Address",
      "description": "We'll send a confirmation email",
      "required": true,
      "validationMessages": {
        "success": "Email is available!",
        "error": "This email is already registered"
      }
    },
    {
      "type": "password",
      "name": "password",
      "label": "Password",
      "description": "At least 8 characters with 1 number",
      "required": true,
      "showStrength": true,
      "validation": {
        "minLength": 8
      }
    }
  ]
}`}</FormCode>
                </div>

                <FormDivider />

                <div>
                  <h4 className="text-sm font-semibold mb-3">Search Filter (Hidden Typography)</h4>
                  <FormCode variant="block">{`{
  "type": "search",
  "name": "query",
  "placeholder": "Search products...",
  "typographyVariant": "hidden"
}`}</FormCode>
                </div>

                <FormDivider />

                <div>
                  <h4 className="text-sm font-semibold mb-3">Data Table Inline Edit (Compact)</h4>
                  <FormCode variant="block">{`{
  "type": "number",
  "name": "quantity",
  "label": "Qty",
  "typographyVariant": "compact",
  "validation": {
    "min": 1,
    "max": 999
  }
}`}</FormCode>
                </div>

                <FormDivider />

                <div>
                  <h4 className="text-sm font-semibold mb-3">Multi-Step Wizard (Error-Only)</h4>
                  <FormCode variant="block">{`{
  "step": {
    "title": "What's your email address?",
    "description": "We'll use this to send you updates"
  },
  "fields": [
    {
      "type": "email",
      "name": "email",
      "label": "Email Address",
      "description": "We'll never share your email",
      "typographyVariant": "error-only"
    }
  ]
}`}</FormCode>
                  <p className="text-xs text-gray-500 mt-2">
                    Step heading shows label/description, field only shows errors
                  </p>
                </div>
              </div>
            </FormSection>
          </FormCard>

          {/* Complete Design System Showcase */}
          <FormCard variant="filled" padding="lg">
            <FormSection
              title="🎨 Complete Design System - 21 Components"
              description="Everything you need to build professional forms"
              divider="bottom"
            >
              <FormMessage type="info" title="Complete Design System">
                21 components: 7 typography, 14 layout/feedback. All fields use typography components internally!
              </FormMessage>

              {/* Progress Indicator */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  FormProgress <FormBadge variant="new">New!</FormBadge>
                </h4>
                <FormProgress
                  steps={['Start', 'Configure', 'Review', 'Complete']}
                  currentStep={2}
                />
              </div>

              <FormDivider label="Layout Components" />

              {/* Grid Demo */}
              <div>
                <h4 className="text-sm font-semibold mb-3">FormGrid + FormCard</h4>
                <FormGrid columns={3} gap="md">
                  <FormCard variant="default" padding="sm">
                    <p className="text-sm text-center">Default Card</p>
                  </FormCard>
                  <FormCard variant="outlined" padding="sm">
                    <p className="text-sm text-center">Outlined Card</p>
                  </FormCard>
                  <FormCard variant="filled" padding="sm">
                    <p className="text-sm text-center">Filled Card</p>
                  </FormCard>
                </FormGrid>
              </div>

              {/* Badges Demo */}
              <div>
                <h4 className="text-sm font-semibold mb-3">FormBadge Variants</h4>
                <div className="flex flex-wrap gap-2">
                  <FormBadge variant="required" />
                  <FormBadge variant="optional" />
                  <FormBadge variant="new">New Feature</FormBadge>
                  <FormBadge variant="beta">Beta</FormBadge>
                  <FormBadge variant="pro">Pro Only</FormBadge>
                </div>
              </div>

              {/* Tooltip Demo */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  FormTooltip
                  <FormTooltip content="This is a helpful tooltip that appears on hover!" position="right" />
                </h4>
                <p className="text-sm text-gray-600">Hover the info icon above to see the tooltip</p>
              </div>

              <FormDivider label="Navigation Components" variant="dashed" />

              {/* Accordion Demo */}
              <FormAccordion title="🔽 FormAccordion - Click to Expand" defaultOpen={false}>
                <FormStack spacing="md">
                  <TextField name="advanced1" label="Advanced Option 1" control={control} errors={errors} json={{}} />
                  <TextField name="advanced2" label="Advanced Option 2" control={control} errors={errors} json={{}} />
                </FormStack>
              </FormAccordion>

              {/* Tabs Demo */}
              <div>
                <h4 className="text-sm font-semibold mb-3">FormTabs</h4>
                <FormTabs
                  tabs={[
                    { id: 'tab1', label: 'Profile' },
                    { id: 'tab2', label: 'Settings' },
                    { id: 'tab3', label: 'Advanced' }
                  ]}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                >
                  <FormTabPanel tabId="tab1" activeTab={activeTab}>
                    <p className="text-sm text-gray-600 py-4">Profile tab content goes here</p>
                  </FormTabPanel>
                  <FormTabPanel tabId="tab2" activeTab={activeTab}>
                    <p className="text-sm text-gray-600 py-4">Settings tab content goes here</p>
                  </FormTabPanel>
                  <FormTabPanel tabId="tab3" activeTab={activeTab}>
                    <p className="text-sm text-gray-600 py-4">Advanced tab content goes here</p>
                  </FormTabPanel>
                </FormTabs>
              </div>

              <FormDivider label="State Components" variant="dotted" />

              {/* Skeleton Demo */}
              <div>
                <h4 className="text-sm font-semibold mb-3">FormSkeleton (Loading State)</h4>
                <FormCard variant="outlined" padding="md">
                  <FormSkeleton fields={3} showLabels={true} showActions={false} />
                </FormCard>
              </div>

              {/* Empty State Demo */}
              <div>
                <h4 className="text-sm font-semibold mb-3">FormEmpty (Empty State)</h4>
                <FormCard variant="outlined" padding="md">
                  <FormEmpty
                    icon={
                      <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    }
                    title="No forms found"
                    description="Create your first form to get started with the design system"
                  />
                </FormCard>
              </div>

              {/* Message Variants */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">FormMessage Variants</h4>
                <FormMessage type="success" title="Success!">
                  Your form has been saved successfully.
                </FormMessage>
                <FormMessage type="warning" title="Warning">
                  Please review your entries before submitting.
                </FormMessage>
                <FormMessage type="error" dismissible>
                  There was an error processing your request.
                </FormMessage>
              </div>

              {/* Button Variants */}
              <div>
                <h4 className="text-sm font-semibold mb-3">FormButton Variants & Sizes</h4>
                <FormStack spacing="sm">
                  <FormActions align="left">
                    <FormButton variant="primary" size="sm">Small Primary</FormButton>
                    <FormButton variant="secondary" size="sm">Small Secondary</FormButton>
                    <FormButton variant="ghost" size="sm">Small Ghost</FormButton>
                  </FormActions>
                  <FormActions align="left">
                    <FormButton variant="primary" size="md">Medium Primary</FormButton>
                    <FormButton variant="secondary" size="md">Medium Secondary</FormButton>
                    <FormButton variant="ghost" size="md">Medium Ghost</FormButton>
                  </FormActions>
                  <FormActions align="left">
                    <FormButton variant="primary" size="lg">Large Primary</FormButton>
                    <FormButton variant="secondary" size="lg">Large Secondary</FormButton>
                    <FormButton variant="ghost" size="lg">Large Ghost</FormButton>
                  </FormActions>
                </FormStack>
              </div>
            </FormSection>
          </FormCard>
          
          {/* Foundation Fields */}
          <FormSection title="Foundation Fields (17)" spacing="normal">
            <TextField name="text" label="Text Field" placeholder="Enter text" control={control} errors={errors} json={{}} />
            <TextareaField name="textarea" label="Textarea Field" placeholder="Enter long text" control={control} errors={errors} json={{}} />
            <NumberField name="number" label="Number Field" control={control} errors={errors} json={{ min: 0, max: 100 }} />
            <SelectField name="select" label="Select Field" control={control} errors={errors} json={{ options: ['Option 1', 'Option 2', 'Option 3'] }} />
            <ChipsField name="chips" label="Chips Field" control={control} errors={errors} json={{ options: ['React', 'Vue', 'Angular', 'Svelte'] }} />
            <ToggleField name="toggle" label="Toggle Field" control={control} errors={errors} json={{}} />
            <DateField name="date" label="Date Field" control={control} errors={errors} json={{}} />
            <TimeField name="time" label="Time Field" control={control} errors={errors} json={{}} />
            <DateTimeField name="datetime" label="DateTime Field" control={control} errors={errors} json={{}} />
            <SliderField name="slider" label="Slider Field" control={control} errors={errors} json={{ min: 0, max: 1000, step: 50 }} />
            <RatingField name="rating" label="Rating Field" control={control} errors={errors} json={{ max: 5, icon: 'star' }} />
            <SignatureField name="signature" label="Signature Field" control={control} errors={errors} json={{}} />
            <FileField name="file" label="File Field" control={control} errors={errors} json={{}} />
            <CalculatedField name="calculated" label="Calculated Field (Number × 2)" control={control} errors={errors} json={{ expression: 'fields.number * 2', dependencies: ['fields.number'], format: 'number' }} />
            <ColorField name="color" label="Color Field" control={control} errors={errors} json={{ format: 'hex', presets: ['#FF6B6B', '#4ECDC4', '#45B7D1'] }} />
            <RangeField name="range" label="Range Field" control={control} errors={errors} json={{ min: 0, max: 1000, step: 50 }} />
            <RepeaterField name="repeater" label="Repeater Field" control={control} errors={errors} json={{ minItems: 1, maxItems: 3, itemSchema: [{ id: 'name', type: 'text', label: 'Name' }] }} />
          </FormSection>

          {/* Composite Fields */}
          <FormSection title="Composite Fields (16)" spacing="normal">
            <EmailField name="email" label="Email Field" control={control} errors={errors} json={{}} />
            <PasswordField name="password" label="Password Field" control={control} errors={errors} json={{}} />
            <PhoneField name="phone" label="Phone Field" control={control} errors={errors} json={{}} />
            <SearchField name="search" label="Search Field" control={control} errors={errors} json={{}} />
            <RadioGroupField name="radio" label="Radio Group Field" control={control} errors={errors} json={{ options: ['Option A', 'Option B', 'Option C'] }} />
            <AddressField name="address" label="Address Field" control={control} errors={errors} json={{}} />
            <DateRangeField name="daterange" label="Date Range Field" control={control} errors={errors} json={{}} />
            <CurrencyField name="currency" label="Currency Field" control={control} errors={errors} json={{ currency: 'USD' }} />
            <NPSField name="nps" label="NPS Field (0-10 Score)" control={control} errors={errors} json={{ followUp: true, showCategory: true }} />
            <MatrixField name="matrix" label="Matrix Field" control={control} errors={errors} json={{ rows: [{ id: 'q1', label: 'Quality' }, { id: 'q2', label: 'Speed' }], columns: [{ id: 'poor', label: 'Poor', value: 1 }, { id: 'good', label: 'Good', value: 2 }] }} />
            <OTPField name="otp" label="OTP Field (6 Digits)" control={control} errors={errors} json={{ digits: 6 }} />
            <RankField name="rank" label="Rank Field (Drag to Reorder)" control={control} errors={errors} json={{ options: [{ id: '1', label: 'First Priority' }, { id: '2', label: 'Second Priority' }, { id: '3', label: 'Third Priority' }] }} />
            <TableField name="table" label="Table Field (Add/Remove Rows)" control={control} errors={errors} json={{ columns: [{ id: 'item', label: 'Item', type: 'text' }, { id: 'qty', label: 'Quantity', type: 'number' }], minRows: 1, maxRows: 5 }} />
          </FormSection>

          {/* Beautiful Popover Fields */}
          <FormSection title="✨ Beautiful Popover Fields with Search" spacing="normal">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-purple-900 mb-2">🔍 Clear Search Affordances</h3>
              <p className="text-xs text-purple-700 mb-2">
                These fields make search capabilities obvious with visual indicators:
              </p>
              <ul className="text-xs text-purple-600 space-y-1 ml-4">
                <li>• <strong>Search Icons:</strong> 🔍 Magnifying glass or 🏷️ tag icons on left side</li>
                <li>• <strong>Clear Placeholders:</strong> "Type to search..." - explicit instructions</li>
                <li>• <strong>Helper Hints:</strong> Inline text shows keyboard shortcuts</li>
                <li>• <strong>Sticky Headers:</strong> Search bars stay visible while scrolling</li>
                <li>• <strong>Multiple Cues:</strong> Never relying on cursor alone!</li>
              </ul>
            </div>

            <SelectField
              name="country"
              label="Country (🔍 Search Icon + Placeholder)"
              description="Notice the search icon on left + 'Type to search...' placeholder - clear visual affordances!"
              control={control}
              errors={errors}
              json={{
                options: [
                  'United States', 'Canada', 'Mexico', 'United Kingdom',
                  'Germany', 'France', 'Spain', 'Italy', 'Australia',
                  'Japan', 'China', 'India', 'Brazil'
                ],
                allowCustom: true
              }}
            />

            <ColorField
              name="brandColor"
              label="Brand Color (Beautiful Palette)"
              description="Material Design palette • Custom picker • Recent colors • HEX/RGB/HSL"
              control={control}
              errors={errors}
              json={{
                format: 'hex',
                presets: ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#000000', '#FFFFFF']
              }}
            />

            <DateRangeField
              name="tripDates"
              label="Trip Dates (Dual Calendar)"
              description="Visual range selection • Quick presets • Clear & Done buttons"
              control={control}
              errors={errors}
              json={{
                presets: ['Today', 'This Week', 'This Month', 'Last 30 Days']
              }}
            />

            <MultiSelectField
              name="skills"
              label="Skills (🔍 Sticky Search Bar in Popover)"
              description="Click to see search bar at top of list - stays visible while scrolling!"
              placeholder="Select your skills..."
              control={control}
              errors={errors}
              json={{
                options: [
                  'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python',
                  'Next.js', 'Vue.js', 'Angular', 'Svelte', 'Go',
                  'Rust', 'Swift', 'Kotlin', 'Java', 'C#'
                ],
                maxSelections: 5,
                allowSearch: true
              }}
            />

            <TagInputField
              name="keywords"
              label="Keywords (🏷️ Icon + Inline Hints)"
              description="Tag icon on left + 'Press Enter or ,' hint on right - triple affordance system!"
              control={control}
              errors={errors}
              json={{
                suggestions: [
                  'frontend', 'backend', 'fullstack', 'mobile', 'web',
                  'api', 'database', 'cloud', 'devops', 'testing',
                  'ui-ux', 'performance', 'security', 'scalability'
                ],
                maxTags: 8,
                allowCustom: true,
                separators: ['Enter', ',']
              }}
            />
          </FormSection>

          {/* NEW: Unified Overlay System Showcase */}
          <FormCard variant="filled" padding="lg">
            <FormSection
              title="🚀 NEW: Unified Overlay System (Phase 3b Complete!)"
              description="Mobile-first overlays with consistent UX across all picker fields"
              divider="bottom"
            >
              <FormMessage type="success" title="Phase 3b Complete! 🎉">
                <strong>5 Fields Unified:</strong> SelectField, MultiSelectField, DateField, TimeField, DateRangeField all use unified overlay primitives!
              </FormMessage>

              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">✨ What's New:</h4>
                  <ul className="text-xs text-blue-700 space-y-1 ml-4">
                    <li>• <strong>Desktop:</strong> Floating UI popover with smart collision detection</li>
                    <li>• <strong>Mobile:</strong> Full-screen bottom sheet with drag-to-dismiss</li>
                    <li>• <strong>Tablet:</strong> Half-screen sheet (optimal middle ground)</li>
                    <li>• <strong>One Component:</strong> Auto-detects device & renders best UI</li>
                    <li>• <strong>JSON-Configurable:</strong> Control presentation, sameWidth, offset, search, etc.</li>
                  </ul>
                </div>

                {/* SelectField with Overlay */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">SelectField (Unified Overlay)</h4>
                  <SelectField
                    name="select_overlay"
                    label="Select with New Overlay System"
                    description="Desktop: Popover | Mobile: Sheet | Auto-detected!"
                    control={control}
                    errors={errors}
                    json={{
                      options: [
                        { label: '🚀 Fast', value: 'fast' },
                        { label: '⚡ Lightning', value: 'lightning' },
                        { label: '🔥 Blazing', value: 'blazing' },
                        { label: '💨 Instant', value: 'instant' },
                      ],
                      ui: {
                        search: true,
                        sameWidth: true,
                        offset: 6,
                        closeOnSelect: true,
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    <strong>Try it!</strong> Open on desktop vs mobile to see different overlays
                  </p>
                </div>

                <FormDivider />

                {/* MultiSelectField with Chips */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">MultiSelectField (Chips + Footer)</h4>
                  <MultiSelectField
                    name="multi_overlay"
                    label="Multi-Select with Chips & Footer"
                    description="Shows chips in trigger | Done/Clear footer | Stays open for multiple selections"
                    placeholder="Select multiple options..."
                    control={control}
                    errors={errors}
                    json={{
                      options: [
                        { label: '⚛️ React', value: 'react' },
                        { label: '📘 TypeScript', value: 'typescript' },
                        { label: '🎨 Tailwind', value: 'tailwind' },
                        { label: '⚡ Vite', value: 'vite' },
                        { label: '🔥 Firebase', value: 'firebase' },
                        { label: '🌐 Next.js', value: 'nextjs' },
                        { label: '📦 Webpack', value: 'webpack' },
                        { label: '🧪 Jest', value: 'jest' },
                      ],
                      ui: {
                        search: true,
                        closeOnSelect: false,
                        maxChipsDisplay: 3,
                        sameWidth: true,
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    <strong>Features:</strong> Click chips to remove | "+N more" badge | Done/Clear buttons
                  </p>
                </div>

                <FormDivider />

                {/* Architecture Benefits */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-green-900 mb-2">🏗️ Architecture Benefits:</h4>
                  <ul className="text-xs text-green-700 space-y-1 ml-4">
                    <li>• <strong>DRY:</strong> One overlay system for all picker fields</li>
                    <li>• <strong>Consistent UX:</strong> Same behavior everywhere</li>
                    <li>• <strong>Mobile-First:</strong> Sheet by default on {'<'}768px</li>
                    <li>• <strong>A11y:</strong> ARIA semantics, keyboard nav, focus trap</li>
                    <li>• <strong>Smaller Bundle:</strong> No Headless UI duplication</li>
                  </ul>
                </div>

                {/* JSON Configuration Example */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">JSON Configuration:</h4>
                  <FormCode variant="block">{`{
  "type": "select",
  "name": "country",
  "label": "Country",
  "options": ["USA", "Canada", "UK"],
  "ui": {
    "presentation": "sheet",      // auto | sheet | popover
    "sameWidth": true,             // match trigger width
    "offset": 6,                   // pixels from trigger
    "maxHeight": 560,              // max overlay height
    "search": true,                // show search bar
    "closeOnSelect": true          // close after selection
  }
}`}</FormCode>
                </div>

                {/* Phase 3b: Date/Time/Range Showcase */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-6">
                  <h4 className="text-sm font-semibold text-purple-900 mb-2">📅 Phase 3b: Date/Time/Range Fields</h4>
                  <ul className="text-xs text-purple-700 space-y-1 ml-4">
                    <li>• <strong>DateField:</strong> Calendar picker with Clear/Done footer</li>
                    <li>• <strong>TimeField:</strong> Scrollable time list with PickerList/PickerOption</li>
                    <li>• <strong>DateRangeField:</strong> Dual calendar + presets + footer</li>
                    <li>• <strong>Height Calc:</strong> Explicit math prevents footer cut-off forever!</li>
                    <li>• <strong>Mobile:</strong> Bottom sheet with touch-friendly 48px targets</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2 mt-6">DateField (Calendar Picker)</h4>
                  <DateField
                    name="date_unified"
                    label="Select Date (Unified Overlay)"
                    description="Mobile: Sheet with footer | Desktop: Popover with fixed footer | Footer never gets cut off!"
                    control={control}
                    errors={errors}
                    json={{}}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    <strong>Try it!</strong> Calendar + Clear/Done buttons | Footer always visible
                  </p>
                </div>

                <FormDivider />

                <div>
                  <h4 className="text-sm font-semibold mb-2">TimeField (Scrollable List)</h4>
                  <TimeField
                    name="time_unified"
                    label="Select Time (PickerList)"
                    description="Replaced Headless UI Listbox with PickerList | closeOnSelect: true"
                    control={control}
                    errors={errors}
                    json={{
                      step: 30,
                      format: '12'
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    <strong>Features:</strong> Scrollable intervals | 12/24hr format | Auto-closes
                  </p>
                </div>

                <FormDivider />

                <div>
                  <h4 className="text-sm font-semibold mb-2">DateRangeField (Dual Calendar)</h4>
                  <DateRangeField
                    name="daterange_unified"
                    label="Select Date Range (Presets + Dual Calendar)"
                    description="Mobile: Single month + horizontal presets | Desktop: Dual months + sidebar presets"
                    control={control}
                    errors={errors}
                    json={{
                      presets: ['Today', 'This Week', 'This Month', 'Last 30 Days']
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    <strong>Features:</strong> Quick presets | Range highlighting | Clear/Done footer
                  </p>
                </div>

                <FormDivider />

                {/* Next: Phase 3c */}
                <FormMessage type="info" title="Next: Phase 3c & 3d">
                  <strong>Coming Soon:</strong> PhoneField, AddressField (Phase 3c) • ColorField, TagInputField (Phase 3d)
                </FormMessage>
              </div>
            </FormSection>
          </FormCard>

          {/* Submit Button using FormActions */}
          <FormActions align="center">
            <FormButton variant="secondary" type="button" size="lg">
              Cancel
            </FormButton>
            <FormButton variant="primary" type="submit" size="lg">
              🚀 Submit Form (Check Console)
            </FormButton>
          </FormActions>

          </FormStack>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p className="font-semibold">Built with @joseph.ehler/wizard-react v0.3.0</p>
          <p className="mt-1">32 Fields • 21 Components • 🚀 Unified Overlay System • Mobile-First 📱</p>
          <p className="mt-2 text-xs">
            <span className="text-blue-600">~317 KB ESM</span> • 
            <span className="text-purple-600 ml-2">Floating UI</span> • 
            <span className="text-indigo-600 ml-2">5 Typography Variants</span> • 
            <span className="text-green-600 ml-2">Phase 3b Complete ✅</span>
          </p>
        </div>

      </div>
    </div>
  )
}

