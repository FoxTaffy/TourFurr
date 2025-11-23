<template>
  <div class="dashboard-page">
    <!-- Animated Background -->
    <div class="bg-forest"></div>
    <div class="fog"></div>

    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <router-link to="/" class="logo">
          <span class="logo-tour">Tour</span><span class="logo-furr">Furr</span>
        </router-link>
        <button @click="handleLogout" class="logout-btn">
          <svg class="logout-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Выйти
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="dashboard-main">
      <div class="dashboard-container">

        <!-- Hero Section with Profile -->
        <section class="hero-section">
          <div class="hero-glow"></div>
          <div class="hero-content">
            <div class="avatar-wrapper">
              <div class="avatar-ring">
                <div class="avatar">
                  <img v-if="user?.avatar" :src="user.avatar" alt="Avatar" />
                  <span v-else class="avatar-letter">{{ user?.nickname?.[0]?.toUpperCase() }}</span>
                </div>
              </div>
              <div class="status-indicator" :class="user?.status"></div>
            </div>

            <div class="hero-info">
              <h1 class="hero-name">{{ user?.nickname }}</h1>
              <p class="hero-email">{{ user?.email }}</p>

              <div class="hero-meta">
                <div class="meta-item">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  <span>{{ user?.phone }}</span>
                </div>
                <div class="meta-item telegram">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.154.232.17.327.015.095.034.312.019.482z"/>
                  </svg>
                  <a :href="'https://' + user?.telegram" target="_blank">{{ user?.telegram }}</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Status Card -->
        <section class="status-section">
          <div class="status-card" :class="user?.status">
            <div class="status-header">
              <div class="status-icon-wrapper" :class="user?.status">
                <svg v-if="user?.status === 'pending'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <svg v-else-if="user?.status === 'approved'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="status-text">
                <h2>Лесной Кемп 2026</h2>
                <span class="status-label">{{ statusLabels[user?.status || 'pending'] }}</span>
              </div>
            </div>

            <div class="progress-bar">
              <div class="progress-track">
                <div class="progress-fill" :class="user?.status"></div>
              </div>
              <div class="progress-steps">
                <div class="step" :class="{ active: true }">
                  <div class="step-marker"></div>
                  <span>Заявка</span>
                </div>
                <div class="step" :class="{ active: user?.status !== 'pending' }">
                  <div class="step-marker"></div>
                  <span>Проверка</span>
                </div>
                <div class="step" :class="{ active: user?.status === 'approved' }">
                  <div class="step-marker"></div>
                  <span>Участие</span>
                </div>
              </div>
            </div>

            <p class="status-description">{{ statusDescriptions[user?.status || 'pending'] }}</p>
          </div>
        </section>

        <!-- Error Message -->
        <section v-if="user?.status === 'approved' && infoError" class="error-section">
          <div class="error-card">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <p>{{ infoError }}</p>
            <small>Проверьте что таблица event_info создана в Supabase и содержит данные</small>
          </div>
        </section>

        <!-- Approved Info Section -->
        <section v-if="user?.status === 'approved' && approvedInfo" class="info-section">
          <h2 class="info-title">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Информация для участника
          </h2>

          <div class="info-grid">
            <!-- Location Card -->
            <div class="info-card location">
              <div class="info-card-header">
                <div class="info-card-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <h3>Локация мероприятия</h3>
              </div>

              <div class="info-card-content">
                <p class="location-name">{{ approvedInfo.location }}</p>
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
            </div>

            <!-- Payment Card -->
            <div class="info-card payment">
              <div class="info-card-header">
                <div class="info-card-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                  </svg>
                </div>
                <h3>Оплата участия</h3>
              </div>

              <div class="info-card-content">
                <div class="price-display">
                  <span class="price-amount">{{ approvedInfo.price }}</span>
                  <span class="price-currency">₽</span>
                </div>

                <div class="payment-details">
                  <div class="payment-row">
                    <span class="payment-label">Банк</span>
                    <span class="payment-value">{{ approvedInfo.bank }}</span>
                  </div>
                  <div class="payment-row">
                    <span class="payment-label">Номер карты</span>
                    <span class="payment-value card-number">{{ approvedInfo.card_number }}</span>
                  </div>
                  <div class="payment-row">
                    <span class="payment-label">Получатель</span>
                    <span class="payment-value">{{ approvedInfo.recipient }}</span>
                  </div>
                </div>

                <p class="payment-note">{{ approvedInfo.payment_note }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Description (if exists) -->
        <section v-if="user?.description" class="description-section">
          <div class="description-card">
            <h3>О себе</h3>
            <p>{{ user.description }}</p>
          </div>
        </section>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../services/supabase'

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
      .single()

    console.log('Event info fetch result:', { data, error })

    if (error) {
      console.error('Supabase error:', error)
      infoError.value = `Ошибка загрузки: ${error.message}`
      return
    }

    if (data) {
      approvedInfo.value = data
      infoError.value = null
    } else {
      infoError.value = 'Данные о мероприятии не найдены'
    }
  } catch (err: any) {
    console.error('Failed to fetch approved info:', err)
    infoError.value = err.message || 'Неизвестная ошибка'
  }
}

