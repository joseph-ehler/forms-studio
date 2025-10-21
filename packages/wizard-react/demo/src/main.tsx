import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import 'react-day-picker/dist/style.css'  // 1) BASE - must come first
import './index.css'                      // 2) OVERRIDES - come after

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
