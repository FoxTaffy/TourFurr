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

      <!-- Yandex SmartCaptcha (появляется после 2 неудачных попыток) -->
      <div v-if="showCaptcha" class="captcha-wrapper">
        <YandexSmartCaptcha
          :siteKey="captchaSiteKey"
          @verify="handleCaptchaVerify"
          @error="handleCaptchaError"
          @expired="handleCaptchaExpired"
        />
        <p v-if="captchaError" class="error-text">{{ captchaError }}</p>
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
    <form v-else class="login-form reset-form">
      <div class="reset-header">
        <h3>Восстановление пароля</h3>
        <p class="reset-desc">
          {{
            resetStep === 'email' ? 'Введите ваш email для восстановления пароля' :
            resetStep === 'code' ? 'Введите 6-цифровой код из письма' :
            'Установите новый пароль для вашего аккаунта'
          }}
        </p>
      </div>

      <!-- Step 1: Email Input -->
      <div v-if="resetStep === 'email'">
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
          <p>Код отправлен на <strong>{{ resetEmail }}</strong>. Проверьте вашу почту.</p>
        </div>

        <!-- Submit Button -->
        <button type="button" @click="handleResetSubmit" :disabled="isResetLoading || resetSubmitted" class="submit-btn">
          <span class="btn-glow"></span>
          <span class="btn-content">
            <svg v-if="isResetLoading" class="spinner" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <svg v-else class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            {{ isResetLoading ? 'Отправка...' : 'Отправить код' }}
          </span>
        </button>
      </div>

      <!-- Step 2: Code Input -->
      <div v-else-if="resetStep === 'code'" class="code-step">
        <p class="code-sent-info">
          Код отправлен на <strong>{{ resetEmail }}</strong>
        </p>

        <!-- Code Inputs -->
        <div class="code-inputs">
          <input
            v-for="(digit, index) in resetCode"
            :key="index"
            :ref="(el) => (codeInputRefs[index] = el as HTMLInputElement)"
            v-model="resetCode[index]"
            type="text"
            inputmode="numeric"
            maxlength="1"
            class="code-input"
            :class="{ error: codeError }"
            @input="handleCodeInput(index, $event)"
            @keydown="handleCodeKeyDown(index, $event)"
            @paste="handleCodePaste"
          />
        </div>

        <p v-if="codeError" class="error-text">{{ codeError }}</p>

        <!-- Resend Code -->
        <div class="resend-section">
          <p v-if="canResend" class="resend-text">
            Не получили код?
            <button type="button" @click="handleResendCode" :disabled="isResending" class="resend-btn-link">
              {{ isResending ? 'Отправка...' : 'Отправить снова' }}
            </button>
          </p>
          <p v-else class="timer-text">
            Повторная отправка через {{ resendTimeLeft }}с
          </p>
        </div>

        <!-- Verify Button -->
        <button type="button" @click="handleCodeVerify" :disabled="!isCodeComplete || isVerifying" class="submit-btn">
          <span class="btn-glow"></span>
          <span class="btn-content">
            <svg v-if="isVerifying" class="spinner" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <svg v-else class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ isVerifying ? 'Проверка...' : 'Подтвердить' }}
          </span>
        </button>
      </div>

      <!-- Step 3: New Password Input -->
      <div v-else-if="resetStep === 'password'" class="password-step">
        <!-- Success Message (if password updated) -->
        <div v-if="passwordUpdateSuccess" class="success-message">
          <svg class="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <p class="success-title">Пароль обновлен!</p>
            <p>Теперь вы можете войти с новым паролем.</p>
          </div>
        </div>

        <!-- Password Inputs (if not success yet) -->
        <template v-else>
          <p class="code-sent-info">
            Установите новый пароль для <strong>{{ resetEmail }}</strong>
          </p>

          <!-- New Password -->
          <div class="form-group">
            <label for="new-password" class="form-label">
              Новый пароль <span class="required">*</span>
            </label>
            <div class="input-wrapper">
              <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <input
                id="new-password"
                v-model="newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                placeholder="Минимум 8 символов"
                class="form-input"
                :class="{ error: passwordError }"
              />
              <button
                type="button"
                @click="showNewPassword = !showNewPassword"
                class="toggle-password"
              >
                <svg v-if="showNewPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
            </div>
            <p v-if="passwordError" class="error-text">{{ passwordError }}</p>
          </div>

          <!-- Confirm Password -->
          <div class="form-group">
            <label for="confirm-password" class="form-label">
              Подтверждение пароля <span class="required">*</span>
            </label>
            <div class="input-wrapper">
              <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <input
                id="confirm-password"
                v-model="confirmPassword"
                :type="showNewPassword ? 'text' : 'password'"
                placeholder="Повторите пароль"
                class="form-input"
                :class="{ error: confirmPasswordError }"
              />
            </div>
            <p v-if="confirmPasswordError" class="error-text">{{ confirmPasswordError }}</p>
          </div>

          <!-- Submit Button -->
          <button type="button" @click="handlePasswordUpdate" :disabled="isUpdatingPassword" class="submit-btn">
            <span class="btn-glow"></span>
            <span class="btn-content">
              <svg v-if="isUpdatingPassword" class="spinner" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <svg v-else class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              {{ isUpdatingPassword ? 'Сохранение...' : 'Сохранить пароль' }}
            </span>
          </button>
        </template>
      </div>

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
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { supabase } from '../../services/supabase'
import YandexSmartCaptcha from '../common/YandexSmartCaptcha.vue'
import * as yup from 'yup'
import { createPasswordResetCode, sendPasswordResetEmail, invalidateOldResetCodes } from '../../utils/passwordReset'
import { safeStorage } from '../../utils/safeStorage'

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

