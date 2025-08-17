<template>
  <section class="py-20 px-4 bg-gradient-to-b from-blood/10 to-dark relative overflow-hidden">
    <!-- Мистические фоновые эффекты -->
    <div class="absolute inset-0 opacity-5">
      <div class="w-full h-full bg-gradient-to-br from-fire/20 via-gold/10 to-green/20 animate-pulse"></div>
    </div>
    
    <!-- Плавающие мистические элементы -->
    <div v-for="i in 8" :key="`mystic-${i}`"
         class="absolute text-gold opacity-20 animate-float hidden md:block pointer-events-none"
         :style="{
           left: Math.random() * 90 + 5 + '%',
           top: Math.random() * 80 + 10 + '%',
           animationDelay: Math.random() * 3 + 's',
           animationDuration: (4 + Math.random() * 2) + 's'
         }">
      {{ getMysticalSymbol(i) }}
    </div>

    <div class="max-w-7xl mx-auto relative z-10">
      <!-- Заголовок секции с мистическими эффектами -->
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-6xl font-metal neon-glow mb-6 forest-text">
          <i class="fas fa-eye mr-4 text-accent ember-effect animate-glow"></i>
          Видения из прошлых игр
          <i class="fas fa-images ml-4 text-accent animate-float"></i>
        </h2>
        
        <p class="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto ancient-text">
          <i class="fas fa-scroll mr-2 ember-effect"></i>
          Здесь хранятся священные хроники прошлых приключений...
          Каждое изображение — окно в мир, где карты решали судьбы
          <i class="fas fa-magic ml-2 neon-glow"></i>
        </p>
      </div>

      <!-- Фильтры галереи с мистическим дизайном -->
      <div class="flex flex-wrap justify-center gap-4 mb-12">
        <button 
          v-for="category in categories" 
          :key="category.value"
          @click="setActiveCategory(category.value)"
          :class="[
            'px-6 py-3 rounded-lg font-semibold transition-all duration-300 border-2 interactive-element ancient-text group',
            activeCategory === category.value 
              ? 'bg-neon text-dark animate-glow border-neon shadow-lg' 
              : 'bg-blood border border-neon/30 text-white hover:border-neon hover:text-neon hover:bg-neon/10'
          ]">
          <i :class="[category.icon, 'mr-2', activeCategory === category.value ? 'text-dark' : 'ember-effect group-hover:animate-float']"></i>
          {{ category.name }}
          <span v-if="activeCategory === category.value" class="ml-2 text-xs animate-glow">✦</span>
        </button>
      </div>

      <!-- Главная галерея изображений -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        <div 
          v-for="(image, index) in filteredImages" 
          :key="image.id" 
          class="gallery-card group cursor-pointer relative overflow-hidden mystical-hover"
          :style="{ animationDelay: `${index * 0.1}s` }"
          @click="openLightbox(image, index)">
          
          <!-- Мистическая рамка карты -->
          <div class="inscryption-card h-80 relative overflow-hidden">
            <!-- Главное изображение -->
            <div class="absolute inset-0">
              <img 
                :src="image.src" 
                :alt="image.alt"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                :loading="index < 8 ? 'eager' : 'lazy'"
                @error="handleImageError($event, image)"
                @load="handleImageLoad($event)">
              
              <!-- Градиентный оверлей для читаемости -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
              
              <!-- Мистический оверлей при наведении -->
              <div class="absolute inset-0 bg-gradient-to-br from-neon/20 via-fire/10 to-gold/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            </div>

            <!-- Контент поверх изображения -->
            <div class="absolute inset-0 p-4 flex flex-col justify-between z-20">
              <!-- Верхние мистические символы -->
              <div class="flex justify-between items-start">
                <div class="text-gold opacity-70 text-sm">
                  {{ getMysticalRune(image.id) }}
                </div>
                <div class="text-fire opacity-70 text-sm ember-effect">
                  {{ image.mysticalPower }}★
                </div>
              </div>

              <!-- Основная информация внизу -->
              <div class="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <h3 class="text-white font-bold text-lg mb-2 carved-text group-hover:text-neon transition-colors">
                  {{ image.alt }}
                </h3>
                
                <p class="text-gray-300 text-sm mb-3 ancient-text opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {{ image.mysticalDescription }}
                </p>
                
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-1">
                    <i :class="getCategoryIcon(image.category)" class="text-accent ember-effect"></i>
                    <span class="text-xs ancient-text text-gray-400">{{ getCategoryName(image.category) }}</span>
                  </div>
                  
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <i class="fas fa-search-plus text-white text-lg animate-glow"></i>
                  </div>
                </div>
              </div>

              <!-- Мистические угловые украшения -->
              <div class="absolute bottom-2 left-2 text-neon opacity-50 text-xs neon-glow">◆</div>
              <div class="absolute bottom-2 right-2 text-accent opacity-50 text-xs animate-flicker">✦</div>
            </div>

            <!-- Эффект загрузки -->
            <div v-if="image.loading" class="absolute inset-0 bg-dark/80 flex items-center justify-center">
              <i class="fas fa-spinner text-2xl text-gold animate-spin"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Модальное окно лайтбокса -->
      <Teleport to="body">
        <div 
          v-if="lightboxOpen" 
          class="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          @click="closeLightbox"
          @keydown.esc="closeLightbox">
          
          <!-- Контейнер изображения -->
          <div class="relative max-w-6xl max-h-full" @click.stop>
            <!-- Основное изображение -->
            <img 
              :src="currentLightboxImage?.src" 
              :alt="currentLightboxImage?.alt"
              class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl">
            
            <!-- Информация об изображении -->
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 rounded-b-lg">
              <h3 class="text-white text-xl font-bold mb-2 carved-text">
                {{ currentLightboxImage?.alt }}
              </h3>
              <p class="text-gray-300 ancient-text">
                {{ currentLightboxImage?.mysticalDescription }}
              </p>
              <div class="flex items-center mt-3 space-x-4">
                <span class="text-xs text-gold border border-gold/30 px-2 py-1 rounded">
                  {{ getCategoryName(currentLightboxImage?.category || '') }}
                </span>
                <span class="text-xs text-accent">
                  Мистическая сила: {{ currentLightboxImage?.mysticalPower }}★
                </span>
              </div>
            </div>

            <!-- Кнопка закрытия -->
            <button 
              @click="closeLightbox"
              class="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors duration-200 group">
              <i class="fas fa-times text-white group-hover:text-accent"></i>
            </button>

            <!-- Навигация по изображениям -->
            <button 
              v-if="lightboxIndex > 0"
              @click="navigateLightbox(-1)"
              class="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors duration-200 group">
              <i class="fas fa-chevron-left text-white group-hover:text-neon"></i>
            </button>

            <button 
              v-if="lightboxIndex < filteredImages.length - 1"
              @click="navigateLightbox(1)"
              class="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors duration-200 group">
              <i class="fas fa-chevron-right text-white group-hover:text-neon"></i>
            </button>
          </div>
        </div>
      </Teleport>

      <!-- Архив прошлых лагерей -->
      <div class="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="inscryption-card p-6 mystical-hover">
          <h3 class="text-xl font-bold mb-4 carved-text border-b border-accent/30 pb-2">
            <i class="fas fa-archive mr-2 ember-effect"></i>
            Архив прошлых ритуалов
          </h3>
          
          <div class="space-y-3">
            <div v-for="archive in pastCamps" :key="archive.year"
                 class="flex items-center p-3 bg-dark/30 rounded-lg border border-gold/30 hover:border-gold hover:bg-gold/10 transition-all duration-300 group">
              <i class="fas fa-scroll text-2xl text-gold mr-4 group-hover:animate-float ember-effect"></i>
              <div>
                <div class="text-white font-semibold ancient-text">{{ archive.name }}</div>
                <div class="text-sm text-gray-400">{{ archive.participants }} душ участвовало</div>
                <div class="text-xs text-accent">{{ archive.mysticalEvent }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="inscryption-card p-6 mystical-hover">
          <h3 class="text-xl font-bold mb-4 carved-text border-b border-neon/30 pb-2">
            <i class="fas fa-trophy mr-2 neon-glow"></i>
            Статистика видений
          </h3>
          
          <div class="grid grid-cols-2 gap-4">
            <div v-for="stat in galleryStats" :key="stat.label"
                 class="text-center p-3 bg-dark/30 rounded-lg border border-accent/30 hover:border-accent hover:bg-accent/10 transition-all duration-300">
              <div class="text-2xl mb-1">
                <i :class="[stat.icon, 'ember-effect']"></i>
              </div>
              <div class="text-lg font-bold carved-text">{{ stat.value }}</div>
              <div class="text-xs ancient-text text-gray-400">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Интерфейсы и типы данных
interface MysticalGalleryImage {
  id: number
  src: string
  alt: string
  category: 'all' | 'camp' | 'activities' | 'art' | 'atmosphere'
  mysticalDescription: string
  mysticalPower: number
  loading?: boolean
}

interface GalleryCategory {
  value: string
  name: string
  icon: string
}

interface PastCamp {
  year: string
  name: string
  participants: number
  mysticalEvent: string
}

interface GalleryStat {
  icon: string
  value: string
  label: string
}

// Реактивные данные
const activeCategory = ref<string>('all')
const lightboxOpen = ref(false)
const currentLightboxImage = ref<MysticalGalleryImage | null>(null)
const lightboxIndex = ref(0)

// Категории фильтрации
const categories: GalleryCategory[] = [
  { value: 'all', name: 'Все видения', icon: 'fas fa-eye' },
  { value: 'camp', name: 'Лагерь', icon: 'fas fa-campground' },
  { value: 'activities', name: 'Ритуалы', icon: 'fas fa-dice' },
  { value: 'atmosphere', name: 'Атмосфера', icon: 'fas fa-fire' },
  { value: 'art', name: 'Арты', icon: 'fas fa-palette' }
]

// Основные изображения галереи (расположены в public/images/gallery/)
const galleryImages: MysticalGalleryImage[] = [
  { 
    id: 1, 
    src: '/images/gallery/camp-1.jpg', 
    alt: 'Палатки среди древних деревьев', 
    category: 'camp',
    mysticalDescription: 'Убежища душ под покровом вековых стражей леса',
    mysticalPower: 4
  },
  { 
    id: 2, 
    src: '/images/gallery/fire-1.jpg', 
    alt: 'Костёр в сердце ночи', 
    category: 'atmosphere',
    mysticalDescription: 'Пламя, соединяющее сердца и освещающее тайны',
    mysticalPower: 5
  },
  { 
    id: 3, 
    src: '/images/gallery/cards-1.jpg', 
    alt: 'Турнир судьбоносных карт', 
    category: 'activities',
    mysticalDescription: 'Момент, когда карты решают участь игроков',
    mysticalPower: 5
  },
  { 
    id: 4, 
    src: '/images/gallery/art-1.jpg', 
    alt: 'Фурри-арт в стиле Inscryption', 
    category: 'art',
    mysticalDescription: 'Художественное воплощение духов леса',
    mysticalPower: 4
  },
  { 
    id: 5, 
    src: '/images/gallery/sauna-1.jpg', 
    alt: 'Баня-палатка очищения', 
    category: 'camp',
    mysticalDescription: 'Святилище пара и воды для омовения душ',
    mysticalPower: 4
  },
  { 
    id: 6, 
    src: '/images/gallery/quest-1.jpg', 
    alt: 'Ночной квест по лесным тропам', 
    category: 'activities',
    mysticalDescription: 'Путешествие во тьме к скрытым артефактам',
    mysticalPower: 5
  },
  { 
    id: 7, 
    src: '/images/gallery/art-2.jpg', 
    alt: 'Мистические карты Inscryption', 
    category: 'art',
    mysticalDescription: 'Концепт-арт магических карт лагеря',
    mysticalPower: 3
  },
  { 
    id: 8, 
    src: '/images/gallery/group-1.jpg', 
    alt: 'Групповое заклинание', 
    category: 'atmosphere',
    mysticalDescription: 'Момент единения всех участников ритуала',
    mysticalPower: 5
  },
  { 
    id: 9, 
    src: '/images/gallery/horror-1.jpg', 
    alt: 'Хоррор-игры при свечах', 
    category: 'activities',
    mysticalDescription: 'Испытание храбрости в покровах тьмы',
    mysticalPower: 4
  },
  { 
    id: 10, 
    src: '/images/gallery/forest-1.jpg', 
    alt: 'Тайны древнего леса', 
    category: 'atmosphere',
    mysticalDescription: 'Место, где реальность встречается с мистикой',
    mysticalPower: 4
  },
  { 
    id: 11, 
    src: '/images/gallery/furry-1.jpg', 
    alt: 'Фурри в естественной среде', 
    category: 'camp',
    mysticalDescription: 'Момент полного единения с природой',
    mysticalPower: 3
  },
  { 
    id: 12, 
    src: '/images/gallery/art-3.jpg', 
    alt: 'Карточные духи леса', 
    category: 'art',
    mysticalDescription: 'Художественная интерпретация лесных сущностей',
    mysticalPower: 4
  }
]

// Архив прошлых лагерей
const pastCamps: PastCamp[] = [
  {
    year: '2023',
    name: 'Первое призвание',
    participants: 45,
    mysticalEvent: 'Пробуждение древних сил'
  },
  {
    year: '2022',
    name: 'Зарождение легенды',
    participants: 28,
    mysticalEvent: 'Основание традиций'
  },
  {
    year: '2021',
    name: 'Эксперимент судьбы',
    participants: 15,
    mysticalEvent: 'Первые шаги в неизвестное'
  }
]

// Статистика галереи
const galleryStats: GalleryStat[] = [
  { icon: 'fas fa-images', value: '50+', label: 'Видений' },
  { icon: 'fas fa-eye', value: '1.2К', label: 'Просмотров' },
  { icon: 'fas fa-heart', value: '200+', label: 'Лайков' },
  { icon: 'fas fa-share', value: '80+', label: 'Репостов' }
]

// Вычисляемые свойства
const filteredImages = computed(() => {
  if (activeCategory.value === 'all') {
    return galleryImages
  }
  return galleryImages.filter(img => img.category === activeCategory.value)
})

// Методы управления галереей
const setActiveCategory = (category: string) => {
  activeCategory.value = category
}

const openLightbox = (image: MysticalGalleryImage, index: number) => {
  currentLightboxImage.value = image
  lightboxIndex.value = index
  lightboxOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  lightboxOpen.value = false
  currentLightboxImage.value = null
  lightboxIndex.value = 0
  document.body.style.overflow = 'auto'
}

const navigateLightbox = (direction: number) => {
  const newIndex = lightboxIndex.value + direction
  if (newIndex >= 0 && newIndex < filteredImages.value.length) {
    lightboxIndex.value = newIndex
    currentLightboxImage.value = filteredImages.value[newIndex]
  }
}

// Обработка событий клавиатуры для лайтбокса
const handleKeydown = (e: KeyboardEvent) => {
  if (!lightboxOpen.value) return
  
  if (e.key === 'Escape') {
    closeLightbox()
  } else if (e.key === 'ArrowLeft') {
    navigateLightbox(-1)
  } else if (e.key === 'ArrowRight') {
    navigateLightbox(1)
  }
}

// Обработка ошибок загрузки изображений
const handleImageError = (event: Event, image: MysticalGalleryImage) => {
  console.warn(`🖼️ Изображение не найдено: ${image.src}`)
  const target = event.target as HTMLImageElement
  target.src = '/images/gallery/placeholder.jpg' // Fallback изображение
  target.alt = 'Изображение не найдено'
}

const handleImageLoad = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.opacity = '1'
}

