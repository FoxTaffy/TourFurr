<template>
  <div class="dashboard-page">
    <!-- Animated Background -->
    <div class="bg-forest"></div>
    <div class="fog"></div>

    <!-- Header -->
    <Header :isDashboard="true" />

    <!-- Main Content -->
    <main class="dashboard-main">
      <div class="dashboard-grid">

        <!-- Left Column - Profile Card -->
        <div class="profile-card">
          <!-- Avatar Warning -->
          <div class="avatar-badge-warning">
            <svg class="warning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <span>Аватар будет напечатан на вашем физическом бейджике!</span>
          </div>

          <div class="avatar-section">
            <div class="avatar" @click="isEditing && triggerAvatarUpload()">
              <img v-if="avatarPreview || user?.avatar" :src="avatarPreview || user?.avatar" alt="Avatar" />
              <span v-else class="avatar-letter">{{ user?.nickname?.[0]?.toUpperCase() }}</span>
              <div v-if="isEditing" class="avatar-overlay">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
            </div>
            <input
              ref="avatarInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleAvatarChange"
            />
            <p v-if="isEditing" class="avatar-hint">Нажмите для изменения</p>
          </div>

          <template v-if="!isEditing">
            <h2 class="profile-name">{{ user?.nickname }}</h2>

            <div class="status-badge" :class="user?.status">
              {{ statusLabels[user?.status || 'pending'] }}
            </div>

            <div class="contact-info">
              <div class="contact-item">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span>{{ user?.email }}</span>
              </div>
              <div class="contact-item">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <span>{{ user?.phone }}</span>
              </div>
              <div class="contact-item telegram">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.154.232.17.327.015.095.034.312.019.482z"/>
                </svg>
                <a :href="'https://' + user?.telegram" target="_blank">{{ user?.telegram }}</a>
              </div>
            </div>

            <button class="edit-btn" @click="startEditing">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Редактировать
            </button>
          </template>

          <template v-else>
            <div class="edit-form">
              <div class="form-group">
                <label>Никнейм</label>
                <input v-model="editForm.nickname" type="text" />
              </div>
              <div class="form-group">
                <label>Телефон</label>
                <input v-model="editForm.phone" type="tel" />
              </div>
              <div class="form-group">
                <label>Telegram</label>
                <input v-model="editForm.telegram" type="text" />
              </div>
              <div class="form-group">
                <label>О себе</label>
                <textarea v-model="editForm.description" rows="3"></textarea>
              </div>

              <div class="edit-actions">
                <button class="save-btn" @click="saveProfile" :disabled="isSaving">
                  {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
                </button>
                <button class="cancel-btn" @click="cancelEditing">Отмена</button>
              </div>

              <button class="delete-btn" @click="confirmDelete">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Удалить аккаунт
              </button>
            </div>
          </template>
        </div>

        <!-- Middle Column - Event Details -->
        <div class="details-card">
          <div class="card-header">
            <h3>Лесной Кемп 2026</h3>
          </div>

          <div class="details-list">
            <div class="detail-row">
              <span class="detail-label">Статус заявки</span>
              <span class="detail-value" :class="user?.status">{{ statusLabels[user?.status || 'pending'] }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Дата регистрации</span>
              <span class="detail-value">{{ formatDate(user?.createdAt) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email подписка</span>
              <span class="detail-value">{{ user?.emailSubscribed ? 'Да' : 'Нет' }}</span>
            </div>
          </div>

          <div v-if="user?.description" class="description-block">
            <span class="detail-label">О себе</span>
            <p>{{ user.description }}</p>
          </div>

          <p class="status-message">{{ statusDescriptions[user?.status || 'pending'] }}</p>
        </div>

        <!-- Right Column - Payment Info (only for approved) -->
        <div v-if="user?.status === 'approved' && approvedInfo" class="payment-card">
          <div class="card-header">
            <h3>Оплата участия</h3>
          </div>

          <!-- Visual Card -->
          <div class="visual-card">
            <div class="card-chip"></div>
            <div class="card-number">{{ approvedInfo.card_number }}</div>
            <div class="card-details">
              <span class="card-holder">{{ approvedInfo.recipient }}</span>
              <span class="card-bank">{{ approvedInfo.bank }}</span>
            </div>
          </div>

          <div class="payment-list">
            <div class="detail-row">
              <span class="detail-label">Сумма</span>
              <span class="detail-value price">{{ approvedInfo.price }} ₽</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Банк</span>
              <span class="detail-value">{{ approvedInfo.bank }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Номер карты</span>
              <span class="detail-value mono">{{ approvedInfo.card_number }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Получатель</span>
              <span class="detail-value">{{ approvedInfo.recipient }}</span>
            </div>
          </div>

          <p class="payment-note">{{ approvedInfo.payment_note }}</p>
        </div>

        <!-- Location Card (only for approved) -->
        <div v-if="user?.status === 'approved' && approvedInfo" class="location-card">
          <div class="card-header">
            <h3>Локация</h3>
          </div>

          <div class="details-list">
            <div class="detail-row">
              <span class="detail-label">Место</span>
              <span class="detail-value">{{ approvedInfo.location }}</span>
            </div>
          </div>

          <p class="location-note">{{ approvedInfo.location_note }}</p>

          <div v-if="approvedInfo.coordinates" class="map-container">
            <iframe
              :src="`https://yandex.ru/map-widget/v1/?pt=${approvedInfo.coordinates}&z=12&l=map`"
              width="100%"
              height="200"
              frameborder="0"
            ></iframe>
          </div>
        </div>

        <!-- Error Card -->
        <div v-if="user?.status === 'approved' && infoError" class="error-card">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <p>{{ infoError }}</p>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../services/supabase'
import Header from '../components/Header.vue'

const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user)

interface ApprovedInfo {
  location: string
  location_note: string
  coordinates: string | null
  price: number
  bank: string
  card_number: string
  recipient: string
  payment_note: string
}

const approvedInfo = ref<ApprovedInfo | null>(null)
const infoError = ref<string | null>(null)

// Edit mode
const isEditing = ref(false)
const isSaving = ref(false)
const avatarInput = ref<HTMLInputElement | null>(null)
const avatarPreview = ref<string | null>(null)
const newAvatarFile = ref<File | null>(null)

const editForm = ref({
  nickname: '',
  phone: '',
  telegram: '',
  description: ''
})

function startEditing() {
  if (user.value) {
    editForm.value = {
      nickname: user.value.nickname,
      phone: user.value.phone,
      telegram: user.value.telegram,
      description: user.value.description || ''
    }
    avatarPreview.value = null
    newAvatarFile.value = null
    isEditing.value = true
  }
}

function cancelEditing() {
  isEditing.value = false
  avatarPreview.value = null
  newAvatarFile.value = null
}

function triggerAvatarUpload() {
  avatarInput.value?.click()
}

function handleAvatarChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    newAvatarFile.value = file
    avatarPreview.value = URL.createObjectURL(file)
  }
}

async function saveProfile() {
  isSaving.value = true

  const updates: any = {
    nickname: editForm.value.nickname,
    phone: editForm.value.phone,
    telegram: editForm.value.telegram,
    description: editForm.value.description
  }

  if (newAvatarFile.value) {
    updates.avatar = newAvatarFile.value
  }

  const result = await authStore.updateProfile(updates)

  if (result.success) {
    isEditing.value = false
    avatarPreview.value = null
    newAvatarFile.value = null
  } else {
    alert(result.error)
  }

  isSaving.value = false
}

async function confirmDelete() {
  if (confirm('Вы уверены, что хотите удалить аккаунт? Это действие необратимо!')) {
    if (confirm('Точно удалить? Все данные будут потеряны.')) {
      const result = await authStore.deleteAccount()
      if (result.success) {
        router.push('/auth')
      } else {
        alert(result.error)
      }
    }
  }
}

async function fetchApprovedInfo() {
  if (user.value?.status !== 'approved') {
    approvedInfo.value = null
    infoError.value = null
    return
  }

  try {
    const { data, error } = await supabase
      .from('event_info')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (error) {
      infoError.value = `Ошибка: ${error.message}`
      return
    }

    if (data) {
      approvedInfo.value = data
      infoError.value = null
    } else {
      infoError.value = 'Данные не найдены'
    }
  } catch (err: any) {
    infoError.value = err.message || 'Ошибка'
  }
}

watch(() => user.value?.status, (newStatus) => {
  if (newStatus === 'approved') {
    fetchApprovedInfo()
  } else {
    approvedInfo.value = null
  }
}, { immediate: true })

const statusLabels: Record<string, string> = {
  pending: 'На рассмотрении',
  approved: 'Одобрено',
  rejected: 'Отклонено'
}

const statusDescriptions: Record<string, string> = {
  pending: 'Ваша заявка находится на рассмотрении. Обычно это занимает 1-2 рабочих дня.',
  approved: 'Поздравляем! Ваша заявка одобрена. Оплатите участие по реквизитам справа.',
  rejected: 'К сожалению, ваша заявка отклонена. Свяжитесь с нами в Telegram.'
}

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return 'Неизвестно'
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

onMounted(async () => {
  await authStore.fetchUser()
  await fetchApprovedInfo()
})

function handleLogout() {
  authStore.logout()
  router.push('/auth')
}
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  position: relative;
}

/* Main Content */
.dashboard-main {
  position: relative;
  z-index: 10;
  padding: 2rem;
  padding-top: 6rem;
}

.dashboard-grid {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 280px 1fr 1fr;
  gap: 1.5rem;
}

/* Card Base Styles */
.profile-card,
.details-card,
.payment-card,
.location-card,
.error-card {
  background: rgba(42, 31, 26, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(139, 111, 71, 0.4);
  border-radius: 20px;
  padding: 2rem;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Profile Card */
.profile-card {
  text-align: center;
  grid-row: span 2;
}

/* Avatar Badge Warning */
.avatar-badge-warning {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, rgba(255, 179, 71, 0.15), rgba(255, 107, 53, 0.15));
  border: 1.5px solid var(--fire-glow);
  border-radius: 12px;
  color: var(--fire-glow);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.5;
  text-align: center;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.avatar-badge-warning .warning-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.avatar-section {
  margin-bottom: 1.5rem;
}

.avatar {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  border-radius: 16px;
  overflow: hidden;
  background: var(--forest-mid);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid var(--fire);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-letter {
  font-family: 'Playfair Display', serif;
  font-size: 3rem;
  color: var(--fire-glow);
}

.profile-name {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  color: var(--cream);
  margin-bottom: 1rem;
}

.status-badge {
  display: inline-block;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.status-badge.pending {
  background: rgba(255, 179, 71, 0.2);
  color: var(--fire-glow);
}

.status-badge.approved {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.status-badge.rejected {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.contact-info {
  text-align: left;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(139, 111, 71, 0.2);
  color: var(--cream);
  font-size: 0.9rem;
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-item svg {
  width: 18px;
  height: 18px;
  color: var(--fire);
  flex-shrink: 0;
}

.contact-item.telegram svg {
  color: #0088cc;
}

.contact-item a {
  color: var(--fire-glow);
  text-decoration: none;
}

.contact-item a:hover {
  text-decoration: underline;
}

/* Card Header */
.card-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(139, 111, 71, 0.3);
}

.card-header h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem;
  color: var(--fire-glow);
  margin: 0;
}

/* Details List */
.details-list {
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(139, 111, 71, 0.2);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: var(--sage);
  font-size: 0.9rem;
}

.detail-value {
  color: var(--cream);
  font-size: 0.95rem;
  font-weight: 500;
  text-align: right;
}

.detail-value.pending { color: var(--fire-glow); }
.detail-value.approved { color: #22c55e; }
.detail-value.rejected { color: #ef4444; }
.detail-value.price {
  color: var(--fire-glow);
  font-size: 1.1rem;
  font-weight: 700;
}
.detail-value.mono {
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

.description-block {
  background: rgba(26, 17, 14, 0.5);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.description-block p {
  color: var(--cream);
  font-size: 0.95rem;
  line-height: 1.5;
  margin-top: 0.5rem;
}

.status-message {
  color: var(--sage);
  font-size: 0.9rem;
  line-height: 1.5;
  font-style: italic;
}

/* Visual Card */
.visual-card {
  background: linear-gradient(135deg, var(--fire) 0%, var(--fire-glow) 100%);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  color: white;
  position: relative;
  overflow: hidden;
}

.visual-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.card-chip {
  width: 40px;
  height: 30px;
  background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
  border-radius: 6px;
  margin-bottom: 1.5rem;
}

.card-number {
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  letter-spacing: 2px;
  margin-bottom: 1rem;
}

.card-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

.card-holder {
  text-transform: uppercase;
  letter-spacing: 1px;
}

.card-bank {
  opacity: 0.8;
}

.payment-list {
  margin-bottom: 1rem;
}

.payment-note {
  color: var(--sage);
  font-size: 0.85rem;
  font-style: italic;
  text-align: center;
}

/* Location Card */
.location-card {
  grid-column: span 2;
}

.location-note {
  color: var(--sage);
  font-size: 0.9rem;
  font-style: italic;
  margin-bottom: 1rem;
}

.map-container {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(139, 111, 71, 0.3);
}

/* Error Card */
.error-card {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.4);
  text-align: center;
  grid-column: span 2;
}

.error-card svg {
  width: 40px;
  height: 40px;
  color: #ef4444;
  margin-bottom: 1rem;
}

.error-card p {
  color: #ef4444;
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr 1fr;
  }

  .profile-card {
    grid-column: span 2;
    grid-row: auto;
  }

  .location-card {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .dashboard-main {
    padding: 1rem;
    padding-top: 5.5rem;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .profile-card,
  .location-card,
  .error-card {
    grid-column: auto;
  }

  .avatar-badge-warning {
    font-size: 0.7rem;
    padding: 0.6rem 0.75rem;
    gap: 0.4rem;
  }

  .avatar-badge-warning .warning-icon {
    width: 18px;
    height: 18px;
  }

  .avatar {
    width: 100px;
    height: 100px;
  }

  .profile-name {
    font-size: 1.25rem;
  }

  .card-header h3 {
    font-size: 1.1rem;
  }

  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .detail-value {
    text-align: left;
  }

  .visual-card {
    padding: 1.25rem;
  }

  .card-number {
    font-size: 1rem;
  }
}

/* Edit Mode Styles */
.avatar {
  position: relative;
  cursor: default;
}

.profile-card .avatar-section .avatar {
  cursor: pointer;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay svg {
  width: 32px;
  height: 32px;
  color: white;
}

.avatar-hint {
  font-size: 0.75rem;
  color: var(--sage);
  margin-top: 0.5rem;
}

.edit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  margin-top: 1.5rem;
  background: rgba(255, 107, 53, 0.15);
  border: 1px solid rgba(255, 107, 53, 0.4);
  border-radius: 12px;
  color: var(--fire-glow);
  font-family: 'Lora', serif;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background: rgba(255, 107, 53, 0.25);
}

.edit-btn svg {
  width: 18px;
  height: 18px;
}

.edit-form {
  text-align: left;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  color: var(--sage);
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  background: rgba(26, 17, 14, 0.6);
  border: 1px solid rgba(139, 111, 71, 0.4);
  border-radius: 10px;
  color: var(--cream);
  font-family: 'Lora', serif;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--fire);
}

.form-group textarea {
  resize: vertical;
  min-height: 60px;
}

.edit-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 1rem;
}

.save-btn,
.cancel-btn {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  font-family: 'Lora', serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn {
  background: var(--fire);
  border: none;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: var(--fire-glow);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  background: transparent;
  border: 1px solid rgba(139, 111, 71, 0.4);
  color: var(--cream);
}

.cancel-btn:hover {
  background: rgba(139, 111, 71, 0.2);
}

.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px;
  margin-top: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 10px;
  color: #ef4444;
  font-family: 'Lora', serif;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

.delete-btn svg {
  width: 16px;
  height: 16px;
}
</style>
