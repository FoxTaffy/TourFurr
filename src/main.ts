import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/style.css'
import { validateEnvironment } from './utils/env'
import { supabase } from './services/supabase'
import { useAuthStore } from './stores/auth'

// Validate environment variables before starting the app
try {
  validateEnvironment()
} catch (error) {
  console.error('❌ Environment validation failed:', error)
  // In production, show a user-friendly error page
  if (import.meta.env.PROD) {
    document.body.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0a0806; color: #F5DEB3; font-family: system-ui, -apple-system, sans-serif; padding: 2rem;">
        <div style="max-width: 500px; text-align: center;">
          <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚠️ Configuration Error</h1>
          <p style="margin-bottom: 1rem; opacity: 0.8;">The application is not properly configured. Please contact the administrator.</p>
          <p style="font-size: 0.875rem; opacity: 0.6;">Error: Missing required environment variables</p>
        </div>
      </div>
    `
    throw error
  }
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// Sync Supabase auth state with the app's auth store.
// When Supabase exhausts token-refresh retries (e.g. ERR_CONNECTION_CLOSED /
// ERR_CONNECTION_TIMED_OUT) it eventually fires a SIGNED_OUT event.
// Without this listener the app's localStorage token and user cache stay
// stale, leaving the UI in a broken "logged in but session dead" state.
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    const authStore = useAuthStore()
    authStore.logout()
  }
})
