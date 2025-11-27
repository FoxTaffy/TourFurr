<template>
  <div class="confirm-page">
    <div class="bg-forest"></div>
    <div class="fog"></div>

    <div class="confirm-container">
      <!-- Loading State -->
      <div v-if="isLoading" class="confirm-card">
        <div class="spinner-large"></div>
        <h2>Подтверждение email...</h2>
        <p>Пожалуйста, подождите</p>
      </div>

      <!-- Success State -->
      <div v-else-if="isSuccess" class="confirm-card success">
        <svg class="icon-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h2>Email успешно подтвержден! 🎉</h2>
        <p>Теперь вы можете войти в систему</p>
        <router-link to="/auth" class="btn-primary">Войти</router-link>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="confirm-card error">
        <svg class="icon-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h2>Ошибка подтверждения</h2>
        <p>{{ error }}</p>
        <router-link to="/auth" class="btn-secondary">Вернуться ко входу</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../services/supabase'

const route = useRoute()
const isLoading = ref(true)
const isSuccess = ref(false)
const error = ref<string | null>(null)

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
}
</style>
