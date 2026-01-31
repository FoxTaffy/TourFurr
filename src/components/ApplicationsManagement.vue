<template>
  <div class="applications-management">
    <h2 class="section-title">Управление заявками на участие</h2>

    <!-- Event Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-value">{{ applications.length }}</span>
        <span class="stat-label">Всего заявок</span>
      </div>
      <div class="stat-card pending">
        <span class="stat-value">{{ pendingApplicationsCount }}</span>
        <span class="stat-label">На рассмотрении</span>
      </div>
      <div class="stat-card approved">
        <span class="stat-value">{{ approvedApplicationsCount }}</span>
        <span class="stat-label">Одобрено</span>
      </div>
      <div class="stat-card available">
        <span class="stat-value">{{ availableSpots }}</span>
        <span class="stat-label">Свободных мест</span>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters">
      <button
        v-for="filter in filters"
        :key="filter.value"
        @click="activeFilter = filter.value"
        class="filter-btn"
        :class="{ active: activeFilter === filter.value }"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Загрузка заявок...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-message">
      <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <p>{{ error }}</p>
      <button @click="loadApplications" class="retry-btn">Попробовать снова</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredApplications.length === 0" class="empty">
      <p>Нет заявок для отображения</p>
    </div>

    <!-- Applications List -->
    <div v-else class="applications-list">
      <div v-for="app in filteredApplications" :key="app.id" class="glass-card application-card">
        <!-- Application Header -->
        <div class="application-header">
          <div class="user-info">
            <div class="user-avatar">
              <img v-if="app.user?.avatar_url" :src="app.user.avatar_url" alt="Avatar" />
              <span v-else class="avatar-letter">{{ app.user?.nickname?.[0]?.toUpperCase() }}</span>
            </div>
            <div>
              <h3 class="user-nickname">{{ app.user?.nickname }}</h3>
              <p class="user-email">{{ app.user?.email }}</p>
            </div>
          </div>
          <div class="application-status" :class="app.status">
            {{ statusLabels[app.status] }}
          </div>
        </div>

        <!-- Application Details -->
        <div class="application-details">
          <div class="detail-section">
            <h4 class="detail-title">Мотивация</h4>
            <p class="detail-text">{{ app.motivation }}</p>
          </div>

          <div class="detail-section">
            <h4 class="detail-title">Опыт в furry-сообществе</h4>
            <p class="detail-text">{{ experienceLabels[app.experience_level] }}</p>
          </div>

          <div v-if="app.skills" class="detail-section">
            <h4 class="detail-title">Навыки и таланты</h4>
            <p class="detail-text">{{ app.skills }}</p>
          </div>

          <div v-if="app.additional_info" class="detail-section">
            <h4 class="detail-title">Дополнительная информация</h4>
            <p class="detail-text">{{ app.additional_info }}</p>
          </div>

          <div class="detail-meta">
            <div class="meta-item">
              <span class="meta-label">Подана:</span>
              <span class="meta-value">{{ formatDate(app.created_at) }}</span>
            </div>
            <div v-if="app.reviewed_at" class="meta-item">
              <span class="meta-label">Рассмотрена:</span>
              <span class="meta-value">{{ formatDate(app.reviewed_at) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Статус оплаты:</span>
              <span class="meta-value payment" :class="app.payment_status">
                {{ paymentLabels[app.payment_status] }}
              </span>
            </div>
          </div>
        </div>

        <!-- Admin Actions -->
        <div class="application-actions">
          <div v-if="app.admin_notes" class="admin-notes">
            <strong>Примечания администратора:</strong> {{ app.admin_notes }}
          </div>

          <div v-if="app.status === 'pending'" class="action-buttons">
            <button
              @click="updateApplicationStatus(app.id, 'approved')"
              class="action-btn approve"
              :disabled="isUpdating === app.id"
            >
              <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Одобрить
            </button>
            <button
              @click="updateApplicationStatus(app.id, 'waitlist')"
              class="action-btn waitlist"
              :disabled="isUpdating === app.id"
            >
              <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              В лист ожидания
            </button>
            <button
              @click="updateApplicationStatus(app.id, 'rejected')"
              class="action-btn reject"
              :disabled="isUpdating === app.id"
            >
              <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Отклонить
            </button>
          </div>

          <!-- Payment Status Update -->
          <div class="payment-actions">
            <label for="payment-status-${app.id}" class="payment-label">Статус оплаты:</label>
            <select
              :id="'payment-status-' + app.id"
              v-model="app.payment_status"
              @change="updatePaymentStatus(app.id, app.payment_status)"
              class="payment-select"
              :disabled="isUpdating === app.id"
            >
              <option value="unpaid">Не оплачено</option>
              <option value="partial">Частичная оплата</option>
              <option value="paid">Оплачено</option>
              <option value="refunded">Возврат средств</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

interface Application {
  id: string
  user_id: string
  motivation: string
  experience_level: string
  skills: string | null
  additional_info: string | null
  status: 'pending' | 'approved' | 'rejected' | 'waitlist'
  admin_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  payment_status: 'unpaid' | 'partial' | 'paid' | 'refunded'
  payment_amount: number | null
  payment_date: string | null
  payment_deadline: string
  created_at: string
  updated_at: string
  user?: {
    id: string
    email: string
    nickname: string
    avatar_url: string | null
  }
}

const applications = ref<Application[]>([])
const isLoading = ref(true)
const error = ref('')
const activeFilter = ref('all')
const isUpdating = ref<string | null>(null)
const maxParticipants = ref(121)

const filters = [
  { label: 'Все', value: 'all' },
  { label: 'На рассмотрении', value: 'pending' },
  { label: 'Одобренные', value: 'approved' },
  { label: 'Лист ожидания', value: 'waitlist' },
  { label: 'Отклоненные', value: 'rejected' }
]

const statusLabels: Record<string, string> = {
  pending: 'На рассмотрении',
  approved: 'Одобрена',
  rejected: 'Отклонена',
  waitlist: 'Лист ожидания'
}

const experienceLabels: Record<string, string> = {
  beginner: 'Новичок (менее 1 года)',
  intermediate: 'Средний опыт (1-3 года)',
  experienced: 'Опытный (3-5 лет)',
  veteran: 'Ветеран (более 5 лет)'
}

const paymentLabels: Record<string, string> = {
  unpaid: 'Не оплачено',
  partial: 'Частичная оплата',
  paid: 'Оплачено',
  refunded: 'Возврат средств'
}

const filteredApplications = computed(() => {
  if (activeFilter.value === 'all') {
    return applications.value
  }
  return applications.value.filter(app => app.status === activeFilter.value)
})

const pendingApplicationsCount = computed(() =>
  applications.value.filter(app => app.status === 'pending').length
)

const approvedApplicationsCount = computed(() =>
  applications.value.filter(app => app.status === 'approved').length
)

const availableSpots = computed(() =>
  maxParticipants.value - approvedApplicationsCount.value
)

async function loadApplications() {
  try {
    isLoading.value = true
    error.value = ''

    // Load event config to get max participants
    const { data: config } = await supabase
      .from('event_config')
      .select('max_participants')
      .eq('is_active', true)
      .single()

    if (config) {
      maxParticipants.value = config.max_participants
    }

    // Load applications with user data
    const { data, error: fetchError } = await supabase
      .from('applications')
      .select(`
        *,
        user:users!applications_user_id_fkey (
          id,
          email,
          nickname,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('❌ Error loading applications:', fetchError)
      error.value = 'Не удалось загрузить заявки'
      return
    }

    applications.value = data || []
    console.log('✅ Loaded applications:', applications.value.length)

  } catch (err) {
    console.error('❌ Error in loadApplications:', err)
    error.value = 'Произошла ошибка при загрузке данных'
  } finally {
    isLoading.value = false
  }
}

async function updateApplicationStatus(applicationId: string, newStatus: string) {
  try {
    isUpdating.value = applicationId

    const { error: updateError } = await supabase
      .from('applications')
      .update({
        status: newStatus,
        reviewed_by: authStore.user?.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', applicationId)

    if (updateError) {
      console.error('❌ Error updating application:', updateError)
      alert('Ошибка при обновлении статуса')
      return
    }

    // Reload applications
    await loadApplications()
    console.log('✅ Application status updated')

  } catch (err) {
    console.error('❌ Error in updateApplicationStatus:', err)
    alert('Произошла ошибка при обновлении статуса')
  } finally {
    isUpdating.value = null
  }
}

async function updatePaymentStatus(applicationId: string, paymentStatus: string) {
  try {
    isUpdating.value = applicationId

    const { error: updateError } = await supabase
      .from('applications')
      .update({
        payment_status: paymentStatus,
        payment_date: paymentStatus === 'paid' ? new Date().toISOString() : null
      })
      .eq('id', applicationId)

    if (updateError) {
      console.error('❌ Error updating payment status:', updateError)
      alert('Ошибка при обновлении статуса оплаты')
      return
    }

    console.log('✅ Payment status updated')

  } catch (err) {
    console.error('❌ Error in updatePaymentStatus:', err)
    alert('Произошла ошибка при обновлении статуса оплаты')
  } finally {
    isUpdating.value = null
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
.applications-management {
  width: 100%;
}

.section-title {
  font-family: 'Merriweather', serif;
  font-size: 1.75rem;
  color: var(--fire-glow);
  margin-bottom: 2rem;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(97, 137, 108, 0.1);
  border: 1px solid rgba(97, 137, 108, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.stat-card.pending {
  border-color: rgba(59, 130, 246, 0.3);
  background: rgba(59, 130, 246, 0.1);
}

.stat-card.approved {
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.1);
}

.stat-card.rejected {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.1);
}

.stat-card.available {
  border-color: rgba(168, 85, 247, 0.3);
  background: rgba(168, 85, 247, 0.1);
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--fire-glow);
  margin-bottom: 0.5rem;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  color: var(--sage);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2rem;
  justify-content: center;
}

.filter-btn {
  padding: 0.5rem 1rem;
  background: rgba(26, 17, 14, 0.6);
  border: 1px solid rgba(97, 137, 108, 0.3);
  border-radius: 8px;
  color: var(--sage);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.filter-btn:hover {
  background: rgba(97, 137, 108, 0.2);
  border-color: rgba(97, 137, 108, 0.5);
}

.filter-btn.active {
  background: var(--forest-green);
  border-color: var(--fire-glow);
  color: var(--cream);
}

.loading, .empty, .error-message {
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

.error-icon {
  width: 3rem;
  height: 3rem;
  color: #f87171;
  margin: 0 auto 1rem;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: var(--forest-green);
  border: 1px solid var(--fire-glow);
  border-radius: 8px;
  color: var(--cream);
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: var(--fire-glow);
  transform: translateY(-2px);
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.glass-card {
  background: rgba(26, 17, 14, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(97, 137, 108, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.application-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(97, 137, 108, 0.2);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  overflow: hidden;
  background: var(--forest-green);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-letter {
  font-size: 1.25rem;
  color: var(--cream);
  font-weight: 600;
}

.user-nickname {
  font-size: 1.1rem;
  color: var(--fire-glow);
  margin-bottom: 0.25rem;
}

.user-email {
  font-size: 0.85rem;
  color: var(--sage);
}

.application-status {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
  min-width: 120px;
}

.application-status.pending {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.application-status.approved {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.application-status.rejected {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.application-status.waitlist {
  background: rgba(168, 85, 247, 0.2);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.application-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-section {
  padding: 1rem;
  background: rgba(97, 137, 108, 0.05);
  border-radius: 8px;
}

.detail-title {
  font-size: 0.85rem;
  color: var(--fire-glow);
  margin-bottom: 0.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-text {
  color: var(--cream);
  line-height: 1.6;
  font-size: 0.95rem;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 1rem;
  background: rgba(97, 137, 108, 0.05);
  border-radius: 8px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.meta-label {
  font-size: 0.75rem;
  color: var(--sage);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-value {
  font-size: 0.9rem;
  color: var(--cream);
  font-weight: 500;
}

.meta-value.payment {
  font-weight: 600;
}

.meta-value.payment.unpaid {
  color: #f87171;
}

.meta-value.payment.partial {
  color: #fbbf24;
}

.meta-value.payment.paid {
  color: #86efac;
}

.meta-value.payment.refunded {
  color: #c084fc;
}

.application-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(97, 137, 108, 0.2);
}

.admin-notes {
  padding: 0.75rem;
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 8px;
  color: var(--cream);
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.action-btn {
  flex: 1;
  min-width: 140px;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn .btn-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.action-btn.approve {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.action-btn.approve:hover:not(:disabled) {
  background: rgba(34, 197, 94, 0.3);
  transform: translateY(-2px);
}

.action-btn.waitlist {
  background: rgba(168, 85, 247, 0.2);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.action-btn.waitlist:hover:not(:disabled) {
  background: rgba(168, 85, 247, 0.3);
  transform: translateY(-2px);
}

.action-btn.reject {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.action-btn.reject:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.3);
  transform: translateY(-2px);
}

.payment-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.payment-label {
  color: var(--sage);
  font-size: 0.9rem;
}

.payment-select {
  flex: 1;
  padding: 0.5rem 1rem;
  background: rgba(26, 17, 14, 0.8);
  border: 1px solid rgba(97, 137, 108, 0.3);
  border-radius: 8px;
  color: var(--cream);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.payment-select:hover {
  border-color: rgba(97, 137, 108, 0.5);
}

.payment-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .application-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }

  .payment-actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .payment-select {
    width: 100%;
  }
}
</style>
