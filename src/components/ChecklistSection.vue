<template>
  <section class="py-20 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Section title -->
      <h2 class="text-4xl md:text-5xl font-metal text-center neon-glow mb-16 forest-text">
        <i class="fas fa-scroll mr-4 text-accent ember-effect"></i>
        Артефакты для выживания
        <i class="fas fa-backpack ml-4 text-accent animate-float"></i>
      </h2>

      <div class="grid md:grid-cols-2 gap-8">
        <!-- Required items -->
        <div class="inscryption-card p-8 animate-fade-in mystical-hover">
          <h3 class="text-2xl font-bold mb-6 text-accent border-b border-accent/30 pb-4 carved-text">
            <i class="fas fa-exclamation-triangle mr-2 ember-effect"></i>
            Священные реликвии
          </h3>
          
          <div class="text-sm text-gray-400 mb-6 ancient-text border-l-4 border-fire/50 pl-4">
            <i class="fas fa-skull mr-2 ember-effect"></i>
            Без этих артефактов твоя душа не выдержит испытаний леса...
          </div>
          
          <ul class="space-y-4">
            <li v-for="(item, index) in requiredItems" :key="item.name" 
                class="flex items-center p-4 bg-dark/50 rounded-lg border border-accent/50 hover:bg-blood/20 transition-colors group mystical-hover interactive-element"
                :style="{ animationDelay: `${index * 0.1}s` }">
              
              <div class="relative mr-4">
                <i :class="[item.icon, 'text-3xl text-accent group-hover:animate-float transition-all duration-300', getItemEffect(item.mysticalType)]"></i>
                <!-- Mystical aura -->
                <div class="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-300">
                  <div class="w-full h-full bg-accent/20 rounded-full blur-lg"></div>
                </div>
              </div>
              
              <div class="flex-1">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-white group-hover:text-neon transition-colors font-semibold ancient-text">
                    {{ item.name }}
                  </span>
                  <span class="text-xs text-gold">{{ item.mysticalPower }}</span>
                </div>
                <div class="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  {{ item.mysticalDescription }}
                </div>
                
                <!-- Danger level -->
                <div class="flex items-center mt-2">
                  <span class="text-xs text-gray-500 mr-2">Важность:</span>
                  <div class="flex">
                    <i v-for="i in item.importance" :key="i" 
                       class="fas fa-fire text-xs text-red-500 mr-1 ember-effect"
                       :style="{ animationDelay: `${i * 0.1}s` }"></i>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <!-- Optional items -->
        <div class="inscryption-card p-8 animate-fade-in mystical-hover">
          <h3 class="text-2xl font-bold mb-6 text-neon border-b border-neon/30 pb-4 carved-text">
            <i class="fas fa-magic mr-2 neon-glow"></i>
            Дополнительные чары
          </h3>
          
          <div class="text-sm text-gray-400 mb-6 ancient-text border-l-4 border-neon/50 pl-4">
            <i class="fas fa-eye mr-2 neon-glow"></i>
            Эти предметы усилят твою магию и откроют новые возможности...
          </div>
          
          <ul class="space-y-4">
            <li v-for="(item, index) in optionalItems" :key="item.name" 
                class="flex items-center p-4 bg-dark/50 rounded-lg border border-neon/30 hover:bg-neon/10 transition-colors group mystical-hover interactive-element"
                :style="{ animationDelay: `${(index + 4) * 0.1}s` }">
              
              <div class="relative mr-4">
                <i :class="[item.icon, 'text-3xl text-neon group-hover:animate-float transition-all duration-300', getItemEffect(item.mysticalType)]"></i>
                <!-- Mystical aura -->
                <div class="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-300">
                  <div class="w-full h-full bg-neon/20 rounded-full blur-lg"></div>
                </div>
              </div>
              
              <div class="flex-1">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-white group-hover:text-neon transition-colors font-semibold ancient-text">
                    {{ item.name }}
                  </span>
                  <span class="text-xs text-gold">{{ item.mysticalPower }}</span>
                </div>
                <div class="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  {{ item.mysticalDescription }}
                </div>
                
                <!-- Bonus level -->
                <div class="flex items-center mt-2">
                  <span class="text-xs text-gray-500 mr-2">Бонус:</span>
                  <div class="flex">
                    <i v-for="i in item.bonusLevel" :key="i" 
                       class="fas fa-star text-xs text-gold mr-1 neon-glow"
                       :style="{ animationDelay: `${i * 0.1}s` }"></i>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Special furry note -->
      <div class="mt-12 inscryption-card p-8 text-center bg-gradient-to-r from-blood/30 to-neon/20 mystical-hover relative">
        <!-- Background mystical effects -->
        <div class="absolute inset-0 opacity-20">
          <div class="w-full h-full bg-gradient-to-br from-fire/30 via-gold/20 to-green/30 animate-flicker"></div>
        </div>
        
        <div class="relative z-10">
          <div class="mb-6">
            <i class="fas fa-mask text-5xl text-accent mr-4 ember-effect animate-float"></i>
            <i class="fas fa-heart text-5xl text-red-400 mx-4 animate-glow"></i>
            <i class="fas fa-paw text-5xl text-neon ml-4 neon-glow animate-float"></i>
          </div>
          
          <h3 class="text-2xl text-white font-semibold mb-4 ancient-text">
            Особое благословение для фурри-душ!
          </h3>
          
          <p class="text-lg text-gray-300 mb-4 max-w-2xl mx-auto">
            <span class="carved-text">Фурсьют</span> приветствуется, но не обязателен! 
            Лес принимает всех, независимо от внешней оболочки.
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div class="p-4 bg-dark/50 rounded-lg border border-gold/30">
              <i class="fas fa-tshirt text-2xl text-gold mb-2 ember-effect"></i>
              <div class="text-sm ancient-text">Обычная одежда</div>
              <div class="text-xs text-gray-400 mt-1">Для тех, кто предпочитает простоту</div>
            </div>
            
            <div class="p-4 bg-dark/50 rounded-lg border border-fire/30">
              <i class="fas fa-mask text-2xl text-fire mb-2 animate-flicker"></i>
              <div class="text-sm ancient-text">Частичный фурсьют</div>
              <div class="text-xs text-gray-400 mt-1">Уши, хвост, лапы - отличный выбор</div>
            </div>
            
            <div class="p-4 bg-dark/50 rounded-lg border border-neon/30">
              <i class="fas fa-dragon text-2xl text-neon mb-2 neon-glow"></i>
              <div class="text-sm ancient-text">Полный фурсьют</div>
              <div class="text-xs text-gray-400 mt-1">Для истинных мастеров перевоплощения</div>
            </div>
          </div>
          
          <p class="text-sm text-gray-400 mt-6 ancient-text">
            Главное — хорошее настроение и готовность к приключениям в стиле Inscryption!
          </p>
        </div>
      </div>

      <!-- Mystical preparation ritual -->
      <div class="mt-12 inscryption-card p-6 mystical-hover">
        <h3 class="text-xl font-bold text-center mb-6 carved-text border-b border-gold/30 pb-4">
          <i class="fas fa-magic mr-2 ember-effect"></i>
          Ритуал подготовки к лагерю
          <i class="fas fa-scroll ml-2 neon-glow"></i>
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="(step, index) in ritualSteps" :key="index"
               class="text-center p-4 bg-dark/30 rounded-lg border border-accent/30 hover:border-accent hover:bg-accent/10 transition-all duration-300 group">
            <div class="text-3xl mb-3">
              <i :class="[step.icon, 'group-hover:animate-float', step.effect]"></i>
            </div>
            <div class="text-sm font-semibold ancient-text text-white group-hover:text-accent transition-colors">
              {{ step.title }}
            </div>
            <div class="text-xs text-gray-400 mt-2 group-hover:text-gray-300 transition-colors">
              {{ step.description }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface MysticalItem {
  icon: string
  name: string
  mysticalDescription: string
  mysticalPower: string
  mysticalType: string
  importance?: number
  bonusLevel?: number
}

interface RitualStep {
  icon: string
  title: string
  description: string
  effect: string
}

const requiredItems: MysticalItem[] = [
  { 
    icon: 'fas fa-campground', 
    name: 'Палатка-убежище', 
    mysticalDescription: 'Защита от ночных духов и непогоды. Твой храм в диких землях.',
    mysticalPower: 'Защита',
    mysticalType: 'protection',
    importance: 5
  },
  { 
    icon: 'fas fa-bed', 
    name: 'Спальник забвения', 
    mysticalDescription: 'Обеспечивает крепкий сон даже при шорохах в лесу.',
    mysticalPower: 'Восстановление',
    mysticalType: 'comfort',
    importance: 5
  },
  { 
    icon: 'fas fa-tshirt', 
    name: 'Тёплые одежды', 
    mysticalDescription: 'Лес холоден к незащищённым душам. Тепло тела - тепло духа.',
    mysticalPower: 'Выносливость',
    mysticalType: 'survival',
    importance: 4
  },
  { 
    icon: 'fas fa-spray-can', 
    name: 'Зелье от комаров', 
    mysticalDescription: 'Древний репеллент против кровожадных духов леса.',
    mysticalPower: 'Отпугивание',
    mysticalType: 'alchemy',
    importance: 5
  }
]

const optionalItems: MysticalItem[] = [
  { 
    icon: 'fas fa-cards-blank', 
    name: 'Колода судьбы', 
    mysticalDescription: 'Собственная колода для участия в турнирах и гаданиях.',
    mysticalPower: 'Предсказание',
    mysticalType: 'divination',
    bonusLevel: 4
  },
  { 
    icon: 'fas fa-swimmer', 
    name: 'Одежды для омовения', 
    mysticalDescription: 'Для ритуалов очищения в священных водах бассейна.',
    mysticalPower: 'Очищение',
    mysticalType: 'ritual',
    bonusLevel: 3
  },
  { 
    icon: 'fas fa-mask', 
    name: 'Фурсьют трансформации', 
    mysticalDescription: 'Позволяет полностью воплотить свою духовную сущность.',
    mysticalPower: 'Перевоплощение',
    mysticalType: 'transformation',
    bonusLevel: 5
  },
  { 
    icon: 'fas fa-flashlight', 
    name: 'Источник света', 
    mysticalDescription: 'Прорезает тьму ночных квестов и освещает скрытые тропы.',
    mysticalPower: 'Освещение',
    mysticalType: 'exploration',
    bonusLevel: 3
  },
  { 
    icon: 'fas fa-guitar', 
    name: 'Инструменты бардов', 
    mysticalDescription: 'Музыка усиливает магию костра и сплачивает сердца.',
    mysticalPower: 'Вдохновение',
    mysticalType: 'enchantment',
    bonusLevel: 4
  },
  { 
    icon: 'fas fa-dice-d20', 
    name: 'Игры судьбы', 
    mysticalDescription: 'Настольные игры для развлечений между ритуалами.',
    mysticalPower: 'Веселье',
    mysticalType: 'entertainment',
    bonusLevel: 3
  }
]

const ritualSteps: RitualStep[] = [
  {
    icon: 'fas fa-list-check',
    title: 'Сбор артефактов',
    description: 'Подготовь все необходимые предметы по священному списку',
    effect: 'ember-effect'
  },
  {
    icon: 'fas fa-heart',
    title: 'Очищение разума',
    description: 'Настройся на мистическую атмосферу предстоящего путешествия',
    effect: 'neon-glow'
  },
  {
    icon: 'fas fa-road',
    title: 'Начало пути',
    description: 'Отправляйся в лес с открытым сердцем и готовностью к чудесам',
    effect: 'carved-text'
  }
]

const getItemEffect = (type: string): string => {
  const effects: Record<string, string> = {
    protection: 'ember-effect',
    comfort: 'neon-glow',
    survival: 'carved-text',
    alchemy: 'ritual-text',
    divination: 'shadow-text',
    ritual: 'ancient-text',
    transformation: 'horror-text',
    exploration: 'forest-text',
    enchantment: 'mystical-text',
    entertainment: 'blood-effect'
  }
  return effects[type] || 'ember-effect'
}
</script>