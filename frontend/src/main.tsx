import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { supabaseConfigError } from './supabaseClient'

const root = createRoot(document.getElementById('root')!)

if (supabaseConfigError) {
  root.render(
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Configuration Error</h1>
        <p style={{ color: '#555', maxWidth: '480px' }}>{supabaseConfigError}</p>
      </div>
    </div>
  )
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
