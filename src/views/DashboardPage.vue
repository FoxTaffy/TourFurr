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
            <h2 class="profile-name"><TeamBadge :teamId="user?.teamId" />{{ user?.nickname }}</h2>

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
                <a :href="'https://' + user?.telegram" target="_blank" rel="noopener noreferrer">{{ user?.telegram }}</a>
              </div>
            </div>

            <button class="edit-btn" @click="startEditing">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Редактировать
            </button>

            <!-- Teams Button -->
            <button class="teams-profile-btn" @click="router.push('/teams')">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/>
              </svg>
              Великие Дома
            </button>

            <!-- Admin Panel Button -->
            <button v-if="user?.isAdmin" class="admin-btn" @click="router.push('/admin')">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
              </svg>
              Админ-панель
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

              <div class="form-group">
                <label class="checkbox-label-edit">
                  <input v-model="editForm.bringingPet" type="checkbox" />
                  <span>Планирую взять с собой питомца</span>
                </label>
                <textarea
                  v-if="editForm.bringingPet"
                  v-model="editForm.petDescription"
                  rows="2"
                  placeholder="Опишите животное..."
                ></textarea>
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
            <h3>TourFurr 3: Game of Thrones</h3>
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
          </div>

          <div v-if="user?.description" class="description-block">
            <span class="detail-label">О себе</span>
            <p>{{ user.description }}</p>
          </div>

          <!-- Pet Info -->
          <div v-if="user?.bringingPet" class="info-block pet-block">
            <div class="info-header">
              <svg class="info-icon" fill="currentColor" viewBox="0 0 512 512">
                <!-- Beautiful paw print icon from FontAwesome -->
                <path d="M226.5 92.9c14.3 42.9-.3 86.2-32.6 96.8s-70.1-15.6-84.4-58.5s.3-86.2 32.6-96.8s70.1 15.6 84.4 58.5zM100.4 198.6c18.9 32.4 14.3 70.1-10.2 84.1s-59.7-.9-78.5-33.3S-2.7 179.3 21.8 165.3s59.7 .9 78.5 33.3zM69.2 401.2C121.6 259.9 214.7 224 256 224s134.4 35.9 186.8 177.2c3.6 9.7 5.2 20.1 5.2 30.5v1.6c0 25.8-20.9 46.7-46.7 46.7c-11.5 0-22.9-1.4-34-4.2l-88-22c-15.3-3.8-31.3-3.8-46.6 0l-88 22c-11.1 2.8-22.5 4.2-34 4.2C84.9 480 64 459.1 64 433.3v-1.6c0-10.4 1.6-20.8 5.2-30.5zM421.8 282.7c-24.5-14-29.1-51.7-10.2-84.1s54-47.3 78.5-33.3s29.1 51.7 10.2 84.1s-54 47.3-78.5 33.3zM310.1 189.7c-32.3-10.6-46.9-53.9-32.6-96.8s52.1-69.1 84.4-58.5s46.9 53.9 32.6 96.8s-52.1 69.1-84.4 58.5z"/>
              </svg>
              <span class="info-title">Питомец</span>
            </div>
            <p class="info-text">{{ user.petDescription || 'Не указано' }}</p>
          </div>

          <p class="status-message">{{ statusDescriptions[user?.status || 'pending'] }}</p>

          <!-- Schedule Button for approved/paid users -->
          <button v-if="user?.status === 'approved' || user?.status === 'paid'" class="schedule-card-btn" @click="router.push('/schedule')">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Расписание мероприятия
          </button>
        </div>

        <!-- Right Column - Payment Info (for approved/paid) -->
        <div v-if="(user?.status === 'approved' || user?.status === 'paid') && approvedInfo" class="payment-card">
          <div class="card-header">
            <svg class="card-header-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
            <h3>Оплата участия</h3>
          </div>

          <!-- Visual Credit Card -->
          <div class="visual-card" :class="{ 'visual-card--paid': user?.status === 'paid' }">
            <div class="visual-card__circles">
              <div class="visual-card__circle visual-card__circle--1"></div>
              <div class="visual-card__circle visual-card__circle--2"></div>
            </div>
            <div class="visual-card__top">
              <div class="visual-card__chip">
                <div class="chip-inner"></div>
              </div>
              <div v-if="user?.status === 'paid'" class="visual-card__paid-badge">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
            </div>
            <div class="visual-card__amount">
              <span class="visual-card__amount-label">{{ user?.status === 'paid' ? 'Оплачено' : 'К оплате' }}</span>
              <span class="visual-card__amount-value">{{ (approvedInfo.price ?? DEFAULT_EVENT_PRICE).toLocaleString('ru-RU') }} ₽</span>
            </div>
            <div class="visual-card__bottom">
              <span class="visual-card__event">TourFurr 3 · 2026</span>
              <span class="visual-card__brand">Т-Банк</span>
            </div>
          </div>

          <!-- T-Bank payment link (for approved users who haven't paid) -->
          <div v-if="user?.status === 'approved' && approvedInfo?.payment_url" class="tbank-payment-section">
            <a
              :href="approvedInfo.payment_url"
              target="_blank"
              rel="noopener noreferrer"
              class="tbank-payment-btn"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
              Оплатить участие
            </a>
          </div>

          <!-- Paid confirmation -->
          <div v-if="user?.status === 'paid'" class="paid-confirmation">
            <div class="paid-confirmation__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div class="paid-confirmation__text">
              <strong>Оплата подтверждена</strong>
              <span>Ваше участие в TourFurr 3 подтверждено</span>
            </div>
          </div>
        </div>

        <div v-if="user?.status === 'paid'" class="payment-status-card">
          <div class="payment-status-banner paid">
            <div class="payment-status-banner__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <strong>Оплата подтверждена</strong>
              <p>Ваше участие оплачено. Добро пожаловать на TourFurr 3!</p>
            </div>
          </div>
        </div>

        <!-- Telegram Group Card (for approved/paid with telegram_link) -->
        <div v-if="(user?.status === 'approved' || user?.status === 'paid') && approvedInfo?.telegram_link" class="telegram-card">
          <div class="card-header">
            <svg class="card-header-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.154.232.17.327.015.095.034.312.019.482z"/>
            </svg>
            <h3>Группа участников</h3>
          </div>
          <div class="telegram-info">
            <div class="telegram-security-notice">
              <div class="warning-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <div class="warning-content">
                <strong>Конфиденциальная ссылка!</strong>
                <p>Ссылка доступна только одобренным участникам. Пожалуйста, не передавайте её посторонним.</p>
              </div>
            </div>
            <a
              :href="approvedInfo.telegram_link"
              target="_blank"
              rel="noopener noreferrer"
              class="telegram-join-btn"
            >
              <svg fill="currentColor" viewBox="0 0 24 24" style="width:20px;height:20px;flex-shrink:0">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.154.232.17.327.015.095.034.312.019.482z"/>
              </svg>
              Войти в группу Telegram
            </a>
          </div>
        </div>

        <!-- Location Card (for approved/paid) -->
        <div v-if="(user?.status === 'approved' || user?.status === 'paid') && approvedInfo" class="location-card">
          <div class="card-header">
            <h3>Локация</h3>
          </div>

          <div v-if="approvedInfo.coordinates" class="map-security-warning">
            <div class="warning-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <div class="warning-content">
              <strong>Конфиденциальная информация!</strong>
              <p>Данные доступны только одобренным участникам. Разглашение координат может привести к серьезным последствиям для мероприятия.</p>
            </div>
          </div>

          <div class="location-details">
            <div class="location-info">
              <div class="info-row">
                <span class="info-label">Регион</span>
                <span class="info-value">{{ approvedInfo.location }}</span>
              </div>
            </div>

            <div v-if="yandexMapUrl" class="map-container">
              <iframe
                :src="yandexMapUrl"
                class="yandex-map"
                allowfullscreen
                frameborder="0"
              ></iframe>
            </div>
          </div>
        </div>

        <!-- Error Card -->
        <div v-if="(user?.status === 'approved' || user?.status === 'paid') && infoError" class="error-card">
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
import TeamBadge from '../components/TeamBadge.vue'

const router = useRouter()
const authStore = useAuthStore()

// Default event price used when approvedInfo is not yet loaded
const DEFAULT_EVENT_PRICE = 9900

const user = computed(() => authStore.user)

interface ApprovedInfo {
  location: string
  coordinates: string | null
  price: number
  telegram_link?: string | null
  payment_url?: string | null
}

const approvedInfo = ref<ApprovedInfo | null>(null)
const infoError = ref<string | null>(null)

// Yandex Maps iframe URL
const yandexMapUrl = computed(() => {
  if (!approvedInfo.value?.coordinates) return ''

  const [lon, lat] = approvedInfo.value.coordinates.split(',')
  // Яндекс.Карты с меткой
  return `https://yandex.ru/map-widget/v1/?ll=${lon},${lat}&z=13&l=map&pt=${lon},${lat},pm2rdm`
})

// Open Yandex Maps for navigation
function openYandexMaps() {
  if (!approvedInfo.value?.coordinates) return

  const [lon, lat] = approvedInfo.value.coordinates.split(',')
  // Yandex Maps URL with marker
  const url = `https://yandex.ru/maps/?pt=${lon},${lat}&z=13&l=map`
  window.open(url, '_blank', 'noopener,noreferrer')
}

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
  description: '',
  bringingPet: false,
  petDescription: ''
})

