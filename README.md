# Forms Studio by Intelligence Studio

**AI-authorable, privacy-first, JSON-driven forms & wizard engine.**

Build enterprise-safe wizards in minutes—not weeks. Declarative flows as JSON, compiled by an LLM, governed by strict contracts, rendered anywhere, and backed by a production-grade data plane (retries, circuit breakers, SSRF/HTTPS, privacy, caching).

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

### **Core (Framework-Agnostic)**
- `@intelligence-studio/wizard-core` - Expression engine, flow runtime, validation
- `@intelligence-studio/wizard-datasources` - Data source manager with SSRF/retry/circuit-breaker
- `@intelligence-studio/wizard-schema` - Zod contracts + JSON Schema
- `@intelligence-studio/wizard-validator` - CLI & API validation

### **React Integration**
- `@intelligence-studio/wizard-react` - Headless React bindings (providers/hooks)
- `@intelligence-studio/wizard-react-renderer` - StepRenderer + shells + Loading primitives
- `@intelligence-studio/wizard-fields-basic` - Default field catalog

### **Tooling**
- `@intelligence-studio/wizard-cli` - Scaffolding, validation, local preview

---

## 🚀 **Quick Start**

```bash
# Install
pnpm add @intelligence-studio/wizard-core @intelligence-studio/wizard-react @intelligence-studio/wizard-react-renderer

# Use
import { createWizardRuntime } from '@intelligence-studio/wizard-core'
import { DataSourceManager } from '@intelligence-studio/wizard-datasources'
import { OnboardingShell, StepRenderer } from '@intelligence-studio/wizard-react-renderer'
import flow from './flow.json'

const runtime = createWizardRuntime({ flow })
const dsm = new DataSourceManager()
runtime.plugDataSources(dsm)

export default function Wizard() {
  const wizard = useWizard(runtime)
  return (
    <OnboardingShell {...wizard.shellProps}>
      <StepRenderer step={wizard.currentStep} state={wizard.state} runtime={runtime} />
    </OnboardingShell>
  )
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

**v0.1.0** - Initial extraction from MotoMind AI  
✅ Expression engine (100% tested)  
✅ Data source manager (79/79 tests passing)  
✅ Flow validator  
✅ React renderer  
🚧 CLI tools  
🚧 Field adapters  
🚧 Documentation site  

---

**Built with ❤️ by Intelligence Studio**