// Watch for status changes
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
  pending: 'Ваша заявка находится на рассмотрении. Обычно это занимает 1-2 рабочих дня. Мы свяжемся с вами после проверки.',
  approved: 'Поздравляем! Ваша заявка одобрена. Ознакомьтесь с информацией ниже для участия в мероприятии.',
  rejected: 'К сожалению, ваша заявка была отклонена. Свяжитесь с нами в Telegram для уточнения причин.'
}

onMounted(async () => {
  await authStore.fetchUser()
  // Explicitly fetch approved info after user is loaded
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

/* Header */
.dashboard-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(26, 17, 14, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(139, 111, 71, 0.3);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-family: 'Playfair Display', serif;
  font-size: 1.75rem;
  font-weight: 900;
  text-decoration: none;
}

.logo-tour { color: var(--cream); }
.logo-furr { color: var(--fire); }

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 107, 53, 0.15);
  border: 1px solid rgba(255, 107, 53, 0.4);
  border-radius: 12px;
  color: var(--fire-glow);
  font-family: 'Lora', serif;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255, 107, 53, 0.25);
  transform: translateY(-2px);
}

.logout-icon {
  width: 18px;
  height: 18px;
}

/* Main Content */
.dashboard-main {
  position: relative;
  z-index: 10;
  padding: 2rem;
}

.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Hero Section */
.hero-section {
  position: relative;
  background: linear-gradient(135deg, rgba(42, 31, 26, 0.8) 0%, rgba(61, 45, 36, 0.6) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(139, 111, 71, 0.4);
  border-radius: 24px;
  padding: 3rem;
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255, 107, 53, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 2.5rem;
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.avatar-ring {
  padding: 4px;
  background: linear-gradient(135deg, var(--fire), var(--fire-glow), var(--amber));
  border-radius: 50%;
  animation: ringPulse 3s ease-in-out infinite;
}

@keyframes ringPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.4); }
  50% { box-shadow: 0 0 20px 5px rgba(255, 107, 53, 0.2); }
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--forest-mid);
  display: flex;
  align-items: center;
  justify-content: center;
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

.status-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 3px solid var(--forest-dark);
}

.status-indicator.pending { background: var(--fire-glow); }
.status-indicator.approved { background: #22c55e; }
.status-indicator.rejected { background: #ef4444; }

.hero-info {
  flex: 1;
}

.hero-name {
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  color: var(--cream);
  margin-bottom: 0.5rem;
}

.hero-email {
  color: var(--sage);
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--cream);
  font-size: 1.1rem;
}

.meta-item svg {
  width: 20px;
  height: 20px;
  color: var(--fire);
}

.meta-item.telegram svg {
  color: #0088cc;
}

.meta-item a {
  color: var(--fire-glow);
  text-decoration: none;
  transition: color 0.3s;
}

.meta-item a:hover {
  color: var(--amber);
  text-decoration: underline;
}

/* Status Section */
.status-section {
  padding: 0;
}

.status-card {
  background: rgba(42, 31, 26, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(139, 111, 71, 0.3);
  border-radius: 20px;
  padding: 2rem;
}

.status-card.approved {
  border-color: rgba(34, 197, 94, 0.4);
  background: linear-gradient(135deg, rgba(42, 31, 26, 0.7) 0%, rgba(34, 197, 94, 0.1) 100%);
}

.status-card.rejected {
  border-color: rgba(239, 68, 68, 0.4);
  background: linear-gradient(135deg, rgba(42, 31, 26, 0.7) 0%, rgba(239, 68, 68, 0.1) 100%);
}

.status-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.status-icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 179, 71, 0.2);
}

.status-icon-wrapper.approved {
  background: rgba(34, 197, 94, 0.2);
}

.status-icon-wrapper.rejected {
  background: rgba(239, 68, 68, 0.2);
}

.status-icon-wrapper svg {
  width: 32px;
  height: 32px;
}

