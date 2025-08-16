<template>
    <section class="py-20 px-4 bg-gradient-to-t from-blood/20 to-dark">
      <div class="max-w-4xl mx-auto">
        <!-- Section title -->
        <h2 class="text-4xl md:text-5xl font-metal text-center neon-glow mb-16 forest-text">
          <i class="fas fa-envelope mr-4 text-accent"></i>
          Контакты и связь
        </h2>
  
        <div class="grid md:grid-cols-2 gap-8">
          <!-- Main contacts -->
          <div class="inscryption-card p-8 animate-fade-in">
            <h3 class="text-2xl font-bold mb-6 text-neon border-b border-neon/30 pb-4">
              <i class="fab fa-telegram mr-2"></i>
              Telegram
            </h3>
            
            <div class="space-y-4">
              <a v-for="contact in telegramLinks" :key="contact.name"
                 :href="contact.url" target="_blank"
                 class="flex items-center p-4 bg-dark/50 rounded-lg border border-neon/30 hover:border-neon hover:bg-neon/10 transition-all duration-300 group">
                <i :class="contact.icon" class="text-2xl text-neon mr-4 group-hover:animate-float"></i>
                <div>
                  <div class="text-white font-semibold group-hover:text-neon transition-colors">{{ contact.name }}</div>
                  <div class="text-gray-400 text-sm">{{ contact.description }}</div>
                </div>
                <i class="fas fa-external-link-alt ml-auto text-accent opacity-50 group-hover:opacity-100"></i>
              </a>
            </div>
          </div>
  
          <!-- Social media -->
          <div class="inscryption-card p-8 animate-fade-in">
            <h3 class="text-2xl font-bold mb-6 text-accent border-b border-accent/30 pb-4">
              <i class="fas fa-share-alt mr-2"></i>
              Социальные сети
            </h3>
            
            <div class="space-y-4">
              <a v-for="social in socialLinks" :key="social.name"
                 :href="social.url" target="_blank"
                 class="flex items-center p-4 bg-dark/50 rounded-lg border border-accent/30 hover:border-accent hover:bg-accent/10 transition-all duration-300 group">
                <i :class="social.icon" class="text-2xl text-accent mr-4 group-hover:animate-float"></i>
                <div>
                  <div class="text-white font-semibold group-hover:text-accent transition-colors">{{ social.name }}</div>
                  <div class="text-gray-400 text-sm">{{ social.description }}</div>
                </div>
                <i class="fas fa-external-link-alt ml-auto text-neon opacity-50 group-hover:opacity-100"></i>
              </a>
            </div>
          </div>
        </div>
  
        <!-- Registration CTA -->
        <div class="mt-12 text-center">
          <div class="inscryption-card p-8 bg-gradient-to-r from-blood/30 to-neon/20">
            <h3 class="text-2xl font-bold text-white mb-4">
              <i class="fas fa-campground text-neon mr-2 animate-glow"></i>
              Готов к приключению в стиле Inscryption?
            </h3>
            <p class="text-gray-300 mb-6 text-lg">
              Присоединяйся к нам в лесном лагере, где карты решают судьбу, а костёр согревает души
            </p>
            <a href="https://t.me/tourfurr_bot" target="_blank" 
               class="btn-inscryption text-xl px-8 py-4">
              <i class="fab fa-telegram mr-3 animate-float"></i>
              Зарегистрироваться сейчас
              <i class="fas fa-paw ml-3 ember-effect"></i>
            </a>
          </div>
        </div>
  
        <!-- Footer -->
        <div class="mt-12 text-center text-gray-500">
          <p class="text-sm">
            <i class="fas fa-code mr-2"></i>
            Сделано с ❤️ для фурри-сообщества
            <i class="fas fa-paw ml-2"></i>
          </p>
          <p class="text-xs mt-2 opacity-70">
            TourFurr.camp © 2024 | Inscryption style camping experience
          </p>
        </div>
      </div>
    </section>
  </template>
  
  <script setup lang="ts">
  interface ContactLink {
    name: string
    description: string
    url: string
    icon: string
  }
  
  const telegramLinks: ContactLink[] = [
    {
      name: 'Бот для регистрации',
      description: 'Записаться на кемпинг',
      url: 'https://t.me/tourfurr_bot',
      icon: 'fas fa-robot'
    },
    {
      name: 'Чат участников',
      description: 'Общение и вопросы',
      url: 'https://t.me/tourfurr_chat',
      icon: 'fas fa-comments'
    },
    {
      name: 'Канал новостей',
      description: 'Актуальная информация',
      url: 'https://t.me/tourfurr_news',
      icon: 'fas fa-bullhorn'
    }
  ]
  
  const socialLinks: ContactLink[] = [
    {
      name: 'VKontakte',
      description: 'Группа ВКонтакте',
      url: 'https://vk.com/tourfurr',
      icon: 'fab fa-vk'
    },
    {
      name: 'Instagram',
      description: 'Фото и видео',
      url: 'https://instagram.com/tourfurr',
      icon: 'fab fa-instagram'
    },
    {
      name: 'Discord',
      description: 'Голосовое общение',
      url: 'https://discord.gg/tourfurr',
      icon: 'fab fa-discord'
    }
  ]
  </script>