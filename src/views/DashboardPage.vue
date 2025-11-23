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

        <!-- Profile Section -->
        <section class="profile-section glass-card">
          <div class="profile-header">
            <div class="avatar-container">
              <div class="avatar">
                <img v-if="user?.avatar" :src="user.avatar" alt="Avatar" />
                <span v-else class="avatar-letter">{{ user?.nickname?.[0]?.toUpperCase() }}</span>
              </div>
            </div>
            <div class="profile-info">
              <h1 class="profile-name">{{ user?.nickname }}</h1>
              <p class="profile-email">{{ user?.email }}</p>
              <div class="status-badge" :class="user?.status">
                {{ statusLabels[user?.status || 'pending'] }}
              </div>
            </div>
          </div>

          <div class="profile-details">
            <div class="detail-item">
              <svg class="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              <span>{{ user?.phone }}</span>
            </div>
            <div class="detail-item">
              <svg class="detail-icon telegram" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.154.232.17.327.015.095.034.312.019.482z"/>
              </svg>
              <a :href="'https://' + user?.telegram" target="_blank">{{ user?.telegram }}</a>
            </div>
            <div v-if="user?.description" class="detail-item description">
              <svg class="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/>
              </svg>
              <span>{{ user?.description }}</span>
            </div>
          </div>
        </section>

        <!-- Event Info -->
        <section class="event-section glass-card">
          <h2 class="section-title">Лесной Кемп 2026</h2>

          <div class="event-status">
            <div class="timeline">
              <div class="timeline-step" :class="{ active: true }">
                <div class="step-dot"></div>
                <span>Регистрация</span>
              </div>
              <div class="timeline-line" :class="{ active: user?.status !== 'pending' }"></div>
              <div class="timeline-step" :class="{ active: user?.status !== 'pending' }">
                <div class="step-dot"></div>
                <span>Проверка</span>
              </div>
              <div class="timeline-line" :class="{ active: user?.status === 'approved' }"></div>
              <div class="timeline-step" :class="{ active: user?.status === 'approved' }">
                <div class="step-dot"></div>
                <span>Участие</span>
              </div>
            </div>
          </div>

          <p class="status-message">{{ statusDescriptions[user?.status || 'pending'] }}</p>
        </section>

        <!-- Approved Info (only for approved users) -->
        <section v-if="user?.status === 'approved' && approvedInfo" class="approved-section">
          <div class="approved-cards">
            <!-- Location -->
            <div class="glass-card approved-card location">
              <div class="card-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <h3>Локация</h3>
              <p class="card-text">{{ approvedInfo.location }}</p>
              <p class="card-note">{{ approvedInfo.location_note }}</p>

              <div v-if="approvedInfo.coordinates" class="map-wrapper">
                <iframe
                  :src="`https://yandex.ru/map-widget/v1/?pt=${approvedInfo.coordinates}&z=12&l=map`"
                  width="100%"
                  height="180"
                  frameborder="0"
                ></iframe>
              </div>
            </div>

            <!-- Payment -->
            <div class="glass-card approved-card payment">
              <div class="card-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
              </div>
              <h3>Оплата</h3>
              <p class="price">{{ approvedInfo.price }} ₽</p>
              <div class="payment-info">
                <p><strong>{{ approvedInfo.bank }}:</strong> {{ approvedInfo.card_number }}</p>
                <p><strong>Получатель:</strong> {{ approvedInfo.recipient }}</p>
              </div>
              <p class="card-note">{{ approvedInfo.payment_note }}</p>
            </div>
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

async function fetchApprovedInfo() {
  if (user.value?.status !== 'approved') {
    approvedInfo.value = null
    return
  }

  try {
    const { data, error } = await supabase
      .from('event_info')
      .select('*')
      .single()

    if (!error && data) {
      approvedInfo.value = data
    }
  } catch (err) {
    console.error('Failed to fetch approved info:', err)
  }
}

watch(() => user.value?.status, (newStatus) => {
  if (newStatus === 'approved') {
    fetchApprovedInfo()
  } else {
    approvedInfo.value = null
  }
})

const statusLabels: Record<string, string> = {
  pending: 'На рассмотрении',
  approved: 'Одобрено',
  rejected: 'Отклонено'
}

