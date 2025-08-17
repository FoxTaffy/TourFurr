<template>
  <section class="hero-section relative min-h-screen flex items-center justify-center overflow-hidden particle-effect">
    <!-- Мистическая атмосфера фона -->
    <div class="absolute inset-0 bg-gradient-to-b from-black via-blood/20 to-dark">
      <!-- Тени деревьев -->
      <div class="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black to-transparent opacity-90"></div>
      
      <!-- Летающие карты с мистическими эффектами -->
      <div v-for="i in 6" :key="i" 
           class="absolute w-16 h-24 mystic-border opacity-20 animate-float hidden md:block"
           :style="{
             left: Math.random() * 80 + 10 + '%',
             top: Math.random() * 60 + 20 + '%',
             animationDelay: Math.random() * 3 + 's',
             transform: `rotate(${Math.random() * 30 - 15}deg)`,
             animationDuration: (Math.random() * 2 + 4) + 's'
           }">
        <!-- Символы на картах -->
        <div class="absolute inset-0 flex items-center justify-center text-gold">
          <i :class="[getRandomCardIcon(i), 'text-xl']"></i>
        </div>
      </div>

      <!-- Мистические огоньки -->
      <div v-for="i in 4" :key="`light-${i}`"
           class="absolute w-3 h-3 candle-light rounded-full hidden md:block"
           :style="{
             left: Math.random() * 90 + 5 + '%',
             top: Math.random() * 80 + 10 + '%',
             animationDelay: Math.random() * 2 + 's'
           }">
      </div>
    </div>

    <!-- Основной контент -->
    <div class="relative z-10 text-center px-4 max-w-5xl mx-auto">
      <!-- Логотип/Иконка -->
      <div class="mb-8 animate-fade-in">
        <div class="relative inline-block">
          <i class="fas fa-campground text-7xl md:text-8xl neon-glow"></i>
          <!-- Мистические символы вокруг -->
          <div class="absolute -top-2 -left-2 text-lg text-gold opacity-60">✦</div>
          <div class="absolute -top-2 -right-2 text-lg text-gold opacity-60">✧</div>
          <div class="absolute -bottom-2 -left-2 text-lg text-gold opacity-60">◆</div>
          <div class="absolute -bottom-2 -right-2 text-lg text-gold opacity-60">◇</div>
        </div>
      </div>

      <!-- Главный заголовок -->
      <h1 class="text-6xl md:text-8xl horror-text mb-8 animate-fade-in font-bold">
        TourFurr<span class="text-4xl md:text-6xl opacity-80"></span>
      </h1>

      <!-- Подзаголовок с эффектами -->
      <div class="text-xl md:text-2xl mb-8 ancient-text animate-slide-up">
        <p class="mb-4">
          <span class="font-bold text-fire">90 фуррей</span> — 
          <span class="neon-glow">один лагерь</span>
        </p>
        <p class="text-lg md:text-xl opacity-90">
          Атмосфера <span class="ritual-text">Inscryption</span> в реальности
        </p>
      </div>

      <!-- Мистическое описание -->
      <div class="text-lg text-gray-300 mb-10 max-w-3xl mx-auto animate-slide-up">
        <div class="inscryption-card p-8">
          <div class="space-y-4">
            <p class="flex items-center">
              <i class="fas fa-skull mr-3 text-accent ember-effect"></i>
              <span class="ancient-text">Войди в лес, где карты решают судьбу</span>
            </p>
            <p class="flex items-center">
              <i class="fas fa-fire mr-3 text-accent ember-effect"></i>
              <span class="ancient-text">Костёр согревает души, но тени таят секреты</span>
            </p>
            <p class="flex items-center">
              <i class="fas fa-eye mr-3 text-accent ember-effect"></i>
              <span class="ancient-text">Готов ли ты к игре, где ставка — твоя душа?</span>
            </p>
          </div>
        </div>
      </div>

      <!-- CTA Кнопки в стиле Inscryption -->
      <div class="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up">
        <a href="https://t.me/tourfurr_bot" target="_blank" 
           class="btn-inscryption text-lg px-8 py-4 group interactive-element">
          <i class="fab fa-telegram mr-3"></i>
          <span>Войти в игру</span>
          <i class="fas fa-arrow-right ml-3"></i>
        </a>
        
        <button @click="scrollToInfo" 
                class="btn-inscryption bg-transparent border-2 border-gold text-gold hover:bg-gold hover:text-dark text-lg px-8 py-4 interactive-element">
          <i class="fas fa-scroll mr-3"></i>
          <span>Изучить тайны</span>
          <i class="fas fa-chevron-down ml-3"></i>
        </button>
      </div>

      <!-- Предупреждение в стиле игры -->
      <div class="mt-12 animate-fade-in">
        <div class="inscryption-card p-6 max-w-2xl mx-auto">
          <div class="flex items-center justify-center text-center">
            <i class="fas fa-exclamation-triangle mr-3 text-yellow-400"></i>
            <p class="text-yellow-200 text-sm">
              <span class="font-semibold">Внимание:</span>
              <span class="ml-2">Выход из игры может оказаться невозможным</span>
            </p>
            <i class="fas fa-question ml-3 text-yellow-400 animate-flicker"></i>
          </div>
        </div>
      </div>

      <!-- Декоративные элементы по углам -->
      <div class="absolute top-20 left-10 text-gold opacity-30 animate-float hidden md:block" 
           :style="{ animationDelay: '2s' }">
        <i class="fas fa-fire text-2xl"></i>
      </div>
      <div class="absolute top-32 right-20 text-green opacity-25 animate-float hidden md:block">
        <i class="fas fa-tree text-3xl"></i>
      </div>
      <div class="absolute bottom-32 left-20 text-fire opacity-25 animate-float hidden md:block">
        <i class="fas fa-dice text-xl"></i>
      </div>
      <div class="absolute bottom-32 right-20 text-gold opacity-30 animate-float hidden md:block">
        <i class="fas fa-crown text-xl"></i>
      </div>
    </div>

    <!-- Мистические частицы внизу -->
    <div class="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
      <div v-for="i in 8" :key="`particle-${i}`"
           class="absolute text-gold text-sm opacity-30 animate-float"
           :style="{
             left: i * 12.5 + '%',
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
  'fas fa-crow', 'fas fa-cat', 'fas fa-wolf',
  'fas fa-dragon', 'fas fa-snake', 'fas fa-fish'
]

const mysticalSymbols = ['✦', '✧', '◆', '◇', '▲', '▼']

const getRandomCardIcon = (index: number): string => {
  return cardIcons[index % cardIcons.length]
}

const getRandomSymbol = (): string => {
  return mysticalSymbols[Math.floor(Math.random() * mysticalSymbols.length)]
}
</script>