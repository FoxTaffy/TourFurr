<template>
  <div class="form-container">
    <!-- Login Form -->
    <form v-if="!showForgotPassword" @submit.prevent="handleSubmit" class="auth-form">
      <div class="form-group">
        <label class="form-label">Email <span class="required">*</span></label>
        <div class="input-wrapper">
          <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          <input
            v-model="form.email"
            type="email"
            placeholder="email@example.com"
            class="form-input"
            :class="{ error: errors.email }"
            autocomplete="email"
          />
        </div>
        <p v-if="errors.email" class="error-text">{{ errors.email }}</p>
      </div>

      <div class="form-group">
        <label class="form-label">Пароль <span class="required">*</span></label>
        <div class="input-wrapper">
          <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Введите пароль"
            class="form-input"
            :class="{ error: errors.password }"
            autocomplete="current-password"
          />
          <button type="button" @click="showPassword = !showPassword" class="toggle-password">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="showPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </button>
        </div>
        <p v-if="errors.password" class="error-text">{{ errors.password }}</p>
      </div>

      <div v-if="serverError" class="server-error">
        <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p>{{ serverError }}</p>
      </div>

      <button type="submit" :disabled="isLoading" class="submit-btn">
        <span class="btn-glow"></span>
        <span class="btn-content">
          <svg v-if="isLoading" class="spinner" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          {{ isLoading ? 'Вход...' : 'Войти' }}
        </span>
      </button>

      <div class="forgot-link">
        <button type="button" @click="showForgotPassword = true" class="forgot-btn">
          Забыли пароль?
        </button>
      </div>
    </form>

    <!-- Password Reset Form -->
    <form v-else class="auth-form reset-form">
      <div class="reset-header">
        <h3>Восстановление пароля</h3>
        <p class="reset-desc">
          {{ resetStep === 'email' ? 'Введите ваш email для восстановления пароля'
           : resetStep === 'code' ? 'Введите 6-значный код из письма'
           : 'Установите новый пароль' }}
        </p>
      </div>

      <!-- Step 1: Email -->
      <div v-if="resetStep === 'email'">
        <div class="form-group">
          <label class="form-label">Email <span class="required">*</span></label>
          <div class="input-wrapper">
            <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            <input
              v-model="resetEmail"
              type="email"
              placeholder="email@example.com"
              class="form-input"
              :class="{ error: resetError }"
            />
          </div>
          <p v-if="resetError" class="error-text">{{ resetError }}</p>
        </div>

        <div v-if="resetSubmitted" class="success-message">
          <svg class="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p>Если аккаунт с этим email существует — код отправлен. Проверьте почту (в том числе «Спам»).</p>
        </div>

        <button type="button" @click="handleResetSubmit" :disabled="isResetLoading || resetSubmitted" class="submit-btn" style="margin-top: 1rem;">
          <span class="btn-glow"></span>
          <span class="btn-content">
            <svg v-if="isResetLoading" class="spinner" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            {{ isResetLoading ? 'Отправка...' : 'Отправить код' }}
          </span>
        </button>
      </div>

      <!-- Step 2: Code -->
      <div v-else-if="resetStep === 'code'" class="code-step">
        <p class="code-sent-info">Код отправлен на <strong>{{ resetEmail }}</strong></p>

        <div class="code-inputs">
          <input
            v-for="(_, index) in resetCode"
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

        <p v-if="codeError" class="error-text" style="text-align:center;">{{ codeError }}</p>

        <div class="resend-section">
          <p v-if="canResend" class="resend-text">
            Не получили код?
            <button type="button" @click="handleResendCode" :disabled="isResending" class="resend-btn-link">
              {{ isResending ? 'Отправка...' : 'Отправить снова' }}
            </button>
          </p>
          <p v-else class="timer-text">Повторная отправка через {{ resendTimeLeft }}с</p>
        </div>

        <button type="button" @click="handleCodeVerify" :disabled="!isCodeComplete || isVerifying" class="submit-btn">
          <span class="btn-glow"></span>
          <span class="btn-content">
            <svg v-if="isVerifying" class="spinner" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            {{ isVerifying ? 'Проверка...' : 'Подтвердить' }}
          </span>
        </button>
      </div>

      <!-- Step 3: New Password -->
      <div v-else-if="resetStep === 'password'" class="password-step">
        <div v-if="passwordUpdateSuccess" class="success-message">
          <svg class="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <p class="success-title">Пароль обновлён!</p>
            <p>Теперь вы можете войти с новым паролем.</p>
          </div>
        </div>

        <template v-else>
          <p class="code-sent-info">Новый пароль для <strong>{{ resetEmail }}</strong></p>

          <div class="form-group">
            <label class="form-label">Новый пароль <span class="required">*</span></label>
            <div class="input-wrapper">
              <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <input
                v-model="newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                placeholder="Минимум 8 символов"
                class="form-input"
                :class="{ error: passwordError }"
              />
              <button type="button" @click="showNewPassword = !showNewPassword" class="toggle-password">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path v-if="showNewPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
            </div>
            <p v-if="passwordError" class="error-text">{{ passwordError }}</p>
          </div>

          <div class="form-group">
            <label class="form-label">Подтверждение пароля <span class="required">*</span></label>
            <div class="input-wrapper">
              <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <input
                v-model="confirmPassword"
                :type="showNewPassword ? 'text' : 'password'"
                placeholder="Повторите пароль"
                class="form-input"
                :class="{ error: confirmPasswordError }"
              />
            </div>
            <p v-if="confirmPasswordError" class="error-text">{{ confirmPasswordError }}</p>
          </div>

          <button type="button" @click="handlePasswordUpdate" :disabled="isUpdatingPassword" class="submit-btn">
            <span class="btn-glow"></span>
            <span class="btn-content">
              <svg v-if="isUpdatingPassword" class="spinner" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              {{ isUpdatingPassword ? 'Сохранение...' : 'Сохранить пароль' }}
            </span>
          </button>
        </template>
      </div>

      <div class="forgot-link" style="margin-top: 0.5rem;">
        <button type="button" @click="resetForgotForm" class="forgot-btn">
          ← Вернуться ко входу
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { supabase } from '../../services/supabase'
import * as yup from 'yup'
import { createPasswordResetCode, invalidateOldResetCodes } from '../../utils/passwordReset'
import { logger } from '../../utils/logger'
import { useToast } from '../../composables/useToast'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })
const showPassword = ref(false)
const isLoading = ref(false)
const serverError = ref('')

