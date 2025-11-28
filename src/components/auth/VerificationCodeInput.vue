<template>
  <div class="verification-container">
    <h2>Подтверждение email</h2>
    <p class="instruction">
      Мы отправили код подтверждения на <strong>{{ email }}</strong><br>
      Введите 6-цифровой код из письма
    </p>

    <div class="code-inputs">
      <input
        v-for="(digit, index) in code"
        :key="index"
        :ref="(el) => (inputRefs[index] = el as HTMLInputElement)"
        v-model="code[index]"
        type="text"
        inputmode="numeric"
        maxlength="1"
        class="code-input"
        :class="{ error: hasError }"
        @input="handleInput(index, $event)"
        @keydown="handleKeyDown(index, $event)"
        @paste="handlePaste"
      />
    </div>

    <p v-if="error" class="error-message">{{ error }}</p>

    <div class="resend-section">
      <p v-if="canResend" class="resend-text">
        Не получили код?
        <button @click="resendCode" :disabled="isResending" class="resend-btn">
          {{ isResending ? 'Отправка...' : 'Отправить снова' }}
        </button>
      </p>
      <p v-else class="timer-text">
        Повторная отправка через {{ timeLeft }}с
      </p>
    </div>

    <button
      v-if="isComplete && !isVerifying"
      @click="verifyCode"
      class="verify-btn"
      :disabled="isVerifying"
    >
      Подтвердить
    </button>

    <div v-if="isVerifying" class="spinner">
      <div class="spinner-circle"></div>
      <p>Проверка кода...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  email: string
}>()

const emit = defineEmits<{
  verified: []
  resend: []
}>()

const code = ref<string[]>(['', '', '', '', '', ''])
const inputRefs = ref<HTMLInputElement[]>([])
const error = ref<string>('')
const hasError = ref(false)
const isVerifying = ref(false)
const isResending = ref(false)

// Resend timer
const timeLeft = ref(60) // 60 seconds cooldown
const canResend = ref(false)
let timer: number | null = null

const isComplete = computed(() => code.value.every(digit => digit !== ''))

onMounted(() => {
  // Auto-focus first input
  inputRefs.value[0]?.focus()

  // Start resend timer
  startTimer()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function startTimer() {
  timeLeft.value = 60
  canResend.value = false

  if (timer) clearInterval(timer)

  timer = window.setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      canResend.value = true
      if (timer) clearInterval(timer)
    }
  }, 1000)
}

function handleInput(index: number, event: Event) {
  const input = event.target as HTMLInputElement
  const value = input.value

  // Only allow digits
  if (value && !/^\d$/.test(value)) {
    code.value[index] = ''
    return
  }

  code.value[index] = value

  // Auto-focus next input
  if (value && index < 5) {
    inputRefs.value[index + 1]?.focus()
  }

  // Clear error on input
  if (hasError.value) {
    hasError.value = false
    error.value = ''
  }

  // Auto-submit when all 6 digits are entered
  if (isComplete.value) {
    setTimeout(() => verifyCode(), 300)
  }
}

function handleKeyDown(index: number, event: KeyboardEvent) {
  // Handle backspace
  if (event.key === 'Backspace' && !code.value[index] && index > 0) {
    inputRefs.value[index - 1]?.focus()
  }

  // Handle arrow keys
  if (event.key === 'ArrowLeft' && index > 0) {
    inputRefs.value[index - 1]?.focus()
  }
  if (event.key === 'ArrowRight' && index < 5) {
    inputRefs.value[index + 1]?.focus()
  }

  // Handle Enter key
  if (event.key === 'Enter' && isComplete.value) {
    verifyCode()
  }
}

function handlePaste(event: ClipboardEvent) {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text')

  if (!pastedData) return

  const digits = pastedData.replace(/\D/g, '').slice(0, 6)

  for (let i = 0; i < digits.length; i++) {
    code.value[i] = digits[i]
  }

  // Focus last filled input or first empty one
  const nextIndex = Math.min(digits.length, 5)
  inputRefs.value[nextIndex]?.focus()

  // Auto-submit if pasted all 6 digits
  if (digits.length === 6) {
    setTimeout(() => verifyCode(), 300)
  }
}

async function verifyCode() {
  if (!isComplete.value || isVerifying.value) return

  isVerifying.value = true
  error.value = ''
  hasError.value = false

  const codeString = code.value.join('')

  try {
    // Import verification function
    const { verifyCode: verifyCodeFn } = await import('@/utils/emailVerification')

    const result = await verifyCodeFn(props.email, codeString)

    if (result.success) {
      emit('verified')
    } else {
      error.value = result.error || 'Неверный код'
      hasError.value = true
      // Clear code on error
      code.value = ['', '', '', '', '', '']
      inputRefs.value[0]?.focus()
    }
  } catch (err: any) {
    error.value = err.message || 'Ошибка проверки кода'
    hasError.value = true
  } finally {
    isVerifying.value = false
  }
}

async function resendCode() {
  if (!canResend.value || isResending.value) return

  isResending.value = true
  error.value = ''
  hasError.value = false

  try {
    emit('resend')
    startTimer()
  } catch (err: any) {
    error.value = err.message || 'Ошибка отправки кода'
  } finally {
    isResending.value = false
  }
}
</script>

<style scoped>
.verification-container {
  max-width: 450px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h2 {
  font-family: 'Merriweather', serif;
  font-size: 1.8rem;
  color: var(--cream);
  margin-bottom: 1rem;
}

.instruction {
  color: var(--sage);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.instruction strong {
  color: var(--fire-glow);
}

.code-inputs {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.code-input {
  width: 3rem;
  height: 3.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  border: 2px solid var(--moss);
  border-radius: 10px;
  background: rgba(26, 17, 14, 0.5);
  color: var(--cream);
  transition: all 0.3s ease;
}

.code-input:focus {
  outline: none;
  border-color: var(--fire-glow);
  box-shadow: 0 0 0 3px rgba(255, 179, 71, 0.2);
  transform: scale(1.05);
}

.code-input.error {
  border-color: #ef4444;
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.error-message {
  color: #fca5a5;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  min-height: 1.25rem;
}

.resend-section {
  margin: 1.5rem 0;
  min-height: 2.5rem;
}

.resend-text {
  color: var(--sage);
  font-size: 0.9rem;
}

.resend-btn {
  background: none;
  border: none;
  color: var(--fire-glow);
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  margin-left: 0.5rem;
  transition: color 0.3s ease;
}

.resend-btn:hover:not(:disabled) {
  color: var(--fire);
}

.resend-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.timer-text {
  color: var(--sage);
  font-size: 0.9rem;
  font-style: italic;
}

.verify-btn {
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, var(--fire), var(--fire-glow));
  border: none;
  border-radius: 10px;
  color: white;
  font-family: 'Lora', serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.verify-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
}

.verify-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.spinner-circle {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 179, 71, 0.3);
  border-top-color: var(--fire-glow);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner p {
  color: var(--sage);
  font-size: 0.9rem;
}

@media (max-width: 480px) {
  .code-inputs {
    gap: 0.5rem;
  }

  .code-input {
    width: 2.5rem;
    height: 3rem;
    font-size: 1.25rem;
  }
}
</style>