function startEditing() {
  if (user.value) {
    editForm.value = {
      nickname: user.value.nickname,
      phone: user.value.phone,
      telegram: user.value.telegram,
      description: user.value.description || '',
      bringingPet: user.value.bringingPet,
      petDescription: user.value.petDescription || ''
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
    description: editForm.value.description,
    bringingPet: editForm.value.bringingPet,
    petDescription: editForm.value.petDescription
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
  if (user.value?.status !== 'approved' && user.value?.status !== 'paid') {
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
  if (newStatus === 'approved' || newStatus === 'paid') {
    fetchApprovedInfo()
  } else {
    approvedInfo.value = null
  }
}, { immediate: true })

const statusLabels: Record<string, string> = {
  pending: 'На рассмотрении',
  approved: 'Одобрено',
  paid: 'Оплачено',
  rejected: 'Отклонено',
  deferred: 'На рассмотрении'
}

const statusDescriptions: Record<string, string> = {
  pending: 'Если Вы ранее не были на ТурФурр — админ может написать вам для знакомства. Статус: В обработке.',
  deferred: 'Если Вы ранее не были на ТурФурр — админ может написать вам для знакомства. Статус: В обработке.',
  approved: 'Поздравляем! Ваша заявка одобрена. Для оплаты участия воспользуйтесь ссылкой в разделе оплаты.',
  paid: 'Оплата подтверждена! Добро пожаловать на TourFurr 3: Game of Thrones. Загляните в Расписание.',
  rejected: 'К сожалению Вам отказано в участии. Если вы не согласны, пожалуйста, напишите одному из оргов в контактах.'
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
  position: relative;
  overflow: hidden;
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

.status-badge.deferred {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.status-badge.approved {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.status-badge.rejected {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.status-badge.paid {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
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
  display: flex;
  align-items: center;
  gap: 0.6rem;
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
.detail-value.deferred { color: #fbbf24; }
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

/* Info Blocks */
.info-block {
  background: rgba(26, 17, 14, 0.5);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  border-left: 3px solid;
}

.pet-block {
  border-left-color: #22c55e;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(26, 17, 14, 0.5));
}

.info-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.info-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.pet-block .info-icon {
  color: #22c55e;
}

.info-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--cream);
}

.info-text {
  color: var(--sage);
  font-size: 0.9rem;
  line-height: 1.5;
}

.status-message {
  color: var(--sage);
  font-size: 0.9rem;
  line-height: 1.5;
  font-style: italic;
  margin-bottom: 1rem;
}

/* Card Header Icon */
.card-header-icon {
  width: 22px;
  height: 22px;
  color: var(--fire-glow);
  flex-shrink: 0;
}

/* Visual Credit Card */
.visual-card {
  background: linear-gradient(135deg, #2a1a0e 0%, #3d2410 40%, #5a3018 100%);
  border-radius: 18px;
  padding: 1.4rem 1.5rem;
  margin-bottom: 1.5rem;
  color: white;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 179, 71, 0.25);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  transition: box-shadow 0.3s ease;
}

.visual-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 179, 71, 0.08) 0%, transparent 60%);
  pointer-events: none;
}

.visual-card--paid {
  background: linear-gradient(135deg, #0e2a1a 0%, #103d24 40%, #185a30 100%);
  border-color: rgba(34, 197, 94, 0.3);
}

.visual-card--paid::after {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, transparent 60%);
}

.visual-card--closed {
  background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 40%, #333333 100%);
  border-color: rgba(150, 150, 150, 0.2);
  opacity: 0.65;
  filter: saturate(0.15);
}

.visual-card--closed::after {
  background: linear-gradient(135deg, rgba(200, 200, 200, 0.05) 0%, transparent 60%);
}

.visual-card--closed .visual-card__chip {
  background: linear-gradient(135deg, #888 0%, #666 40%, #999 70%, #555 100%);
}

.visual-card--closed .visual-card__amount-value {
  color: #aaaaaa;
  text-shadow: none;
}

.visual-card--closed .visual-card__event,
.visual-card--closed .visual-card__deadline {
  color: rgba(180, 180, 180, 0.5);
}

/* Closed badge on card */
.visual-card__closed-badge {
  width: 32px;
  height: 32px;
  background: rgba(150, 150, 150, 0.15);
  border: 1.5px solid rgba(150, 150, 150, 0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.visual-card__closed-badge svg {
  width: 18px;
  height: 18px;
  color: #888;
}

/* Deadline label on card bottom */
.visual-card__deadline {
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(200, 100, 100, 0.7);
  letter-spacing: 0.5px;
}

/* Payment Closed Notice */
.payment-closed-notice {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem 1.25rem;
  background: rgba(100, 100, 100, 0.1);
  border: 1px solid rgba(150, 150, 150, 0.25);
  border-radius: 14px;
}

.payment-closed-notice__icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  background: rgba(120, 120, 120, 0.15);
  border: 1.5px solid rgba(150, 150, 150, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.payment-closed-notice__icon svg {
  width: 20px;
  height: 20px;
  color: #888;
}

.payment-closed-notice__text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.payment-closed-notice__text strong {
  color: #aaaaaa;
  font-size: 0.95rem;
}

.payment-closed-notice__text span {
  color: var(--sage);
  font-size: 0.82rem;
  opacity: 0.7;
  line-height: 1.4;
}

/* Decorative circles */
.visual-card__circles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: inherit;
}

.visual-card__circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.12;
}

.visual-card__circle--1 {
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, var(--fire-glow), transparent);
  top: -60px;
  right: -40px;
}

.visual-card__circle--2 {
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, var(--fire), transparent);
  bottom: -40px;
  left: -20px;
}

/* Card top row */
.visual-card__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
  position: relative;
  z-index: 1;
}

/* Chip */
.visual-card__chip {
  width: 42px;
  height: 32px;
  background: linear-gradient(135deg, #e8c96a 0%, #c8a84b 40%, #f0d878 70%, #b8901e 100%);
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.chip-inner {
  position: absolute;
  inset: 6px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.chip-inner::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(0, 0, 0, 0.15);
  transform: translateY(-50%);
}

.chip-inner::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(0, 0, 0, 0.15);
  transform: translateX(-50%);
}

/* Paid badge on card */
.visual-card__paid-badge {
  width: 32px;
  height: 32px;
  background: rgba(34, 197, 94, 0.25);
  border: 2px solid rgba(34, 197, 94, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.visual-card__paid-badge svg {
  width: 18px;
  height: 18px;
  color: #4ade80;
}

/* NFC icon */
.visual-card__nfc svg {
  width: 28px;
  height: 28px;
  color: rgba(255, 255, 255, 0.4);
}

/* Amount */
.visual-card__amount {
  position: relative;
  z-index: 1;
  margin-bottom: 1.25rem;
}

.visual-card__amount-label {
  display: block;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 0.3rem;
}

.visual-card__amount-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--fire-glow);
  letter-spacing: 1px;
  text-shadow: 0 0 20px rgba(255, 179, 71, 0.4);
}

.visual-card--paid .visual-card__amount-value {
  color: #4ade80;
  text-shadow: 0 0 20px rgba(74, 222, 128, 0.4);
}

/* Card bottom row */
.visual-card__bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  position: relative;
  z-index: 1;
}

.visual-card__event {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.5);
}

.visual-card__brand {
  font-size: 0.85rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.5px;
}

/* Payment Note */
.payment-note {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  color: var(--sage);
  font-size: 0.85rem;
  font-style: italic;
  margin-bottom: 0.25rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  border-left: 2px solid rgba(255, 179, 71, 0.4);
}

.payment-note svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-top: 1px;
  color: var(--fire-glow);
  opacity: 0.8;
}

