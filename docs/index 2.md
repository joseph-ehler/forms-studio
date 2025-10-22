---
layout: home

hero:
  name: Cascade
  text: Design System Platform
  tagline: Production-grade design system with unbreakable contracts, zero-drift distribution, and god-tier governance
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
    - theme: alt
      text: View Tokens
      link: /tokens/
    - theme: alt
      text: Components
      link: /components/

features:
  - icon: ✅
    title: Unbreakable Contracts
    details: 62 automated tests prove correctness. Visual, behavioral, and accessibility contracts enforced at every layer.
    
  - icon: 🎨
    title: 145 Design Tokens
    details: Complete token system for typography, spacing, colors, shadows, motion, and glassmorphism. Multi-brand ready.
    
  - icon: ♿
    title: Accessibility First
    details: 100% WCAG AA compliance. Screen reader tests, keyboard navigation, touch targets, and educational error messages.
    
  - icon: 🔒
    title: Zero Drift
    details: Token snapshots + CI enforcement. ESLint blocks hardcoded values. Impossible to ship non-compliant code.
    
  - icon: 🚀
    title: Performance Gated
    details: CSS < 25KB, JS < 50KB, button latency < 16ms. Budgets enforced in CI. Motion respects prefers-reduced-motion.
    
  - icon: 🌍
    title: Multi-Brand Support
    details: 3 brands × 2 themes = 6 combinations. Same primitives, different values. CSS var swap only.
    
  - icon: 🛡️
    title: Security Hardened
    details: JSON schema validation blocks XSS. Rate limiting. List capping. Chaos tests prove resilience.
    
  - icon: 🎯
    title: 7 Button Variants
    details: Systematic hierarchy (primary, secondary, ghost) + semantic (danger, success, warning, link). All token-based.
    
  - icon: 📊
    title: Live Playground
    details: 17 interactive sliders. Export tokens as JSON. Create PRs directly. Design Console workflow.
---

## What Makes Cascade Different?

### Not a Component Library—A Platform

Traditional design systems are **collections of components**. Cascade is a **platform that prevents entropy**:

- **Contracts Prove Correctness**: Visual screenshots, a11y assertions, behavioral tests
- **Tokens Prevent Drift**: 145 tokens, snapshot diffing, ESLint enforcement  
- **Governance Encodes Process**: CI blocks violations, coverage reports, release hygiene

### The Numbers

| Metric | Value |
|--------|-------|
| Design Tokens | 145 |
| Contract Tests | 62 |
| CI Workflows | 4 |
| Button Variants | 7 |
| Field Components | 14 (100% compliant) |
| Chaos Scenarios | 12 |
| A11y Coverage | 100% WCAG AA |
| Multi-Brand Support | 6 theme combos |

### Built on Principles

1. **Single Source of Truth** - Change once, update everywhere
2. **Pit of Success** - Correct by default, impossible to misuse
3. **Auto-wiring** - Context provides, consumers receive
4. **Guardrails > Docs** - Lint rules prevent drift
5. **Observability** - Every primitive has debug helpers

## Quick Start

```bash
# Install
npm install @cascade/wizard-react

# Install ESLint plugin (optional)
npm install --save-dev eslint-plugin-cascade
```

```tsx
import '@cascade/wizard-react/dist/ds-inputs.css'

// Use design system classes
<input className="ds-input" />
<button className="ds-button">Submit</button>
```

## Why Accessibility Matters

**20-40% of users need accessibility features:**

- 8% blind/low-vision (screen readers)
- 4% color blind (contrast)  
- 15% motor disabilities (touch targets)
- 20% keyboard-only (navigation)

Cascade makes accessibility **impossible to ignore** and **easy to understand**.

## License

MIT © 2025 Cascade Design System
