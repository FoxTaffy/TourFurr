<template>
  <div class="confirm-page">
    <div class="bg-forest"></div>
    <div class="fog"></div>

    <div class="confirm-container">
      <!-- Loading State -->
      <div v-if="isLoading" class="confirm-card">
        <div class="spinner-large"></div>
        <h2>Подтверждаем ваш email...</h2>
        <p class="loading-text">Это займёт всего несколько секунд</p>
        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <!-- Success State -->
      <div v-else-if="isSuccess" class="confirm-card success">
        <div class="success-animation">
          <svg class="icon-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div class="success-particles">
            <span v-for="i in 12" :key="i" class="particle"></span>
          </div>
        </div>

        <h2>Email успешно подтверждён! 🎉</h2>
        <p class="success-message">
          Отлично! Ваш аккаунт активирован.<br>
          Теперь вы можете войти в систему и зарегистрироваться на конвент.
        </p>

        <div class="redirect-info">
          <svg class="clock-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p>Переход ко входу через {{ countdown }} сек...</p>
        </div>

        <router-link to="/auth" class="btn-primary">
          <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
          </svg>
          Войти сейчас
        </router-link>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="confirm-card error">
        <svg class="icon-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h2>Не удалось подтвердить email</h2>
        <p class="error-message">{{ getUserFriendlyError(error) }}</p>

        <div class="error-help">
          <h3>Что делать?</h3>
          <ul>
            <li>Проверьте, что вы перешли по правильной ссылке</li>
            <li>Ссылка могла устареть (действительна 24 часа)</li>
            <li>Попробуйте зарегистрироваться заново</li>
          </ul>
        </div>

        <div class="error-actions">
          <router-link to="/auth" class="btn-primary">
            Перейти ко входу
          </router-link>
          <router-link to="/auth?tab=register" class="btn-secondary">
            Зарегистрироваться заново
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../services/supabase'

const route = useRoute()
const router = useRouter()
const isLoading = ref(true)
const isSuccess = ref(false)
const error = ref<string | null>(null)
const countdown = ref(5)

// User-friendly error messages
function getUserFriendlyError(errorMessage: string): string {
  const errorMap: Record<string, string> = {
    'Invalid token': 'Неверная или устаревшая ссылка подтверждения',
    'Token expired': 'Ссылка подтверждения устарела. Попробуйте зарегистрироваться заново.',
    'User not found': 'Пользователь не найден. Возможно, аккаунт уже удалён.',
    'Email already confirmed': 'Этот email уже подтверждён! Вы можете войти в систему.',
    'Неверная ссылка подтверждения': 'Ссылка для подтверждения некорректна. Проверьте URL.'
  }

  for (const [key, value] of Object.entries(errorMap)) {
    if (errorMessage.includes(key)) {
      return value
    }
  }

  return 'Произошла ошибка при подтверждении email. Попробуйте зарегистрироваться заново.'
}

onMounted(async () => {
  try {
    // Получаем токены из URL
    const token_hash = route.query.token_hash as string
    const type = route.query.type as string

    if (!token_hash || type !== 'email') {
      throw new Error('Неверная ссылка подтверждения')
    }

    // Подтверждаем email через Supabase Auth
    const { data, error: authError } = await supabase.auth.verifyOtp({
      token_hash,
      type: 'email'
    })

    if (authError) throw authError
    if (!data.user) throw new Error('Пользователь не найден')

    // Обновляем запись в таблице users
    const { error: dbError } = await supabase
      .from('users')
      .update({
        email_verified: true,
        email_verified_at: new Date().toISOString()
      })
      .eq('id', data.user.id)

    if (dbError) throw dbError

    isSuccess.value = true

    // Auto-redirect countdown
    const interval = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(interval)
        router.push('/auth')
      }
    }, 1000)
  } catch (err: any) {
    console.error('Email confirmation error:', err)
    error.value = err.message || 'Произошла ошибка при подтверждении email'
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.confirm-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.bg-forest {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #1a1410 0%, #2a1f1a 50%, #1a1410 100%);
  z-index: 0;
}

.bg-forest::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255, 107, 53, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(255, 179, 71, 0.08) 0%, transparent 50%);
}

.fog {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 0%, rgba(26, 20, 16, 0.3) 100%);
  pointer-events: none;
  z-index: 1;
}

.confirm-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 500px;
}

