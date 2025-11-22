<template>
  <div class="telegram-input">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-300 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-400">*</span>
    </label>
    <div class="relative">
      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.154.232.17.327.015.095.034.312.019.482z"/>
        </svg>
      </span>
      <input
        :id="inputId"
        v-model="inputValue"
        type="text"
        :placeholder="placeholder"
        class="w-full bg-gray-800/50 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
        :class="{ 'border-red-500': hasError }"
        @input="handleInput"
        @blur="handleBlur"
      />
    </div>
    <p v-if="convertedValue && showConverted" class="mt-1 text-xs text-gray-400">
      Будет сохранено как: <span class="text-amber-400">{{ convertedValue }}</span>
    </p>
    <p v-if="errorMessage" class="mt-1 text-xs text-red-400">{{ errorMessage }}</p>
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
