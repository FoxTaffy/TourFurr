import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/style.css'
import { validateEnvironment } from './utils/env'

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
