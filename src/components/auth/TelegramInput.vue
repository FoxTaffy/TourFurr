<template>
  <div class="form-group">
    <label v-if="label" :for="inputId" class="form-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    <div class="telegram-input-wrapper">
      <span class="telegram-icon">
        <svg class="icon" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.154.232.17.327.015.095.034.312.019.482z"/>
        </svg>
      </span>
      <input
        :id="inputId"
        v-model="inputValue"
        type="text"
        :placeholder="placeholder"
        class="form-input telegram-input"
        :class="{ error: hasError || hasInvalidChars }"
        @input="handleInput"
        @blur="handleBlur"
      />
    </div>
    <p v-if="convertedValue && showConverted && !hasInvalidChars" class="converted-hint">
      Будет сохранено как: <span class="converted-value">{{ convertedValue }}</span>
    </p>
    <p v-if="hasInvalidChars" class="error-text">
      Telegram должен содержать только латинские буквы (a-z), цифры и подчеркивание
    </p>
    <p v-else-if="errorMessage" class="error-text">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
  required?: boolean
  hasError?: boolean
  errorMessage?: string
  showConverted?: boolean
}>(), {
  placeholder: '@username или t.me/username',
  showConverted: true
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'converted', value: string): void
}>()

const inputId = `telegram-${Math.random().toString(36).substr(2, 9)}`
const inputValue = ref(props.modelValue)

// Check if input contains invalid (non-English) characters
const hasInvalidChars = computed(() => {
  if (!inputValue.value) return false

  let username = inputValue.value.trim()
  // Remove common prefixes to check only the username part
  username = username.replace(/^https?:\/\//, '')
  username = username.replace(/^t\.me\//, '')
  username = username.replace(/^@/, '')

  if (!username) return false

  // Check if contains characters other than English letters, numbers, underscores
  return !/^[a-zA-Z0-9_]+$/.test(username)
})

const convertedValue = computed(() => {
  return convertTelegramUsername(inputValue.value)
})

function convertTelegramUsername(value: string): string {
  if (!value) return ''

  let username = value.trim()

  // Remove https://
  username = username.replace(/^https?:\/\//, '')

  // Remove t.me/ prefix
  username = username.replace(/^t\.me\//, '')

  // Remove @ prefix
  username = username.replace(/^@/, '')

  // Validate: only English letters, numbers, and underscores (Telegram username rules)
  if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
    return '' // Invalid characters - return empty
  }

  // Return formatted as t.me/username
  if (username) {
    return `t.me/${username}`
  }

  return ''
}

function handleInput() {
  emit('update:modelValue', inputValue.value)
}

function handleBlur() {
  if (convertedValue.value) {
    emit('converted', convertedValue.value)
  }
}

watch(() => props.modelValue, (newVal) => {
  inputValue.value = newVal
})
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--cream);
}

.required {
  color: var(--fire);
}

.telegram-input-wrapper {
  position: relative;
}

.telegram-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #0088cc;
  pointer-events: none;
  z-index: 1;
}

.telegram-icon .icon {
  width: 1.25rem;
  height: 1.25rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(26, 17, 14, 0.6);
  border: 1px solid var(--moss);
  border-radius: 12px;
  color: var(--cream);
  font-family: 'Lora', serif;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.telegram-input {
  padding-left: 3rem;
}

.form-input:focus {
  outline: none;
  border-color: var(--fire);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.form-input.error {
  border-color: var(--fire);
}

.converted-hint {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--sage);
}

.converted-value {
  color: var(--fire-glow);
  font-weight: 500;
}

.error-text {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--fire);
}
</style>
