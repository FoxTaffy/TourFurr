<template>
    <section class="hero-section relative min-h-screen flex items-center justify-center overflow-hidden particle-effect">
      <!-- Мистическая атмосфера фона -->
      <div class="absolute inset-0 bg-gradient-to-b from-black via-blood/30 to-dark">
        <!-- Тени деревьев -->
        <div class="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black to-transparent opacity-90"></div>
        
        <!-- Летающие карты с мистическими эффектами -->
        <div v-for="i in 8" :key="i" 
             class="absolute w-20 h-32 mystic-border card-stack opacity-20 animate-float"
             :class="[
               i % 2 === 0 ? 'candle-light' : '',
               i % 3 === 0 ? 'mystical-hover' : ''
             ]"
             :style="{
               left: Math.random() * 80 + 10 + '%',
               top: Math.random() * 60 + 20 + '%',
               animationDelay: Math.random() * 3 + 's',
               transform: `rotate(${Math.random() * 45 - 22.5}deg)`,
               animationDuration: (Math.random() * 2 + 3) + 's'
             }">
          <!-- Символы на картах -->
          <div class="absolute inset-0 flex items-center justify-center text-gold">
            <i :class="getRandomCardIcon(i)" class="text-2xl ember-effect"></i>
          </div>
        </div>
  
        <!-- Мистические огоньки -->
        <div v-for="i in 5" :key="`light-${i}`"
             class="absolute w-4 h-4 candle-light rounded-full"
             :style="{
               left: Math.random() * 90 + 5 + '%',
               top: Math.random() * 80 + 10 + '%',
               animationDelay: Math.random() * 2 + 's'
             }">
        </div>
      </div>
  
      <!-- Основной контент -->
      <div class="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <!-- Логотип/Иконка в стиле Inscryption -->
        <div class="mb-8 animate-fade-in">
          <div class="relative inline-block">
            <i class="fas fa-campground text-9xl neon-glow animate-glow"></i>
            <!-- Мистические символы вокруг -->
            <div class="absolute -top-4 -left-4 text-3xl ember-effect">✦</div>
            <div class="absolute -top-4 -right-4 text-3xl ember-effect">✧</div>
            <div class="absolute -bottom-4 -left-4 text-3xl ember-effect">◆</div>
            <div class="absolute -bottom-4 -right-4 text-3xl ember-effect">◇</div>
          </div>
        </div>
  
        <!-- Главный заголовок -->
        <h1 class="text-7xl md:text-9xl horror-text mb-8 animate-fade-in">
          <span class="shadow-text">TourFurr</span>.<span class="carved-text">camp</span>
        </h1>
  
        <!-- Подзаголовок с эффектами -->
        <div class="text-2xl md:text-3xl mb-8 ancient-text animate-slide-up">
          <p class="mb-4">
            <span class="ember-effect font-bold">90 фуррей</span> — 
            <span class="neon-glow">один лагерь</span>
          </p>
          <p class="text-xl md:text-2xl">
            Атмосфера <span class="ritual-text">Inscryption</span> в реальности
          </p>
          <div class="section-divider mt-6"></div>
        </div>
  
        <!-- Мистическое описание -->
        <div class="text-lg text-gray-300 mb-10 max-w-3xl mx-auto animate-slide-up mystical-hover p-6 mystic-border">
          <p class="mb-3">
            <i class="fas fa-skull mr-2 text-accent ember-effect"></i>
            Войди в лес, где карты решают судьбу...
          </p>
          <p class="mb-3">
            <i class="fas fa-fire mr-2 text-accent ember-effect"></i>
            Костёр согревает души, но тени таят секреты...
          </p>
          <p>
            <i class="fas fa-eye mr-2 text-accent ember-effect"></i>
            Готов ли ты к игре, где ставка — твоя душа?
          </p>
        </div>
  
        <!-- CTA Кнопки в стиле Inscryption -->
        <div class="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up">
          <a href="https://t.me/tourfurr_bot" target="_blank" 
             class="btn-inscryption group interactive-element blood-border">
            <i class="fab fa-telegram mr-3 group-hover:animate-float"></i>
            <span class="carved-text">Войти в игру</span>
            <i class="fas fa-skull ml-3 ember-effect"></i>
          </a>
          
          <button @click="scrollToInfo" 
                  class="btn-inscryption bg-transparent gold-highlight interactive-element">
            <i class="fas fa-scroll mr-3 ember-effect"></i>
            <span class="ancient-text">Изучить тайны</span>
            <i class="fas fa-eye ml-3 neon-glow"></i>
          </button>
        </div>
  
        <!-- Предупреждение в стиле игры -->
        <div class="mt-12 p-4 blood-border rounded-lg bg-gradient-to-r from-blood/30 to-dark/50 animate-fade-in">
          <p class="text-yellow-300 flex items-center justify-center flex-wrap">
            <i class="fas fa-exclamation-triangle mr-2 ember-effect"></i>
            <span class="ritual-text text-lg">Внимание:</span>
            <span class="ml-2">Выход из игры может оказаться невозможным...</span>
            <i class="fas fa-question ml-2 animate-flicker"></i>
          </p>
        </div>
  
        <!-- Декоративные элементы по углам -->
        <div class="absolute top-10 left-10 text-accent opacity-60 animate-flicker">
          <i class="fas fa-fire text-3xl ember-effect"></i>
          <div class="text-xs mt-1 ancient-text">Огонь</div>
        </div>
        <div class="absolute top-20 right-20 text-neon opacity-50 animate-float">
          <i class="fas fa-tree text-4xl neon-glow"></i>
          <div class="text-xs mt-1 ancient-text">Лес</div>
        </div>
        <div class="absolute bottom-20 left-20 text-accent opacity-50 animate-flicker">
          <i class="fas fa-dice text-2xl ember-effect"></i>
          <div class="text-xs mt-1 ancient-text">Судьба</div>
        </div>
        <div class="absolute bottom-20 right-20 text-gold opacity-60 animate-float">
          <i class="fas fa-skull text-2xl carved-text"></i>
          <div class="text-xs mt-1 ancient-text">Цена</div>
        </div>
      </div>
  
      <!-- Мистические частицы внизу -->
      <div class="absolute bottom-0 left-0 right-0 h-20 overflow-hidden">
        <div v-for="i in 10" :key="`particle-${i}`"
             class="absolute text-gold text-sm opacity-30 animate-float"
             :style="{
               left: i * 10 + '%',
               animationDelay: i * 0.5 + 's',
               animationDuration: (3 + Math.random() * 2) + 's'
             }">
          {{ getRandomSymbol() }}
        </div>
      </div>
    </section>
  </template>
  
  <script setup lang="ts">
  const scrollToInfo = () => {
    const infoSection = document.querySelector('#info-section')
    if (infoSection) {
      infoSection.scrollIntoView({ behavior: 'smooth' })
    }
  }
  
  const cardIcons = [
    'fas fa-crow', 'fas fa-spider', 'fas fa-cat', 'fas fa-wolf',
    'fas fa-dragon', 'fas fa-snake', 'fas fa-bug', 'fas fa-fish'
  ]
  
  const mysticalSymbols = ['✦', '✧', '◆', '◇', '▲', '▼', '●', '◐', '◑', '◒']
  
  const getRandomCardIcon = (index: number): string => {
    return cardIcons[index % cardIcons.length]
  }
  
  const getRandomSymbol = (): string => {
    return mysticalSymbols[Math.floor(Math.random() * mysticalSymbols.length)]
  }
  </script>