const EMAIL_VERIFY_CODE_STORAGE_PREFIX = 'verify_code_'

const schema = yup.object({
  email: yup.string().required('Email обязателен').email('Неверный формат email'),
  password: yup.string().required('Пароль обязателен')
})

async function handleSubmit() {
  errors.email = ''
  errors.password = ''
  serverError.value = ''

  try {
    await schema.validate(form, { abortEarly: false })
  } catch (err: any) {
    err.inner.forEach((e: any) => {
      if (e.path in errors) (errors as any)[e.path] = e.message
    })
    return
  }

  isLoading.value = true
  const result = await authStore.login(form.email, form.password)
  isLoading.value = false

  if (result.success) {
    toast.success('Вход выполнен успешно!')
    router.push('/dashboard')
    return
  }

  if (result.needsVerification) {
    const email = result.email || form.email
    if (result.verificationCode) {
      sessionStorage.setItem(`${EMAIL_VERIFY_CODE_STORAGE_PREFIX}${email.toLowerCase()}`, result.verificationCode)
    }
    toast.info('Подтвердите email — мы повторно отправили код.')
    router.push({ path: '/auth/verify-email', query: { email, emailSent: result.emailSent ? 'true' : 'false' } })
    return
  }

  if (result.isLegacyAccount) {
    resetEmail.value = form.email
    showForgotPassword.value = true
    return
  }

  const msg = result.error || 'Ошибка входа'
  serverError.value = msg
  toast.error(msg)
}

// ─── Password Reset ───────────────────────────────────────────────────────────

const showForgotPassword = ref(false)
const resetEmail = ref('')
const resetError = ref('')
const isResetLoading = ref(false)
const resetSubmitted = ref(false)
const resetStep = ref<'email' | 'code' | 'password'>('email')

const resetCode = ref<string[]>(['', '', '', '', '', ''])
const codeInputRefs = ref<HTMLInputElement[]>([])
const codeError = ref('')
const isVerifying = ref(false)
const isResending = ref(false)
const resendTimeLeft = ref(60)
const canResend = ref(false)
let resendTimer: number | null = null

