<template>
    <section class="py-20 px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Section title -->
        <h2 class="text-4xl md:text-5xl font-metal text-center neon-glow mb-16 forest-text">
          <i class="fas fa-list-check mr-4 text-accent"></i>
          Что взять с собой
        </h2>
  
        <div class="grid md:grid-cols-2 gap-8">
          <!-- Required items -->
          <div class="inscryption-card p-8 animate-fade-in">
            <h3 class="text-2xl font-bold mb-6 text-accent border-b border-accent/30 pb-4">
              <i class="fas fa-exclamation-triangle mr-2"></i>
              Обязательно
            </h3>
            
            <ul class="space-y-4">
              <li v-for="item in requiredItems" :key="item.name" 
                  class="flex items-center p-3 bg-dark/50 rounded-lg border border-accent/50 hover:bg-blood/20 transition-colors group">
                <i :class="item.icon" class="text-2xl text-accent mr-4 group-hover:animate-float"></i>
                <span class="text-white group-hover:text-neon transition-colors font-semibold">{{ item.name }}</span>
              </li>
            </ul>
          </div>
  
          <!-- Optional items -->
          <div class="inscryption-card p-8 animate-fade-in">
            <h3 class="text-2xl font-bold mb-6 text-neon border-b border-neon/30 pb-4">
              <i class="fas fa-plus-circle mr-2"></i>
              Дополнительно
            </h3>
            
            <ul class="space-y-4">
              <li v-for="item in optionalItems" :key="item.name" 
                  class="flex items-center p-3 bg-dark/50 rounded-lg border border-neon/30 hover:bg-neon/10 transition-colors group">
                <i :class="item.icon" class="text-2xl text-neon mr-4 group-hover:animate-float"></i>
                <span class="text-white group-hover:text-neon transition-colors">{{ item.name }}</span>
              </li>
            </ul>
          </div>
        </div>
  
        <!-- Special furry note -->
        <div class="mt-12 inscryption-card p-6 text-center bg-gradient-to-r from-blood/30 to-neon/20">
          <p class="text-xl text-white font-semibold mb-2">
            <i class="fas fa-paw text-accent mr-2 animate-float"></i>
            Фурсьют приветствуется, но не обязателен!
            <i class="fas fa-heart text-accent ml-2 ember-effect"></i>
          </p>
          <p class="text-gray-300">
            Главное — хорошее настроение и готовность к приключениям в стиле Inscryption
          </p>
        </div>
      </div>
    </section>
  </template>
  
  <script setup lang="ts">
  import type { ChecklistItem } from '../types'
  
  const requiredItems: ChecklistItem[] = [
    { icon: 'fas fa-campground', name: 'Палатка', required: true },
    { icon: 'fas fa-bed', name: 'Спальник', required: true },
    { icon: 'fas fa-tshirt', name: 'Тёплая одежда', required: true },
    { icon: 'fas fa-spray-can', name: 'Репеллент от комаров', required: true }
  ]
  
  const optionalItems: ChecklistItem[] = [
    { icon: 'fas fa-cards-blank', name: 'Колода карт', required: false },
    { icon: 'fas fa-swimmer', name: 'Купальник', required: false },
    { icon: 'fas fa-mask', name: 'Фурсьют', required: false },
    { icon: 'fas fa-flashlight', name: 'Фонарик', required: false },
    { icon: 'fas fa-guitar', name: 'Музыкальные инструменты', required: false },
    { icon: 'fas fa-gamepad', name: 'Настольные игры', required: false }
  ]
  </script>