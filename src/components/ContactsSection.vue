<template>
  <section class="py-20 px-4 bg-gradient-to-t from-blood/20 to-dark relative">
    <!-- Mystical background effects -->
    <div class="absolute inset-0 opacity-10">
      <div class="w-full h-full bg-gradient-to-br from-fire/30 via-gold/20 to-green/30 animate-pulse"></div>
    </div>
    
    <div class="max-w-4xl mx-auto relative z-10">
      <!-- Section title -->
      <h2 class="text-4xl md:text-5xl font-metal text-center neon-glow mb-16 forest-text">
        <i class="fas fa-scroll mr-4 text-accent ember-effect"></i>
        Каналы связи с духами
        <i class="fas fa-raven ml-4 text-accent animate-float"></i>
      </h2>

      <div class="grid md:grid-cols-2 gap-8">
        <!-- Main contacts with mystical theming -->
        <div class="inscryption-card p-8 animate-fade-in mystical-hover">
          <h3 class="text-2xl font-bold mb-6 text-neon border-b border-neon/30 pb-4 carved-text">
            <i class="fab fa-telegram mr-2 neon-glow"></i>
            Телеграм-порталы
          </h3>
          
          <div class="text-sm text-gray-400 mb-6 ancient-text border-l-4 border-neon/50 pl-4">
            <i class="fas fa-info-circle mr-2 neon-glow"></i>
            Основные каналы связи с организаторами и участниками ритуалов...
          </div>
          
          <div class="space-y-4">
            <a v-for="(contact, index) in telegramLinks" :key="contact.name"
               :href="contact.url" target="_blank"
               class="flex items-center p-4 bg-dark/50 rounded-lg border border-neon/30 hover:border-neon hover:bg-neon/10 transition-all duration-300 group interactive-element mystical-hover"
               :style="{ animationDelay: `${index * 0.1}s` }">
              
              <div class="relative mr-4">
                <i :class="[contact.icon, 'text-3xl text-neon group-hover:animate-float transition-all duration-300', getContactEffect(contact.type)]"></i>
                <!-- Mystical aura -->
                <div class="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-300">
                  <div class="w-full h-full bg-neon/20 rounded-full blur-lg"></div>
                </div>
              </div>
              
              <div class="flex-1">
                <div class="flex items-center justify-between mb-1">
                  <div class="text-white font-semibold group-hover:text-neon transition-colors ancient-text">
                    {{ contact.name }}
                  </div>
                  <div class="text-xs text-gold">{{ contact.mysticalPurpose }}</div>
                </div>
                <div class="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  {{ contact.description }}
                </div>
                <div class="text-xs text-accent mt-1">
                  <i class="fas fa-users mr-1"></i>{{ contact.memberCount || 'Неизвестно' }} душ
                </div>
              </div>
              
              <i class="fas fa-external-link-alt ml-4 text-accent opacity-50 group-hover:opacity-100 group-hover:animate-float"></i>
            </a>
          </div>
        </div>

        <!-- Social media with dark magic theming -->
        <div class="inscryption-card p-8 animate-fade-in mystical-hover">
          <h3 class="text-2xl font-bold mb-6 text-accent border-b border-accent/30 pb-4 carved-text">
            <i class="fas fa-globe mr-2 ember-effect"></i>
            Сети тёмной магии
          </h3>
          
          <div class="text-sm text-gray-400 mb-6 ancient-text border-l-4 border-accent/50 pl-4">
            <i class="fas fa-eye mr-2 ember-effect"></i>
            Дополнительные каналы для распространения видений и новостей...
          </div>
          
          <div class="space-y-4">
            <a v-for="(social, index) in socialLinks" :key="social.name"
               :href="social.url" target="_blank"
               class="flex items-center p-4 bg-dark/50 rounded-lg border border-accent/30 hover:border-accent hover:bg-accent/10 transition-all duration-300 group interactive-element mystical-hover"
               :style="{ animationDelay: `${(index + 3) * 0.1}s` }">
              
              <div class="relative mr-4">
                <i :class="[social.icon, 'text-3xl text-accent group-hover:animate-float transition-all duration-300', getSocialEffect(social.platform)]"></i>
                <!-- Mystical aura -->
                <div class="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-300">
                  <div class="w-full h-full bg-accent/20 rounded-full blur-lg"></div>
                </div>
              </div>
              
              <div class="flex-1">
                <div class="flex items-center justify-between mb-1">
                  <div class="text-white font-semibold group-hover:text-accent transition-colors ancient-text">
                    {{ social.name }}
                  </div>
                  <div class="text-xs text-gold">{{ social.mysticalPower }}</div>
                </div>
                <div class="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  {{ social.description }}
                </div>
                <div class="text-xs text-neon mt-1">
                  <i class="fas fa-magic mr-1"></i>{{ social.content }}
                </div>
              </div>
              
              <i class="fas fa-external-link-alt ml-4 text-neon opacity-50 group-hover:opacity-100 group-hover:animate-float"></i>
            </a>
          </div>
        </div>
      </div>

      <!-- Enhanced registration CTA -->
      <div class="mt-12 text-center">
        <div class="inscryption-card p-8 bg-gradient-to-r from-blood/30 to-neon/20 mystical-hover relative overflow-hidden">
          <!-- Animated mystical background -->
          <div class="absolute inset-0 opacity-20">
            <div class="w-full h-full bg-gradient-to-br from-fire/40 via-gold/30 to-green/40 animate-flicker"></div>
          </div>
          
          <!-- Floating mystical elements -->
          <div class="absolute inset-0 overflow-hidden">
            <div v-for="i in 8" :key="i"
                 class="absolute text-gold opacity-30 animate-float"
                 :style="{
                   left: Math.random() * 100 + '%',
                   top: Math.random() * 100 + '%',
                   animationDelay: Math.random() * 3 + 's',
                   animationDuration: (4 + Math.random() * 2) + 's'
                 }">
              {{ getMysticalSymbol(i) }}
            </div>
          </div>
          
          <div class="relative z-10">
            <div class="mb-6 flex justify-center space-x-6">
              <i class="fas fa-campground text-6xl neon-glow animate-glow"></i>
              <i class="fas fa-skull text-6xl ember-effect animate-flicker"></i>
              <i class="fas fa-paw text-6xl carved-text animate-float"></i>
            </div>
            
            <h3 class="text-3xl font-bold text-white mb-4 ancient-text">
              Готов принять вызов судьбы?
            </h3>
            
            <p class="text-lg text-gray-300 mb-6 max-w-3xl mx-auto ancient-text">
              Присоединяйся к нам в мистическом лесном лагере, где карты решают судьбу, 
              костёр согревает души, а каждая встреча становится легендой...
            </p>
            
            <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="p-4 bg-dark/50 rounded-lg border border-fire/30">
                <i class="fas fa-fire text-2xl text-fire mb-2 ember-effect"></i>
                <div class="text-sm ancient-text text-white">Мистическая атмосфера</div>
              </div>
              <div class="p-4 bg-dark/50 rounded-lg border border-gold/30">
                <i class="fas fa-users text-2xl text-gold mb-2 neon-glow"></i>
                <div class="text-sm ancient-text text-white">90 единомышленников</div>
              </div>
              <div class="p-4 bg-dark/50 rounded-lg border border-neon/30">
                <i class="fas fa-heart text-2xl text-neon mb-2 animate-glow"></i>
                <div class="text-sm ancient-text text-white">Незабываемые воспоминания</div>
              </div>
            </div>
            
            <a href="https://t.me/tourfurr_bot" target="_blank" 
               class="btn-inscryption text-2xl px-10 py-5 interactive-element group">
              <i class="fab fa-telegram mr-3 group-hover:animate-float"></i>
              Войти в игру судьбы
              <i class="fas fa-dice ml-3 ember-effect group-hover:animate-float"></i>
            </a>
            
            <div class="mt-6 text-sm text-gray-400 ancient-text">
              <i class="fas fa-exclamation-triangle mr-2 ember-effect"></i>
              Внимание: Выход из этой реальности не гарантирован
              <i class="fas fa-question ml-2 animate-flicker"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Mystical footer with additional info -->
      <div class="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Organizers info -->
        <div class="inscryption-card p-6 mystical-hover">
          <h3 class="text-xl font-bold mb-4 carved-text border-b border-gold/30 pb-2">
            <i class="fas fa-crown mr-2 ember-effect"></i>
            Хранители лагеря
          </h3>
          
          <div class="space-y-3">
            <div v-for="organizer in organizers" :key="organizer.role"
                 class="flex items-center p-3 bg-dark/30 rounded-lg border border-gold/30 hover:border-gold hover:bg-gold/10 transition-all duration-300 group">
              <i :class="organizer.icon" class="text-2xl text-gold mr-4 group-hover:animate-float ember-effect"></i>
              <div>
                <div class="text-white font-semibold ancient-text">{{ organizer.role }}</div>
                <div class="text-sm text-gray-400">{{ organizer.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Emergency contacts -->
        <div class="inscryption-card p-6 mystical-hover">
          <h3 class="text-xl font-bold mb-4 carved-text border-b border-accent/30 pb-2">
            <i class="fas fa-shield-alt mr-2 ember-effect"></i>
            Экстренная связь
          </h3>
          
          <div class="space-y-3">
            <div class="p-4 bg-dark/30 rounded-lg border border-accent/30">
              <div class="flex items-center mb-2">
                <i class="fas fa-phone text-accent mr-2 ember-effect"></i>
                <span class="text-white font-semibold ancient-text">Во время лагеря</span>
              </div>
              <div class="text-sm text-gray-400">
                Номер будет предоставлен всем участникам перед началом
              </div>
            </div>
            
            <div class="p-4 bg-dark/30 rounded-lg border border-neon/30">
              <div class="flex items-center mb-2">
                <i class="fas fa-map-marker-alt text-neon mr-2 neon-glow"></i>
                <span class="text-white font-semibold ancient-text">Точные координаты</span>
              </div>
              <div class="text-sm text-gray-400">
                Будут отправлены зарегистрированным участникам
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Final mystical footer -->
      <div class="mt-12 text-center text-gray-500 border-t border-gold/30 pt-8">
        <div class="mb-4 flex justify-center space-x-4 text-2xl">
          <i class="fas fa-skull text-gold ember-effect animate-float"></i>
          <i class="fas fa-heart text-red-400 animate-glow"></i>
          <i class="fas fa-paw text-neon neon-glow animate-float"></i>
        </div>
        
        <p class="text-sm ancient-text">
          <i class="fas fa-code mr-2 ember-effect"></i>
          Создано с тёмной магией для фурри-сообщества
          <i class="fas fa-magic ml-2 neon-glow"></i>
        </p>
        
        <p class="text-xs mt-2 opacity-70 ancient-text">
          TourFurr.camp © 2024 | Inscryption style camping experience
        </p>
        
        <div class="mt-4 text-xs text-gold opacity-50">
          <i class="fas fa-quote-left mr-1"></i>
          Каждая карта имеет цену... Каждая дружба бесценна
          <i class="fas fa-quote-right ml-1"></i>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface MysticalContactLink {
  name: string
  description: string
  url: string
  icon: string
  type: string
  mysticalPurpose: string
  memberCount?: string
}

interface MysticalSocialLink {
  name: string
  description: string
  url: string
  icon: string
  platform: string
  mysticalPower: string
  content: string
}

interface Organizer {
  role: string
  description: string
  icon: string
}

const telegramLinks: MysticalContactLink[] = [
  {
    name: 'Бот-привратник',
    description: 'Автоматический помощник для регистрации на кемпинг',
    url: 'https://t.me/tourfurr_bot',
    icon: 'fas fa-robot',
    type: 'bot',
    mysticalPurpose: 'Врата входа',
    memberCount: '∞'
  },
  {
    name: 'Круг участников',
    description: 'Основной чат для общения и обсуждений',
    url: 'https://t.me/tourfurr_chat',
    icon: 'fas fa-comments',
    type: 'chat',
    mysticalPurpose: 'Коллективный разум',
    memberCount: '250+'
  },
  {
    name: 'Канал пророчеств',
    description: 'Официальные новости и важные объявления',
    url: 'https://t.me/tourfurr_news',
    icon: 'fas fa-bullhorn',
    type: 'channel',
    mysticalPurpose: 'Источник истины',
    memberCount: '180+'
  }
]

const socialLinks: MysticalSocialLink[] = [
  {
    name: 'ВКонтакте',
    description: 'Основная группа в российской соцсети',
    url: 'https://vk.com/tourfurr',
    icon: 'fab fa-vk',
    platform: 'vk',
    mysticalPower: 'Массовость',
    content: 'Фото, видео, обсуждения'
  },
  {
    name: 'Instagram',
    description: 'Визуальная хроника наших приключений',
    url: 'https://instagram.com/tourfurr',
    icon: 'fab fa-instagram',
    platform: 'instagram',
    mysticalPower: 'Красота',
    content: 'Атмосферные фото и видео'
  },
  {
    name: 'Discord',
    description: 'Голосовое общение и игровые сессии',
    url: 'https://discord.gg/tourfurr',
    icon: 'fab fa-discord',
    platform: 'discord',
    mysticalPower: 'Единение',
    content: 'Голосовые чаты, игры'
  }
]

const organizers: Organizer[] = [
  {
    role: 'Главный маг',
    description: 'Ответственный за общую организацию и магию лагеря',
    icon: 'fas fa-hat-wizard'
  },
  {
    role: 'Хранитель карт',
    description: 'Организует турниры и карточные игры',
    icon: 'fas fa-cards-blank'
  },
  {
    role: 'Повелитель огня',
    description: 'Отвечает за костры, барбекю и безопасность',
    icon: 'fas fa-fire'
  },
  {
    role: 'Дух леса',
    description: 'Координирует квесты и взаимодействие с природой',
    icon: 'fas fa-tree'
  }
]

const getContactEffect = (type: string): string => {
  const effects: Record<string, string> = {
    bot: 'neon-glow',
    chat: 'ember-effect',
    channel: 'carved-text'
  }
  return effects[type] || 'neon-glow'
}

const getSocialEffect = (platform: string): string => {
  const effects: Record<string, string> = {
    vk: 'ember-effect',
    instagram: 'neon-glow',
    discord: 'carved-text'
  }
  return effects[platform] || 'ember-effect'
}

const getMysticalSymbol = (index: number): string => {
  const symbols = ['✦', '✧', '◆', '◇', '▲', '▼', '●', '◐', '◑', '◒', '☾', '☽']
  return symbols[index % symbols.length]
}
</script>