const isCodeComplete = computed(() => resetCode.value.every(d => d !== ''))

const newPassword = ref('')
const confirmPassword = ref('')
const showNewPassword = ref(false)
const passwordError = ref('')
const confirmPasswordError = ref('')
const isUpdatingPassword = ref(false)
const passwordUpdateSuccess = ref(false)

const resetSchema = yup.object({
  email: yup.string().required('Email обязателен').email('Неверный формат email')
})

async function handleResetSubmit() {
  resetError.value = ''
  try {
    await resetSchema.validate({ email: resetEmail.value })
  } catch (err: any) {
    resetError.value = err.message
    return
  }

  isResetLoading.value = true
  resetSubmitted.value = true

  try {
    const cleanEmail = resetEmail.value.trim().toLowerCase()
    let userExists = false

    const { data, error: rpcError } = await supabase.rpc('check_email_exists', { p_email: cleanEmail })
    if (rpcError) {
      const { data: fallback } = await supabase.from('users').select('id').eq('email', cleanEmail).maybeSingle()
      userExists = !!fallback
    } else {
      userExists = !!data
    }

    if (userExists) {
      await invalidateOldResetCodes(cleanEmail)
      const result = await createPasswordResetCode(cleanEmail)
      if (result.success) {
        setTimeout(() => {
          resetSubmitted.value = false
          resetStep.value = 'code'
          startResendTimer()
          setTimeout(() => codeInputRefs.value[0]?.focus(), 100)
        }, 1500)
      } else {
        setTimeout(() => {
          resetSubmitted.value = false
          resetError.value = result.error || 'Ошибка создания кода'
        }, 1500)
      }
    } else {
      setTimeout(() => { resetSubmitted.value = false }, 1500)
    }
  } catch (err) {
    logger.error('Reset error:', err)
    setTimeout(() => {
      resetSubmitted.value = false
      resetError.value = 'Ошибка отправки. Попробуйте позже.'
    }, 1500)
  } finally {
    isResetLoading.value = false
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
      if (resendTimer) { clearInterval(resendTimer); resendTimer = null }
    }
  }, 1000)
}

function handleCodeInput(index: number, event: Event) {
  const input = event.target as HTMLInputElement
  const value = input.value
  if (value && !/^\d$/.test(value)) { resetCode.value[index] = ''; return }
  resetCode.value[index] = value
  if (value && index < 5) codeInputRefs.value[index + 1]?.focus()
  if (codeError.value) codeError.value = ''
  if (isCodeComplete.value) setTimeout(() => handleCodeVerify(), 300)
}

function handleCodeKeyDown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !resetCode.value[index] && index > 0) codeInputRefs.value[index - 1]?.focus()
  if (event.key === 'ArrowLeft' && index > 0) codeInputRefs.value[index - 1]?.focus()
  if (event.key === 'ArrowRight' && index < 5) codeInputRefs.value[index + 1]?.focus()
  if (event.key === 'Enter' && isCodeComplete.value) handleCodeVerify()
}

function handleCodePaste(event: ClipboardEvent) {
  event.preventDefault()
  const digits = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6)
  for (let i = 0; i < digits.length; i++) resetCode.value[i] = digits[i]
  codeInputRefs.value[Math.min(digits.length, 5)]?.focus()
  if (digits.length === 6) setTimeout(() => handleCodeVerify(), 300)
}