.status-icon-wrapper.pending svg { color: var(--fire-glow); }
.status-icon-wrapper.approved svg { color: #22c55e; }
.status-icon-wrapper.rejected svg { color: #ef4444; }

.status-text h2 {
  font-family: 'Playfair Display', serif;
  font-size: 1.75rem;
  color: var(--cream);
  margin-bottom: 0.25rem;
}

.status-label {
  font-size: 1rem;
  font-weight: 600;
}

.status-card.pending .status-label { color: var(--fire-glow); }
.status-card.approved .status-label { color: #22c55e; }
.status-card.rejected .status-label { color: #ef4444; }

/* Progress Bar */
.progress-bar {
  margin-bottom: 1.5rem;
}

.progress-track {
  height: 4px;
  background: var(--moss);
  border-radius: 4px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-fill.pending {
  width: 33%;
  background: var(--fire-glow);
}

.progress-fill.approved {
  width: 100%;
  background: linear-gradient(90deg, var(--fire-glow), #22c55e);
}

.progress-fill.rejected {
  width: 66%;
  background: #ef4444;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-marker {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--moss);
  border: 2px solid var(--moss);
}

.step.active .step-marker {
  background: var(--fire);
  border-color: var(--fire-glow);
}

.step span {
  font-size: 0.85rem;
  color: var(--sage);
}

.step.active span {
  color: var(--cream);
}

.status-description {
  color: var(--sage);
  font-size: 1rem;
  line-height: 1.7;
}

/* Error Section */
.error-section {
  margin-top: 1rem;
}

.error-card {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
}

.error-card svg {
  width: 48px;
  height: 48px;
  color: #ef4444;
  margin-bottom: 1rem;
}

.error-card p {
  color: #ef4444;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.error-card small {
  color: var(--sage);
  font-size: 0.9rem;
}

/* Info Section */
.info-section {
  margin-top: 1rem;
}

.info-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  color: var(--fire-glow);
  margin-bottom: 1.5rem;
}

.info-title svg {
  width: 28px;
  height: 28px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.info-card {
  background: rgba(42, 31, 26, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(139, 111, 71, 0.3);
}

.info-card.location {
  border-color: rgba(34, 197, 94, 0.4);
}

.info-card.payment {
  border-color: rgba(255, 179, 71, 0.4);
}

.info-card-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(139, 111, 71, 0.2);
}

.info-card.location .info-card-header {
  background: rgba(34, 197, 94, 0.1);
}

.info-card.payment .info-card-header {
  background: rgba(255, 179, 71, 0.1);
}

.info-card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
}

.info-card-icon svg {
  width: 26px;
  height: 26px;
}

.info-card.location .info-card-icon svg { color: #22c55e; }
.info-card.payment .info-card-icon svg { color: var(--fire-glow); }

.info-card-header h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem;
  color: var(--cream);
}

.info-card-content {
  padding: 1.5rem;
}

/* Location Card */
.location-name {
  font-size: 1.15rem;
  color: var(--cream);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.location-note {
  font-size: 0.95rem;
  color: var(--sage);
  font-style: italic;
  margin-bottom: 1rem;
}

.map-container {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(139, 111, 71, 0.3);
}

/* Payment Card */
.price-display {
  text-align: center;
  margin-bottom: 1.5rem;
}

.price-amount {
  font-family: 'Playfair Display', serif;
  font-size: 3rem;
  color: var(--fire-glow);
}

.price-currency {
  font-size: 1.5rem;
  color: var(--sage);
  margin-left: 4px;
}

.payment-details {
  background: rgba(26, 17, 14, 0.6);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(139, 111, 71, 0.2);
}

.payment-row:last-child {
  border-bottom: none;
}

.payment-label {
  font-size: 0.9rem;
  color: var(--sage);
}

.payment-value {
  font-size: 1rem;
  color: var(--cream);
  font-weight: 500;
}

.payment-value.card-number {
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

.payment-note {
  font-size: 0.9rem;
  color: var(--sage);
  font-style: italic;
  text-align: center;
}

/* Description Section */
.description-section {
  margin-top: 0;
}

.description-card {
  background: rgba(42, 31, 26, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(139, 111, 71, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
}

.description-card h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  color: var(--fire-glow);
  margin-bottom: 0.75rem;
}

.description-card p {
  color: var(--cream);
  font-size: 1rem;
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-main {
    padding: 1rem;
  }

  .hero-section {
    padding: 2rem;
  }

  .hero-content {
    flex-direction: column;
    text-align: center;
  }

  .hero-name {
    font-size: 2rem;
  }

  .hero-meta {
    justify-content: center;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .avatar {
    width: 100px;
    height: 100px;
  }

  .avatar-letter {
    font-size: 2.5rem;
  }

  .status-header {
    flex-direction: column;
    text-align: center;
  }

  .progress-steps {
    gap: 0.5rem;
  }

  .step span {
    font-size: 0.75rem;
  }
}
</style>
