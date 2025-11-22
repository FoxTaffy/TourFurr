<template>
  <div class="auth-page">
    <!-- Animated Background -->
    <div class="bg-forest"></div>
    <div class="fog"></div>

    <!-- Floating Particles -->
    <div class="particles">
      <div v-for="i in 20" :key="i" class="particle" :style="particleStyle(i)"></div>
    </div>

    <!-- Main Container -->
    <div class="auth-container">
      <!-- Logo/Title -->
      <div class="auth-header">
        <div class="logo-glow"></div>
        <h1 class="logo">
          <span class="logo-tour">Tour</span><span class="logo-furr">Furr</span>
        </h1>
        <p class="subtitle">Добро пожаловать в мир приключений</p>
        <div class="fire-embers">
          <span v-for="i in 5" :key="i" class="ember"></span>
        </div>
      </div>

      <!-- Auth Card -->
      <div class="glass-card auth-card">
        <!-- Tabs -->
        <div class="tabs">
          <button
            @click="activeTab = 'login'"
            class="tab"
            :class="{ active: activeTab === 'login' }"
          >
            <svg class="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
            </svg>
            Вход
          </button>
          <button
            @click="activeTab = 'register'"
            class="tab"
            :class="{ active: activeTab === 'register' }"
          >
            <svg class="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
            Регистрация
          </button>
          <div class="tab-indicator" :class="{ right: activeTab === 'register' }"></div>
        </div>

        <!-- Forms -->
        <div class="form-container">
          <LoginForm v-if="activeTab === 'login'" />
          <RegisterForm v-else />
        </div>
      </div>

      <!-- Back to Home -->
      <router-link to="/" class="back-link">
        <svg class="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Вернуться на главную
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LoginForm from '../components/auth/LoginForm.vue'
import RegisterForm from '../components/auth/RegisterForm.vue'

const activeTab = ref<'login' | 'register'>('login')

function particleStyle(i: number) {
  return {
    '--delay': `${Math.random() * 5}s`,
    '--duration': `${10 + Math.random() * 10}s`,
    '--x': `${Math.random() * 100}%`,
    '--size': `${2 + Math.random() * 3}px`
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  position: relative;
  overflow: hidden;
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
  0% {
    transform: translateY(0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.3;
  }
  100% {
    transform: translateY(-100vh) scale(0.5);
    opacity: 0;
  }
}

/* Container */
.auth-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 440px;
}

/* Header */
.auth-header {
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
}

.logo-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 107, 53, 0.3), transparent 70%);
  filter: blur(40px);
  animation: pulse-glow 3s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
}

.logo {
  font-family: 'Playfair Display', serif;
  font-size: 3.5rem;
  font-weight: 900;
  position: relative;
  margin-bottom: 0.5rem;
}

.logo-tour {
  color: var(--cream);
  text-shadow: 0 0 20px rgba(255, 239, 213, 0.3);
}

.logo-furr {
  color: var(--fire);
  text-shadow: 0 0 30px rgba(255, 107, 53, 0.5);
  animation: fire-flicker 2s ease-in-out infinite;
}

@keyframes fire-flicker {
  0%, 100% { text-shadow: 0 0 30px rgba(255, 107, 53, 0.5); }
  50% { text-shadow: 0 0 40px rgba(255, 179, 71, 0.7), 0 0 60px rgba(255, 107, 53, 0.4); }
}

.subtitle {
  color: var(--sage);
  font-size: 1rem;
  letter-spacing: 0.05em;
}

.fire-embers {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
}

.ember {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--fire);
  border-radius: 50%;
  animation: ember-rise 2s ease-out infinite;
}

.ember:nth-child(1) { left: -20px; animation-delay: 0s; }
.ember:nth-child(2) { left: -10px; animation-delay: 0.3s; }
.ember:nth-child(3) { left: 0px; animation-delay: 0.6s; }
.ember:nth-child(4) { left: 10px; animation-delay: 0.9s; }
.ember:nth-child(5) { left: 20px; animation-delay: 1.2s; }

@keyframes ember-rise {
  0% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(-30px) scale(0); opacity: 0; }
}

/* Auth Card */
.auth-card {
  padding: 2rem;
  background: linear-gradient(
    135deg,
    rgba(42, 31, 26, 0.4) 0%,
    rgba(61, 45, 36, 0.3) 100%
  );
  backdrop-filter: blur(20px) saturate(150%);
  -webkit-backdrop-filter: blur(20px) saturate(150%);
}

/* Tabs */
.tabs {
  display: flex;
  position: relative;
  background: rgba(26, 17, 14, 0.6);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 2rem;
}

.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: var(--sage);
  font-family: 'Lora', serif;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.tab:hover {
  color: var(--cream);
}

.tab.active {
  color: var(--cream);
}

.tab-icon {
  width: 18px;
  height: 18px;
}

.tab-indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: linear-gradient(135deg, var(--fire), var(--fire-glow));
  border-radius: 8px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
}

.tab-indicator.right {
  transform: translateX(100%);
}

/* Back Link */
.back-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 2rem;
  color: var(--sage);
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.back-link:hover {
  color: var(--fire-glow);
}

.back-link:hover .back-icon {
  transform: translateX(-4px);
}

.back-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

/* Form Container */
.form-container {
  min-height: 200px;
}

/* Responsive */
@media (max-width: 480px) {
  .auth-page {
    padding: 1rem;
  }

  .logo {
    font-size: 2.5rem;
  }

  .auth-card {
    padding: 1.5rem;
  }

  .tab {
    font-size: 0.85rem;
    padding: 10px 12px;
  }
}
</style>
