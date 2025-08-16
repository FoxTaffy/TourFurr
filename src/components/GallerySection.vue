<template>
    <section class="py-20 px-4 bg-gradient-to-b from-blood/10 to-dark">
      <div class="max-w-6xl mx-auto">
        <!-- Section title -->
        <h2 class="text-4xl md:text-5xl font-metal text-center neon-glow mb-16 forest-text">
          <i class="fas fa-images mr-4 text-accent"></i>
          Галерея атмосферы
        </h2>
  
        <!-- Gallery filter -->
        <div class="flex flex-wrap justify-center gap-4 mb-12">
          <button v-for="category in categories" :key="category.value"
                  @click="activeCategory = category.value"
                  :class="[
                    'px-6 py-3 rounded-lg font-semibold transition-all duration-300',
                    activeCategory === category.value 
                      ? 'bg-neon text-dark animate-glow' 
                      : 'bg-blood border border-neon/30 text-white hover:border-neon hover:text-neon'
                  ]">
            <i :class="category.icon" class="mr-2"></i>
            {{ category.name }}
          </button>
        </div>
  
        <!-- Gallery grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="image in filteredImages" :key="image.id" 
               class="inscryption-card p-4 group cursor-pointer hover:scale-105 transition-all duration-300 animate-fade-in"
               @click="openImage(image)">
            
            <!-- Placeholder image with Inscryption theme -->
            <div class="w-full h-48 bg-gradient-to-br from-dark via-blood to-card rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
              <!-- Background pattern -->
              <div class="absolute inset-0 opacity-20">
                <div class="w-full h-full bg-gradient-to-br from-neon/20 to-accent/20"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              
              <!-- Content based on category -->
              <div class="relative z-10 text-center">
                <i v-if="image.category === 'camp'" class="fas fa-campground text-4xl text-neon mb-2 group-hover:animate-float"></i>
                <i v-else-if="image.category === 'activities'" class="fas fa-dice text-4xl text-accent mb-2 group-hover:animate-float"></i>
                <i v-else class="fas fa-palette text-4xl text-neon mb-2 group-hover:animate-float"></i>
                
                <p class="text-white font-semibold">{{ image.alt }}</p>
                <p class="text-gray-400 text-sm mt-1">Inscryption Style</p>
              </div>
  
              <!-- Hover overlay -->
              <div class="absolute inset-0 bg-neon/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <i class="fas fa-search-plus text-2xl text-white"></i>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Coming soon note -->
        <div class="mt-12 inscryption-card p-6 text-center">
          <p class="text-lg text-neon font-semibold animate-glow">
            <i class="fas fa-clock mr-2"></i>
            Фотографии с прошлых лагерей и концепт-арты будут добавлены
            <i class="fas fa-plus ml-2 ember-effect"></i>
          </p>
        </div>
      </div>
    </section>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import type { GalleryImage } from '../types'
  
  const activeCategory = ref<string>('all')
  
  const categories = [
    { value: 'all', name: 'Все', icon: 'fas fa-th' },
    { value: 'camp', name: 'Лагерь', icon: 'fas fa-campground' },
    { value: 'activities', name: 'Активности', icon: 'fas fa-gamepad' },
    { value: 'art', name: 'Арты', icon: 'fas fa-palette' }
  ]
  
  const galleryImages: GalleryImage[] = [
    { id: 1, src: '', alt: 'Палатки в лесу', category: 'camp' },
    { id: 2, src: '', alt: 'Костёр ночью', category: 'camp' },
    { id: 3, src: '', alt: 'Карточный турнир', category: 'activities' },
    { id: 4, src: '', alt: 'Inscryption арт', category: 'art' },
    { id: 5, src: '', alt: 'Баня-палатка', category: 'camp' },
    { id: 6, src: '', alt: 'Ночной квест', category: 'activities' },
    { id: 7, src: '', alt: 'Фурри арт', category: 'art' },
    { id: 8, src: '', alt: 'Общее фото', category: 'camp' },
    { id: 9, src: '', alt: 'Хоррор-игры', category: 'activities' }
  ]
  
  const filteredImages = computed(() => {
    if (activeCategory.value === 'all') {
      return galleryImages
    }
    return galleryImages.filter(img => img.category === activeCategory.value)
  })
  
  const openImage = (image: GalleryImage) => {
    // Здесь можно добавить модальное окно для просмотра изображений
    console.log('Opening image:', image.alt)
  }
  </script>