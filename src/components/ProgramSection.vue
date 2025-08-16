<template>
    <section class="py-20 px-4 bg-gradient-to-b from-dark to-blood/10">
      <div class="max-w-6xl mx-auto">
        <!-- Section title -->
        <h2 class="text-4xl md:text-5xl font-metal text-center neon-glow mb-16 forest-text">
          <i class="fas fa-calendar-week mr-4 text-accent"></i>
          Программа лагеря
        </h2>
  
        <div class="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
          <div v-for="day in program" :key="day.day" 
               class="inscryption-card p-6 animate-fade-in hover:scale-105 transition-transform duration-300"
               :style="{ animationDelay: `${day.day * 0.2}s` }">
            
            <!-- Day header -->
            <div class="text-center mb-6 border-b border-neon/30 pb-4">
              <div class="text-4xl mb-2">
                <i :class="day.icon" class="text-accent ember-effect"></i>
              </div>
              <h3 class="text-xl font-bold text-neon">День {{ day.day }}</h3>
              <p class="text-lg text-white font-semibold">{{ day.title }}</p>
            </div>
  
            <!-- Activities -->
            <ul class="space-y-3">
              <li v-for="activity in day.activities" :key="activity" 
                  class="flex items-start text-gray-300 hover:text-white transition-colors">
                <i class="fas fa-chevron-right text-accent mr-2 mt-1 text-sm"></i>
                <span>{{ activity }}</span>
              </li>
            </ul>
          </div>
        </div>
  
        <!-- Special note -->
        <div class="mt-12 inscryption-card p-6 text-center">
          <p class="text-lg text-neon font-semibold animate-glow">
            <i class="fas fa-magic mr-2"></i>
            Программа может дополняться и изменяться в зависимости от погоды и желаний участников
            <i class="fas fa-dice ml-2 ember-effect"></i>
          </p>
        </div>
      </div>
    </section>
  </template>
  
  <script setup lang="ts">
  import type { ProgramDay } from '../types'
  
  const program: ProgramDay[] = [
    {
      day: 1,
      title: 'Заселение',
      icon: 'fas fa-fire',
      activities: [
        'Прибытие и заселение',
        'Знакомство у костра',
        'Вечерние посиделки',
        'Первые карточные партии'
      ]
    },
    {
      day: 2,
      title: 'Турниры',
      icon: 'fas fa-trophy',
      activities: [
        'Турнир по карточным играм',
        'Мастер-классы',
        'Ночной квест по лесу',
        'Мистические истории'
      ]
    },
    {
      day: 3,
      title: 'Релакс',
      icon: 'fas fa-spa',
      activities: [
        'Баня и бассейн',
        'Барная вечеринка',
        'Хоррор-игры в палатках',
        'Ночные прогулки'
      ]
    },
    {
      day: 4,
      title: 'Закрытие',
      icon: 'fas fa-camera',
      activities: [
        'Общее фото лагеря',
        'Обмен контактами',
        'Сбор лагеря',
        'До свидания!'
      ]
    }
  ]
  </script>