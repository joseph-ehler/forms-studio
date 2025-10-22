# Forms Studio React - Field Roadmap
## The Path to Category Leadership

**Mission**: Build the most comprehensive, mobile-native, privacy-first form field library that eats Typeform/SurveyJS lunch and delivers features they can't match.

---

## 🎯 **Strategic Foundation (DONE ✅)**

### Current State (v0.2.0)
**12 fields shipped:**
- **Foundation (6)**: TextField, TextareaField, NumberField, SelectField, ChipsField, ToggleField
- **Composite (6)**: EmailField, PasswordField, PhoneField, SearchField, RadioGroupField, AddressField

**All fields are mobile/native-first:**
- ✅ 44px minimum touch targets
- ✅ `text-base` (16px) to prevent iOS zoom
- ✅ Correct `inputMode`, `enterKeyHint`, `autoComplete`
- ✅ `autoCapitalize`, `autoCorrect`, `spellCheck` optimized
- ✅ `active:scale` tactile feedback
- ✅ Full ARIA support

---

## 📊 **The Competitive Landscape**

### **vs Typeform**
| Feature | Typeform | Forms Studio |
|---------|----------|--------------|
| Mobile-native inputs | Partial | ✅ **Native-first** |
| Expression engine | Limited | ✅ **Full eval** |
| Privacy controls | Basic | ✅ **Field-level** |
| AI integration | None | 🚀 **AI-assist fields** |
| Data sources | Fixed | ✅ **Extensible** |
| File pipeline | Basic | 🚀 **OCR + DLP** |
| Payments | Stripe only | 🚀 **Multi-provider** |

### **vs SurveyJS**
| Feature | SurveyJS | Forms Studio |
|---------|----------|--------------|
| JSON-driven | ✅ | ✅ |
| React quality | Dated | ✅ **Modern** |
| TypeScript | Weak | ✅ **Full types** |
| Bundle size | ~200KB | ✅ **48KB** |
| Field registry | Fixed | ✅ **Extensible** |
| Privacy tags | None | ✅ **Built-in** |

---

## 🎯 **Design Constraints (All Fields)**

### **1. Mobile-First**
```tsx
// Every field must have:
- inputMode: 'text' | 'numeric' | 'decimal' | 'tel' | 'search' | 'email' | 'url'
- enterKeyHint: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'
- autoComplete: intelligent hints (email, tel, address-*, etc.)
- autoCapitalize: 'none' | 'sentences' | 'words'
- autoCorrect: 'on' | 'off'
- spellCheck: boolean
- className: 'min-h-[44px] text-base' (44px touch, 16px text)
```

### **2. Accessibility-First**
```tsx
// Every field must have:
- Proper label association (htmlFor + id)
- aria-invalid + aria-describedby for errors
- role="alert" for error messages
- Keyboard navigation (Tab, Enter, Escape, Arrow keys)
- Screen reader announcements (aria-live)
- Focus indicators (ring-2 ring-blue-500)
```

### **3. Privacy-First**
```json
{
  "id": "ssn",
  "type": "text",
  "privacy": {
    "classification": "PII",
    "purpose": "identity_verification",
    "retention": "7_years",
    "allowInAI": false,
    "maskInLogs": true,
    "encryptAtRest": true
  }
}
```

### **4. Observability**
```typescript
// Every field emits telemetry:
type FieldEvent =
  | { type: 'field_focus'; fieldId: string; timestamp: number }
  | { type: 'field_change'; fieldId: string; value: any; timestamp: number }
  | { type: 'field_validate'; fieldId: string; valid: boolean; errors: string[] }
  | { type: 'field_error'; fieldId: string; error: string }
  | { type: 'field_help_open'; fieldId: string }
```

### **5. Expression-Ready**
```typescript
// Every field exposes to expression engine:
interface FieldState {
  value: any
  valid: boolean
  dirty: boolean
  touched: boolean
  error: string | null
}

// Available in expressions as:
fields.email.value
fields.email.valid
fields.email.dirty
```

---

## 🚀 **Implementation Sprints**

### **Sprint 1: Table Stakes (Week 1-2)**
**Goal**: Match Typeform/SurveyJS feature parity

