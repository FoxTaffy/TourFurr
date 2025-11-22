<template>
    <section id="event">
      <div class="container">
        <div class="glass-card">
          <h2 class="section-title">О событии</h2>
          <div class="content">
            <p class="main-text">
              <strong>TourFurr</strong> — это уникальный лесной кемп для фурри-сообщества, который пройдёт 
              <strong>6–9 августа 2026 года</strong>. Ты сможешь окунуться в атмосферу природы, найти новых друзей и провести незабываемое время у костра под звёздным небом.
            </p>
            <p class="sub-text">
              Мы создаём пространство для творчества, общения и приключений. Здесь каждый найдёт что-то своё: от активных ролевых игр до спокойных вечеров с гитарой у огня.
            </p>
          </div>
        </div>
      </div>
    </section>
  </template>
  
  <script>
  export default {
    name: 'Event'
  }
  </script>
  
  <style scoped>
  .content {
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
  }
  
  .main-text {
      color: var(--sage);
      font-size: 1.2rem;
      margin-bottom: 1.5rem;
      line-height: 1.8;
  }
  
  .main-text strong {
      color: var(--fire-glow);
  }
  
  .sub-text {
      color: var(--sage);
      font-size: 1.05rem;
      margin-top: 1.5rem;
  }
  </style>