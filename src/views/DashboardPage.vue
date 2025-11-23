<template>
  <div class="dashboard-page">
    <!-- Animated Background -->
    <div class="bg-forest"></div>
    <div class="fog"></div>

    <!-- Floating Particles -->
    <div class="particles">
      <div v-for="i in 15" :key="i" class="particle" :style="particleStyle(i)"></div>
    </div>

    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <router-link to="/" class="logo">
          <span class="logo-tour">Tour</span><span class="logo-furr">Furr</span>
        </router-link>
        <div class="header-actions">
          <span class="user-email">{{ user?.email }}</span>
          <button @click="handleLogout" class="logout-btn">
            <svg class="logout-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Выйти
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="dashboard-content">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <h1 class="welcome-title">
          Добро пожаловать, <span class="highlight">{{ user?.nickname }}</span>!
        </h1>
        <p class="welcome-text">Лесной Кемп 2026 ждёт тебя</p>
      </div>

      <!-- Status Banner -->
      <div v-if="user?.status === 'pending'" class="status-banner pending">
        <div class="banner-icon-wrapper">
          <svg class="banner-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div class="banner-content">
          <h3 class="banner-title">Заявка на рассмотрении</h3>
          <p class="banner-text">Мы проверяем вашу заявку. Обычно это занимает 1-2 рабочих дня.</p>
        </div>
      </div>

      <div v-else-if="user?.status === 'approved'" class="status-banner approved">
        <div class="banner-icon-wrapper approved">
          <svg class="banner-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div class="banner-content">
          <h3 class="banner-title">Заявка одобрена!</h3>
          <p class="banner-text">Поздравляем! Вы можете участвовать в мероприятии.</p>
        </div>
      </div>

      <div v-else-if="user?.status === 'rejected'" class="status-banner rejected">
        <div class="banner-icon-wrapper rejected">
          <svg class="banner-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div class="banner-content">
          <h3 class="banner-title">Заявка отклонена</h3>
          <p class="banner-text">К сожалению, ваша заявка была отклонена. Свяжитесь с нами для уточнения.</p>
        </div>
      </div>

      <!-- Cards Grid -->
      <div class="cards-grid">
        <!-- Profile Card -->
        <div class="glass-card profile-card">
          <div class="card-header">
            <h2 class="card-title">
              <svg class="title-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Профиль
            </h2>
          </div>

          <div class="profile-content">
            <!-- Avatar Section -->
            <div class="avatar-section">
              <div class="avatar-wrapper">
                <div class="avatar-glow"></div>
                <div class="avatar">
                  <img v-if="user?.avatar" :src="user.avatar" alt="Avatar" />
                  <span v-else class="avatar-letter">{{ user?.nickname?.[0]?.toUpperCase() }}</span>
                </div>
                <div class="avatar-ring"></div>
              </div>
              <h3 class="profile-name">{{ user?.nickname }}</h3>
              <p class="profile-email">{{ user?.email }}</p>
            </div>

            <!-- Info Section -->
            <div class="info-section">
              <div class="info-item">
                <div class="info-icon-wrapper">
                  <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                </div>
                <div class="info-content">
                  <span class="info-label">Телефон</span>
                  <span class="info-value">{{ user?.phone }}</span>
                </div>
              </div>

              <div class="info-item">
                <div class="info-icon-wrapper telegram">
                  <svg class="info-icon" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.154.232.17.327.015.095.034.312.019.482z"/>
                  </svg>
                </div>
                <div class="info-content">
                  <span class="info-label">Telegram</span>
                  <a :href="'https://' + user?.telegram" target="_blank" class="info-link">
                    {{ user?.telegram }}
                    <svg class="external-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                  </a>
                </div>
              </div>

              <div v-if="user?.description" class="info-item description">
                <div class="info-icon-wrapper">
                  <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/>
                  </svg>
                </div>
                <div class="info-content">
                  <span class="info-label">О себе</span>
                  <p class="info-description">{{ user?.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Card -->
        <div class="glass-card status-card">
          <div class="card-header">
            <h2 class="card-title">
              <svg class="title-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              Статус заявки
            </h2>
          </div>

          <div class="status-content">
            <div class="status-indicator" :class="user?.status">
              <span class="status-dot"></span>
              <span class="status-text">{{ statusLabels[user?.status || 'pending'] }}</span>
            </div>

            <p class="status-description">
              {{ statusDescriptions[user?.status || 'pending'] }}
            </p>

            <!-- Timeline -->
            <div class="timeline">
              <div class="timeline-item completed">
                <div class="timeline-dot"></div>
                <span>Регистрация</span>
              </div>
              <div class="timeline-item" :class="{ completed: user?.status !== 'pending' }">
                <div class="timeline-dot"></div>
                <span>Проверка</span>
              </div>
              <div class="timeline-item" :class="{ completed: user?.status === 'approved' }">
                <div class="timeline-dot"></div>
                <span>Участие</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Event Info Card -->
        <div class="glass-card event-card">
          <div class="card-header">
            <h2 class="card-title">
              <svg class="title-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              Мероприятие
            </h2>
          </div>

          <div class="event-content">
            <div class="event-name">Лесной Кемп 2026</div>

            <!-- Basic info for all users -->
            <div v-if="user?.status !== 'approved'" class="event-details">
              <div class="event-detail">
                <svg class="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <span>Локация после одобрения</span>
              </div>
            </div>

            <!-- Full info for approved users -->
            <div v-else class="approved-info">
              <div class="info-block">
                <h4 class="info-block-title">
                  <svg class="block-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  Локация
                </h4>
                <p class="info-block-text">Московская область, Дмитровский район</p>
                <p class="info-block-subtext">Точные координаты будут отправлены за неделю до мероприятия</p>
              </div>

              <div class="info-block payment">
                <h4 class="info-block-title">
                  <svg class="block-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                  </svg>
                  Оплата участия
                </h4>
                <p class="info-block-text">Стоимость: <strong>3500 ₽</strong></p>
                <div class="payment-details">
                  <p>Сбербанк: <span class="payment-value">2202 2061 7891 2345</span></p>
                  <p>Получатель: <span class="payment-value">Иванов И.И.</span></p>
                </div>
                <p class="info-block-subtext">В комментарии укажите ваш никнейм</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user)

const statusLabels: Record<string, string> = {
  pending: 'На рассмотрении',
  approved: 'Одобрено',
  rejected: 'Отклонено'
}

const statusDescriptions: Record<string, string> = {
  pending: 'Ваша заявка находится на рассмотрении. Обычно это занимает 1-2 рабочих дня.',
  approved: 'Поздравляем! Ваша заявка одобрена. Вы можете участвовать в мероприятии.',
  rejected: 'К сожалению, ваша заявка была отклонена. Свяжитесь с нами для уточнения.'
}

function particleStyle(i: number) {
  return {
    '--delay': `${Math.random() * 5}s`,
    '--duration': `${10 + Math.random() * 10}s`,
    '--x': `${Math.random() * 100}%`,
    '--size': `${2 + Math.random() * 3}px`
  }
}

onMounted(() => {
  authStore.fetchUser()
})

function handleLogout() {
  authStore.logout()
  router.push('/auth')
}
</script>

<style scoped>
.dashboard-page {
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Particles */
.particles {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.particle {
  position: absolute;
  bottom: -10px;
  left: var(--x);
  width: var(--size);
  height: var(--size);
  background: radial-gradient(circle, var(--fire-glow), transparent);
  border-radius: 50%;
  animation: float-up var(--duration) var(--delay) infinite ease-out;
  opacity: 0;
}

@keyframes float-up {
  0% { transform: translateY(0) scale(1); opacity: 0; }
  10% { opacity: 0.6; }
  90% { opacity: 0.2; }
  100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
}

/* Header */
.dashboard-header {
  position: relative;
  z-index: 100;
  background: rgba(26, 17, 14, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--moss);
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-email {
  color: var(--sage);
  font-size: 0.9rem;
}

.logout-btn {
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
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255, 107, 53, 0.2);
  border-color: var(--fire);
}

.logout-icon {
  width: 16px;
  height: 16px;
}

/* Main Content */
.dashboard-content {
  position: relative;
  z-index: 10;
  max-width: min(1200px, 95vw);
  margin: 0 auto;
  padding: clamp(0.5rem, 2vw, 2rem);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Welcome */
.welcome-section {
  text-align: center;
  margin-bottom: clamp(0.5rem, 1.5vw, 1rem);
  flex-shrink: 0;
}

.welcome-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.5rem, 3.5vw, 2.5rem);
  color: var(--cream);
  margin-bottom: 0.5rem;
}

.welcome-title .highlight {
  color: var(--fire-glow);
}

.welcome-text {
  color: var(--sage);
  font-size: clamp(0.9rem, 1.8vw, 1.1rem);
}

/* Status Banner */
.status-banner {
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1vw, 0.75rem);
  padding: clamp(0.5rem, 1vw, 0.75rem) clamp(0.75rem, 1.5vw, 1rem);
  border-radius: 12px;
  margin-bottom: clamp(0.5rem, 1vw, 0.75rem);
  flex-shrink: 0;
}

.status-banner.pending {
  background: rgba(255, 179, 71, 0.1);
  border: 1px solid rgba(255, 179, 71, 0.3);
}

.status-banner.approved {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-banner.rejected {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.banner-icon-wrapper {
  width: clamp(32px, 4vw, 40px);
  height: clamp(32px, 4vw, 40px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 179, 71, 0.2);
  border-radius: 10px;
  flex-shrink: 0;
}

.banner-icon-wrapper.approved {
  background: rgba(34, 197, 94, 0.2);
}

.banner-icon-wrapper.rejected {
  background: rgba(239, 68, 68, 0.2);
}

.banner-icon {
  width: clamp(16px, 2vw, 20px);
  height: clamp(16px, 2vw, 20px);
  color: var(--fire-glow);
}

.banner-icon-wrapper.approved .banner-icon {
  color: #22c55e;
}

.banner-icon-wrapper.rejected .banner-icon {
  color: #ef4444;
}

.banner-title {
  font-size: clamp(0.9rem, 1.8vw, 1.1rem);
  font-weight: 600;
  color: var(--cream);
  margin-bottom: 4px;
}

.banner-text {
  font-size: clamp(0.8rem, 1.5vw, 0.95rem);
  color: var(--sage);
}

/* Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: clamp(0.5rem, 1vw, 0.75rem);
  flex: 1;
  min-height: 0;
}

/* Glass Card Override for Dashboard */
.glass-card {
  padding: clamp(0.5rem, 1vw, 1rem);
  background: linear-gradient(
    135deg,
    rgba(42, 31, 26, 0.4) 0%,
    rgba(61, 45, 36, 0.3) 100%
  );
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Profile Card */
.profile-card {
  grid-row: span 2;
}

.card-header {
  margin-bottom: clamp(0.25rem, 0.5vw, 0.5rem);
  flex-shrink: 0;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.1rem, 2vw, 1.4rem);
  color: var(--fire-glow);
}

.title-icon {
  width: clamp(20px, 2.5vw, 28px);
  height: clamp(20px, 2.5vw, 28px);
}

/* Profile Content */
.profile-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

/* Avatar */
.avatar-section {
  text-align: center;
  margin-bottom: clamp(0.25rem, 0.5vw, 0.5rem);
  padding-bottom: clamp(0.25rem, 0.5vw, 0.5rem);
  border-bottom: 1px solid var(--moss);
}

.avatar-wrapper {
  position: relative;
  width: clamp(60px, 8vw, 90px);
  height: clamp(60px, 8vw, 90px);
  margin: 0 auto clamp(0.5rem, 1vw, 1rem);
}

.avatar-glow {
  position: absolute;
  inset: -10px;
  background: radial-gradient(circle, rgba(255, 107, 53, 0.3), transparent 70%);
  filter: blur(15px);
  animation: pulse-glow 3s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

.avatar {
  position: relative;
  width: 100%;
  height: 100%;
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
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  color: var(--fire-glow);
}

.avatar-ring {
  position: absolute;
  inset: -3px;
  border: 2px solid var(--fire);
  border-radius: 50%;
  animation: ring-rotate 10s linear infinite;
}

@keyframes ring-rotate {
  100% { transform: rotate(360deg); }
}

.profile-name {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.2rem, 2.5vw, 1.6rem);
  color: var(--cream);
  margin-bottom: 4px;
}

.profile-email {
  font-size: clamp(0.9rem, 1.5vw, 1.1rem);
  color: var(--sage);
}

/* Info Items */
.info-section {
  display: flex;
  flex-direction: column;
  gap: clamp(0.3rem, 0.6vw, 0.5rem);
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.info-icon-wrapper {
  width: clamp(36px, 4vw, 44px);
  height: clamp(36px, 4vw, 44px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 107, 53, 0.1);
  border-radius: 8px;
  flex-shrink: 0;
}

.info-icon-wrapper.telegram {
  background: rgba(0, 136, 204, 0.1);
}

.info-icon {
  width: 20px;
  height: 20px;
  color: var(--fire);
}

.info-icon-wrapper.telegram .info-icon {
  color: #0088cc;
}

.info-content {
  flex: 1;
}

.info-label {
  display: block;
  font-size: clamp(0.8rem, 1.2vw, 0.95rem);
  color: var(--sage);
  margin-bottom: 2px;
}

.info-value {
  color: var(--cream);
  font-size: clamp(0.95rem, 1.5vw, 1.1rem);
}

.info-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--fire-glow);
  text-decoration: none;
  font-size: clamp(0.95rem, 1.5vw, 1.1rem);
  transition: color 0.3s ease;
}

.info-link:hover {
  color: var(--fire);
}

.external-icon {
  width: 14px;
  height: 14px;
}

.info-description {
  color: var(--cream);
  font-size: 0.9rem;
  line-height: 1.5;
}

/* Status Card */
.status-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 10px;
  width: fit-content;
}

.status-indicator.pending {
  background: rgba(255, 179, 71, 0.1);
}

.status-indicator.approved {
  background: rgba(34, 197, 94, 0.1);
}

.status-indicator.rejected {
  background: rgba(239, 68, 68, 0.1);
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: dot-pulse 1.5s ease-in-out infinite;
}

.status-indicator.pending .status-dot {
  background: var(--fire-glow);
}

.status-indicator.approved .status-dot {
  background: #22c55e;
}

.status-indicator.rejected .status-dot {
  background: #ef4444;
}

@keyframes dot-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.status-text {
  font-weight: 600;
  color: var(--cream);
  font-size: clamp(1rem, 1.5vw, 1.2rem);
}

.status-description {
  font-size: clamp(0.95rem, 1.4vw, 1.1rem);
  color: var(--sage);
  line-height: 1.5;
}

/* Timeline */
.timeline {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--moss);
}

