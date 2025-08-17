<template>
  <section class="py-20 px-4 bg-gradient-to-b from-dark to-blood/10">
    <div class="max-w-6xl mx-auto">
      <!-- Section title -->
      <h2 class="text-4xl md:text-5xl font-metal text-center neon-glow mb-16 forest-text">
        <i class="fas fa-scroll mr-4 text-accent ember-effect"></i>
        Ритуалы четырех дней
        <i class="fas fa-moon ml-4 text-accent animate-flicker"></i>
      </h2>

      <div class="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
        <div v-for="day in program" :key="day.day" 
             class="inscryption-card p-6 animate-fade-in hover:scale-105 transition-transform duration-300 mystical-hover"
             :style="{ animationDelay: `${day.day * 0.2}s` }">
          
          <!-- Day header -->
          <div class="text-center mb-6 border-b border-neon/30 pb-4 relative">
            <!-- Мистический фон -->
            <div class="absolute inset-0 opacity-10">
              <div class="w-full h-full bg-gradient-to-br from-gold/20 to-fire/20 rounded-lg"></div>
            </div>
            
            <div class="text-4xl mb-2 relative z-10">
              <i :class="day.icon" class="text-accent ember-effect animate-float"></i>
            </div>
            <h3 class="text-xl font-bold text-neon carved-text relative z-10">
              {{ getDayTitle(day.day) }}
            </h3>
            <p class="text-lg text-white font-semibold ancient-text relative z-10">{{ day.title }}</p>
            
            <!-- Мистический символ дня -->
            <div class="absolute top-2 right-2 text-gold opacity-50 text-xs">
              {{ getMysticalDaySymbol(day.day) }}
            </div>
          </div>

          <!-- Activities with mystical descriptions -->
          <ul class="space-y-3">
            <li v-for="(activity, index) in day.activities" :key="activity" 
                class="flex items-start text-gray-300 hover:text-white transition-colors group p-2 rounded interactive-element"
                :class="getActivityStyle(index)">
              <i class="fas fa-diamond text-accent mr-2 mt-1 text-sm group-hover:animate-float ember-effect"></i>
              <div>
                <span class="font-medium">{{ activity.name }}</span>
                <div class="text-xs text-gray-500 mt-1 group-hover:text-gray-400 transition-colors ancient-text">
                  {{ activity.mysticalDescription }}
                </div>
              </div>
            </li>
          </ul>

          <!-- Day mystical essence -->
          <div class="mt-6 p-3 bg-gradient-to-r from-blood/20 to-dark/40 rounded-lg border border-gold/30">
            <div class="text-center">
              <div class="text-xs ancient-text text-gold mb-1">Сущность дня:</div>
              <div class="text-sm carved-text">{{ getDayEssence(day.day) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Special mystical note -->
      <div class="mt-12 inscryption-card p-8 text-center mystical-hover">
        <div class="mb-4">
          <i class="fas fa-eye text-4xl neon-glow animate-glow"></i>
          <i class="fas fa-dice mx-4 text-4xl ember-effect animate-float"></i>
          <i class="fas fa-skull text-4xl carved-text animate-flicker"></i>
        </div>
        <p class="text-xl text-neon font-semibold animate-glow mb-4 ancient-text">
          Внимание, смертный! Программа может изменяться в зависимости от воли древних сил...
        </p>
        <div class="text-sm text-gray-400 space-y-2">
          <p>
            <i class="fas fa-cloud-rain mr-2 ember-effect"></i>
            Погода может повлиять на ритуалы
          </p>
          <p>
            <i class="fas fa-users mr-2 neon-glow"></i>
            Желания участников будут учтены духами леса
          </p>
          <p>
            <i class="fas fa-magic mr-2 carved-text"></i>
            Случайные события добавят изюминку в каждый день
          </p>
        </div>
      </div>

      <!-- Mystical timeline -->
      <div class="mt-12 relative">
        <div class="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-gold via-fire to-blood opacity-50"></div>
        
        <div class="text-center mb-8">
          <h3 class="text-2xl carved-text mb-4">
            <i class="fas fa-hourglass mr-2 ember-effect"></i>
            Временная линия ритуалов
            <i class="fas fa-hourglass ml-2 ember-effect"></i>
          </h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          <div v-for="(timeline, index) in timelineEvents" :key="index"
               class="text-center relative">
            <!-- Timeline dot -->
            <div class="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-gold to-fire rounded-full border-2 border-white animate-glow" 
                 style="top: -12px;"></div>
            
            <div class="inscryption-card p-4 mt-4 hover:blood-border transition-all duration-300">
              <div class="text-2xl mb-2">
                <i :class="[timeline.icon, 'ember-effect']"></i>
              </div>
              <div class="text-sm ancient-text text-gold font-semibold">{{ timeline.time }}</div>
              <div class="text-white text-sm mt-1">{{ timeline.event }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ProgramDay } from '../types'

interface MysticalActivity {
  name: string
  mysticalDescription: string
}

interface MysticalDay extends Omit<ProgramDay, 'activities'> {
  activities: MysticalActivity[]
}

interface TimelineEvent {
  time: string
  event: string
  icon: string
}

const program: MysticalDay[] = [
  {
    day: 1,
    title: 'Призыв душ',
    icon: 'fas fa-fire',
    activities: [
      { 
        name: 'Прибытие и заселение', 
        mysticalDescription: 'Души собираются в священном лесу' 
      },
      { 
        name: 'Ритуал знакомства у костра', 
        mysticalDescription: 'Огонь раскрывает истинные имена' 
      },
      { 
        name: 'Вечерние мистерии', 
        mysticalDescription: 'Первые тайны открываются в темноте' 
      },
      { 
        name: 'Первые карточные поединки', 
        mysticalDescription: 'Карты выбирают достойных' 
      }
    ]
  },
  {
    day: 2,
    title: 'Битва карт',
    icon: 'fas fa-skull',
    activities: [
      { 
        name: 'Великий турнир', 
        mysticalDescription: 'Судьба решается игрой в карты' 
      },
      { 
        name: 'Мастер-классы темных искусств', 
        mysticalDescription: 'Обучение тайным знаниям' 
      },
      { 
        name: 'Ночной квест по лесу', 
        mysticalDescription: 'Поиск потерянных артефактов' 
      },
      { 
        name: 'Истории у костра', 
        mysticalDescription: 'Легенды оживают в языках пламени' 
      }
    ]
  },
  {
    day: 3,
    title: 'Очищение духа',
    icon: 'fas fa-spa',
    activities: [
      { 
        name: 'Ритуал бани и воды', 
        mysticalDescription: 'Омовение души в священных водах' 
      },
      { 
        name: 'Барная церемония', 
        mysticalDescription: 'Эликсиры раскрепощают истинную сущность' 
      },
      { 
        name: 'Хоррор-игры в палатках', 
        mysticalDescription: 'Страхи становятся реальностью' 
      },
      { 
        name: 'Лунные прогулки', 
        mysticalDescription: 'Тайны раскрываются под лунным светом' 
      }
    ]
  },
  {
    day: 4,
    title: 'Прощальный ритуал',
    icon: 'fas fa-camera',
    activities: [
      { 
        name: 'Запечатление душ', 
        mysticalDescription: 'Общее фото для вечной памяти' 
      },
      { 
        name: 'Обмен магическими символами', 
        mysticalDescription: 'Связь сохранится навсегда' 
      },
      { 
        name: 'Разрушение лагеря', 
        mysticalDescription: 'Возвращение к обычному миру' 
      },
      { 
        name: 'Прощание до новой игры', 
        mysticalDescription: 'До встречи в следующем кругу' 
      }
    ]
  }
]

const timelineEvents: TimelineEvent[] = [
  { time: '16:00', event: 'Прибытие игроков', icon: 'fas fa-door-open' },
  { time: '20:00', event: 'Ритуал у костра', icon: 'fas fa-fire' },
  { time: '00:00', event: 'Ночные мистерии', icon: 'fas fa-moon' },
  { time: '12:00', event: 'Дневные турниры', icon: 'fas fa-trophy' }
]

const getDayTitle = (day: number): string => {
  const titles = ['Первый день', 'Второй день', 'Третий день', 'Четвертый день']
  return titles[day - 1] || `День ${day}`
}

const getMysticalDaySymbol = (day: number): string => {
  const symbols = ['◆', '◇', '▲', '▼']
  return symbols[day - 1] || '●'
}

const getDayEssence = (day: number): string => {
  const essences = [
    'Начало пути',
    'Испытание силы',
    'Очищение души',
    'Завершение круга'
  ]
  return essences[day - 1] || 'Мистическая сущность'
}

const getActivityStyle = (index: number): string => {
  const styles = [
    'hover:bg-fire/10',
    'hover:bg-gold/10',
    'hover:bg-blood/10',
    'hover:bg-green/10'
  ]
  return styles[index % styles.length]
}
</script>