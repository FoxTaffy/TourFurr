<template>
  <section class="py-20 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Section title -->
      <h2 class="text-4xl md:text-5xl font-metal text-center neon-glow mb-16 forest-text">
        <i class="fas fa-scroll mr-4 text-accent ember-effect"></i>
        Свидетельства выживших
        <i class="fas fa-feather ml-4 text-accent animate-float"></i>
      </h2>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="review in reviews" :key="review.id" 
             class="inscryption-card p-6 animate-fade-in hover:scale-105 transition-all duration-300 mystical-hover"
             :style="{ animationDelay: `${review.id * 0.2}s` }">
          
          <!-- Reviewer info with mystical elements -->
          <div class="flex items-center mb-4 relative">
            <!-- Mystical aura around avatar -->
            <div class="relative">
              <div class="w-16 h-16 bg-gradient-to-br from-neon to-accent rounded-full flex items-center justify-center mr-4 animate-float relative z-10"
                   :class="getAvatarEffect(review.furrySpecies)">
                <i :class="[getFurryIcon(review.furrySpecies), 'text-dark text-xl']"></i>
              </div>
              <!-- Mystical glow effect -->
              <div class="absolute inset-0 w-16 h-16 rounded-full animate-glow opacity-50"
                   :class="getMysticalGlow(review.id)"></div>
              <!-- Species symbol -->

            </div>
            
            <div class="flex-1">
              <h4 class="text-lg font-bold text-white carved-text">{{ review.name }}</h4>
              <div class="text-xs text-gray-400 ancient-text mb-1">{{ review.mysticalTitle }}</div>
              <div class="flex text-accent">
                <i v-for="i in review.rating" :key="i" 
                   class="fas fa-star text-sm ember-effect"
                   :style="{ animationDelay: `${i * 0.1}s` }"></i>
              </div>
            </div>

            <!-- Mystical corner decoration -->
            <div class="absolute top-0 right-0 text-gold opacity-30 text-xs">
              {{ getMysticalRune(review.id) }}
            </div>
          </div>

          <!-- Review text with mystical styling -->
          <blockquote class="relative text-gray-300 italic leading-relaxed border-l-4 border-neon/50 pl-4 mb-4">
            <div class="absolute -left-2 -top-2 text-accent text-lg opacity-50">
              <i class="fas fa-quote-left"></i>
            </div>
            <span class="ancient-text">{{ review.text }}</span>
            <div class="absolute -right-2 -bottom-2 text-accent text-lg opacity-50">
              <i class="fas fa-quote-right"></i>
            </div>
          </blockquote>

          <!-- Experience indicators -->
          <div class="flex justify-center space-x-2 mb-4">
            <div v-for="experience in review.experiences" :key="experience"
                 class="text-xs px-2 py-1 rounded border border-accent/50 bg-blood/20 text-accent"
                 :class="getExperienceStyle(experience)">
              <i :class="[getExperienceIcon(experience), 'mr-1']"></i>
              {{ experience }}
            </div>
          </div>
        </div>
      </div>

      <!-- Mystical statistics -->
      <div class="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div v-for="stat in mysticalStats" :key="stat.label"
             class="inscryption-card p-4 text-center hover:blood-border transition-all duration-300">
          <div class="text-3xl mb-2">
            <i :class="[stat.icon, 'ember-effect']"></i>
          </div>
          <div class="text-2xl font-bold carved-text">{{ stat.value }}</div>
          <div class="text-sm ancient-text text-gray-400">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface MysticalReview {
  id: number
  name: string
  furrySpecies: string
  mysticalTitle: string
  rating: number
  text: string
  experienceType: string
  experiences: string[]
  likes?: number
}

interface MysticalStat {
  icon: string
  value: string
  label: string
}

const reviews: MysticalReview[] = [
  {
    id: 1,
    name: 'ЛисичкаАли',
    furrySpecies: 'fox',
    mysticalTitle: 'Хранительница лесных секретов',
    rating: 5,
    text: 'Лес принял меня как свою. Карты шептали правду, которую я искала всю жизнь. Костёр показал видения прошлого, а новые друзья стали семьёй. Это место изменило мою душу навсегда.',
    experienceType: 'spiritual',
    experiences: ['Карты', 'Мистика', 'Дружба'],
    likes: 23
  },
  {
    id: 2,
    name: 'ВолчараМакс',
    furrySpecies: 'wolf',
    mysticalTitle: 'Альфа ночного квеста',
    rating: 5,
    text: 'Баня-палатка стала местом перерождения, а ночной квест по лесу... Я видел то, что обычному человеку не дано. Тени танцевали вокруг нас, направляя к древним тайнам.',
    experienceType: 'adventure',
    experiences: ['Квесты', 'Баня', 'Мистика'],
    likes: 31
  },
  {
    id: 3,
    name: 'КотоЛуна',
    furrySpecies: 'cat',
    mysticalTitle: 'Новичок тёмных искусств',
    rating: 4,
    text: 'Первый раз в подобном месте, но атмосфера затянула с первой минуты. Хоррор-игры в палатках при свете свечей... Страшно и восхитительно одновременно. Обязательно вернусь за новыми ощущениями.',
    experienceType: 'initiation',
    experiences: ['Хоррор', 'Новичок', 'Атмосфера'],
    likes: 18
  },
  {
    id: 4,
    name: 'ДраконВладис',
    furrySpecies: 'dragon',
    mysticalTitle: 'Мастер древних карт',
    rating: 5,
    text: 'Как старожил подобных мероприятий, могу сказать - это лучший лагерь! Организация на уровне ритуала, каждая деталь продумана. Карточные турниры достойны легенд.',
    experienceType: 'mastery',
    experiences: ['Турниры', 'Ветеран', 'Организация'],
    likes: 45
  },
  {
    id: 5,
    name: 'ЕнотМистик',
    furrySpecies: 'raccoon',
    mysticalTitle: 'Собиратель артефактов',
    rating: 5,
    text: 'Нашёл больше артефактов и тайн, чем ожидал. Бар превратился в алхимическую лабораторию, а каждый разговор у костра - в передачу древних знаний. Магия реальна!',
    experienceType: 'discovery',
    experiences: ['Артефакты', 'Бар', 'Знания'],
    likes: 27
  },
  {
    id: 6,
    name: 'СоваМудрая',
    furrySpecies: 'owl',
    mysticalTitle: 'Хранительница ночных тайн',
    rating: 5,
    text: 'Ночная атмосфера лагеря неповторима. Звуки леса, мерцание костров, таинственные силуэты... Это не просто кемпинг, это погружение в другую реальность, где время течёт иначе.',
    experienceType: 'mystical',
    experiences: ['Ночь', 'Атмосфера', 'Время'],
    likes: 38
  }
]