#### **1.1 Date/Time/DateTime/DateRange**
**Priority**: CRITICAL  
**Why**: Top-10 most-used field type

**Components**:
- `DateField` - Single date picker
- `TimeField` - Time picker (12/24hr)
- `DateTimeField` - Combined date + time
- `DateRangeField` - Start + end date

**JSON Shape**:
```json
{
  "id": "dob",
  "type": "date",
  "bind": "user.dob",
  "min": "1900-01-01",
  "max": "2025-12-31",
  "format": "MM/DD/YYYY",
  "firstDayOfWeek": "monday"
}
```

**React Implementation**:
```tsx
export const DateField: React.FC<FieldComponentProps> = ({
  name, label, control, errors, json
}) => {
  const min = json?.min
  const max = json?.max
  const format = json?.format ?? 'YYYY-MM-DD'

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <input
          type="date"
          min={min}
          max={max}
          {...field}
          className="min-h-[44px] text-base"
        />
      )}
    />
  )
}
```

**Mobile Considerations**:
- Use native picker on mobile (iOS/Android)
- Desktop fallback with keyboard-friendly calendar
- Support internationalization (date formats)

---

#### **1.2 RadioGroup (Cards) + Scale/Matrix**
**Priority**: HIGH  
**Why**: Core survey pattern

**Components**:
- `RadioGroupField` (✅ DONE - enhance with Matrix mode)
- `ScaleField` - Likert scale (1-5, 1-10)
- `MatrixField` - Rows × Columns radio grid

**JSON Shape**:
```json
{
  "id": "satisfaction",
  "type": "scale",
  "bind": "survey.satisfaction",
  "min": 1,
  "max": 5,
  "labels": ["Poor", "Fair", "Good", "Very Good", "Excellent"],
  "layout": "horizontal"
}
```

**Matrix Example**:
```json
{
  "id": "product_feedback",
  "type": "matrix",
  "bind": "survey.feedback",
  "rows": [
    { "id": "quality", "label": "Product Quality" },
    { "id": "support", "label": "Customer Support" },
    { "id": "value", "label": "Value for Money" }
  ],
  "columns": [
    { "value": 1, "label": "Poor" },
    { "value": 5, "label": "Excellent" }
  ]
}
```

---

#### **1.3 Slider & RangeSlider**
**Priority**: HIGH  
**Why**: Fast numeric selection

**JSON Shape**:
```json
{
  "id": "budget",
  "type": "slider",
  "bind": "user.budget",
  "min": 0,
  "max": 10000,
  "step": 50,
  "format": "currency",
  "currency": "USD",
  "showValue": true
}
```

**React Implementation**:
```tsx
export const SliderField: React.FC<FieldComponentProps> = ({
  name, control, json
}) => {
  const min = json?.min ?? 0
  const max = json?.max ?? 100
  const step = json?.step ?? 1
  
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            {...field}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-center text-base font-medium">
            {formatValue(field.value, json)}
          </div>
        </div>
      )}
    />
  )
}
```

---

#### **1.4 Rating (Stars/Hearts/Emoji)**
**Priority**: HIGH  
**Why**: NPS/CSAT patterns

**JSON Shape**:
```json
{
  "id": "rating",
  "type": "rating",
  "bind": "review.rating",
  "max": 5,
  "icon": "star",
  "allowHalf": false,
  "size": "large"
}
```

**Icons**:
- `star` - ⭐
- `heart` - ❤️
- `emoji` - 😞 😐 🙂 😊 🤩

---

#### **1.5 Repeater / Collection**
**Priority**: CRITICAL  
**Why**: "Add another driver/address/child"

**JSON Shape**:
```json
{
  "id": "drivers",
  "type": "repeater",
  "bind": "policy.drivers",
  "itemSchema": [
    { "id": "name", "type": "text", "bind": "$item.name", "label": "Name" },
    { "id": "license", "type": "text", "bind": "$item.license", "label": "License" },
    { "id": "age", "type": "number", "bind": "$item.age", "label": "Age" }
  ],
  "minItems": 1,
  "maxItems": 5,
  "addButtonText": "Add Another Driver",
  "removeButtonText": "Remove"
}
```

**Features**:
- Add/remove items
- Drag-to-reorder (optional)
- Min/max constraints
- Each item has index available: `$item.name`, `$index`