// Yandex SmartCaptcha state
const captchaSiteKey = import.meta.env.VITE_SMARTCAPTCHA_SITE_KEY || ''
const captchaToken = ref<string | null>(null)
const captchaError = ref('')
const loginAttempts = ref(0)
const showCaptcha = computed(() => loginAttempts.value >= 2)

// Password reset state
const showForgotPassword = ref(false)
const resetEmail = ref('')
const resetError = ref('')
const isResetLoading = ref(false)
const resetSubmitted = ref(false)
const resetStep = ref<'email' | 'code' | 'password'>('email')

// Code verification state
const resetCode = ref<string[]>(['', '', '', '', '', ''])
const codeInputRefs = ref<HTMLInputElement[]>([])
const codeError = ref('')
const isVerifying = ref(false)
const isResending = ref(false)
const resendTimeLeft = ref(60)
const canResend = ref(false)
let resendTimer: number | null = null

const isCodeComplete = computed(() => resetCode.value.every(digit => digit !== ''))

// New password state
const newPassword = ref('')
const confirmPassword = ref('')
const showNewPassword = ref(false)
const passwordError = ref('')
const confirmPasswordError = ref('')
const isUpdatingPassword = ref(false)
const passwordUpdateSuccess = ref(false)

const schema = yup.object({
  email: yup.string().required('Email обязателен').email('Неверный формат email'),
  password: yup.string().required('Пароль обязателен')
})

const resetSchema = yup.object({
  email: yup.string().required('Email обязателен').email('Неверный формат email')
})

// SmartCaptcha handlers
function handleCaptchaVerify(token: string) {
  captchaToken.value = token
  captchaError.value = ''
}

function handleCaptchaError(error: string) {
  captchaToken.value = null
  captchaError.value = error || 'Ошибка проверки. Попробуйте еще раз'
}

function handleCaptchaExpired() {
  captchaToken.value = null
  captchaError.value = 'Проверка истекла. Пожалуйста, пройдите проверку снова'
}

async function handleSubmit() {
  errors.email = ''
  errors.password = ''
  serverError.value = ''
  captchaError.value = ''

  // Проверка CAPTCHA если она показана
  if (showCaptcha.value && !captchaToken.value) {
    captchaError.value = 'Пожалуйста, пройдите проверку CAPTCHA'
    return
  }

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
    // Сбросить счетчик попыток при успешном входе
    loginAttempts.value = 0
    captchaToken.value = null
    router.push('/dashboard')
  } else {
    // Check if user needs email verification
    if ((result as any).needsVerification) {
      const email = (result as any).email || form.email
      const emailSent = (result as any).emailSent
      const verificationCode = (result as any).verificationCode || ''
      router.push({
        path: '/auth/verify-email',
        query: {
          email,
          emailSent: emailSent ? 'true' : 'false',
          ...(verificationCode ? { code: verificationCode } : {})
        }
      })
      return
    }

    // Увеличить счетчик неудачных попыток
    loginAttempts.value++
    captchaToken.value = null // Сбросить токен для новой попытки
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
    const cleanEmail = resetEmail.value.trim().toLowerCase()

    // Check if user exists
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .single()

    if (user) {
      // Invalidate old codes first
      await invalidateOldResetCodes(cleanEmail)

      // Create password reset code
      const result = await createPasswordResetCode(cleanEmail)

      if (result.success && result.code) {
        // Send password reset email via resend.com
        const sendResult = await sendPasswordResetEmail(cleanEmail, result.code)

        if (!sendResult.success) {
          resetError.value = sendResult.error || 'Ошибка отправки письма'
          return
        }

        // Show success and switch to code input
        resetSubmitted.value = true
        setTimeout(() => {
          resetStep.value = 'code'
          resetSubmitted.value = false
          startResendTimer()
          // Auto-focus first code input
          setTimeout(() => {
            codeInputRefs.value[0]?.focus()
          }, 100)
        }, 1500)
      } else {
        resetError.value = result.error || 'Ошибка создания кода'
      }
    } else {
      // User doesn't exist - show generic message for security
      resetSubmitted.value = true
      setTimeout(() => {
        resetError.value = 'Если аккаунт с этим email существует, код будет отправлен на почту'
        resetSubmitted.value = false
      }, 2000)
    }
  } catch (err) {
    console.error('Reset error:', err)
    resetError.value = 'Ошибка отправки. Попробуйте позже.'
  }

  isResetLoading.value = false
}

