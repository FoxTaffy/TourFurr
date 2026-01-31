<template>
  <div class="voting-panel">
    <h2 class="panel-title">Голосование по заявкам (9/9)</h2>

    <!-- Статистика -->
    <div class="stats-bar">
      <div class="stat">
        <span class="stat-label">Всего заявок:</span>
        <span class="stat-value">{{ applications.length }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">Требуют голоса:</span>
        <span class="stat-value highlight">{{ pendingForMe }}</span>
      </div>
    </div>

    <!-- Загрузка -->
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Загрузка заявок...</p>
    </div>

    <!-- Список заявок -->
    <div v-else-if="applications.length > 0" class="applications-list">
      <div
        v-for="app in applications"
        :key="app.application_id"
        class="application-card"
        :class="{ voted: app.already_voted }"
      >
        <!-- Хедер карточки -->
        <div class="card-header">
          <div class="user-info">
            <h3>{{ app.user_nickname }}</h3>
            <span class="user-email">{{ app.user_email }}</span>
          </div>
          <div class="vote-progress">
            <span class="votes-count">{{ app.votes_for }}/9</span>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: (app.votes_for / 9 * 100) + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Мотивация -->
        <div class="motivation">
          <strong>Мотивация:</strong>
          <p>{{ app.motivation }}</p>
        </div>

        <!-- Опыт -->
        <div class="experience">
          <strong>Опыт:</strong>
          <span>{{ experienceLabels[app.experience_level] }}</span>
        </div>

        <!-- Дата подачи -->
        <div class="created-date">
          Подана: {{ formatDate(app.created_at) }}
        </div>

        <!-- Кнопки голосования -->
        <div v-if="!app.already_voted" class="vote-buttons">
          <button
            @click="vote(app.application_id, true)"
            class="vote-btn approve"
            :disabled="isVoting === app.application_id"
          >
            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            За
          </button>
          <button
            @click="vote(app.application_id, false)"
            class="vote-btn reject"
            :disabled="isVoting === app.application_id"
          >
            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Против
          </button>
        </div>

        <!-- Уже проголосовал -->
        <div v-else class="already-voted">
          ✅ Вы уже проголосовали
        </div>

        <!-- Статистика голосов -->
        <div class="vote-stats">
          <span class="vote-stat for">👍 {{ app.votes_for }}</span>
          <span class="vote-stat against">👎 {{ app.votes_against }}</span>
        </div>
      </div>
    </div>

    <!-- Пусто -->
    <div v-else class="empty">
      <p>Нет заявок для голосования</p>
    </div>

    <!-- Ошибка -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

interface Application {
  application_id: string
  user_id: string
  user_nickname: string
  user_email: string
  motivation: string
  experience_level: string
  created_at: string
  votes_for: number
  votes_against: number
  already_voted: boolean
}

const applications = ref<Application[]>([])
const isLoading = ref(true)
const isVoting = ref<string | null>(null)
const error = ref('')

const experienceLabels: Record<string, string> = {
  beginner: 'Новичок (< 1 года)',
  intermediate: 'Средний опыт (1-3 года)',
  experienced: 'Опытный (3-5 лет)',
  veteran: 'Ветеран (> 5 лет)'
}

const pendingForMe = computed(() =>
  applications.value.filter(app => !app.already_voted).length
)

async function loadApplications() {
  try {
    isLoading.value = true
    error.value = ''

    if (!authStore.user?.id) {
      error.value = 'Необходимо войти в систему'
      return
    }

    // Вызываем функцию Postgres
    const { data, error: fetchError } = await supabase
      .rpc('get_pending_applications_for_admin', {
        admin_user_id: authStore.user.id
      })

    if (fetchError) {
      console.error('Error loading applications:', fetchError)
      error.value = 'Не удалось загрузить заявки'
      return
    }

    applications.value = data || []
    console.log('Loaded applications:', applications.value.length)

  } catch (err) {
    console.error('Error in loadApplications:', err)
    error.value = 'Произошла ошибка при загрузке'
  } finally {
    isLoading.value = false
  }
}

async function vote(applicationId: string, voteValue: boolean) {
  try {
    isVoting.value = applicationId

    if (!authStore.user?.id) {
      error.value = 'Необходимо войти в систему'
      return
    }

    // Создаём голос
    const { error: voteError } = await supabase
      .from('admin_votes')
      .insert({
        application_id: applicationId,
        admin_id: authStore.user.id,
        vote: voteValue
      })

    if (voteError) {
      console.error('Error voting:', voteError)
      error.value = 'Ошибка при голосовании'
      return
    }

    console.log(`Voted ${voteValue ? 'FOR' : 'AGAINST'} application ${applicationId}`)

    // Перезагружаем список
    await loadApplications()

  } catch (err) {
    console.error('Error in vote:', err)
    error.value = 'Произошла ошибка при голосовании'
  } finally {
    isVoting.value = null
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadApplications()
})
</script>

<style scoped>
.voting-panel {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.panel-title {
  font-family: 'Merriweather', serif;
  font-size: 2rem;
  color: var(--fire-glow);
  margin-bottom: 2rem;
  text-align: center;
}

.stats-bar {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(97, 137, 108, 0.1);
  border-radius: 12px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stat-label {
  color: var(--sage);
  font-size: 0.9rem;
}

.stat-value {
  color: var(--fire-glow);
  font-size: 2rem;
  font-weight: 700;
}

.stat-value.highlight {
  color: #fbbf24;
}

.loading, .empty {
  text-align: center;
  padding: 3rem;
  color: var(--sage);
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid rgba(97, 137, 108, 0.2);
  border-top-color: var(--fire-glow);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.application-card {
  background: rgba(26, 17, 14, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(97, 137, 108, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.application-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.application-card.voted {
  opacity: 0.7;
  border-color: rgba(97, 137, 108, 0.5);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(97, 137, 108, 0.2);
}

.user-info h3 {
  font-size: 1.25rem;
  color: var(--fire-glow);
  margin-bottom: 0.25rem;
}

.user-email {
  color: var(--sage);
  font-size: 0.9rem;
}

.vote-progress {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.votes-count {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--fire-glow);
}

.progress-bar {
  width: 180px;
  height: 8px;
  background: rgba(97, 137, 108, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #86efac);
  transition: width 0.3s ease;
}

.motivation {
  margin-bottom: 1rem;
}

.motivation strong,
.experience strong {
  color: var(--fire-glow);
  display: block;
  margin-bottom: 0.5rem;
}

.motivation p {
  color: var(--cream);
  line-height: 1.6;
}

.experience {
  margin-bottom: 1rem;
}

.experience span {
  color: var(--cream);
}

.created-date {
  color: var(--sage);
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.vote-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.vote-btn {
  flex: 1;
  padding: 1rem;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.vote-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.vote-btn .btn-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.vote-btn.approve {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.vote-btn.approve:hover:not(:disabled) {
  background: rgba(34, 197, 94, 0.3);
  transform: translateY(-2px);
}

.vote-btn.reject {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.vote-btn.reject:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.3);
  transform: translateY(-2px);
}

.already-voted {
  padding: 1rem;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  color: #86efac;
  text-align: center;
  font-weight: 600;
  margin-bottom: 1rem;
}

.vote-stats {
  display: flex;
  gap: 2rem;
  justify-content: center;
  padding: 1rem;
  background: rgba(97, 137, 108, 0.05);
  border-radius: 8px;
}

.vote-stat {
  font-size: 1.1rem;
  font-weight: 600;
}

.vote-stat.for {
  color: #86efac;
}

.vote-stat.against {
  color: #f87171;
}

.error-message {
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #f87171;
  text-align: center;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .voting-panel {
    padding: 1rem;
  }

  .stats-bar {
    flex-direction: column;
    gap: 1rem;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .vote-progress {
    align-items: flex-start;
    width: 100%;
  }

  .progress-bar {
    width: 100%;
  }

  .vote-buttons {
    flex-direction: column;
  }
}
</style>
