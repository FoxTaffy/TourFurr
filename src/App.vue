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
    <div class="fixed bottom-10 right-10 z-50">
      <div class="candle-light w-16 h-16 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
           @click="toggleMysticalMode">
        <i class="fas fa-fire text-2xl ember-effect"></i>
      </div>
    </div>

    <!-- Мистический фон -->
    <div class="fixed inset-0 pointer-events-none z-0 particle-effect opacity-20"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import HeroSection from './components/HeroSection.vue'
import InfoSection from './components/InfoSection.vue'
import ProgramSection from './components/ProgramSection.vue'
import ChecklistSection from './components/ChecklistSection.vue'
import GallerySection from './components/GallerySection.vue'
import ReviewsSection from './components/ReviewsSection.vue'
import ContactsSection from './components/ContactsSection.vue'

const mysticalMode = ref(false)

const toggleMysticalMode = () => {
  mysticalMode.value = !mysticalMode.value
  
  if (mysticalMode.value) {
    document.body.style.filter = 'hue-rotate(30deg) saturate(1.2)'
    console.log('🔥 Мистический режим активирован...')
  } else {
    document.body.style.filter = 'none'
    console.log('⚡ Обычный режим восстановлен.')
  }
}

onMounted(() => {
  // Добавляем случайные мистические эффекты
  setInterval(() => {
    if (Math.random() < 0.1) { // 10% шанс каждую секунду
      const body = document.body
      body.style.filter = 'brightness(1.1) saturate(1.1)'
      setTimeout(() => {
        body.style.filter = mysticalMode.value ? 'hue-rotate(30deg) saturate(1.2)' : 'none'
      }, 200)
    }
  }, 1000)

  // Консольное сообщение в стиле Inscryption
  console.log(`
  ═══════════════════════════════════════
    🎴 Добро пожаловать в TourFurr.camp 🎴
  ═══════════════════════════════════════
  
  ▲ Карты ждут своего игрока...
  ◆ Лес шепчет древние тайны...
  ● Костёр готов согреть души...
  
  Готов ли ты к этому путешествию?
  
  ═══════════════════════════════════════
  `)
})
</script>

<style>
@import './style.css';

/* Глобальные эффекты для приложения */
#app {
  position: relative;
  background-attachment: fixed;
}

/* Специальные эффекты при загрузке */
@keyframes appLoad {
  0% {
    opacity: 0;
    transform: scale(0.95);
    filter: blur(5px);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    filter: blur(0px);
  }
}

#app {
  animation: appLoad 1.5s ease-out;
}

/* Мистические курсоры для разных элементов */
.mystical-cursor-fire {
  cursor: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2C8 2 4 8 4 12C4 16 8 20 12 20C16 20 20 16 20 12C20 8 16 2 12 2Z" fill="%23ff4500"/></svg>'), auto;
}

.mystical-cursor-skull {
  cursor: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2L14 8L20 6L16 12L22 14L16 16L20 18L14 16L12 22L10 16L4 18L8 16L2 14L8 12L4 6L10 8L12 2Z" fill="%23d4af37"/></svg>'), pointer;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .particle-effect::before {
    font-size: 8px;
    letter-spacing: 20px;
    line-height: 30px;
  }
  
  .hero-section {
    min-height: 100vh;
  }
  
  .card-stack::before,
  .card-stack::after {
    transform: translateZ(-2px) rotate(1deg);
  }
}

/* Темные темы для системных настроек */
@media (prefers-color-scheme: dark) {
  :root {
    --inscryption-bone: #f8f5f0;
  }
}

/* Сниженная анимация для пользователей с ограниченными возможностями */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>