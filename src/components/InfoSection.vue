<template>
    <section id="info-section" class="py-20 px-4 relative particle-effect">
      <div class="max-w-6xl mx-auto">
        <!-- Заголовок секции в стиле Inscryption -->
        <h2 class="text-4xl md:text-6xl text-center mb-16 animate-fade-in">
          <span class="horror-text">
            <i class="fas fa-map-marker-alt mr-4 ember-effect"></i>
            Тайны лагеря
          </span>
          <div class="text-lg ancient-text mt-4 opacity-80">
            <i class="fas fa-scroll mr-2"></i>
            Изучи детали перед началом игры...
            <i class="fas fa-scroll ml-2"></i>
          </div>
        </h2>
  
        <div class="grid lg:grid-cols-2 gap-12">
          <!-- Основная информация -->
          <div class="inscryption-card p-8 animate-fade-in mystical-hover">
            <h3 class="text-3xl font-bold mb-8 carved-text border-b-2 border-gold pb-4">
              <i class="fas fa-info-circle mr-3 ember-effect"></i>
              Священные знания
            </h3>
            
            <div class="space-y-6">
              <div class="flex items-center text-lg p-4 mystic-border interactive-element">
                <i class="fas fa-map-marker-alt text-4xl mr-6 candle-light animate-flicker"></i>
                <div>
                  <span class="text-gray-300 ancient-text">Место силы:</span>
                  <div class="text-white font-bold text-xl shadow-text">{{ campInfo.location }}</div>
                  <div class="text-sm text-gray-400 mt-1">
                    <i class="fas fa-tree mr-1"></i>
                    Древний лес с мистической энергией
                  </div>
                </div>
              </div>
              
              <div class="flex items-center text-lg p-4 mystic-border interactive-element">
                <i class="fas fa-calendar-alt text-4xl mr-6 neon-glow animate-glow"></i>
                <div>
                  <span class="text-gray-300 ancient-text">Время ритуала:</span>
                  <div class="text-white font-bold text-xl shadow-text">{{ campInfo.date }}</div>
                  <div class="text-sm text-gray-400 mt-1">
                    <i class="fas fa-moon mr-1"></i>
                    Когда луна благоволит игрокам
                  </div>
                </div>
              </div>
              
              <div class="flex items-center text-lg p-4 mystic-border interactive-element">
                <i class="fas fa-coins text-4xl mr-6 ember-effect animate-float"></i>
                <div>
                  <span class="text-gray-300 ancient-text">Цена души:</span>
                  <div class="text-3xl font-bold ritual-text">{{ campInfo.price }}</div>
                  <div class="text-sm text-gray-400 mt-1">
                    <i class="fas fa-skull mr-1"></i>
                    Справедливая плата за приключение
                  </div>
                </div>
              </div>
              
              <div class="flex items-center text-lg p-4 mystic-border interactive-element">
                <i class="fas fa-users text-4xl mr-6 carved-text"></i>
                <div>
                  <span class="text-gray-300 ancient-text">Избранных душ:</span>
                  <div class="text-white font-bold text-xl shadow-text">до {{ campInfo.participants }}</div>
                  <div class="text-sm text-gray-400 mt-1">
                    <i class="fas fa-paw mr-1"></i>
                    Каждая душа ценна в этой игре
                  </div>
                </div>
              </div>
              
              <!-- Особое предупреждение -->
              <div class="mt-8 p-6 blood-border bg-gradient-to-r from-blood/40 to-dark/60 animate-flicker">
                <div class="flex items-center">
                  <i class="fas fa-exclamation-triangle text-3xl mr-4 ember-effect"></i>
                  <div>
                    <p class="text-yellow-300 font-bold text-lg ritual-text">Внимание, игрок!</p>
                    <p class="text-white mt-2">Бар оплачивается отдельно</p>
                    <p class="text-sm text-gray-400 mt-1">
                      <i class="fas fa-wine-glass mr-1 ember-effect"></i>
                      Эликсиры и зелья имеют свою цену...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Удобства лагеря -->
          <div class="inscryption-card p-8 animate-fade-in mystical-hover">
            <h3 class="text-3xl font-bold mb-8 carved-text border-b-2 border-gold pb-4">
              <i class="fas fa-castle mr-3 ember-effect"></i>
              Обители комфорта
            </h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div v-for="(facility, index) in facilities" :key="facility.name" 
                   class="facility-card p-4 mystic-border hover:blood-border transition-all duration-500 group interactive-element"
                   :style="{ animationDelay: `${index * 0.1}s` }">
                
                <!-- Иконка с эффектами -->
                <div class="text-center mb-3">
                  <i :class="facility.icon" 
                     class="text-4xl mb-2 group-hover:animate-float transition-all duration-300"
                     :class="getFacilityIconStyle(facility.name)"></i>
                  <div class="text-white font-semibold group-hover:text-gold transition-colors ancient-text">
                    {{ facility.name }}
                  </div>
                </div>
  
                <!-- Мистическое описание -->
                <div class="text-xs text-gray-400 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {{ getFacilityDescription(facility.name) }}
                </div>
  
                <!-- Декоративные элементы -->
                <div class="absolute top-1 right-1 opacity-20 group-hover:opacity-60 transition-opacity">
                  <span class="text-xs">{{ getMysticalSymbol(index) }}</span>
                </div>
              </div>
            </div>
  
            <!-- Особая достопримечательность -->
            <div class="mt-8 p-6 gold-highlight mystical-hover">
              <div class="text-center">
                <div class="text-4xl mb-4">
                  <i class="fas fa-spa mr-3 neon-glow animate-glow"></i>
                  <i class="fas fa-swimmer ml-3 ember-effect animate-float"></i>
                </div>
                <p class="text-2xl font-bold carved-text mb-2">
                  Баня-палатка с бассейном!
                </p>
                <p class="text-sm ancient-text text-gray-300">
                  Место очищения души перед великими испытаниями
                </p>
                <div class="mt-4 flex justify-center space-x-4 text-xs">
                  <span class="ember-effect">✦ Очищение ✦</span>
                  <span class="neon-glow">◆ Восстановление ◆</span>
                  <span class="ember-effect">✧ Медитация ✧</span>
                </div>
              </div>
            </div>
  
            <!-- Мистическая атмосфера -->
            <div class="mt-8 p-4 blood-border bg-gradient-to-br from-dark to-blood/20">
              <div class="text-center">
                <div class="text-lg ancient-text text-gold mb-2">
                  <i class="fas fa-eye mr-2 animate-flicker"></i>
                  Атмосфера лагеря
                  <i class="fas fa-eye ml-2 animate-flicker"></i>
                </div>
                <div class="grid grid-cols-3 gap-4 text-sm">
                  <div class="flex flex-col items-center">
                    <i class="fas fa-fire text-xl ember-effect mb-1"></i>
                    <span class="ancient-text">Мистика</span>
                  </div>
                  <div class="flex flex-col items-center">
                    <i class="fas fa-heart text-xl text-red-400 mb-1 animate-float"></i>
                    <span class="ancient-text">Уют</span>
                  </div>
                  <div class="flex flex-col items-center">
                    <i class="fas fa-mask text-xl carved-text mb-1"></i>
                    <span class="ancient-text">Тайна</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Декоративные мистические элементы -->
        <div class="absolute top-10 left-10 opacity-30 animate-float">
          <i class="fas fa-crow text-3xl carved-text"></i>
        </div>
        <div class="absolute top-20 right-10 opacity-30 animate-flicker">
          <i class="fas fa-spider text-2xl ember-effect"></i>
        </div>
        <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 opacity-20">
          <div class="text-xs ancient-text text-center">
            <div class="mb-2">◆ ◇ ▲ ▼ ◆ ◇</div>
            <div>Место, где карты обретают душу</div>
          </div>
        </div>
      </div>
    </section>
  </template>
  
  <script setup lang="ts">
  import type { CampInfo, Facility } from '../types'
  
  const campInfo: CampInfo = {
    location: 'Московская область 🌲',
    date: 'Начало августа (будет объявлено позже)',
    price: '8 000 ₽',
    participants: 90,
    mysticalLevel: 'high'
  }
  
  const facilities: Facility[] = [
    { icon: 'fas fa-restroom', name: 'Туалет', mystical: false },
    { icon: 'fas fa-shower', name: 'Душ', mystical: false },
    { icon: 'fas fa-tint', name: 'Вода', mystical: true },
    { icon: 'fas fa-wine-glass', name: 'Бар', mystical: true },
    { icon: 'fas fa-swimmer', name: 'Бассейн', mystical: true },
    { icon: 'fas fa-spa', name: 'Баня-палатка', mystical: true }
  ]
  
  const getFacilityIconStyle = (facilityName: string): string => {
    const styles: Record<string, string> = {
      'Туалет': 'text-gray-400',
      'Душ': 'text-blue-400',
      'Вода': 'neon-glow',
      'Бар': 'ember-effect',
      'Бассейн': 'text-blue-300 animate-glow',
      'Баня-палатка': 'ritual-text'
    }
    return styles[facilityName] || 'carved-text'
  }
  
  const getFacilityDescription = (facilityName: string): string => {
    const descriptions: Record<string, string> = {
      'Туалет': 'Место уединения и размышлений',
      'Душ': 'Омовение перед ритуалами',
      'Вода': 'Источник жизненной силы',
      'Бар': 'Эликсиры для храбрости',
      'Бассейн': 'Воды забвения и очищения',
      'Баня-палатка': 'Святилище огня и пара'
    }
    return descriptions[facilityName] || 'Загадочное место силы'
  }
  
  const getMysticalSymbol = (index: number): string => {
    const symbols = ['✦', '✧', '◆', '◇', '▲', '▼']
    return symbols[index % symbols.length]
  }
  </script>
  
  <style scoped>
  .facility-card {
    position: relative;
    border-radius: 8px;
    background: linear-gradient(135deg, 
      var(--inscryption-dark) 0%, 
      var(--inscryption-wood) 50%, 
      var(--inscryption-blood) 100%);
    transition: all 0.3s ease;
  }
  
  .facility-card:hover {
    transform: translateY(-5px) rotateX(5deg);
    box-shadow: 
      0 15px 30px rgba(0, 0, 0, 0.5),
      0 0 20px var(--inscryption-gold);
  }
  
  .facility-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, 
      transparent 30%, 
      rgba(212, 175, 55, 0.1) 50%, 
      transparent 70%);
    border-radius: 8px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .facility-card:hover::before {
    opacity: 1;
  }
  
  /* Анимации появления для карточек */
  .facility-card {
    animation: fadeIn 0.8s ease-out forwards;
    opacity: 0;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  </style>