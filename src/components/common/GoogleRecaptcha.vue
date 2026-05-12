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

const ONLOAD_CB = '__grecaptchaOnload'

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Already fully loaded
    if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
      resolve()
      return
    }

    // Script tag not yet added — inject it
    if (!document.querySelector('script[src*="recaptcha/api.js"]')) {
      ;(window as any)[ONLOAD_CB] = () => {
        resolve()
        delete (window as any)[ONLOAD_CB]
      }

      const script = document.createElement('script')
      script.src = `https://www.google.com/recaptcha/api.js?render=explicit&hl=${props.language}&onload=${ONLOAD_CB}`
      script.async = true
      script.defer = true
      script.onerror = () => {
        delete (window as any)[ONLOAD_CB]
        reject(new Error('Failed to load reCAPTCHA script'))
      }
      document.head.appendChild(script)
      return
    }

    // Script tag exists but not ready yet — poll for render
    let attempts = 0
    const poll = () => {
      if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
        resolve()
      } else if (attempts++ < 100) {
        setTimeout(poll, 100)
      } else {
        reject(new Error('reCAPTCHA load timeout'))
      }
    }
    poll()
  })
}

function renderWidget() {
  if (!captchaContainer.value) return
  if (!props.siteKey) {
    console.error('[reCAPTCHA] VITE_RECAPTCHA_SITE_KEY is empty — rebuild Docker with the env var set')
    emit('error', 'reCAPTCHA: не задан ключ сайта')
    return
  }
  if (!window.grecaptcha || typeof window.grecaptcha.render !== 'function') {
    emit('error', 'reCAPTCHA не загрузилась. Проверьте интернет-соединение')
    return
  }
  if (widgetId.value !== null) return

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
        emit('error', 'Ошибка соединения с reCAPTCHA')
      }
    })
  } catch (err) {
    console.error('[reCAPTCHA] render error:', err)
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
  } catch (err) {
    console.error('[reCAPTCHA] load error:', err)
    emit('error', 'Не удалось загрузить reCAPTCHA')
  }
})

onBeforeUnmount(() => {
  if (widgetId.value !== null && window.grecaptcha) {
    window.grecaptcha.reset(widgetId.value)
    widgetId.value = null
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