---

#### **1.6 Conditional Group / FieldSet**
**Priority**: HIGH  
**Why**: Progressive disclosure

**JSON Shape**:
```json
{
  "id": "businessDetails",
  "type": "fieldset",
  "legend": "Business Information",
  "shouldExistWhen": "fields.accountType.value === 'business'",
  "children": [
    { "id": "companyName", "type": "text", "label": "Company Name" },
    { "id": "taxId", "type": "text", "label": "Tax ID" }
  ]
}
```

---

#### **1.7 Signature (Canvas)**
**Priority**: MEDIUM  
**Why**: Agreements & consent

**JSON Shape**:
```json
{
  "id": "signature",
  "type": "signature",
  "bind": "consent.signature",
  "strokeWidth": 2,
  "strokeColor": "#000000",
  "backgroundColor": "#FFFFFF",
  "width": 400,
  "height": 150,
  "format": "image/png"
}
```

**React Implementation**:
- Use HTML5 Canvas
- Touch/mouse support
- Clear button
- Base64 output
- Mobile: full-width, responsive

---

#### **1.8 File/Image (Full Pipeline)**
**Priority**: CRITICAL  
**Why**: Core functionality with competitive edge

**JSON Shape**:
```json
{
  "id": "documents",
  "type": "file",
  "bind": "application.documents",
  "accept": "image/*,application/pdf",
  "maxSize": 10485760,
  "maxFiles": 5,
  "capture": "camera",
  "features": {
    "dragDrop": true,
    "preview": true,
    "compression": true,
    "stripEXIF": true,
    "scanAV": true,
    "scanDLP": true,
    "ocr": true,
    "chunkedUpload": true,
    "resumable": true
  }
}
```

**Pipeline**:
1. **Capture**: Drag-drop, camera, file picker
2. **Validate**: Size, type, count
3. **Process**: Compress, strip EXIF, generate preview
4. **Scan**: AV scan, DLP scan (PII detection)
5. **Extract**: OCR text extraction
6. **Upload**: Chunked, resumable
7. **Store**: Privacy-aware storage

---

### **Sprint 2: Survey Power (Week 3-4)**
**Goal**: Typeform-killer features

#### **2.1 NPS (0-10) + Follow-up**
```json
{
  "id": "nps",
  "type": "nps",
  "bind": "survey.nps",
  "followUp": {
    "threshold": 7,
    "questionId": "nps_reason",
    "detractorQuestion": "What disappointed you?",
    "promoterQuestion": "What did you love?"
  }
}
```

#### **2.2 Piping / Answer Substitution**
Use expression engine for dynamic text:
```json
{
  "id": "greeting",
  "type": "text",
  "label": "Hi {fields.firstName.value}! How can we help you today?"
}
```

#### **2.3 Calculated/Derived Fields**
```json
{
  "id": "estPayment",
  "type": "calculated",
  "expr": "(fields.price.value - fields.down.value) * 0.06 / 12",
  "format": "currency",
  "currency": "USD",
  "readonly": true
}
```

#### **2.4 Jump Logic / Branching**
Already supported via `shouldExistWhen`, extend with:
```json
{
  "id": "submit",
  "type": "button",
  "nextStepWhen": {
    "high_value": "fields.amount.value > 10000",
    "default": "confirmation"
  }
}
```

---

### **Sprint 3: Commerce & Differentiators (Week 5-6)**

#### **3.1 Financial Fields**
**CurrencyField** (enhanced):
```json
{
  "id": "amount",
  "type": "currency",
  "bind": "payment.amount",
  "currency": "USD",
  "min": 0,
  "max": 100000,
  "locale": "en-US"
}
```

**IBANField**:
```json
{
  "id": "iban",
  "type": "iban",
  "bind": "account.iban",
  "countries": ["US", "CA", "UK"],
  "validate": true
}
```

**SSNField** (masked):
```json
{
  "id": "ssn",
  "type": "ssn",
  "bind": "identity.ssn",
  "format": "XXX-XX-XXXX",
  "mask": true,
  "privacy": { "classification": "PII", "allowInAI": false }
}
```

