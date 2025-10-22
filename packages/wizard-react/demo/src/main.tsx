import React from 'react'
import ReactDOM from 'react-dom/client'
import { DesignSystemDemo } from './DesignSystemDemo'
import { prePaintScript } from '../../src/components/shell/applyBrand'
import './demo.css'

// Import component styles (loads all CSS from source)
import '../../src/components/index.ts'

// Apply pre-paint script to prevent FOUC
const script = document.createElement('script')
script.textContent = prePaintScript
document.head.appendChild(script)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DesignSystemDemo />
  </React.StrictMode>,
)