/* Pay Online Section */
.pay-online-section {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.pay-online-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #FF6B35 0%, #FF9A35 50%, #FFB347 100%);
  color: #1a0e06;
  border: none;
  border-radius: 14px;
  font-size: 1.05rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow:
    0 4px 20px rgba(255, 107, 53, 0.45),
    0 0 0 0 rgba(255, 107, 53, 0.3);
  overflow: hidden;
  letter-spacing: 0.3px;
}

.pay-online-btn:not(:disabled) {
  animation: btnPulse 2.5s ease-in-out infinite;
}

@keyframes btnPulse {
  0%, 100% { box-shadow: 0 4px 20px rgba(255, 107, 53, 0.45), 0 0 0 0 rgba(255, 107, 53, 0.3); }
  50% { box-shadow: 0 4px 24px rgba(255, 107, 53, 0.55), 0 0 0 6px rgba(255, 107, 53, 0); }
}

.pay-online-btn__glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100%);
  transform: translateX(-100%);
  transition: transform 0s;
}

.pay-online-btn:hover:not(:disabled) .pay-online-btn__glow {
  animation: shimmer 0.7s ease forwards;
}

@keyframes shimmer {
  to { transform: translateX(100%); }
}

.pay-online-btn__content {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  position: relative;
  z-index: 1;
}

