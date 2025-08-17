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
        <div class="inscryption-card p-8 animate-fade-in">
          <h3 class="text-2xl font-bold mb-8 forest-text border-b border-gold/20 pb-4">
            <i class="fas fa-info-circle mr-3 text-gold"></i>
            Основная информация
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
        <div class="inscryption-card p-8 animate-fade-in">
          <h3 class="text-2xl font-bold mb-8 forest-text border-b border-gold/20 pb-4">
            <i class="fas fa-home mr-3 text-gold"></i>
            Удобства лагеря
          </h3>
          
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div v-for="(facility, index) in facilities" :key="facility.name" 
                 class="facility-card p-4 text-center group interactive-element"
                 :style="{ animationDelay: `${index * 0.1}s` }">
              
              <!-- Иконка с эффектами -->
              <div class="mb-3">
                <i :class="[facility.icon, 'text-3xl mb-2 group-hover:animate-float transition-all duration-300', getFacilityIconStyle(facility.name)]"></i>
                <div class="text-white font-medium group-hover:text-gold transition-colors">
                  {{ facility.name }}
                </div>
              </div>

              <!-- Мистическое описание -->
              <div class="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {{ getFacilityDescription(facility.name) }}
              </div>
            </div>
          </div>

          <!-- Особая достопримечательность -->
          <div class="mt-8 inscryption-card p-6">
            <div class="text-center">
              <div class="text-3xl mb-4">
                <i class="fas fa-spa mr-3 neon-glow"></i>
                <i class="fas fa-swimmer ml-3 text-blue-400"></i>
              </div>
              <h4 class="text-xl font-bold mb-2 carved-text">
                Баня-палатка с бассейном
              </h4>
              <p class="text-sm text-gray-300">
                Место релаксации и восстановления сил
              </p>
            </div>
          </div>
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
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(212, 175, 55, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.facility-card:hover {
  transform: translateY(-2px);
  border-color: rgba(212, 175, 55, 0.4);
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

/* Анимации появления для карточек */
.facility-card {
  animation: fadeIn 0.6s ease-out forwards;
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>