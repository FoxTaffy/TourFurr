<template>
  <div ref="captchaContainer" class="smartcaptcha-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

interface Props {
  siteKey: string
  language?: string
  invisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  language: 'ru',
  invisible: false
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
    if (window.smartCaptcha) {
      isScriptLoaded.value = true
      resolve()
      return
    }

    const existing = document.querySelector('script[src*="smartcaptcha.yandexcloud.net"]')
    if (existing) {
      existing.addEventListener('load', () => {
        isScriptLoaded.value = true
        resolve()
      })
      existing.addEventListener('error', reject)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://smartcaptcha.yandexcloud.net/captcha.js?render=onload&onload=onSmartCaptchaReady'
    script.async = true
    script.defer = true

    ;(window as any).onSmartCaptchaReady = () => {
      isScriptLoaded.value = true
      resolve()
    }

    script.onerror = () => {
      reject(new Error('Failed to load Yandex SmartCaptcha script'))
    }

    document.head.appendChild(script)
  })
}

function renderWidget() {
  if (!captchaContainer.value || !window.smartCaptcha) return

  try {
    widgetId.value = window.smartCaptcha.render(captchaContainer.value, {
      sitekey: props.siteKey,
      hl: props.language,
      invisible: props.invisible,
      callback: (token: string) => {
        emit('verify', token)
      },
      'expired-callback': () => {
        emit('expired')
      }
    })
  } catch (error) {
    emit('error', 'Failed to render SmartCaptcha widget')
  }
}

function reset() {
  if (widgetId.value !== null && window.smartCaptcha) {
    window.smartCaptcha.reset(widgetId.value)
  }
}

function destroy() {
  if (widgetId.value !== null && window.smartCaptcha) {
    window.smartCaptcha.destroy(widgetId.value)
    widgetId.value = null
  }
}

function getResponse(): string | undefined {
  if (widgetId.value !== null && window.smartCaptcha) {
    return window.smartCaptcha.getResponse(widgetId.value)
  }
  return undefined
}

defineExpose({ reset, destroy, getResponse })

watch(() => props.siteKey, () => {
  destroy()
  if (isScriptLoaded.value) {
    renderWidget()
  }
})

onMounted(async () => {
  try {
    await loadScript()
    renderWidget()
  } catch (error) {
    emit('error', 'Failed to load SmartCaptcha')
  }
})

onBeforeUnmount(() => {
  destroy()
})

declare global {
  interface Window {
    smartCaptcha?: {
      render: (container: HTMLElement, options: any) => number
      reset: (widgetId: number) => void
      destroy: (widgetId: number) => void
      getResponse: (widgetId: number) => string | undefined
      execute: (widgetId: number) => void
    }
  }
}
</script>

<style scoped>
.smartcaptcha-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 65px;
}
</style>
