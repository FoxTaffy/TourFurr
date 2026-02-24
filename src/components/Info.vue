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
            <p class="included-note">
              * Еда включена в стоимость билета
            </p>
          </div>
        </div>
      </div>
    </section>
  </template>
  
  <script>
  export default {
    name: 'Info',
    data() {
      return {
        infoCards: [
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
            value: '121',
            detail: 'Участников'
          }
        ],
        includedItems: [
          { id: 1, text: 'Место на территории лагеря (приезжай со своей палаткой)' },
          { id: 2, text: 'Доступ ко всем зонам и активностям' },
          { id: 3, text: 'Участие в ролевых играх и мероприятиях' },
          { id: 4, text: 'Костровые посиделки и вечерние программы' },
          { id: 5, text: 'Печатная карта территории' }
        ]
      }
    }
  }
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