async function handleCodeVerify() {
  if (!isCodeComplete.value || isVerifying.value) return
  isVerifying.value = true
  codeError.value = ''
  try {
    const { verifyResetCode } = await import('@/utils/passwordReset')
    const result = await verifyResetCode(resetEmail.value, resetCode.value.join(''))
    if (result.success) {
      resetStep.value = 'password'
    } else {
      codeError.value = result.error || 'Неверный код'
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
    await invalidateOldResetCodes(resetEmail.value)
    const result = await createPasswordResetCode(resetEmail.value)
    if (result.success) {
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
  let valid = true
  if (!newPassword.value) { passwordError.value = 'Введите пароль'; valid = false }
  else if (newPassword.value.length < 8) { passwordError.value = 'Минимум 8 символов'; valid = false }
  else if (!/[A-Z]/.test(newPassword.value)) { passwordError.value = 'Нужна хотя бы одна заглавная буква'; valid = false }
  else if (!/\d/.test(newPassword.value)) { passwordError.value = 'Нужна хотя бы одна цифра'; valid = false }
  if (!confirmPassword.value) { confirmPasswordError.value = 'Подтвердите пароль'; valid = false }
  else if (newPassword.value !== confirmPassword.value) { confirmPasswordError.value = 'Пароли не совпадают'; valid = false }
  return valid
}

async function handlePasswordUpdate() {
  if (!validatePassword()) return
  isUpdatingPassword.value = true
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword.value })
    if (error) {
      if (error.message?.toLowerCase().includes('same')) {
        passwordError.value = 'Новый пароль должен отличаться от текущего.'
      } else if (error.message?.toLowerCase().includes('not authenticated') || error.message?.toLowerCase().includes('session')) {
        passwordError.value = 'Сессия истекла. Запросите новый код.'
        setTimeout(() => resetForgotForm(), 2000)
      } else {
        passwordError.value = 'Ошибка обновления пароля.'
      }
      return
    }
    passwordUpdateSuccess.value = true
    await authStore.logout()
    setTimeout(() => resetForgotForm(), 2000)
  } catch (err: any) {
    passwordError.value = 'Произошла ошибка. Попробуйте позже.'
  } finally {
    isUpdatingPassword.value = false
  }
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
  if (resendTimer) { clearInterval(resendTimer); resendTimer = null }
}

onUnmounted(() => {
  if (resendTimer) { clearInterval(resendTimer); resendTimer = null }
})
</script>

<style scoped>
.form-container { width: 100%; }

.auth-form {
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

.required { color: var(--fire); }

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

.form-input::placeholder { color: var(--sage); opacity: 0.7; }

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

.toggle-password:hover { color: var(--cream); }

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

.error-icon { width: 20px; height: 20px; flex-shrink: 0; }

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

.submit-btn:active:not(:disabled) { transform: translateY(0); }

.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-100%);
}

.submit-btn:hover:not(:disabled) .btn-glow { animation: shimmer 0.8s ease; }

@keyframes shimmer { 100% { transform: translateX(100%); } }

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin { 100% { transform: rotate(360deg); } }

.forgot-link { text-align: center; }

.forgot-btn {
  background: none;
  border: none;
  color: var(--fire-glow);
  font-size: 0.9rem;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  padding: 0;
  position: relative;
  transition: all 0.3s ease;
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

.forgot-btn:hover::after { width: 100%; }

/* Reset Form */
.reset-form { animation: fadeIn 0.3s ease; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.reset-header { text-align: center; margin-bottom: 1.5rem; }

.reset-header h3 {
  font-family: 'Merriweather', serif;
  font-size: 1.5rem;
  color: var(--fire-glow);
  margin-bottom: 0.5rem;
}

.reset-desc { color: var(--sage); font-size: 0.9rem; line-height: 1.5; }

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
  margin-bottom: 0.5rem;
}

.success-icon { width: 24px; height: 24px; flex-shrink: 0; margin-top: 2px; }
.success-title { font-weight: 600; font-size: 1.1rem; margin-bottom: 0.25rem; }

/* Code Step */
.code-step { display: flex; flex-direction: column; gap: 1.5rem; }

.code-sent-info { text-align: center; color: var(--sage); font-size: 0.95rem; line-height: 1.6; }
.code-sent-info strong { color: var(--fire-glow); }

.code-inputs { display: flex; gap: 0.75rem; justify-content: center; }

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

.resend-section { text-align: center; min-height: 2rem; }
.resend-text { color: var(--sage); font-size: 0.9rem; }

.resend-btn-link {
  background: none;
  border: none;
  color: var(--fire-glow);
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  margin-left: 0.25rem;
  font-family: 'Inter', sans-serif;
  padding: 0;
  transition: color 0.3s ease;
}

.resend-btn-link:hover:not(:disabled) { color: var(--fire); }
.resend-btn-link:disabled { opacity: 0.5; cursor: not-allowed; }

.timer-text { color: var(--sage); font-size: 0.9rem; font-style: italic; }

/* Password Step */
.password-step { display: flex; flex-direction: column; gap: 1.5rem; }

@media (max-width: 480px) {
  .code-inputs { gap: 0.5rem; }
  .code-input { width: 2.5rem; height: 3rem; font-size: 1.25rem; }
}
</style>