.pay-online-btn__content svg {
  width: 22px;
  height: 22px;
}

.pay-online-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(255, 107, 53, 0.55), 0 0 0 4px rgba(255, 107, 53, 0.15);
  animation: none;
}

.pay-online-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 12px rgba(255, 107, 53, 0.4);
}

.pay-online-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  animation: none;
}

.spinner-inline {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(26, 14, 6, 0.3);
  border-top-color: #1a0e06;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

/* Payment method badges */
.payment-methods-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  justify-content: center;
}

.pm-badge {
  padding: 0.3rem 0.65rem;
  border-radius: 8px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  white-space: nowrap;
}

.pm-badge--visa {
  background: rgba(26, 44, 102, 0.6);
  border: 1px solid rgba(26, 44, 102, 0.8);
  color: #8ab4f8;
}

.pm-badge--mir {
  background: rgba(0, 102, 80, 0.5);
  border: 1px solid rgba(0, 160, 126, 0.5);
  color: #6ee7c4;
}

.pm-badge--sbp {
  background: rgba(128, 0, 128, 0.4);
  border: 1px solid rgba(180, 0, 180, 0.4);
  color: #e879f9;
}

.pm-badge--sber {
  background: rgba(0, 120, 50, 0.45);
  border: 1px solid rgba(0, 180, 80, 0.4);
  color: #86efac;
}