function resetForgotForm() {
  showForgotPassword.value = false
  resetEmail.value = ''
  resetError.value = ''
  resetSubmitted.value = false
  isResetLoading.value = false
  resetStep.value = 'email'
  resetCode.value = ['', '', '', '', '', '']
  codeError.value = ''
  isVerifying.value = false
  isResending.value = false
  newPassword.value = ''
  confirmPassword.value = ''
  showNewPassword.value = false
  passwordError.value = ''
  confirmPasswordError.value = ''
  isUpdatingPassword.value = false
  passwordUpdateSuccess.value = false
  if (resendTimer) {
    clearInterval(resendTimer)
    resendTimer = null
  }
}

function startResendTimer() {
  resendTimeLeft.value = 60
  canResend.value = false

  if (resendTimer) clearInterval(resendTimer)

  resendTimer = window.setInterval(() => {
    resendTimeLeft.value--
    if (resendTimeLeft.value <= 0) {
      canResend.value = true
      if (resendTimer) {
        clearInterval(resendTimer)
        resendTimer = null
      }
    }
  }, 1000)
}

function handleCodeInput(index: number, event: Event) {
  const input = event.target as HTMLInputElement
  const value = input.value

  // Only allow digits
  if (value && !/^\d$/.test(value)) {
    resetCode.value[index] = ''
    return
  }

  resetCode.value[index] = value

  // Auto-focus next input
  if (value && index < 5) {
    codeInputRefs.value[index + 1]?.focus()
  }

  // Clear error on input
  if (codeError.value) {
    codeError.value = ''
  }

  // Auto-submit when all 6 digits are entered
  if (isCodeComplete.value) {
    setTimeout(() => handleCodeVerify(), 300)
  }
}

function handleCodeKeyDown(index: number, event: KeyboardEvent) {
  // Handle backspace
  if (event.key === 'Backspace' && !resetCode.value[index] && index > 0) {
    codeInputRefs.value[index - 1]?.focus()
  }

  // Handle arrow keys
  if (event.key === 'ArrowLeft' && index > 0) {
    codeInputRefs.value[index - 1]?.focus()
  }
  if (event.key === 'ArrowRight' && index < 5) {
    codeInputRefs.value[index + 1]?.focus()
  }

  // Handle Enter key
  if (event.key === 'Enter' && isCodeComplete.value) {
    handleCodeVerify()
  }
}

function handleCodePaste(event: ClipboardEvent) {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text')

  if (!pastedData) return

  const digits = pastedData.replace(/\D/g, '').slice(0, 6)

  for (let i = 0; i < digits.length; i++) {
    resetCode.value[i] = digits[i]
  }

  // Focus last filled input or first empty one
  const nextIndex = Math.min(digits.length, 5)
  codeInputRefs.value[nextIndex]?.focus()

  // Auto-submit if pasted all 6 digits
  if (digits.length === 6) {
    setTimeout(() => handleCodeVerify(), 300)
  }
}

async function handleCodeVerify() {
  if (!isCodeComplete.value || isVerifying.value) return

  isVerifying.value = true
  codeError.value = ''

  const codeString = resetCode.value.join('')

  try {
    const { verifyResetCode } = await import('@/utils/passwordReset')

    const result = await verifyResetCode(resetEmail.value, codeString)

    if (result.success) {
      // Move to password step
      resetStep.value = 'password'
    } else {
      codeError.value = result.error || 'Неверный код'
      // Clear code on error
      resetCode.value = ['', '', '', '', '', '']
      codeInputRefs.value[0]?.focus()
    }
  } catch (err: any) {
    codeError.value = err.message || 'Ошибка проверки кода'
  } finally {
    isVerifying.value = false
  }
}