#### **3.2 Payment (Stripe Element)**
```json
{
  "id": "card",
  "type": "payment.stripe",
  "bind": "payment.methodId",
  "publishableKey": "env:STRIPE_PK",
  "appearance": {
    "theme": "stripe",
    "variables": { "colorPrimary": "#0052D4" }
  }
}
```

#### **3.3 Address (International + Autocomplete)**
Enhance existing AddressField:
```json
{
  "id": "address",
  "type": "address",
  "bind": "user.address",
  "countries": ["US", "CA", "MX"],
  "autocomplete": {
    "provider": "google_places",
    "apiKey": "env:GOOGLE_PLACES_KEY"
  },
  "geoFence": {
    "center": [37.7749, -122.4194],
    "radiusKm": 50
  }
}
```

#### **3.4 Availability / Timeslot Picker**
```json
{
  "id": "appointment",
  "type": "availability",
  "bind": "booking.slot",
  "dataSource": "calendarSlots",
  "timezone": "America/Los_Angeles",
  "minAdvanceHours": 24,
  "continueEnabledWhen": "ctx.calendarSlots.length > 0 && fields.slot.valid"
}
```

---

### **Sprint 4: AI & Identity (Week 7-8)**
**Goal**: Unfair competitive advantage

#### **4.1 AISuggestField**
```json
{
  "id": "problem",
  "type": "ai.suggest",
  "bind": "issue.summary",
  "promptKey": "issue_summarize",
  "model": "gpt-4",
  "temperature": 0.3,
  "maxTokens": 100,
  "privacy": { "allowInAI": true },
  "guardrails": {
    "maxLength": 500,
    "blockPII": true,
    "blockProfanity": true
  }
}
```

#### **4.2 AIExtractField**
```json
{
  "id": "extracted",
  "type": "ai.extract",
  "sourceField": "freeText",
  "schemaRef": "VehicleInfo",
  "model": "gpt-4",
  "schema": {
    "vin": "string",
    "make": "string",
    "model": "string",
    "year": "number"
  }
}
```

#### **4.3 AIRedactField**
```json
{
  "id": "redacted",
  "type": "ai.redact",
  "sourceField": "rawText",
  "redactPII": true,
  "redactSSN": true,
  "redactCreditCard": true,
  "showPreview": true,
  "storeBoth": true
}
```

#### **4.4 OTP / Passcode**
```json
{
  "id": "otp",
  "type": "otp",
  "digits": 6,
  "bind": "auth.otp",
  "resendAfterSec": 30,
  "maxAttempts": 3,
  "lockoutSec": 300,
  "autoSubmit": true
}
```

#### **4.5 KYC Document Verification**
```json
{
  "id": "idCheck",
  "type": "kyc.document",
  "provider": "persona",
  "bind": "kyc.sessionId",
  "documentTypes": ["passport", "drivers_license"],
  "verifyLiveness": true
}
```

---

## 🎨 **Composite Recipes**

### **AddressBlock (International)**
Handles 200+ countries with proper formatting:
```json
{
  "id": "shipping",
  "type": "composite.address",
  "countries": "all",
  "autocomplete": true,
  "validate": true
}
```

### **PaymentBlock**
Currency + Stripe Element in one:
```json
{
  "id": "payment",
  "type": "composite.payment",
  "amount": "fields.total.value",
  "currency": "USD"
}
```

### **EvidenceBlock**
File + Camera + OCR:
```json
{
  "id": "proof",
  "type": "composite.evidence",
  "capture": ["camera", "upload"],
  "ocr": true,
  "extractFields": ["date", "amount", "vendor"]
}
```

### **ConsentBlock**
Legal text + checkbox + signature:
```json
{
  "id": "consent",
  "type": "composite.consent",
  "legalText": "I agree to...",
  "requireSignature": true,
  "version": "1.2"
}
```

---

## 📋 **Field Catalog Summary**

| Sprint | Fields | Status | Priority |
|--------|--------|--------|----------|
| **0 (Foundation)** | 12 core fields | ✅ DONE | - |
| **1 (Table Stakes)** | Date, Time, Range, Slider, Rating, Repeater, Signature, File | 🟡 PLAN | CRITICAL |
| **2 (Survey Power)** | NPS, Calculated, Matrix, Rank | 🟡 PLAN | HIGH |
| **3 (Commerce)** | Currency, IBAN, SSN, Payment, Address+, Availability | 🟡 PLAN | HIGH |
| **4 (AI + Identity)** | AISuggest, AIExtract, AIRedact, OTP, KYC | 🟡 PLAN | MEDIUM |
| **Total** | **40+ field types** | - | - |

