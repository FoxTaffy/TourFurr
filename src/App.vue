<template>
  <div id="app" class="min-h-screen bg-black text-white overflow-x-hidden">
    <!-- Hero Section -->
    <HeroSection />
    
    <!-- Мистический разделитель -->
    <div class="section-divider"></div>
    
    <!-- Info Section -->
    <InfoSection />
    
    <!-- Мистический разделитель -->
    <div class="section-divider"></div>
    
    <!-- Program Section -->
    <ProgramSection />
    
    <!-- Мистический разделитель -->
    <div class="section-divider"></div>
    
    <!-- Checklist Section -->
    <ChecklistSection />
    
    <!-- Мистический разделитель -->
    <div class="section-divider"></div>
    
    <!-- Gallery Section -->
    <GallerySection />
    
    <!-- Мистический разделитель -->
    <div class="section-divider"></div>
    
    <!-- Reviews Section -->
    <ReviewsSection />
    
    <!-- Мистический разделитель -->
    <div class="section-divider"></div>
    
    <!-- Contacts Section -->
    <ContactsSection />

    <!-- Плавающие мистические эффекты -->
    <div class="fixed bottom-8 right-8 z-50">
      <button class="w-14 h-14 bg-gradient-to-br from-gold to-fire rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-300 shadow-lg"
              @click="toggleMysticalMode"
              :class="{ 'animate-glow': mysticalMode }">
        <i class="fas fa-fire text-xl text-white"></i>
      </button>
    </div>

    <!-- Мистический фон -->
    <div class="fixed inset-0 pointer-events-none z-0 particle-effect opacity-10"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import HeroSection from './components/HeroSection.vue'
import InfoSection from './components/InfoSection.vue'
import ProgramSection from './components/ProgramSection.vue'
import ChecklistSection from './components/ChecklistSection.vue'
import GallerySection from './components/GallerySection.vue'
import ReviewsSection from './components/ReviewsSection.vue'
import ContactsSection from './components/ContactsSection.vue'

const mysticalMode = ref(false)
const showMysticalBurst = ref(false)

const toggleMysticalMode = () => {
  mysticalMode.value = !mysticalMode.value
  
  if (mysticalMode.value) {
    document.body.style.filter = 'hue-rotate(20deg) saturate(1.1) brightness(1.05)'
    console.log('🔥 Мистический режим активирован')
    triggerMysticalBurst()
  } else {
    document.body.style.filter = 'none'
    console.log('⚡ Обычный режим восстановлен')
  }
}

const triggerMysticalBurst = () => {
  showMysticalBurst.value = true
  setTimeout(() => {
    showMysticalBurst.value = false
  }, 1500)
}

onMounted(() => {
  // Мягкие мистические эффекты
  setInterval(() => {
    if (Math.random() < 0.05) { // 5% шанс каждые 3 секунды
      const body = document.body
      const currentFilter = body.style.filter
      body.style.filter = 'brightness(1.05) saturate(1.05)'
      setTimeout(() => {
        body.style.filter = currentFilter
      }, 200)
    }
  }, 3000)

  // Консольное сообщение в стиле Inscryption (упрощенное)
  console.log(`
  ═══════════════════════════════════════
    🎴 Добро пожаловать в TourFurr.camp 🎴
  ═══════════════════════════════════════
  
  Готов к мистическому приключению?
  
  ═══════════════════════════════════════
  `)
})

onUnmounted(() => {
  // Очистка при размонтировании
})
</script>

<style>
@import './style.css';

/* Глобальные эффекты для приложения */
#app {
  position: relative;
  background-attachment: fixed;
}

/* Плавная загрузка приложения */
@keyframes appLoad {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

#app {
  animation: appLoad 1s ease-out;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .particle-effect::before {
    font-size: 10px;
    letter-spacing: 60px;
    line-height: 60px;
  }
}

/* Сниженная анимация для пользователей с ограниченными возможностями */
@media (prefers-reduced-motion: reduce) {
  #app {
    animation: none;
  }
  
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>