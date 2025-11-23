<template>
  <div class="admin-page">
    <!-- Animated Background -->
    <div class="bg-forest"></div>
    <div class="fog"></div>

    <!-- Header -->
    <header class="admin-header">
      <div class="header-content">
        <router-link to="/" class="logo">
          <span class="logo-tour">Tour</span><span class="logo-furr">Furr</span>
        </router-link>
        <h2 class="header-title">Панель администратора</h2>
        <router-link to="/dashboard" class="back-btn">
          <svg class="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Назад
        </router-link>
      </div>
    </header>

    <!-- Main Content -->
    <main class="admin-content">
      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value">{{ users.length }}</span>
          <span class="stat-label">Всего заявок</span>
        </div>
        <div class="stat-card pending">
          <span class="stat-value">{{ pendingCount }}</span>
          <span class="stat-label">На рассмотрении</span>
        </div>
        <div class="stat-card approved">
          <span class="stat-value">{{ approvedCount }}</span>
          <span class="stat-label">Одобрено</span>
        </div>
        <div class="stat-card rejected">
          <span class="stat-value">{{ rejectedCount }}</span>
          <span class="stat-label">Отклонено</span>
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

      <!-- Users List -->
      <div class="users-list">
        <div v-if="isLoading" class="loading">
          <div class="spinner"></div>
          <p>Загрузка...</p>
        </div>

        <div v-else-if="filteredUsers.length === 0" class="empty">
          <p>Нет заявок для отображения</p>
        </div>

        <div v-else class="user-cards">
          <div v-for="user in filteredUsers" :key="user.id" class="glass-card user-card">
            <!-- User Header -->
            <div class="user-header">
              <div class="user-avatar">
                <img v-if="user.avatar_url" :src="user.avatar_url" alt="Avatar" />
                <span v-else class="avatar-letter">{{ user.nickname?.[0]?.toUpperCase() }}</span>
              </div>
              <div class="user-main-info">
                <h3 class="user-nickname">{{ user.nickname }}</h3>
                <p class="user-email">{{ user.email }}</p>
              </div>
              <div class="user-status" :class="user.status">
                {{ statusLabels[user.status] }}
              </div>
            </div>

            <!-- User Details -->
            <div class="user-details">
              <div class="detail-item">
                <svg class="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <span>{{ user.phone }}</span>
              </div>
              <div class="detail-item">
                <svg class="detail-icon telegram" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.154.232.17.327.015.095.034.312.019.482z"/>
                </svg>
                <a :href="'https://' + user.telegram" target="_blank" class="telegram-link">
                  {{ user.telegram }}
                </a>
              </div>
            </div>

            <!-- Description -->
            <div v-if="user.description" class="user-description">
              <p>{{ user.description }}</p>
            </div>

            <!-- Actions -->
            <div class="user-actions">
              <button
                v-if="user.status !== 'approved'"
                @click="updateStatus(user.id, 'approved')"
                class="action-btn approve"
                :disabled="isUpdating === user.id"
              >
                <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                Одобрить
              </button>
              <button
                v-if="user.status !== 'rejected'"
                @click="updateStatus(user.id, 'rejected')"
                class="action-btn reject"
                :disabled="isUpdating === user.id"
              >
                <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Отклонить
              </button>
              <button
                v-if="user.status !== 'pending'"
                @click="updateStatus(user.id, 'pending')"
                class="action-btn pending"
                :disabled="isUpdating === user.id"
              >
                <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                На рассмотрение
              </button>
            </div>

            <!-- Created Date -->
            <div class="user-date">
              Зарегистрирован: {{ formatDate(user.created_at) }}
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase, isSupabaseConfigured } from '../services/supabase'

interface User {
  id: string
  email: string
  nickname: string
  phone: string
  telegram: string
  avatar_url: string | null
  description: string | null
  status: string
  created_at: string
}

const users = ref<User[]>([])
const isLoading = ref(true)
const isUpdating = ref<string | null>(null)
const activeFilter = ref('all')

const filters = [
  { label: 'Все', value: 'all' },
  { label: 'На рассмотрении', value: 'pending' },
  { label: 'Одобрено', value: 'approved' },
  { label: 'Отклонено', value: 'rejected' }
]

const statusLabels: Record<string, string> = {
  pending: 'На рассмотрении',
  approved: 'Одобрено',
  rejected: 'Отклонено'
}

const filteredUsers = computed(() => {
  if (activeFilter.value === 'all') return users.value
  return users.value.filter(u => u.status === activeFilter.value)
})

const pendingCount = computed(() => users.value.filter(u => u.status === 'pending').length)
const approvedCount = computed(() => users.value.filter(u => u.status === 'approved').length)
const rejectedCount = computed(() => users.value.filter(u => u.status === 'rejected').length)

async function loadUsers() {
  isLoading.value = true

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      users.value = data
    }
  } else {
    // Mock data for testing
    const stored = localStorage.getItem('mockUsers')
    if (stored) {
      users.value = JSON.parse(stored)
    }
  }

  isLoading.value = false
}

async function updateStatus(userId: string, status: string) {
  isUpdating.value = userId

  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', userId)

    if (!error) {
      const user = users.value.find(u => u.id === userId)
      if (user) user.status = status
    }
  } else {
    // Mock update
    const user = users.value.find(u => u.id === userId)
    if (user) {
      user.status = status
      localStorage.setItem('mockUsers', JSON.stringify(users.value))
    }
  }

  isUpdating.value = null
}

