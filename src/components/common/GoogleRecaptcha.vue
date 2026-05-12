<template>
  <div ref="captchaContainer" class="recaptcha-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

interface Props {
  siteKey: string
  language?: string
  theme?: 'light' | 'dark'
  size?: 'normal' | 'compact'
}

const props = withDefaults(defineProps<Props>(), {
  language: 'ru',
  theme: 'dark',
  size: 'normal'
})

const emit = defineEmits<{
  (e: 'verify', token: string): void
  (e: 'error', error: string): void
  (e: 'expired'): void
}>()

const captchaContainer = ref<HTMLElement | null>(null)
const widgetId = ref<number | null>(null)
const isScriptLoaded = ref(false)

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src*="recaptcha/api.js"]')

    if (!existingScript) {
      const script = document.createElement('script')
      script.src = `https://www.google.com/recaptcha/api.js?render=explicit&hl=${props.language}`
      script.async = true
      script.defer = true
      script.onerror = () => reject(new Error('Failed to load Google reCAPTCHA script'))
      document.head.appendChild(script)
    }

    const waitForReady = () => {
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(() => {
          isScriptLoaded.value = true
          resolve()
        })
      } else {
        setTimeout(waitForReady, 100)
      }
    }
    waitForReady()
  })
}

function renderWidget() {
  if (!captchaContainer.value || !window.grecaptcha) return

  try {
    widgetId.value = window.grecaptcha.render(captchaContainer.value, {
      sitekey: props.siteKey,
      theme: props.theme,
      size: props.size,
      callback: (token: string) => {
        emit('verify', token)
      },
      'expired-callback': () => {
        emit('expired')
      },
      'error-callback': () => {
        emit('error', 'reCAPTCHA error')
      }
    })
  } catch (error) {
    emit('error', 'Failed to render reCAPTCHA widget')
  }
}

function reset() {
  if (widgetId.value !== null && window.grecaptcha) {
    window.grecaptcha.reset(widgetId.value)
  }
}

function getResponse(): string | undefined {
  if (widgetId.value !== null && window.grecaptcha) {
    return window.grecaptcha.getResponse(widgetId.value) || undefined
  }
  return undefined
}

defineExpose({ reset, getResponse })

watch(() => props.siteKey, () => {
  if (widgetId.value !== null && window.grecaptcha) {
    window.grecaptcha.reset(widgetId.value)
  }
})

onMounted(async () => {
  try {
    await loadScript()
    renderWidget()
  } catch (error) {
    emit('error', 'Failed to load reCAPTCHA')
  }
})

onBeforeUnmount(() => {
  if (widgetId.value !== null && window.grecaptcha) {
    window.grecaptcha.reset(widgetId.value)
  }
})

declare global {
  interface Window {
    grecaptcha?: {
      render: (container: HTMLElement, options: any) => number
      reset: (widgetId?: number) => void
      getResponse: (widgetId?: number) => string
      execute: (widgetId?: number) => void
      ready: (callback: () => void) => void
    }
  }
}
</script>

<style scoped>
.recaptcha-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 78px;
}
</style>
