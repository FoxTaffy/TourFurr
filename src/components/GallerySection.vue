<template>
  <section class="py-20 px-4 bg-gradient-to-b from-blood/10 to-dark">
    <div class="max-w-6xl mx-auto">
      <!-- Section title -->
      <h2 class="text-4xl md:text-5xl font-metal text-center neon-glow mb-16 forest-text">
        <i class="fas fa-eye mr-4 text-accent ember-effect"></i>
        Видения из прошлых игр
        <i class="fas fa-images ml-4 text-accent animate-flicker"></i>
      </h2>

      <!-- Gallery filter with mystical design -->
      <div class="flex flex-wrap justify-center gap-4 mb-12">
        <button v-for="category in categories" :key="category.value"
                @click="activeCategory = category.value"
                :class="[
                  'px-6 py-3 rounded-lg font-semibold transition-all duration-300 border-2 interactive-element ancient-text',
                  activeCategory === category.value 
                    ? 'bg-neon text-dark animate-glow border-neon shadow-lg' 
                    : 'bg-blood border border-neon/30 text-white hover:border-neon hover:text-neon hover:bg-neon/10'
                ]">
          <i :class="[category.icon, 'mr-2', activeCategory === category.value ? 'text-dark' : 'ember-effect']"></i>
          {{ category.name }}
          <span v-if="activeCategory === category.value" class="ml-2 text-xs">✦</span>
        </button>
      </div>

      <!-- Gallery grid with mystical cards -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="image in filteredImages" :key="image.id" 
             class="inscryption-card group cursor-pointer hover:scale-105 transition-all duration-300 mystical-hover interactive-element relative overflow-hidden"
             @click="openImage(image)"
             :style="{ animationDelay: `${image.id * 0.1}s` }">
          
          <!-- Mystical background overlay -->
          <div class="absolute inset-0 bg-gradient-to-br from-dark/80 via-blood/60 to-card/80 z-10"></div>
          
          <!-- Main image placeholder with enhanced styling -->
          <div class="relative w-full h-64 bg-gradient-to-br from-dark via-blood to-card rounded-lg overflow-hidden">
            <!-- Background mystical pattern -->
            <div class="absolute inset-0 opacity-30">
              <div class="w-full h-full bg-gradient-to-br from-neon/20 to-accent/20"></div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              
              <!-- Mystical symbols floating -->
              <div class="absolute inset-0 overflow-hidden">
                <div v-for="i in 5" :key="i"
                     class="absolute text-gold opacity-20 animate-float"
                     :style="{
                       left: Math.random() * 80 + 10 + '%',
                       top: Math.random() * 80 + 10 + '%',
                       animationDelay: Math.random() * 3 + 's',
                       animationDuration: (3 + Math.random() * 2) + 's'
                     }">
                  {{ getMysticalSymbol(i) }}
                </div>
              </div>
            </div>
            
            <!-- Content based on category -->
            <div class="relative z-20 flex flex-col items-center justify-center h-full text-center p-6">
              <div class="mb-4 relative">
                <i v-if="image.category === 'camp'" 
                   class="fas fa-campground text-6xl text-neon group-hover:animate-float neon-glow"></i>
                <i v-else-if="image.category === 'activities'" 
                   class="fas fa-dice text-6xl text-accent group-hover:animate-float ember-effect"></i>
                <i v-else-if="image.category === 'atmosphere'" 
                   class="fas fa-fire text-6xl text-fire group-hover:animate-flicker ritual-text"></i>
                <i v-else 
                   class="fas fa-palette text-6xl text-neon group-hover:animate-float neon-glow"></i>
                
                <!-- Mystical aura around icon -->
                <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div class="w-full h-full bg-accent/20 rounded-full blur-lg animate-glow"></div>
                </div>
              </div>
              
              <h3 class="text-white font-bold text-lg mb-2 carved-text group-hover:text-neon transition-colors">
                {{ image.alt }}
              </h3>
              
              <p class="text-gray-400 text-sm mb-3 ancient-text group-hover:text-gray-300 transition-colors">
                {{ image.mysticalDescription }}
              </p>
              
              <div class="text-xs text-gold border border-gold/30 px-3 py-1 rounded-full bg-dark/50">
                <i class="fas fa-skull mr-1 ember-effect"></i>
                {{ getMysticalEssence(image.category) }}
              </div>
            </div>

            <!-- Hover overlay with mystical effects -->
            <div class="absolute inset-0 bg-gradient-to-t from-neon/30 via-fire/20 to-gold/30 opacity-0 group-hover:opacity-100 transition-all duration-500 z-30 flex items-center justify-center">
              <div class="text-center">
                <i class="fas fa-search-plus text-4xl text-white mb-2 animate-glow"></i>
                <div class="text-white font-semibold ancient-text">Открыть видение</div>
              </div>
            </div>

            <!-- Corner mystical decorations -->
            <div class="absolute top-2 left-2 text-gold opacity-50 text-sm z-20">
              {{ getMysticalRune(image.id) }}
            </div>
            <div class="absolute top-2 right-2 text-fire opacity-50 text-sm z-20 ember-effect">
              {{ getMysticalNumber(image.id) }}
            </div>
            <div class="absolute bottom-2 left-2 text-neon opacity-50 text-sm z-20 neon-glow">
              ◆
            </div>
            <div class="absolute bottom-2 right-2 text-accent opacity-50 text-sm z-20 animate-flicker">
              ✦
            </div>
          </div>

          <!-- Card bottom with mystical info -->
          <div class="p-4 bg-gradient-to-r from-dark to-blood/50 border-t border-gold/30">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <i :class="getCategoryIcon(image.category)" class="text-accent ember-effect"></i>
                <span class="text-sm ancient-text text-gray-300">{{ getCategoryName(image.category) }}</span>
              </div>
              <div class="flex items-center space-x-1">
                <i v-for="i in image.mysticalPower" :key="i" 
                   class="fas fa-star text-xs text-gold ember-effect"
                   :style="{ animationDelay: `${i * 0.1}s` }"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Coming soon section with enhanced mystical design -->
      <div class="mt-12 inscryption-card p-8 text-center mystical-hover relative overflow-hidden">
        <!-- Animated background -->
        <div class="absolute inset-0 opacity-20">
          <div class="w-full h-full bg-gradient-to-br from-fire/30 via-gold/20 to-green/30 animate-pulse"></div>
        </div>
        
        <div class="relative z-10">
          <div class="mb-6 flex justify-center space-x-6">
            <i class="fas fa-clock text-5xl neon-glow animate-glow"></i>
            <i class="fas fa-camera text-5xl ember-effect animate-float"></i>
            <i class="fas fa-magic text-5xl carved-text animate-flicker"></i>
          </div>
          
          <h3 class="text-2xl font-semibold mb-4 ancient-text text-white">
            Хроники будущих приключений
          </h3>
          
          <p class="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
            Фотографии с прошлых лагерей и концепт-арты в стиле Inscryption 
            будут добавлены после проведения священных ритуалов записи...
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div class="p-4 bg-dark/50 rounded-lg border border-fire/30 hover:border-fire hover:bg-fire/10 transition-all duration-300 group">
              <i class="fas fa-images text-3xl text-fire mb-3 group-hover:animate-float ember-effect"></i>
              <div class="text-sm font-semibold ancient-text text-white">Фото лагеря</div>
              <div class="text-xs text-gray-400 mt-1">Реальные моменты магии</div>
            </div>
            
            <div class="p-4 bg-dark/50 rounded-lg border border-gold/30 hover:border-gold hover:bg-gold/10 transition-all duration-300 group">
              <i class="fas fa-palette text-3xl text-gold mb-3 group-hover:animate-float neon-glow"></i>
              <div class="text-sm font-semibold ancient-text text-white">Концепт-арты</div>
              <div class="text-xs text-gray-400 mt-1">Художественные видения</div>
            </div>
            
            <div class="p-4 bg-dark/50 rounded-lg border border-neon/30 hover:border-neon hover:bg-neon/10 transition-all duration-300 group">
              <i class="fas fa-video text-3xl text-neon mb-3 group-hover:animate-float carved-text"></i>
              <div class="text-sm font-semibold ancient-text text-white">Видео-хроники</div>
              <div class="text-xs text-gray-400 mt-1">Движущиеся воспоминания</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mystical memory archive -->
      <div class="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Previous camps archive -->
        <div class="inscryption-card p-6 mystical-hover">
          <h3 class="text-xl font-bold mb-4 carved-text border-b border-accent/30 pb-2">
            <i class="fas fa-archive mr-2 ember-effect"></i>
            Архив прошлых лагерей
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

        <!-- Upload invitation -->
        <div class="inscryption-card p-6 mystical-hover">
          <h3 class="text-xl font-bold mb-4 carved-text border-b border-neon/30 pb-2">
            <i class="fas fa-upload mr-2 neon-glow"></i>
            Поделись своими видениями
          </h3>
          
          <div class="text-center">
            <div class="mb-4">
              <i class="fas fa-camera-retro text-4xl text-neon animate-glow"></i>
            </div>
            
            <p class="text-gray-300 mb-4 ancient-text">
              Если у тебя есть фотографии или арты в духе нашего лагеря, 
              поделись ими с сообществом!
            </p>
            
            <a href="https://t.me/tourfurr_chat" target="_blank" 
               class="btn-inscryption interactive-element">
              <i class="fab fa-telegram mr-2 animate-float"></i>
              Отправить в чат
              <i class="fas fa-image ml-2 ember-effect"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface MysticalGalleryImage {
  id: number
  src: string
  alt: string
  category: 'camp' | 'activities' | 'art' | 'atmosphere'
  mysticalDescription: string
  mysticalPower: number
}

