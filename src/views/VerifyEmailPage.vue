<template>
  <div class="verify-page">
    <div class="bg-forest"></div>
    <div class="fog"></div>

    <div class="verify-container">
      <!-- Grace Period Timer -->
      <div v-if="gracePeriodStatus && !gracePeriodStatus.isExpired" class="grace-period-timer">
        <div class="timer-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div class="timer-content">
          <p class="timer-label">Время до удаления аккаунта:</p>
          <p class="timer-value" :class="{ 'timer-warning': remainingSeconds && remainingSeconds < 300 }">
            {{ formattedTime }}
          </p>
          <p class="timer-hint">Подтвердите email до истечения времени</p>
        </div>
      </div>

      <!-- Expired Message -->
      <div v-else-if="gracePeriodStatus && gracePeriodStatus.isExpired && gracePeriodStatus.exists" class="expired-message">
        <div class="expired-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3>Время истекло</h3>
        <p>Ваш аккаунт был удален из-за отсутствия подтверждения email в течение 15 минут.</p>
        <p>Пожалуйста, зарегистрируйтесь заново.</p>
        <button @click="router.push('/auth')" class="back-to-auth-btn">
          Перейти к регистрации
        </button>
      </div>

      <!-- Account Not Found -->
      <div v-else-if="gracePeriodStatus && !gracePeriodStatus.exists" class="expired-message">
        <div class="expired-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
          </svg>
        </div>
        <h3>Аккаунт не найден</h3>
        <p>Аккаунт с таким email не существует или был удален.</p>
        <p>Пожалуйста, зарегистрируйтесь заново.</p>
        <button @click="router.push('/auth')" class="back-to-auth-btn">
          Перейти к регистрации
        </button>
      </div>

      <!-- Verification Input -->
      <VerificationCodeInput
        v-if="gracePeriodStatus && !gracePeriodStatus.isExpired && gracePeriodStatus.exists"
        :email="email"
        @verified="handleVerified"
        @resend="handleResend"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../services/supabase'
import VerificationCodeInput from '../components/auth/VerificationCodeInput.vue'
import { createVerificationCode, sendVerificationEmail, invalidateOldCodes } from '../utils/emailVerification'
import { checkGracePeriodStatus, formatRemainingTime, type GracePeriodStatus } from '../utils/gracePeriod'

const route = useRoute()
const router = useRouter()
const email = ref<string>('')
const gracePeriodStatus = ref<GracePeriodStatus | null>(null)
const remainingSeconds = ref<number | null>(null)
const checkInterval = ref<number | null>(null)

const formattedTime = computed(() => {
  if (!remainingSeconds.value) return '00:00'
  return formatRemainingTime(remainingSeconds.value)
})

async function checkGracePeriod() {
  if (!email.value) return

  const status = await checkGracePeriodStatus(email.value)
  gracePeriodStatus.value = status
  remainingSeconds.value = status.secondsRemaining

  // Если время истекло, остановить проверку
  if (status.isExpired) {
    stopGracePeriodCheck()
  }
}

function startGracePeriodCheck() {
  // Проверять каждую секунду
  checkInterval.value = window.setInterval(() => {
    checkGracePeriod()
  }, 1000)
}

function stopGracePeriodCheck() {
  if (checkInterval.value) {
    clearInterval(checkInterval.value)
    checkInterval.value = null
  }
}

onMounted(async () => {
  // Get email from query params
  const emailParam = route.query.email as string

  if (!emailParam) {
    // If no email in query, redirect to auth page
    router.push('/auth')
    return
  }

  email.value = emailParam

  // Начальная проверка grace period
  await checkGracePeriod()

  // Запустить периодическую проверку
  if (gracePeriodStatus.value && !gracePeriodStatus.value.isExpired) {
    startGracePeriodCheck()
  }
})

onUnmounted(() => {
  stopGracePeriodCheck()
})

async function handleVerified() {
  try {
    // Update user's email_verified status in database
    const { error } = await supabase
      .from('users')
      .update({
        email_verified: true,
        email_verified_at: new Date().toISOString()
      })
      .eq('email', email.value)

    if (error) {
      console.error('Error updating email verification status:', error)
      alert('Ошибка обновления статуса. Свяжитесь с поддержкой.')
      return
    }

    // Redirect to login with success message
    router.push('/auth?verified=true')
  } catch (err: any) {
    console.error('Error in handleVerified:', err)
    alert('Произошла ошибка. Попробуйте войти в систему.')
    router.push('/auth')
  }
}

async function handleResend() {
  try {
    // Invalidate old codes first
    await invalidateOldCodes(email.value)

    const result = await createVerificationCode(email.value)

    if (result.success && result.code) {
      await sendVerificationEmail(email.value, result.code)
    } else {
      alert(result.error || 'Не удалось отправить код')
    }
  } catch (err: any) {
    console.error('Error resending code:', err)
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

/* Grace Period Timer */
.grace-period-timer {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05));
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 16px;
  margin-bottom: 1.5rem;
  animation: timerPulse 2s ease-in-out infinite;
}

@keyframes timerPulse {
  0%, 100% {
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.2);
  }
  50% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
  }
}

.timer-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2));
  border-radius: 12px;
  color: #60a5fa;
}

.timer-icon svg {
  width: 28px;
  height: 28px;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

.timer-content {
  flex: 1;
}

.timer-label {
  font-size: 0.85rem;
  color: var(--sage);
  margin: 0 0 0.5rem 0;
}

.timer-value {
  font-family: 'Courier New', monospace;
  font-size: 2rem;
  font-weight: 700;
  color: #60a5fa;
  margin: 0 0 0.5rem 0;
  letter-spacing: 0.1em;
  transition: color 0.3s ease;
}

.timer-value.timer-warning {
  color: #f59e0b;
  animation: warningBlink 1s ease-in-out infinite;
}

@keyframes warningBlink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.timer-hint {
  font-size: 0.75rem;
  color: var(--sage);
  opacity: 0.8;
  margin: 0;
}

/* Expired Message */
.expired-message {
  padding: 2rem;
  text-align: center;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 16px;
}

.expired-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2));
  border-radius: 50%;
  color: #f87171;
}

.expired-icon svg {
  width: 36px;
  height: 36px;
}

.expired-message h3 {
  font-family: 'Merriweather', serif;
  font-size: 1.5rem;
  color: var(--cream);
  margin: 0 0 0.75rem 0;
}

.expired-message p {
  color: var(--sage);
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 0.5rem 0;
}

.expired-message p:last-of-type {
  margin-bottom: 1.5rem;
}

.back-to-auth-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--fire), var(--fire-glow));
  border: none;
  border-radius: 10px;
  color: white;
  font-family: 'Lora', serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-to-auth-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
}

@media (max-width: 640px) {
  .verify-container {
    padding: 0.5rem;
  }

  .grace-period-timer {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.75rem;
  }

  .timer-value {
    font-size: 1.75rem;
  }

  .expired-message {
    padding: 1.5rem;
  }
}
</style>
