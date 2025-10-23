import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { FieldShowcase } from './FieldShowcase'
import './styles.css'

// Simple router based on hash
function Router() {
  const [route, setRoute] = React.useState(window.location.hash);

  React.useEffect(() => {
    const handler = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  // Show Field Showcase if hash is #fields, otherwise show DS demo
  if (route === '#fields' || route === '#/fields') {
    return <FieldShowcase />;
  }

  // Default: DS Demo with nav button
  return (
    <div>
      <div style={{ 
        position: 'fixed', 
        top: '16px', 
        right: '16px', 
        zIndex: 1000,
        display: 'flex',
        gap: '8px'
      }}>
        <a 
          href="#" 
          style={{
            padding: '8px 16px',
            background: '#3b82f6',
            color: 'white',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          DS Demo
        </a>
        <a 
          href="#fields" 
          style={{
            padding: '8px 16px',
            background: '#10b981',
            color: 'white',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          🏆 Field Showcase
        </a>
      </div>
      <App />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
)
