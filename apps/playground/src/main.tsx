import React from 'react';
import ReactDOM from 'react-dom/client';
import { ButtonShowcase } from './pages/button-showcase';

// Load design tokens (FOUNDATION) - from src for instant HMR
import '../../../packages/tokens/src/tokens.css';
import '../../../packages/tokens/src/accessibility-prefs.css';

// DEVELOPMENT: Import from src for instant HMR
// PRODUCTION: Vite will use dist automatically
import '../../../packages/ds/src/styles/ds-interactions.css';
import '../../../packages/ds/src/styles/focus-rings.css';
import '../../../packages/ds/src/styles/overlay-standards.css';
import '../../../packages/ds/src/fb/Button.css';

// Basic app styles (includes Tailwind)
import './index.css';

// Install input modality detection
import { installModalityFlag } from '@intstudio/ds';
if (typeof window !== 'undefined') {
  installModalityFlag();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ButtonShowcase />
  </React.StrictMode>
);