async function handleResendCode() {
  if (!canResend.value || isResending.value) return

  isResending.value = true
  codeError.value = ''

  try {
    // Invalidate old codes first
    await invalidateOldResetCodes(resetEmail.value)

    // Create new password reset code
    const result = await createPasswordResetCode(resetEmail.value)

    if (result.success && result.code) {
      // Send new code via email
      const sendResult = await sendPasswordResetEmail(resetEmail.value, result.code)

      if (!sendResult.success) {
        codeError.value = sendResult.error || 'Ошибка отправки письма'
        return
      }

      // Clear code inputs and restart timer
      resetCode.value = ['', '', '', '', '', '']
      codeInputRefs.value[0]?.focus()
      startResendTimer()
    } else {
      codeError.value = result.error || 'Ошибка создания кода'
    }
  } catch (err: any) {
    codeError.value = err.message || 'Ошибка отправки кода'
  } finally {
    isResending.value = false
  }
}

function validatePassword(): boolean {
  passwordError.value = ''
  confirmPasswordError.value = ''
  let isValid = true

  if (!newPassword.value) {
    passwordError.value = 'Введите пароль'
    isValid = false
  } else if (newPassword.value.length < 8) {
    passwordError.value = 'Минимум 8 символов'
    isValid = false
  } else if (!/[a-zA-Z]/.test(newPassword.value)) {
    passwordError.value = 'Должен содержать буквы'
    isValid = false
  } else if (!/\d/.test(newPassword.value)) {
    passwordError.value = 'Должен содержать цифры'
    isValid = false
  } else if (!/[^a-zA-Z0-9]/.test(newPassword.value)) {
    passwordError.value = 'Должен содержать специальный символ'
    isValid = false
  }

  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Подтвердите пароль'
    isValid = false
  } else if (newPassword.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Пароли не совпадают'
    isValid = false
  }

  return isValid
}

async function handlePasswordUpdate() {
  if (!validatePassword()) return

  isUpdatingPassword.value = true
  passwordError.value = ''
  confirmPasswordError.value = ''

  try {
    // Update password via Edge Function
    const { data, error } = await supabase.functions.invoke('update-password', {
      body: {
        email: resetEmail.value,
        newPassword: newPassword.value
      }
    })

    if (error) {
      console.error('Password update error:', error)
      passwordError.value = 'Ошибка обновления пароля. Попробуйте снова.'
      return
    }

    if (!data?.success) {
      passwordError.value = data?.error || 'Ошибка обновления пароля'
      return
    }

    // Show success
    passwordUpdateSuccess.value = true

    // Sign out if user was logged in
    await supabase.auth.signOut()
    safeStorage.removeItem('auth_token')
    safeStorage.removeItem('current_user')

    // After 2 seconds, reset form and show login
    setTimeout(() => {
      resetForgotForm()
    }, 2000)
  } catch (err: any) {
    console.error('Unexpected error:', err)
    passwordError.value = 'Произошла ошибка. Попробуйте позже.'
  } finally {
    isUpdatingPassword.value = false
  }
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

.captcha-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.captcha-wrapper > div {
  transform: scale(0.95);
  transform-origin: center;
}

@media (max-width: 640px) {
  .captcha-wrapper > div {
    transform: scale(0.85);
  }
}

/* Code Step Styles */
.code-step {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.code-sent-info {
  text-align: center;
  color: var(--sage);
  font-size: 0.95rem;
  line-height: 1.6;
}

.code-sent-info strong {
  color: var(--fire-glow);
}

.code-inputs {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
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

.resend-section {
  text-align: center;
  min-height: 2rem;
}

.resend-text {
  color: var(--sage);
  font-size: 0.9rem;
}

.resend-btn-link {
  background: none;
  border: none;
  color: var(--fire-glow);
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  margin-left: 0.25rem;
  transition: color 0.3s ease;
  font-family: 'Inter', sans-serif;
  padding: 0;
}

.resend-btn-link:hover:not(:disabled) {
  color: var(--fire);
}

.resend-btn-link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.timer-text {
  color: var(--sage);
  font-size: 0.9rem;
  font-style: italic;
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

/* Password Step Styles */
.password-step {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.success-title {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}
</style>
