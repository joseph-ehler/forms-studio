# Intelligence Studio

**A platform for building beautiful, accessible web applications.**

Intelligence Studio provides enterprise-grade tools for modern web development:
- **Design System Studio** - Tokens, primitives, patterns, and accessibility
- **Form Studio** - AI-authorable, privacy-first, JSON-driven forms
- **Shared Core** - Expression engine, data sources, validation

---

## 🎯 **Why Forms Studio?**

### **Your Unfair Advantages**

1. **AI-Authorable** - Flows from a 3-line brief → validated JSON
2. **Production-Grade Data Layer** - SSRF protection, retry+jitter, circuit breakers, cache, abort signals
3. **Privacy-First** - Required classification/purpose/retention/allowInAI tags
4. **Developer-First** - JSON Schema, CLI, SDK, 100% tested
5. **Self-Host Anywhere** - React, Web Components, Node, Edge, SSR

**They have:** Pretty UIs + SaaS storage + webhooks  
**We have:** The entire reliability/security/privacy/AI layer they're missing

---

## 📦 **Packages**

### **Design System Studio**
```bash
npm install @intstudio/ds
```

- **Tokens** - Color, typography, spacing, widths
- **Primitives** - Stack, Grid, Container, Section, Button, Card
- **Patterns** - Page layouts, card patterns
- **Shell** - TopBar, Drawer, BottomNav, AppContent
- **A11y** - Accessibility presets, focus management
- **White-label** - Brand packs, theme system

→ [Design System Demo](packages/ds/demo)

### **Form Studio** (Coming Soon)
```bash
npm install @intstudio/forms
```

- AI-authorable JSON flows
- Privacy-first data handling
- Enterprise-grade validation
- Dynamic field registry

### **Core Libraries**

**[@intstudio/core](packages/core)**
- Expression engine
- Flow runtime
- Validation contracts

**[@intstudio/datasources](packages/datasources)**
- Data source manager
- SSRF protection
- Retry + circuit breaker
- Privacy classification

**[@intstudio/eslint-plugin-cascade](packages/eslint-plugin-cascade)**
- Design system guardrails
- Import rules
- Best practices

---

## 🚀 **Quick Start**

### **Design System**

```typescript
import { Stack, Button, Section, Container } from '@intstudio/ds'

export function App() {
  return (
    <Section bg="base" paddingY="lg">
      <Container maxWidth="standard" padding>
        <Stack spacing="comfortable">
          <h1>Welcome to Intelligence Studio</h1>
          <Button size="lg" variant="primary">
            Get Started
          </Button>
        </Stack>
      </Container>
    </Section>
  )
}
```

### **Forms** (Coming Soon)

```typescript
import { FormWizard } from '@intstudio/forms'
import { createRuntime } from '@intstudio/core'
import flow from './flow.json'

const runtime = createRuntime({ flow })

export function Wizard() {
  return <FormWizard runtime={runtime} />
}
```

---

## 🏗️ **Development**

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Develop
pnpm dev
```

---

## 📄 **License**

- **Core packages**: Apache 2.0
- **UI packages**: MIT
- **Premium kits**: Commercial (coming soon)

---

## 🎉 **Status**

### **Design System Studio**
✅ Design tokens (color, spacing, typography, widths)  
✅ Primitives (Stack, Grid, Button, Container, Section, Card, etc.)  
✅ Patterns (10 layout patterns, 6 card patterns)  
✅ Shell components (TopBar, Drawer, BottomNav, AppContent)  
✅ A11y layer (presets, focus management, ARIA)  
✅ White-label (brand packs, theme system)  
✅ Guardrails (ESLint rules, Stylelint rules)  
🚧 Storybook (coming in 2 weeks)  
🚧 Visual regression tests  

### **Form Studio**
✅ Expression engine (core logic)  
✅ Data source manager (79/79 tests)  
✅ Flow validator  
🚧 Form components (migrating to use @intstudio/ds)  
🚧 Field registry  
🚧 Documentation  

### **v0.3.0** - October 2025
- Soft-extracted Design System as `@intstudio/ds`
- Reorganized to platform structure
- Added comprehensive guardrails
- Fixed 9 critical bugs (buttons, icons, MediaContainer)  

---

**Built with ❤️ by Intelligence Studio**