---

## ✅ **QA Checklist (Every Field)**

### **Mobile**
- [ ] Correct keyboard type (`inputMode`)
- [ ] Auto-focus management
- [ ] Paste behavior works
- [ ] No layout jank on focus
- [ ] 44px minimum touch target
- [ ] 16px minimum font size (no zoom)
- [ ] Active state feedback

### **Accessibility**
- [ ] Proper label association
- [ ] `role` attribute set correctly
- [ ] `aria-describedby` for errors/hints
- [ ] Focus trap in popovers/modals
- [ ] `aria-live` for async updates
- [ ] Keyboard navigation (Tab, Enter, Esc, Arrows)
- [ ] Screen reader tested

### **i18n**
- [ ] Date/number/currency formatting
- [ ] RTL layout support
- [ ] Localized error messages
- [ ] Timezone handling

### **Privacy**
- [ ] Classification set
- [ ] Logs masked
- [ ] `allowInAI` default false
- [ ] Encryption at rest flag
- [ ] Retention policy

### **Performance**
- [ ] No reflows on render
- [ ] Memoized lists
- [ ] Virtualization for large option sets
- [ ] Debounced onChange (where appropriate)

### **Tests**
- [ ] Unit tests (format/validation)
- [ ] Visual tests (Storybook)
- [ ] E2E tests (happy path)
- [ ] Keyboard-only navigation
- [ ] Screen reader testing

---

## 🚀 **Why This Eats Their Lunch**

### **vs Typeform**
✅ Match: All survey field types  
✅ Surpass: File pipeline, payments, AI assist, privacy controls  
✅ Win: Expression engine, data sources, extensibility  

### **vs SurveyJS**
✅ Match: JSON-driven, comprehensive fields  
✅ Surpass: Modern React, TypeScript, bundle size, mobile UX  
✅ Win: AI fields, privacy tags, observability  

### **Unfair Advantages**
1. **AI-assisted fields** - No one else has this
2. **Privacy-first** - SOC2/GDPR/HIPAA built-in
3. **Expression engine** - Programmable logic
4. **Data source registry** - External data integration
5. **File pipeline** - OCR + DLP + scanning
6. **Mobile-native** - Best mobile UX in category
7. **Extensible** - Field registry + custom types

---

## 📅 **12-Week Roadmap**

| Weeks | Sprint | Fields | Milestone |
|-------|--------|--------|-----------|
| 1-2 | Sprint 1A | Date, Time, Range | Basic date/time |
| 3-4 | Sprint 1B | Slider, Rating, Repeater | Survey basics |
| 5-6 | Sprint 1C | Signature, File (basic) | Core complete |
| 7-8 | Sprint 2 | NPS, Matrix, Calculated | Survey power |
| 9-10 | Sprint 3 | Currency, Payment, Address+ | Commerce |
| 11-12 | Sprint 4 | AI fields, OTP, KYC | Differentiators |

---

## 🎯 **Success Metrics**

### **Coverage**
- [ ] 40+ field types (vs Typeform: 20, SurveyJS: 25)
- [ ] 100% mobile-native inputs
- [ ] 100% WCAG AAA accessible

### **Performance**
- [ ] Bundle: <100KB total (tree-shakeable)
- [ ] First render: <50ms
- [ ] Zero layout shift

### **Quality**
- [ ] >90% test coverage
- [ ] 100% TypeScript typed
- [ ] Zero accessibility violations

### **DX**
- [ ] One-line field registration
- [ ] Full Storybook documentation
- [ ] Example for every field type

---

## 📦 **Next Action: Ready to Implement**

Would you like me to:

1. **Start Sprint 1A** - Build Date/Time/Range fields
2. **Create tickets** - Detailed specs + acceptance tests
3. **Build Storybook** - Visual documentation system
4. **Set up testing** - Test infrastructure for all fields

**Let's ship the foundation that eats their lunch.** 🚀