function formatDate(dateStr: string) {
  if (!dateStr) return 'Неизвестно'
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.admin-page {
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Header */
.admin-header {
  position: relative;
  z-index: 100;
  background: rgba(26, 17, 14, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--moss);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  font-weight: 900;
  text-decoration: none;
}

.logo-tour { color: var(--cream); }
.logo-furr { color: var(--fire); }

.header-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem;
  color: var(--fire-glow);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 107, 53, 0.1);
  border: 1px solid rgba(255, 107, 53, 0.3);
  border-radius: 8px;
  color: var(--fire-glow);
  font-family: 'Lora', serif;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 107, 53, 0.2);
}

.back-icon {
  width: 16px;
  height: 16px;
}

/* Main Content */
.admin-content {
  position: relative;
  z-index: 10;
  max-width: 1400px;
  margin: 0 auto;
  padding: clamp(0.5rem, 1.5vw, 1.5rem);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: clamp(0.5rem, 1vw, 1rem);
  margin-bottom: clamp(0.5rem, 1vw, 1rem);
  flex-shrink: 0;
}

.stat-card {
  background: rgba(42, 31, 26, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid var(--moss);
  border-radius: 10px;
  padding: clamp(0.5rem, 1vw, 1rem);
  text-align: center;
}

.stat-card.pending {
  border-color: rgba(255, 179, 71, 0.5);
}

.stat-card.approved {
  border-color: rgba(34, 197, 94, 0.5);
}

.stat-card.rejected {
  border-color: rgba(239, 68, 68, 0.5);
}

.stat-value {
  display: block;
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.2rem, 2.5vw, 1.75rem);
  font-weight: 700;
  color: var(--cream);
}

.stat-card.pending .stat-value { color: var(--fire-glow); }
.stat-card.approved .stat-value { color: #22c55e; }
.stat-card.rejected .stat-value { color: #ef4444; }

.stat-label {
  font-size: clamp(0.65rem, 1vw, 0.8rem);
  color: var(--sage);
}

/* Filters */
.filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: clamp(0.5rem, 1vw, 1rem);
  flex-shrink: 0;
}

.filter-btn {
  padding: clamp(6px, 1vw, 10px) clamp(12px, 2vw, 20px);
  background: rgba(42, 31, 26, 0.6);
  border: 1px solid var(--moss);
  border-radius: 8px;
  color: var(--sage);
  font-family: 'Lora', serif;
  font-size: clamp(0.75rem, 1.2vw, 0.9rem);
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  border-color: var(--fire);
  color: var(--cream);
}

.filter-btn.active {
  background: linear-gradient(135deg, var(--fire), var(--fire-glow));
  border-color: var(--fire);
  color: white;
}

/* Users List */
.users-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.loading, .empty {
  text-align: center;
  padding: 2rem;
  color: var(--sage);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--moss);
  border-top-color: var(--fire);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

/* User Cards */
.user-cards {
  display: grid;
  gap: clamp(0.5rem, 1vw, 1rem);
}

.user-card {
  padding: clamp(0.75rem, 1.5vw, 1.25rem);
  background: linear-gradient(
    135deg,
    rgba(42, 31, 26, 0.4) 0%,
    rgba(61, 45, 36, 0.3) 100%
  );
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* User Header */
.user-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--moss);
}

.user-avatar {
  width: clamp(40px, 5vw, 50px);
  height: clamp(40px, 5vw, 50px);
  border-radius: 50%;
  overflow: hidden;
  background: var(--forest-mid);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-letter {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: var(--fire-glow);
}

.user-main-info {
  flex: 1;
}

.user-nickname {
  font-family: 'Playfair Display', serif;
  font-size: clamp(0.9rem, 1.5vw, 1.1rem);
  color: var(--cream);
  margin-bottom: 2px;
}

.user-email {
  font-size: clamp(0.7rem, 1vw, 0.8rem);
  color: var(--sage);
}

.user-status {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.user-status.pending {
  background: rgba(255, 179, 71, 0.2);
  color: var(--fire-glow);
}

.user-status.approved {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.user-status.rejected {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* User Details */
.user-details {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 0.75rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--cream);
  font-size: clamp(0.75rem, 1.2vw, 0.85rem);
}

.detail-icon {
  width: 16px;
  height: 16px;
  color: var(--fire);
}

.detail-icon.telegram {
  color: #0088cc;
}

.telegram-link {
  color: var(--fire-glow);
  text-decoration: none;
}

.telegram-link:hover {
  text-decoration: underline;
}

/* Description */
.user-description {
  background: rgba(26, 17, 14, 0.4);
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
}

.user-description p {
  font-size: clamp(0.75rem, 1.2vw, 0.85rem);
  color: var(--cream);
  line-height: 1.4;
}

/* Actions */
.user-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: clamp(6px, 1vw, 8px) clamp(10px, 1.5vw, 14px);
  border: none;
  border-radius: 6px;
  font-family: 'Lora', serif;
  font-size: clamp(0.7rem, 1vw, 0.8rem);
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.approve {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.action-btn.approve:hover:not(:disabled) {
  background: rgba(34, 197, 94, 0.3);
}

.action-btn.reject {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.action-btn.reject:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.3);
}

.action-btn.pending {
  background: rgba(255, 179, 71, 0.2);
  color: var(--fire-glow);
  border: 1px solid rgba(255, 179, 71, 0.3);
}

.action-btn.pending:hover:not(:disabled) {
  background: rgba(255, 179, 71, 0.3);
}

.action-icon {
  width: 14px;
  height: 14px;
}

/* Date */
.user-date {
  font-size: clamp(0.65rem, 1vw, 0.75rem);
  color: var(--sage);
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }

  .header-title {
    order: -1;
  }

  .admin-content {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters {
    flex-wrap: wrap;
  }

  .user-details {
    flex-direction: column;
    gap: 0.5rem;
  }

  .user-actions {
    flex-wrap: wrap;
  }
}
</style>