.pm-badge--ymoney {
  background: rgba(140, 0, 200, 0.35);
  border: 1px solid rgba(180, 60, 220, 0.4);
  color: #d8b4fe;
}

/* Security hint */
.payment-security-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  color: var(--sage);
  font-size: 0.78rem;
  opacity: 0.75;
}

.payment-security-hint svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

/* Payment error */
.payment-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  color: #fca5a5;
  font-size: 0.85rem;
}

.payment-error svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* T-Bank payment section */
.tbank-payment-section {
  margin-top: 1rem;
}

.tbank-payment-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.9rem 1.5rem;
  background: linear-gradient(135deg, #ffdd2d 0%, #fcc521 100%);
  color: #1a1a1a;
  font-weight: 700;
  font-size: 1rem;
  border-radius: 14px;
  text-decoration: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 4px 18px rgba(255, 221, 45, 0.35);
}

.tbank-payment-btn svg {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.tbank-payment-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(255, 221, 45, 0.5);
}

.tbank-payment-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(255, 221, 45, 0.3);
}

/* Paid Confirmation */
.paid-confirmation {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(16, 185, 129, 0.08));
  border: 1px solid rgba(34, 197, 94, 0.35);
  border-radius: 14px;
}

.paid-confirmation__icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  background: rgba(34, 197, 94, 0.2);
  border: 2px solid rgba(34, 197, 94, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.paid-confirmation__icon svg {
  width: 22px;
  height: 22px;
  color: #4ade80;
}

.paid-confirmation__text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.paid-confirmation__text strong {
  color: #4ade80;
  font-size: 0.95rem;
}

.paid-confirmation__text span {
  color: var(--sage);
  font-size: 0.82rem;
}

/* Receipt Reminder */
.receipt-reminder {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 179, 71, 0.1);
  border: 1px solid rgba(255, 179, 71, 0.3);
  border-left: 3px solid var(--fire-glow);
  border-radius: 10px;
  margin-top: 1rem;
}