const statusDescriptions: Record<string, string> = {
  pending: 'Ваша заявка находится на рассмотрении. Обычно это занимает 1-2 рабочих дня.',
  approved: 'Поздравляем! Ваша заявка одобрена. Ниже информация для участия.',
  rejected: 'К сожалению, ваша заявка была отклонена. Свяжитесь с нами для уточнения.'
}

onMounted(async () => {
  await authStore.fetchUser()
  fetchApprovedInfo()
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
  background: rgba(26, 17, 14, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--moss);
}

.header-content {
  max-width: 1000px;
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

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 107, 53, 0.1);
  border: 1px solid rgba(255, 107, 53, 0.3);
  border-radius: 8px;
  color: var(--fire-glow);
  font-family: 'Lora', serif;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255, 107, 53, 0.2);
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
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Glass Card Override */
.glass-card {
  padding: 2rem;
  background: rgba(42, 31, 26, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(139, 111, 71, 0.3);
  border-radius: 16px;
}

/* Profile Section */
.profile-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar-container {
  flex-shrink: 0;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
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
  font-size: 2rem;
  color: var(--fire-glow);
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-family: 'Playfair Display', serif;
  font-size: 1.75rem;
  color: var(--cream);
  margin-bottom: 0.25rem;
}

.profile-email {
  color: var(--sage);
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.status-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
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

.profile-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--moss);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--cream);
  font-size: 1.1rem;
}

.detail-item.description {
  width: 100%;
}

.detail-icon {
  width: 20px;
  height: 20px;
  color: var(--fire);
  flex-shrink: 0;
}

.detail-icon.telegram {
  color: #0088cc;
}

.detail-item a {
  color: var(--fire-glow);
  text-decoration: none;
}

.detail-item a:hover {
  text-decoration: underline;
}

/* Event Section */
.event-section {
  text-align: center;
}

.section-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  color: var(--fire-glow);
  margin-bottom: 1.5rem;
}

.timeline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-bottom: 1.5rem;
}

.timeline-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--moss);
  border: 2px solid var(--moss);
}

.timeline-step.active .step-dot {
  background: var(--fire);
  border-color: var(--fire-glow);
}

.timeline-step span {
  font-size: 0.9rem;
  color: var(--sage);
}

.timeline-step.active span {
  color: var(--fire-glow);
}

.timeline-line {
  width: 60px;
  height: 2px;
  background: var(--moss);
  margin: 0 10px;
  margin-bottom: 24px;
}

.timeline-line.active {
  background: var(--fire);
}

.status-message {
  color: var(--sage);
  font-size: 1rem;
  line-height: 1.6;
}

/* Approved Section */
.approved-section {
  margin-top: 0.5rem;
}

.approved-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.approved-card {
  text-align: center;
}

.approved-card.location {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
}

.approved-card.payment {
  background: rgba(255, 179, 71, 0.1);
  border-color: rgba(255, 179, 71, 0.3);
}

.card-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.card-icon svg {
  width: 28px;
  height: 28px;
}

.approved-card.location .card-icon svg {
  color: #22c55e;
}

.approved-card.payment .card-icon svg {
  color: var(--fire-glow);
}

.approved-card h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem;
  color: var(--cream);
  margin-bottom: 0.75rem;
}

.card-text {
  color: var(--cream);
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.card-note {
  color: var(--sage);
  font-size: 0.9rem;
  font-style: italic;
}

.price {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  color: var(--fire-glow);
  margin-bottom: 1rem;
}

.payment-info {
  background: rgba(26, 17, 14, 0.5);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  text-align: left;
}

.payment-info p {
  color: var(--cream);
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.payment-info p:last-child {
  margin-bottom: 0;
}

.payment-info strong {
  color: var(--sage);
}

.map-wrapper {
  margin-top: 1rem;
  border-radius: 8px;
  overflow: hidden;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-main {
    padding: 1rem;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .profile-details {
    flex-direction: column;
    align-items: center;
  }

  .approved-cards {
    grid-template-columns: 1fr;
  }

  .timeline {
    transform: scale(0.9);
  }
}
</style>
