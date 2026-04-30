import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { validateEnvironment, getEnvironment } from './lib/envConfig'
import { warmupBackend } from './lib/openRouter'
import './index.css'
import App from './App.tsx'
import { initSentry } from './lib/sentry'
import { initPostHog } from './lib/posthog'

// ── Initialize Observability ──────────────────────────────────────────────────
initSentry();
initPostHog();

// ── Environment Validation ──────────────────────────────────────────────────
// Validate all required environment variables before app initialization
const envValidation = validateEnvironment();

if (!envValidation.isValid) {
  console.error('❌ Environment validation failed. Application may not work correctly.');
  console.error('Errors:', envValidation.errors);
  
  // In production, show error screen
  if (import.meta.env.PROD) {
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui;">
        <div style="text-align:center;max-width:600px;padding:2rem;">
          <h1 style="color:#ef4444;margin-bottom:1rem;">Configuration Error</h1>
          <p style="color:#6b7280;margin-bottom:1.5rem;">The application is not properly configured. Please contact support.</p>
          <details style="text-align:left;background:#f3f4f6;padding:1rem;border-radius:0.5rem;">
            <summary style="cursor:pointer;color:#6b7280;">Show Errors</summary>
            <ul style="margin-top:0.5rem;color:#dc2626;font-size:0.875rem;">
              ${envValidation.errors.map(e => `<li>${e}</li>`).join('')}
            </ul>
          </details>
        </div>
      </div>
    `;
    throw new Error('Environment validation failed');
  }
}

console.log(`🚀 Campus2Career starting in ${getEnvironment()} mode`);

// ── Pre-warm AI backend (handles Render free tier cold start) ────────────────
// Fire-and-forget ping so the backend is ready by the time user clicks AI features
warmupBackend().catch(() => {/* silently ignore — callOpenRouter retries anyway */});

// ── Clear stale local cache on every app start ───────────────────────────────
// Only wipe the local profile cache — let Supabase re-hydrate fresh from DB.
// Do NOT sign out here — that would force re-login on every refresh.
localStorage.removeItem('c2c_user');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
