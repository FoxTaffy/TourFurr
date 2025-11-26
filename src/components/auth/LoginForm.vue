<template>
  <div class="form-container">
    <!-- Login Form -->
    <form v-if="!showForgotPassword" @submit.prevent="handleSubmit" class="login-form">
      <!-- Email -->
      <div class="form-group">
        <label for="email" class="form-label">
          Email <span class="required">*</span>
        </label>
        <div class="input-wrapper">
          <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="email@example.com"
            class="form-input"
            :class="{ error: errors.email }"
          />
        </div>
        <p v-if="errors.email" class="error-text">{{ errors.email }}</p>
      </div>

      <!-- Password -->
      <div class="form-group">
        <label for="password" class="form-label">
          Пароль <span class="required">*</span>
        </label>
        <div class="input-wrapper">
          <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Введите пароль"
            class="form-input"
            :class="{ error: errors.password }"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="toggle-password"
          >
            <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </button>
        </div>
        <p v-if="errors.password" class="error-text">{{ errors.password }}</p>
      </div>

      <!-- Server Error -->
      <div v-if="serverError" class="server-error">
        <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p>{{ serverError }}</p>
      </div>

      <!-- Submit Button -->
      <button type="submit" :disabled="isLoading" class="submit-btn">
        <span class="btn-glow"></span>
        <span class="btn-content">
          <svg v-if="isLoading" class="spinner" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <svg v-else class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
          </svg>
          {{ isLoading ? 'Вход...' : 'Войти' }}
        </span>
      </button>

      <!-- Forgot Password -->
      <div class="forgot-link">
        <button type="button" @click="showForgotPassword = true" class="forgot-btn">
          Забыли пароль?
        </button>
      </div>
    </form>

    <!-- Password Reset Form -->
    <form v-else @submit.prevent="handleResetSubmit" class="login-form reset-form">
      <div class="reset-header">
        <h3>Восстановление пароля</h3>
        <p class="reset-desc">Введите ваш email для восстановления пароля</p>
      </div>

      <!-- Email -->
      <div class="form-group">
        <label for="reset-email" class="form-label">
          Email <span class="required">*</span>
        </label>
        <div class="input-wrapper">
          <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          <input
            id="reset-email"
            v-model="resetEmail"
            type="email"
            placeholder="email@example.com"
            class="form-input"
            :class="{ error: resetError }"
          />
        </div>
        <p v-if="resetError" class="error-text">{{ resetError }}</p>
      </div>

      <!-- Success Message -->
      <div v-if="resetSubmitted" class="success-message">
        <svg class="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p>Если аккаунт с этим email существует, инструкции по восстановлению пароля будут отправлены на ваш email.</p>
      </div>

      <!-- Submit Button -->
      <button type="submit" :disabled="isResetLoading || resetSubmitted" class="submit-btn">
        <span class="btn-glow"></span>
        <span class="btn-content">
          <svg v-if="isResetLoading" class="spinner" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <svg v-else class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          {{ isResetLoading ? 'Отправка...' : 'Отправить' }}
        </span>
      </button>

      <!-- Back to Login -->
      <div class="forgot-link">
        <button type="button" @click="resetForgotForm" class="forgot-btn">
          ← Вернуться ко входу
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { supabase } from '../../services/supabase'
import * as yup from 'yup'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: ''
})

const showPassword = ref(false)
const isLoading = ref(false)
const serverError = ref('')

// Password reset state
const showForgotPassword = ref(false)
const resetEmail = ref('')
const resetError = ref('')
const isResetLoading = ref(false)
const resetSubmitted = ref(false)

const schema = yup.object({
  email: yup.string().required('Email обязателен').email('Неверный формат email'),
  password: yup.string().required('Пароль обязателен')
})

const resetSchema = yup.object({
  email: yup.string().required('Email обязателен').email('Неверный формат email')
})

async function handleSubmit() {
  errors.email = ''
  errors.password = ''
  serverError.value = ''

  try {
    await schema.validate(form, { abortEarly: false })
  } catch (err: any) {
    err.inner.forEach((e: any) => {
      if (e.path in errors) {
        (errors as any)[e.path] = e.message
      }
    })
    return
  }

  isLoading.value = true
  const result = await authStore.login(form.email, form.password)
  isLoading.value = false

  if (result.success) {
    router.push('/dashboard')
  } else {
    serverError.value = result.error || 'Ошибка входа'
  }
}

async function handleResetSubmit() {
  resetError.value = ''

  try {
    await resetSchema.validate({ email: resetEmail.value })
  } catch (err: any) {
    resetError.value = err.message
    return
  }

  isResetLoading.value = true

  try {
    // Check if user exists
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', resetEmail.value)
      .single()

    if (error || !data) {
      // Don't reveal if user exists for security
      resetSubmitted.value = true
    } else {
      // User exists - in a real app, send password reset email here
      resetSubmitted.value = true
    }
  } catch (err) {
    console.error('Reset error:', err)
    resetSubmitted.value = true
  }

  isResetLoading.value = false
}

function resetForgotForm() {
  showForgotPassword.value = false
  resetEmail.value = ''
  resetError.value = ''
  resetSubmitted.value = false
  isResetLoading.value = false
}
</script>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.9rem;
  color: var(--cream);
  font-weight: 500;
}

.required {
  color: var(--fire);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  width: 18px;
  height: 18px;
  color: var(--sage);
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 14px 14px 14px 44px;
  background: rgba(26, 17, 14, 0.6);
  border: 1px solid var(--moss);
  border-radius: 12px;
  color: var(--cream);
  font-family: 'Lora', serif;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.form-input::placeholder {
  color: var(--sage);
  opacity: 0.7;
}

.form-input:focus {
  outline: none;
  border-color: var(--fire);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1), 0 0 20px rgba(255, 107, 53, 0.1);
}

.form-input.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.toggle-password {
  position: absolute;
  right: 12px;
  padding: 4px;
  background: none;
  border: none;
  color: var(--sage);
  cursor: pointer;
  transition: color 0.3s ease;
}

.toggle-password:hover {
  color: var(--cream);
}

.error-text {
  font-size: 0.8rem;
  color: #ef4444;
  margin-top: 4px;
}

.server-error {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  color: #fca5a5;
  font-size: 0.9rem;
}

.error-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.submit-btn {
  position: relative;
  padding: 14px 24px;
  background: linear-gradient(135deg, var(--fire), var(--fire-glow));
  border: none;
  border-radius: 12px;
  color: white;
  font-family: 'Lora', serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-100%);
}

.submit-btn:hover:not(:disabled) .btn-glow {
  animation: shimmer 0.8s ease;
}

@keyframes shimmer {
  100% { transform: translateX(100%); }
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.btn-icon {
  width: 20px;
  height: 20px;
}

.spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

.forgot-link {
  text-align: center;
}

.forgot-btn {
  background: none;
  border: none;
  color: var(--fire-glow);
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  padding: 0;
}

.forgot-btn::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--fire-glow);
  transition: width 0.3s ease;
}

.forgot-btn:hover::after {
  width: 100%;
}

.form-container {
  width: 100%;
}

.reset-form {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reset-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.reset-header h3 {
  font-family: 'Merriweather', serif;
  font-size: 1.5rem;
  color: var(--fire-glow);
  margin-bottom: 0.5rem;
}

.reset-desc {
  color: var(--sage);
  font-size: 0.9rem;
  line-height: 1.5;
}

.success-message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 18px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 10px;
  color: #86efac;
  font-size: 0.9rem;
  line-height: 1.6;
}

.success-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  margin-top: 2px;
}
</style>