// Утилитарные функции
const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    camp: 'fas fa-campground',
    activities: 'fas fa-dice',
    atmosphere: 'fas fa-fire',
    art: 'fas fa-palette'
  }
  return icons[category] || 'fas fa-image'
}

const getCategoryName = (category: string): string => {
  const names: Record<string, string> = {
    camp: 'Лагерь',
    activities: 'Ритуалы',
    atmosphere: 'Атмосфера',
    art: 'Арты'
  }
  return names[category] || 'Неизвестно'
}

const getMysticalSymbol = (index: number): string => {
  const symbols = ['✦', '✧', '◆', '◇', '▲', '▼', '●', '◐', '◑', '◒']
  return symbols[index % symbols.length]
}

const getMysticalRune = (id: number): string => {
  const runes = ['ᚦ', 'ᚱ', 'ᚢ', 'ᚨ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ']
  return runes[id % runes.length]
}

// Хуки жизненного цикла
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = 'auto'
})
</script>

<style scoped>
/* Основные стили компонента галереи */
.gallery-card {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

.gallery-card:hover {
  transform: translateY(-4px);
}

/* Анимация появления карточек */
@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Стили для изображений */
.gallery-card img {
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.5s ease;
}

.gallery-card img[loading="eager"] {
  opacity: 1;
}

/* Адаптивные стили для мобильных устройств */
@media (max-width: 768px) {
  .gallery-card {
    height: 300px;
  }
  
  .text-4xl {
    font-size: 2rem;
  }
  
  .md\\:text-6xl {
    font-size: 2.5rem;
  }
  
  .grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4 {
    grid-template-columns: 1fr;
  }
}

/* Улучшенные переходы для интерактивности */
.interactive-element {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mystical-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

/* Стили для лайтбокса */
.fixed.inset-0.z-50 {
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Анимации для плавающих элементов */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}

/* Пользовательская анимация свечения */
@keyframes customGlow {
  0%, 100% {
    filter: drop-shadow(0 0 5px rgba(0, 204, 122, 0.3));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(0, 204, 122, 0.8));
  }
}

.animate-glow {
  animation: customGlow 2s ease-in-out infinite;
}

/* Скрытие скроллбара при открытом лайтбоксе */
body.overflow-hidden {
  overflow: hidden;
}
</style>