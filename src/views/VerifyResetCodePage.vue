<template>
  <div class="verify-page">
    <div class="bg-forest"></div>
    <div class="fog"></div>

    <div class="verify-container">
      <!-- Fallback code display when email fails -->
      <div v-if="fallbackCode" class="fallback-code-banner">
        <div class="fallback-code-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
          </svg>
        </div>
        <div class="fallback-code-content">
          <h4>Ваш код сброса пароля</h4>
          <p class="fallback-code-hint">Письмо не удалось отправить. Введите этот код:</p>
          <div class="fallback-code-value">{{ fallbackCode }}</div>
        </div>
      </div>

      <!-- Email Rate Limit Warning (no fallback code available) -->
      <div v-else-if="emailNotSent && emailError" class="rate-limit-warning">
        <div class="warning-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <div class="warning-content">
          <h4>Письмо не отправлено</h4>
          <p>{{ emailError }}</p>
        </div>
      </div>

      <!-- Reset Code Input -->
      <ResetCodeInput
        :email="email"
        @verified="handleVerified"
        @resend="handleResend"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ResetCodeInput from '../components/auth/ResetCodeInput.vue'
import { createPasswordResetCode, sendPasswordResetEmail, invalidateOldResetCodes } from '../utils/passwordReset'
import { logger } from '../utils/logger'

const route = useRoute()
const router = useRouter()
const email = ref<string>('')
const emailNotSent = ref<boolean>(false)
const emailError = ref<string>('')
const fallbackCode = ref<string>('')

onMounted(async () => {
  // Get email from query params
  const emailParam = route.query.email as string

  if (!emailParam) {
    // If no email in query, redirect to reset password page
    router.push('/reset-password')
    return
  }

  email.value = emailParam

  // Check if email was sent successfully
  const emailSentParam = route.query.emailSent as string
  const emailErrorParam = route.query.emailError as string

  const codeParam = route.query.code as string

  if (emailSentParam === 'false') {
    emailNotSent.value = true
    emailError.value = emailErrorParam || 'Не удалось отправить письмо с кодом сброса пароля'
  }

  if (codeParam) {
    fallbackCode.value = codeParam
  }
})

async function handleVerified() {
  try {
    // Store email in sessionStorage for password update page
    sessionStorage.setItem('reset_email', email.value)

    // Redirect to update password page
    router.push('/auth/update-password')
  } catch (err: any) {
    logger.error('Error in handleVerified:', err)
    alert('Произошла ошибка. Попробуйте снова.')
  }
}

async function handleResend() {
  try {
    // Invalidate old codes first
    await invalidateOldResetCodes(email.value)

    const result = await createPasswordResetCode(email.value)

    if (result.success && result.code) {
      const emailResult = await sendPasswordResetEmail(email.value, result.code)
      if (!emailResult.success) {
        fallbackCode.value = result.code
      } else {
        fallbackCode.value = ''
      }
    } else {
      alert(result.error || 'Не удалось создать код')
    }
  } catch (err: any) {
    logger.error('Error resending code:', err)
    alert('Ошибка отправки кода')
  }
}
</script>

<style scoped>
.verify-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  background: #0a0806;
}

.bg-forest {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #1a1410 0%, #2a1f1a 50%, #1a1410 100%);
  z-index: 0;
  animation: bgShift 20s ease-in-out infinite;
}

@keyframes bgShift {
  0%, 100% {
    transform: scale(1) translateY(0);
  }
  50% {
    transform: scale(1.05) translateY(-10px);
  }
}

.bg-forest::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255, 107, 53, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(255, 179, 71, 0.12) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(255, 138, 62, 0.08) 0%, transparent 70%);
  animation: glowPulse 8s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.fog {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at center, transparent 0%, rgba(26, 20, 16, 0.4) 100%),
    radial-gradient(ellipse at 30% 40%, rgba(42, 31, 26, 0.3) 0%, transparent 50%);
  pointer-events: none;
  z-index: 1;
  animation: fogMove 15s ease-in-out infinite;
}

@keyframes fogMove {
  0%, 100% {
    transform: translateX(0) translateY(0);
  }
  50% {
    transform: translateX(20px) translateY(-20px);
  }
}

/* Add ambient particles */
.verify-page::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(2px 2px at 20% 30%, rgba(255, 179, 71, 0.2), transparent),
    radial-gradient(2px 2px at 60% 70%, rgba(255, 107, 53, 0.2), transparent),
    radial-gradient(2px 2px at 50% 50%, rgba(255, 138, 62, 0.2), transparent),
    radial-gradient(2px 2px at 80% 10%, rgba(255, 179, 71, 0.2), transparent),
    radial-gradient(2px 2px at 90% 60%, rgba(255, 107, 53, 0.2), transparent);
  background-size: 200% 200%;
  animation: sparkle 3s linear infinite;
  z-index: 2;
  pointer-events: none;
}

@keyframes sparkle {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 100% 100%;
  }
}

.verify-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 500px;
  background: linear-gradient(135deg, rgba(42, 31, 26, 0.75), rgba(61, 45, 36, 0.75));
  backdrop-filter: blur(30px);
  border: 1px solid rgba(139, 111, 71, 0.6);
  border-radius: 24px;
  padding: 1rem;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.7),
    0 0 40px rgba(255, 138, 62, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Fallback code display */
.fallback-code-banner {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1));
  border: 1px solid rgba(34, 197, 94, 0.4);
  border-radius: 16px;
  margin-bottom: 1.5rem;
}

.fallback-code-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(34, 197, 94, 0.2);
  border-radius: 10px;
}

.fallback-code-icon svg {
  width: 22px;
  height: 22px;
  color: #22c55e;
}

.fallback-code-content h4 {
  color: #22c55e;
  font-size: 1rem;
  margin: 0 0 0.25rem;
}

.fallback-code-hint {
  color: var(--sage);
  font-size: 0.85rem;
  margin: 0 0 0.75rem;
}

.fallback-code-value {
  font-family: 'Courier New', monospace;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 8px;
  color: #22c55e;
  text-align: center;
  padding: 0.75rem;
  background: rgba(26, 17, 14, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

/* Rate Limit Warning */
.rate-limit-warning {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(251, 191, 36, 0.1));
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: 16px;
  margin-bottom: 1.5rem;
  animation: warningPulse 3s ease-in-out infinite;
}

@keyframes warningPulse {
  0%, 100% {
    box-shadow: 0 0 10px rgba(245, 158, 11, 0.2);
  }
  50% {
    box-shadow: 0 0 20px rgba(245, 158, 11, 0.4);
  }
}

.warning-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.2));
  border-radius: 12px;
  color: #fbbf24;
}

.warning-icon svg {
  width: 28px;
  height: 28px;
}

.warning-content {
  flex: 1;
}

.warning-content h4 {
  font-family: 'Merriweather', serif;
  font-size: 1rem;
  color: #fbbf24;
  margin: 0 0 0.5rem 0;
}

.warning-content p {
  font-size: 0.875rem;
  color: var(--sage);
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
}

.warning-content p:last-child {
  margin-bottom: 0;
}

.dev-mode-hint {
  padding: 0.5rem 0.75rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  margin-top: 0.75rem !important;
  font-size: 0.8rem !important;
}

.dev-mode-hint strong {
  color: #60a5fa;
}

@media (max-width: 640px) {
  .verify-container {
    padding: 0.5rem;
  }
}
</style>