interface PastCamp {
  year: string
  name: string
  participants: number
  mysticalEvent: string
}

const activeCategory = ref<string>('all')

const categories = [
  { value: 'all', name: 'Все видения', icon: 'fas fa-eye' },
  { value: 'camp', name: 'Лагерь', icon: 'fas fa-campground' },
  { value: 'activities', name: 'Ритуалы', icon: 'fas fa-dice' },
  { value: 'atmosphere', name: 'Атмосфера', icon: 'fas fa-fire' },
  { value: 'art', name: 'Арты', icon: 'fas fa-palette' }
]

const galleryImages: MysticalGalleryImage[] = [
  { 
    id: 1, 
    src: '', 
    alt: 'Палатки среди древних деревьев', 
    category: 'camp',
    mysticalDescription: 'Убежища душ под покровом вековых стражей леса',
    mysticalPower: 4
  },
  { 
    id: 2, 
    src: '', 
    alt: 'Костёр в сердце ночи', 
    category: 'atmosphere',
    mysticalDescription: 'Пламя, соединяющее сердца и освещающее тайны',
    mysticalPower: 5
  },
  { 
    id: 3, 
    src: '', 
    alt: 'Турнир судьбоносных карт', 
    category: 'activities',
    mysticalDescription: 'Момент, когда карты решают участь игроков',
    mysticalPower: 5
  },
  { 
    id: 4, 
    src: '', 
    alt: 'Фурри-арт в стиле Inscryption', 
    category: 'art',
    mysticalDescription: 'Художественное воплощение духов леса',
    mysticalPower: 4
  },
  { 
    id: 5, 
    src: '', 
    alt: 'Баня-палатка очищения', 
    category: 'camp',
    mysticalDescription: 'Святилище пара и воды для омовения душ',
    mysticalPower: 4
  },
  { 
    id: 6, 
    src: '', 
    alt: 'Ночной квест по лесным тропам', 
    category: 'activities',
    mysticalDescription: 'Путешествие во тьме к скрытым артефактам',
    mysticalPower: 5
  },
  { 
    id: 7, 
    src: '', 
    alt: 'Мистические карты Inscryption', 
    category: 'art',
    mysticalDescription: 'Концепт-арт магических карт лагеря',
    mysticalPower: 3
  },
  { 
    id: 8, 
    src: '', 
    alt: 'Групповое заклинание', 
    category: 'atmosphere',
    mysticalDescription: 'Момент единения всех участников ритуала',
    mysticalPower: 5
  },
  { 
    id: 9, 
    src: '', 
    alt: 'Хоррор-игры при свечах', 
    category: 'activities',
    mysticalDescription: 'Испытание храбрости в покровах тьмы',
    mysticalPower: 4
  }
]

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

const filteredImages = computed(() => {
  if (activeCategory.value === 'all') {
    return galleryImages
  }
  return galleryImages.filter(img => img.category === activeCategory.value)
})

const getCategoryIcon = (category: string): string => {
  const icons = {
    camp: 'fas fa-campground',
    activities: 'fas fa-dice',
    atmosphere: 'fas fa-fire',
    art: 'fas fa-palette'
  }
  return icons[category] || 'fas fa-image'
}

const getCategoryName = (category: string): string => {
  const names = {
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

const getMysticalNumber = (id: number): string => {
  return (id % 9 + 1).toString()
}

const getMysticalEssence = (category: string): string => {
  const essences = {
    camp: 'Основа',
    activities: 'Действие',
    atmosphere: 'Дух',
    art: 'Творение'
  }
  return essences[category] || 'Тайна'
}

const openImage = (image: MysticalGalleryImage) => {
  console.log(`🖼️ Открываем видение: "${image.alt}"`)
  console.log(`✨ ${image.mysticalDescription}`)
  // Здесь можно добавить модальное окно для просмотра изображений
}
</script>