.timeline-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: clamp(0.9rem, 1.3vw, 1.05rem);
  color: var(--sage);
}

.timeline-item.completed {
  color: var(--fire-glow);
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--moss);
  border: 2px solid var(--moss);
}

.timeline-item.completed .timeline-dot {
  background: var(--fire);
  border-color: var(--fire-glow);
}

/* Event Card */
.event-content {
  text-align: center;
}

.event-name {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.2rem, 2.5vw, 1.6rem);
  color: var(--cream);
  margin-bottom: 0.75rem;
}

.event-details {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.event-detail {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--sage);
  font-size: clamp(0.95rem, 1.4vw, 1.1rem);
}

.detail-icon {
  width: 18px;
  height: 18px;
  color: var(--fire);
}

/* Approved Info */
.approved-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
}

.info-block {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 10px;
  padding: clamp(0.75rem, 1.5vw, 1rem);
}

.info-block.payment {
  background: rgba(255, 179, 71, 0.1);
  border-color: rgba(255, 179, 71, 0.3);
}

.info-block-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Playfair Display', serif;
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  color: var(--cream);
  margin-bottom: 0.5rem;
}

.block-icon {
  width: 18px;
  height: 18px;
  color: #22c55e;
}

.info-block.payment .block-icon {
  color: var(--fire-glow);
}

.info-block-text {
  font-size: clamp(0.9rem, 1.3vw, 1.05rem);
  color: var(--cream);
  margin-bottom: 0.25rem;
}

.info-block-text strong {
  color: var(--fire-glow);
}

.info-block-subtext {
  font-size: clamp(0.8rem, 1.1vw, 0.9rem);
  color: var(--sage);
  font-style: italic;
}

.payment-details {
  background: rgba(26, 17, 14, 0.4);
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  margin: 0.5rem 0;
}

.payment-details p {
  font-size: clamp(0.85rem, 1.2vw, 0.95rem);
  color: var(--sage);
  margin-bottom: 0.25rem;
}

.payment-details p:last-child {
  margin-bottom: 0;
}

.payment-value {
  color: var(--cream);
  font-family: monospace;
}

/* Responsive */
@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }

  .profile-card {
    grid-row: auto;
  }

  .welcome-title {
    font-size: 1.75rem;
  }

  .header-content {
    padding: 1rem;
  }

  .user-email {
    display: none;
  }

  .dashboard-content {
    padding: 1rem;
  }
}
</style>
