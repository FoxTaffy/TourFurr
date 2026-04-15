<template>
    <section id="info">
      <div class="container">
        <div class="glass-card intro-card">
          <h2 class="section-title">Основная информация</h2>
          <div class="intro-content">
            <p class="intro-text">
              Организаторы уже начали подготовку — следи за новостями, самое интересное впереди! 
              Приезжай со своей палаткой, принеси хорошее настроение — остальное мы уже приготовили.
            </p>
          </div>
          <p class="notice">
            Следите за обновлениями — скоро расскажем все подробности!
          </p>
        </div>
  
        <div class="info-grid">
          <div 
            v-for="card in infoCards" 
            :key="card.id" 
            class="glass-card info-card"
          >
            <i :class="['info-icon', card.icon]"></i>
            <div class="info-label">{{ card.label }}</div>
            <div class="info-value">{{ card.value }}</div>
            <div class="info-detail">{{ card.detail }}</div>
            <div v-if="card.id === 3 && approvedCount !== null" class="info-approved">
              {{ 155 - approvedCount }} мест осталось
            </div>
          </div>
        </div>
  
        <div class="glass-card included-card">
          <h3 class="included-title">Что входит</h3>
          <div class="included-content">
            <p 
              v-for="item in includedItems" 
              :key="item.id" 
              class="included-item"
            >
              <i class="fas fa-check"></i>
              {{ item.text }}
            </p>

          </div>
        </div>
      </div>
    </section>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { supabase } from '../services/supabase'

  const approvedCount = ref<number | null>(null)

  onMounted(async () => {
    const { count } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .in('status', ['approved', 'paid'])
    if (count !== null && count !== undefined) {
      approvedCount.value = count
    }
  })

  const infoCards = [
    {
      id: 1,
      icon: 'fas fa-calendar-days',
      label: 'Даты события',
      value: 'c 6 по 9 августа',
      detail: '2026 года'
    },
    {
      id: 2,
      icon: 'fas fa-ruble-sign',
      label: 'Стоимость участия',
      value: '9900',
      detail: 'Полная оплата до 30 мая'
    },
    {
      id: 3,
      icon: 'fas fa-users',
      label: 'Количество мест',
      value: '155',
      detail: 'Участников'
    }
  ]

  const includedItems = [
  { id: 1, text: 'Безопасность и приватность: арендованная земля, только свои люди, никаких посторонних' },
  { id: 2, text: 'Полноценное питание: 3-разовое горячее с учётом нормы калорий для взрослого' },
  { id: 3, text: 'Комфорт и удобства: душ, туалет, бассейн, скошенная трава, дрова, освещение, гирлянды, бензин для генераторов' },
  { id: 4, text: 'Готовый лагерь «под ключ»: не нужно доплачивать на месте — всё уже есть' },
  { id: 5, text: 'Полноценная сюжетно-ролевая игра: декор, сцена, украшения, кемпфаеры для команд' },
  { id: 6, text: 'Насыщенная сетка расписания: разнообразные активности и игры, от смешных до сложных' },
  { id: 7, text: 'Техника, электрика, полноценное освещение, дискотека, тусовка с музыкой и сценой' },
  { id: 8, text: 'Медицинская помощь 24/7: 5 медиков с образованием, аптечка на все случаи' },
  { id: 9, text: 'Чистота и порядок: организованный вывоз мусора, наличие огнетушителей' },
  { id: 10, text: 'Призы и награды за участие и активность' },
  { id: 11, text: 'Никаких бытовых хлопот: не нужно мыть посуду или готовить' },
  { id: 12, text: 'Бесплатный Wi-Fi на территории конвента' } 
  ]
  </script>
  
  <style scoped>
  .intro-card {
      text-align: center;
      margin-bottom: 3rem;
  }
  
  .intro-content {
      max-width: 800px;
      margin: 0 auto;
  }
  
  .intro-text {
      color: var(--sage);
      font-size: 1.15rem;
      margin-bottom: 1.5rem;
      line-height: 1.8;
  }
  
  .notice {
      color: var(--sage);
      font-size: 1.05rem;
      margin-top: 1rem;
  }
  
  .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
  }
  
  .info-card {
      text-align: center;
      padding: 2rem !important;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .info-card:hover {
      transform: translateY(-8px) scale(1.02);
  }
  
  .info-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      display: block;
      color: var(--fire-glow);
      filter: drop-shadow(0 0 10px rgba(255, 179, 71, 0.5));
  }
  
  .info-label {
      color: var(--moss);
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 0.5rem;
  }
  
  .info-value {
      font-family: 'Merriweather', serif;
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--fire-glow);
      margin-bottom: 0.5rem;
  }
  
  .info-detail {
      color: var(--sage);
      font-size: 0.95rem;
  }
  
  .info-approved {
      margin-top: 0.5rem;
      color: var(--fire-glow);
      font-size: 0.9rem;
      opacity: 0.85;
  }
  
  .included-card {
      margin-top: 3rem;
  }
  
  .included-title {
      font-family: 'Merriweather', serif;
      font-size: 2rem;
      color: var(--fire-glow);
      margin-bottom: 1.5rem;
      text-align: center;
  }
  
  .included-content {
      max-width: 700px;
      margin: 0 auto;
      color: var(--sage);
      font-size: 1.05rem;
      line-height: 1.8;
  }
  
  .included-item {
      margin-bottom: 1rem;
      padding-left: 1.5rem;
      position: relative;
  }
  
  .included-item i {
      position: absolute;
      left: 0;
      color: var(--fire-glow);
  }
  
  .included-note {
      margin-bottom: 0;
      color: var(--moss);
      font-size: 0.95rem;
      margin-top: 1.5rem;
  }
  
  @media (max-width: 768px) {
      .info-grid {
          grid-template-columns: 1fr;
      }
  }
  </style>