.confirm-card {
  background: linear-gradient(135deg, rgba(42, 31, 26, 0.95), rgba(61, 45, 36, 0.95));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(139, 111, 71, 0.5);
  border-radius: 24px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.spinner-large {
  width: 60px;
  height: 60px;
  margin: 0 auto 2rem;
  border: 4px solid rgba(255, 179, 71, 0.2);
  border-top-color: var(--fire-glow);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

.icon-success,
.icon-error {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
}

.icon-success {
  color: #22c55e;
  filter: drop-shadow(0 0 20px rgba(34, 197, 94, 0.5));
}

.icon-error {
  color: #ef4444;
  filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.5));
}

h2 {
  font-family: 'Merriweather', serif;
  font-size: 2rem;
  color: var(--cream);
  margin-bottom: 1rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

p {
  color: var(--sage);
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.btn-primary,
.btn-secondary {
  display: inline-block;
  padding: 1rem 2rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, var(--fire), var(--fire-glow));
  color: white;
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
}

.btn-secondary {
  background: rgba(61, 45, 36, 0.8);
  border: 1px solid rgba(139, 111, 71, 0.4);
  color: var(--cream);
}

.btn-secondary:hover {
  background: rgba(61, 45, 36, 1);
  border-color: rgba(139, 111, 71, 0.6);
}

/* Loading dots animation */
.loading-text {
  margin-bottom: 1rem;
  font-size: 1rem;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background: var(--fire-glow);
  border-radius: 50%;
  animation: dot-bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes dot-bounce {
  0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

/* Success animation */
.success-animation {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem;
}

.success-animation .icon-success {
  position: relative;
  z-index: 2;
  margin: 20px auto;
  animation: success-pop 0.5s ease-out;
}

.success-particles {
  position: absolute;
  inset: 0;
}

.success-particles .particle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 6px;
  background: var(--fire-glow);
  border-radius: 50%;
  animation: particle-burst 1s ease-out forwards;
}

.success-particles .particle:nth-child(1) { --angle: 0deg; animation-delay: 0.1s; }
.success-particles .particle:nth-child(2) { --angle: 30deg; animation-delay: 0.15s; }
.success-particles .particle:nth-child(3) { --angle: 60deg; animation-delay: 0.2s; }
.success-particles .particle:nth-child(4) { --angle: 90deg; animation-delay: 0.1s; }
.success-particles .particle:nth-child(5) { --angle: 120deg; animation-delay: 0.15s; }
.success-particles .particle:nth-child(6) { --angle: 150deg; animation-delay: 0.2s; }
.success-particles .particle:nth-child(7) { --angle: 180deg; animation-delay: 0.1s; }
.success-particles .particle:nth-child(8) { --angle: 210deg; animation-delay: 0.15s; }
.success-particles .particle:nth-child(9) { --angle: 240deg; animation-delay: 0.2s; }
.success-particles .particle:nth-child(10) { --angle: 270deg; animation-delay: 0.1s; }
.success-particles .particle:nth-child(11) { --angle: 300deg; animation-delay: 0.15s; }
.success-particles .particle:nth-child(12) { --angle: 330deg; animation-delay: 0.2s; }

@keyframes success-pop {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes particle-burst {
  0% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-60px) scale(0);
    opacity: 0;
  }
}

/* Success message */
.success-message {
  color: var(--sage);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

/* Redirect info */
.redirect-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 179, 71, 0.1);
  border: 1px solid rgba(255, 179, 71, 0.3);
  border-radius: 12px;
  color: var(--fire-glow);
}

.redirect-info p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--fire-glow);
}

.clock-icon {
  width: 20px;
  height: 20px;
  color: var(--fire-glow);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Button with icon */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-icon {
  width: 20px;
  height: 20px;
}

/* Error help */
.error-message {
  color: #fca5a5;
  font-size: 1.05rem;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.error-help {
  text-align: left;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.error-help h3 {
  font-family: 'Lora', serif;
  font-size: 1.1rem;
  color: var(--cream);
  margin-bottom: 1rem;
}

.error-help ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.error-help li {
  color: var(--sage);
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
  font-size: 0.95rem;
}

.error-help li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: var(--fire-glow);
}

/* Error actions */
.error-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.error-actions .btn-primary,
.error-actions .btn-secondary {
  flex: 1;
  min-width: 180px;
  text-align: center;
}

@media (max-width: 640px) {
  .confirm-card {
    padding: 2rem 1.5rem;
  }

  h2 {
    font-size: 1.5rem;
  }

  p {
    font-size: 1rem;
  }

  .icon-success,
  .icon-error {
    width: 60px;
    height: 60px;
  }

  .success-animation {
    width: 100px;
    height: 100px;
  }

  .error-actions {
    flex-direction: column;
  }

  .error-actions .btn-primary,
  .error-actions .btn-secondary {
    min-width: 100%;
  }
}
</style>