.receipt-reminder .reminder-icon {
  width: 24px;
  height: 24px;
  color: var(--fire-glow);
  flex-shrink: 0;
  margin-top: 2px;
}

.receipt-reminder .reminder-content {
  flex: 1;
}

.receipt-reminder strong {
  display: block;
  color: var(--fire-glow);
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.receipt-reminder p {
  color: var(--sage);
  font-size: 0.85rem;
  margin: 0;
  line-height: 1.5;
}

/* Location Card */
.location-card {
  grid-column: 1 / -1;
}

/* Telegram Card */
.telegram-card {
  grid-column: 1 / -1;
}

.telegram-info {
  padding: 1.25rem;
}

.telegram-security-notice {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, rgba(29, 161, 242, 0.12) 0%, rgba(29, 161, 242, 0.06) 100%);
  border: 2px solid rgba(29, 161, 242, 0.35);
  border-radius: 12px;
  margin-bottom: 1.25rem;
  box-shadow: 0 2px 8px rgba(29, 161, 242, 0.12);
}

.telegram-join-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #229ED9, #1a8cbf);
  color: #fff;
  border-radius: 12px;
  text-decoration: none;
  font-family: 'Lora', serif;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(34, 158, 217, 0.3);
}

.telegram-join-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(34, 158, 217, 0.4);
  background: linear-gradient(135deg, #1a8cbf, #1479a8);
}

.telegram-join-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(34, 158, 217, 0.25);
}

/* Security Warning Banner */
.map-security-warning {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.15) 0%, rgba(217, 119, 6, 0.08) 100%);
  border: 2px solid rgba(217, 119, 6, 0.4);
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(217, 119, 6, 0.15);
}

.warning-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(217, 119, 6, 0.2);
  border-radius: 10px;
  flex-shrink: 0;
}

.warning-icon svg {
  width: 24px;
  height: 24px;
  color: #d97706;
}

.warning-content {
  flex: 1;
}

.warning-content strong {
  display: block;
  color: #d97706;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  letter-spacing: 0.01em;
}

.warning-content p {
  color: var(--sage);
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.6;
}

/* Location Details Section */
.location-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.location-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem;
  background: rgba(139, 111, 71, 0.05);
  border-radius: 8px;
  transition: background 0.2s ease;
}

.info-row:hover {
  background: rgba(139, 111, 71, 0.08);
}

.info-label {
  color: var(--sage);
  font-size: 0.9rem;
  font-weight: 500;
  min-width: 120px;
}

.info-value {
  color: var(--parchment);
  font-size: 0.95rem;
  flex: 1;
  text-align: right;
}

.info-note {
  font-style: italic;
  color: rgba(219, 205, 179, 0.8);
}

