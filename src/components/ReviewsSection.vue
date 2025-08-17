<template>
  <section class="py-20 px-4 bg-gradient-to-b from-dark to-blood/10">
    <div class="max-w-6xl mx-auto">
      <!-- Заголовок секции -->
      <h2 class="text-4xl md:text-5xl font-metal text-center neon-glow mb-16 forest-text">
        <i class="fas fa-scroll mr-4 text-accent ember-effect"></i>
        Свидетельства выживших
        <i class="fas fa-feather ml-4 text-accent animate-float"></i>
      </h2>

      <!-- Отзывы -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <div 
          v-for="review in reviews" 
          :key="review.id" 
          class="inscryption-card p-6 hover:scale-105 transition-all duration-300 mystical-hover"
          :style="{ animationDelay: `${review.id * 0.1}s` }"
        >
          <!-- Заголовок отзыва с аватаром -->
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-gold/30">
              <img 
                :src="review.avatar" 
                :alt="review.name"
                class="w-full h-full object-cover"
                @error="handleImageError"
              >
            </div>
            <div>
              <h4 class="text-lg font-bold text-white carved-text">{{ review.name }}</h4>
              <!-- Рейтинг звездами -->
              <div class="flex text-accent">
                <i 
                  v-for="i in 5" 
                  :key="i" 
                  :class="[
                    'fas text-sm mr-1',
                    i <= review.rating ? 'fa-star ember-effect' : 'fa-star text-gray-600'
                  ]"
                ></i>
              </div>
            </div>
          </div>

          <!-- Текст отзыва -->
          <blockquote class="text-gray-300 italic leading-relaxed border-l-4 border-neon/30 pl-4">
            <div class="relative">
              <i class="fas fa-quote-left text-accent text-sm opacity-50 absolute -left-2 -top-2"></i>
              <span class="ancient-text">{{ review.text }}</span>
              <i class="fas fa-quote-right text-accent text-sm opacity-50 float-right mt-2"></i>
            </div>
          </blockquote>
        </div>
      </div>

      <!-- Статистика -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div 
          v-for="stat in statistics" 
          :key="stat.label"
          class="inscryption-card p-6 text-center hover:blood-border transition-all duration-300"
        >
          <div class="text-4xl mb-3">
            <i :class="[stat.icon, 'ember-effect']"></i>
          </div>
          <div class="text-3xl font-bold carved-text text-white mb-2">{{ stat.value }}</div>
          <div class="text-sm ancient-text text-gray-400">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

/**
 * Интерфейс для отзыва участника
 */
interface Review {
  id: number
  name: string
  avatar: string
  text: string
  rating: number
}

/**
 * Интерфейс для статистической информации
 */
interface Statistic {
  icon: string
  value: string
  label: string
}

/**
 * Отзывы участников прошлых лагерей
 * Простая структура: аватар, имя, текст, оценка
 */
const reviews = ref<Review[]>([
  {
    id: 1,
    name: 'ЛисичкаАли',
    avatar: '/images/avatars/fox-avatar.jpg',
    text: 'Потрясающая атмосфера! Лес действительно погружает в мир Inscryption. Карточные игры у костра, новые друзья и незабываемые впечатления. Обязательно вернусь в следующем году!',
    rating: 5
  },
  {
    id: 2,
    name: 'ВолчараМакс',
    avatar: '/images/avatars/wolf-avatar.jpg',
    text: 'Организация на высшем уровне! Баня-палатка стала настоящим спасением после активного дня. Ночные квесты добавили адреналина. Рекомендую всем любителям приключений.',
    rating: 5
  },
  {
    id: 3,
    name: 'КотоЛуна',
    avatar: '/images/avatars/cat-avatar.jpg',
    text: 'Первый раз в подобном лагере, но точно не последний! Атмосфера мистическая, но уютная. Хоррор-игры в палатках при свечах — это что-то невероятное. Спасибо организаторам!',
    rating: 4
  },
  {
    id: 4,
    name: 'ДраконВладис',
    avatar: '/images/avatars/dragon-avatar.jpg',
    text: 'Как опытный участник различных лагерей, могу сказать — TourFurr превзошёл ожидания. Карточные турниры были честными и увлекательными. Место идеально подходит для отдыха.',
    rating: 5
  },
  {
    id: 5,
    name: 'ЕнотМистик',
    avatar: '/images/avatars/raccoon-avatar.jpg',
    text: 'Бар порадовал разнообразием напитков, а баня помогла расслабиться. Каждый день был насыщен событиями. Особенно понравились вечерние посиделки у костра с гитарой.',
    rating: 5
  },
  {
    id: 6,
    name: 'СоваМудрая',
    avatar: '/images/avatars/owl-avatar.jpg',
    text: 'Ночная атмосфера лагеря просто волшебная. Звуки леса, мерцание костров, интересные беседы... Это место заряжает энергией и дарит вдохновение. Советую всем фуррям!',
    rating: 4
  }
])

/**
 * Статистические данные о лагере
 */
const statistics = ref<Statistic[]>([
  { 
    icon: 'fas fa-users', 
    value: '250+', 
    label: 'Выживших игроков' 
  },
  { 
    icon: 'fas fa-star', 
    value: '4.9', 
    label: 'Средний рейтинг' 
  },
  { 
    icon: 'fas fa-fire', 
    value: '100%', 
    label: 'Магический опыт' 
  },
  { 
    icon: 'fas fa-heart', 
    value: '95%', 
    label: 'Хотят вернуться' 
  }
])

/**
 * Обработчик ошибки загрузки изображения
 * Заменяет сломанное изображение на placeholder
 */
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = '/images/avatars/default-avatar.jpg'
}
</script>

<style scoped>
/**
 * Дополнительные стили для компонента
 * Используем CSS-переменные для консистентности
 */

/* Анимация появления карточек */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Применяем анимацию к карточкам отзывов */
.inscryption-card {
  animation: fadeInUp 0.6s ease-out forwards;
}

/* Эффект наведения на статистику */
.hover\:blood-border:hover {
  border-color: rgba(255, 107, 53, 0.5);
  background: rgba(255, 107, 53, 0.05);
}

/* Стили для аватаров */
.inscryption-card img {
  transition: transform 0.3s ease;
}

.inscryption-card:hover img {
  transform: scale(1.05);
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .inscryption-card {
    margin: 0 8px;
  }
  
  /* Уменьшаем размер статистики на мобильных */
  .statistics-value {
    font-size: 1.5rem;
  }
}

/* Сниженная анимация для пользователей с ограниченными возможностями */
@media (prefers-reduced-motion: reduce) {
  .inscryption-card {
    animation: none;
  }
  
  .inscryption-card:hover {
    transform: none;
  }
}
</style>