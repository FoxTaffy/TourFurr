<template>
  <div ref="turnstileContainer" class="turnstile-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

interface Props {
  siteKey: string
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact'
  language?: string
  action?: string
  cData?: string
  appearance?: 'always' | 'execute' | 'interaction-only'
  refreshExpired?: 'auto' | 'manual' | 'never'
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'dark',
  size: 'normal',
  language: 'ru',
  appearance: 'always',
  refreshExpired: 'auto'
})

const emit = defineEmits<{
  (e: 'verify', token: string): void
  (e: 'error', error: string): void
  (e: 'expired'): void
  (e: 'timeout'): void
  (e: 'beforeInteractive'): void
  (e: 'afterInteractive'): void
  (e: 'unsupported'): void
}>()

const turnstileContainer = ref<HTMLElement | null>(null)
const widgetId = ref<string | null>(null)
const isScriptLoaded = ref(false)

// Load Cloudflare Turnstile script
function loadTurnstileScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.turnstile) {
      isScriptLoaded.value = true
      resolve()
      return
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src*="challenges.cloudflare.com"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        isScriptLoaded.value = true
        resolve()
      })
      existingScript.addEventListener('error', reject)
      return
    }

    // Create new script tag
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true

    script.onload = () => {
      isScriptLoaded.value = true
      resolve()
    }
    script.onerror = () => {
      reject(new Error('Failed to load Cloudflare Turnstile script'))
    }

    document.head.appendChild(script)
  })
}

// Render the Turnstile widget
function renderWidget() {
  if (!turnstileContainer.value || !window.turnstile) {
    return
  }

  try {
    widgetId.value = window.turnstile.render(turnstileContainer.value, {
      sitekey: props.siteKey,
      theme: props.theme,
      size: props.size,
      language: props.language,
      action: props.action,
      cData: props.cData,
      appearance: props.appearance,
      'refresh-expired': props.refreshExpired,
      callback: (token: string) => {
        emit('verify', token)
      },
      'error-callback': (error?: string) => {
        emit('error', error || 'Turnstile error')
      },
      'expired-callback': () => {
        emit('expired')
      },
      'timeout-callback': () => {
        emit('timeout')
      },
      'before-interactive-callback': () => {
        emit('beforeInteractive')
      },
      'after-interactive-callback': () => {
        emit('afterInteractive')
      },
      'unsupported-callback': () => {
        emit('unsupported')
      }
    })
  } catch (error) {
    console.error('Turnstile render error:', error)
    emit('error', 'Failed to render Turnstile widget')
  }
}

// Reset the widget
function reset() {
  if (widgetId.value !== null && window.turnstile) {
    window.turnstile.reset(widgetId.value)
  }
}

// Remove the widget
function remove() {
  if (widgetId.value !== null && window.turnstile) {
    window.turnstile.remove(widgetId.value)
    widgetId.value = null
  }
}

// Get the response token
function getResponse(): string | undefined {
  if (widgetId.value !== null && window.turnstile) {
    return window.turnstile.getResponse(widgetId.value)
  }
  return undefined
}

// Expose methods to parent component
defineExpose({
  reset,
  remove,
  getResponse
})

// Watch for siteKey changes
watch(() => props.siteKey, () => {
  remove()
  if (isScriptLoaded.value) {
    renderWidget()
  }
})

onMounted(async () => {
  try {
    await loadTurnstileScript()
    renderWidget()
  } catch (error) {
    console.error('Failed to initialize Turnstile:', error)
    emit('error', 'Failed to load Turnstile')
  }
})

onBeforeUnmount(() => {
  remove()
})

// TypeScript declaration for window.turnstile
declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: any) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
      getResponse: (widgetId: string) => string | undefined
    }
  }
}
</script>

<style scoped>
.turnstile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 65px;
}
</style>