/* Map Container */
.map-container {
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(139, 111, 71, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.3s ease;
  min-height: 350px;
}

.map-container:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.yandex-map {
  width: 100%;
  height: 350px;
  border: none;
  border-radius: 8px;
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
  .error-card,
  .house-picker-card {
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

  .visual-card__amount-value {
    font-size: 1.7rem;
  }

  .payment-methods-row {
    gap: 0.35rem;
  }

  .pm-badge {
    font-size: 0.68rem;
    padding: 0.25rem 0.55rem;
  }

  /* Location Card Mobile Styles */
  .map-security-warning {
    padding: 0.875rem 1rem;
    gap: 0.75rem;
  }

  .warning-icon {
    width: 36px;
    height: 36px;
  }

  .warning-icon svg {
    width: 20px;
    height: 20px;
  }

  .warning-content strong {
    font-size: 0.9rem;
  }

  .warning-content p {
    font-size: 0.85rem;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .info-label {
    min-width: auto;
    font-size: 0.85rem;
  }

  .info-value {
    text-align: left;
    font-size: 0.9rem;
  }

  .map-container {
    border-radius: 8px;
  }
}

/* Payment Status Card */
.payment-status-card {
  grid-column: span 2;
}

.payment-status-banner {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 16px;
  animation: fadeIn 0.5s ease-out;
}

.payment-status-banner__icon {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.payment-status-banner__icon svg {
  width: 26px;
  height: 26px;
}

.payment-status-banner strong {
  display: block;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.payment-status-banner p {
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
}

.payment-status-banner.waiting {
  background: rgba(255, 179, 71, 0.1);
  border: 1px solid rgba(255, 179, 71, 0.3);
  color: var(--fire-glow);
}

.payment-status-banner.waiting .payment-status-banner__icon {
  background: rgba(255, 179, 71, 0.15);
  border: 1.5px solid rgba(255, 179, 71, 0.4);
  color: var(--fire-glow);
}

.payment-status-banner.waiting p {
  color: var(--sage);
}

.payment-status-banner.paid {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.payment-status-banner.paid .payment-status-banner__icon {
  background: rgba(16, 185, 129, 0.15);
  border: 1.5px solid rgba(16, 185, 129, 0.4);
  color: #10b981;
}

.payment-status-banner.paid p {
  color: var(--sage);
}

.payment-status-banner.closed {
  background: rgba(100, 100, 100, 0.1);
  border: 1px solid rgba(150, 150, 150, 0.25);
  color: #aaaaaa;
}

.payment-status-banner.closed .payment-status-banner__icon {
  background: rgba(120, 120, 120, 0.15);
  border: 1.5px solid rgba(150, 150, 150, 0.3);
  color: #888;
}

.payment-status-banner.closed p {
  color: var(--sage);
  opacity: 0.7;
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

.schedule-card-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  margin-top: 1rem;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.15));
  border: 1px solid rgba(34, 197, 94, 0.5);
  border-radius: 12px;
  color: #22c55e;
  font-family: 'Lora', serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.schedule-card-btn:hover {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(22, 163, 74, 0.25));
  border-color: #22c55e;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.schedule-card-btn svg {
  width: 18px;
  height: 18px;
}

.teams-profile-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  margin-top: 0.75rem;
  background: linear-gradient(135deg, rgba(255, 179, 71, 0.1), rgba(255, 107, 53, 0.1));
  border: 1px solid rgba(255, 179, 71, 0.4);
  border-radius: 12px;
  color: var(--fire-glow);
  font-family: 'Lora', serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.teams-profile-btn:hover {
  background: linear-gradient(135deg, rgba(255, 179, 71, 0.2), rgba(255, 107, 53, 0.2));
  border-color: var(--fire-glow);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 179, 71, 0.3);
}

.teams-profile-btn svg {
  width: 18px;
  height: 18px;
}

.admin-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  margin-top: 0.75rem;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(167, 139, 250, 0.15));
  border: 1px solid rgba(139, 92, 246, 0.4);
  border-radius: 12px;
  color: #a78bfa;
  font-family: 'Lora', serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.admin-btn:hover {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(167, 139, 250, 0.25));
  border-color: rgba(139, 92, 246, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.admin-btn svg {
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

.checkbox-label-edit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--cream);
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 0.5rem;
}

.checkbox-label-edit input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--fire);
}

.checkbox-label-edit:hover {
  color: var(--fire-glow);
}
</style>