const mysticalStats: MysticalStat[] = [
  { icon: 'fas fa-users', value: '250+', label: 'Выживших игроков' },
  { icon: 'fas fa-star', value: '4.9', label: 'Средний рейтинг' },
  { icon: 'fas fa-fire', value: '100%', label: 'Магический опыт' },
  { icon: 'fas fa-heart', value: '95%', label: 'Хотят вернуться' }
]

const getFurryIcon = (species: string): string => {
  const icons: Record<string, string> = {
    fox: 'fas fa-paw',
    wolf: 'fas fa-wolf',
    cat: 'fas fa-cat',
    dragon: 'fas fa-dragon',
    raccoon: 'fas fa-mask',
    owl: 'fas fa-crow'
  }
  return icons[species] || 'fas fa-paw'
}

const getSpeciesSymbol = (species: string): string => {
  const symbols: Record<string, string> = {
    fox: '🦊',
    wolf: '🐺', 
    cat: '🐱',
    dragon: '🐉',
    raccoon: '🦝',
    owl: '🦉'
  }
  return symbols[species] || '🐾'
}

const getAvatarEffect = (species: string): string => {
  const effects: Record<string, string> = {
    fox: 'ember-effect',
    wolf: 'neon-glow',
    cat: 'carved-text',
    dragon: 'ritual-text',
    raccoon: 'ancient-text',
    owl: 'shadow-text'
  }
  return effects[species] || 'ember-effect'
}

const getMysticalGlow = (id: number): string => {
  const glows = ['bg-fire/20', 'bg-gold/20', 'bg-green/20', 'bg-blood/20']
  return glows[id % glows.length]
}

const getMysticalRune = (id: number): string => {
  const runes = ['◆', '◇', '▲', '▼', '●', '◐']
  return runes[id % runes.length]
}

const getReviewEssence = (type: string): string => {
  const essences: Record<string, string> = {
    spiritual: 'Духовное пробуждение',
    adventure: 'Жажда приключений', 
    initiation: 'Первое посвящение',
    mastery: 'Мастерство игрока',
    discovery: 'Открытие тайн',
    mystical: 'Мистический опыт'
  }
  return essences[type] || 'Неизведанная сущность'
}

const getExperienceIcon = (experience: string): string => {
  const icons: Record<string, string> = {
    'Карты': 'fas fa-cards-blank',
    'Мистика': 'fas fa-eye',
    'Дружба': 'fas fa-heart',
    'Квесты': 'fas fa-map',
    'Баня': 'fas fa-spa',
    'Хоррор': 'fas fa-skull',
    'Новичок': 'fas fa-seedling',
    'Атмосфера': 'fas fa-cloud',
    'Турниры': 'fas fa-trophy',
    'Ветеран': 'fas fa-medal',
    'Организация': 'fas fa-cogs',
    'Артефакты': 'fas fa-gem',
    'Бар': 'fas fa-wine-glass',
    'Знания': 'fas fa-book',
    'Ночь': 'fas fa-moon',
    'Время': 'fas fa-hourglass'
  }
  return icons[experience] || 'fas fa-star'
}

const getExperienceStyle = (experience: string): string => {
  const styles: Record<string, string> = {
    'Карты': 'hover:bg-gold/20 hover:border-gold',
    'Мистика': 'hover:bg-fire/20 hover:border-fire',
    'Дружба': 'hover:bg-red-500/20 hover:border-red-500',
    'Квесты': 'hover:bg-green/20 hover:border-green',
    'Баня': 'hover:bg-blue-500/20 hover:border-blue-500',
    'Хоррор': 'hover:bg-blood/20 hover:border-blood'
  }
  return styles[experience] || 'hover:bg-accent/20'
}

const getRandomDate = (): string => {
  const dates = [
    'в полночь при новолунии',
    'на рассвете третьего дня',
    'когда тени стали длиннее',
    'в час тишины леса',
    'при мерцании последней свечи'
  ]
  return dates[Math.floor(Math.random() * dates.length)]
}

const likeReview = (id: number) => {
  const review = reviews.find(r => r.id === id)
  if (review) {
    review.likes = (review.likes || 0) + 1
    console.log(`💖 Отзыв получил благословение духов леса!`)
  }
}
</script>