<template>
    <section class="py-20 px-4">
      <div class="max-w-6xl mx-auto">
        <!-- Section title -->
        <h2 class="text-4xl md:text-5xl font-metal text-center neon-glow mb-16 forest-text">
          <i class="fas fa-comments mr-4 text-accent"></i>
          Отзывы участников
        </h2>
  
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="review in reviews" :key="review.id" 
               class="inscryption-card p-6 animate-fade-in hover:scale-105 transition-all duration-300"
               :style="{ animationDelay: `${review.id * 0.2}s` }">
            
            <!-- Reviewer info -->
            <div class="flex items-center mb-4">
              <!-- Avatar placeholder -->
              <div class="w-16 h-16 bg-gradient-to-br from-neon to-accent rounded-full flex items-center justify-center mr-4 animate-float">
                <i class="fas fa-paw text-dark text-xl"></i>
              </div>
              
              <div>
                <h4 class="text-lg font-bold text-white">{{ review.name }}</h4>
                <div class="flex text-accent">
                  <i v-for="i in review.rating" :key="i" class="fas fa-star text-sm ember-effect"></i>
                </div>
              </div>
            </div>
  
            <!-- Review text -->
            <blockquote class="text-gray-300 italic leading-relaxed border-l-4 border-neon/50 pl-4">
              "{{ review.text }}"
            </blockquote>
  
            <!-- Decorative element -->
            <div class="mt-4 text-right">
              <i class="fas fa-quote-right text-accent opacity-50"></i>
            </div>
          </div>
        </div>
  
        <!-- CTA for reviews -->
        <div class="mt-12 text-center">
          <div class="inscryption-card p-6">
            <p class="text-lg text-white mb-4">
              Хотите поделиться своим опытом?
            </p>
            <a href="https://t.me/tourfurr_chat" target="_blank" 
               class="btn-inscryption">
              <i class="fab fa-telegram mr-2"></i>
              Написать отзыв
            </a>
          </div>
        </div>
      </div>
    </section>
  </template>
  
  <script setup lang="ts">
  import type { Review } from '../types'
  
  const reviews: Review[] = [
    {
      id: 1,
      name: 'ЛисичкаАли',
      avatar: '🦊',
      rating: 5,
      text: 'Невероятная атмосфера! Почувствовал себя как в игре Inscryption. Карточные турниры до утра, костёр, новые друзья. Обязательно приеду снова!'
    },
    {
      id: 2,
      name: 'ВолчараМакс',
      avatar: '🐺',
      rating: 5,
      text: 'Баня-палатка это что-то! А ночной квест по лесу был просто мистическим. Организация на высоте, всё продумано до мелочей.'
    },
    {
      id: 3,
      name: 'КотоЛуна',
      avatar: '🐱',
      rating: 4,
      text: 'Первый раз был на фурри-кемпинге. Немного волновался, но все оказались очень дружелюбными. Хоррор-игры в палатках - незабываемо!'
    }
  ]
  </script>