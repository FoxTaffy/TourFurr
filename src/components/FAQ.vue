<template>
    <section id="faq">
      <div class="container">
        <div class="glass-card">
          <h2 class="section-title">FAQ</h2>
          <div class="faq-container">
            <div 
              v-for="item in faqItems" 
              :key="item.id" 
              class="faq-item"
            >
              <div class="faq-question">{{ item.question }}</div>
              <div class="faq-answer">{{ item.answer }}</div>
              <a v-if="item.link" :href="item.link" target="_blank" rel="noopener noreferrer" class="faq-link">Оплатить через Т-Банк</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </template>
  
  <script>
  export default {
    name: 'FAQ',
    data() {
      return {
        faqItems: [
          {
            id: 1,
            question: 'Как зарегистрироваться?',
            answer: 'Регистрация откроется 1 марта 2026 года. Нужно будет заполнить анкету на сайте, загрузить аватар и дождаться одобрения модераторов. После аппрува появится окно для оплаты. Само событие пройдёт 6–9 августа 2026 года.'
          },
          {
            id: 2,
            question: 'Какой возраст участников?',
            answer: 'Мероприятие 18+. При регистрации необходимо подтвердить возраст.'
          },
          {
            id: 3,
            question: 'Что взять с собой?',
            answer: 'Обязательно: палатку, спальник, коврик, фонарик, одежду по погоде (в том числе теплую для вечера), средства гигиены. Рекомендуем: powerbank, дождевик, посуду, термос. Не берите дорогие вещи, которые жалко потерять.'
          },
          {
            id: 4,
            question: 'Есть ли питание на месте?',
            answer: 'Еда входит в стоимость билета.'
          },
          {
            id: 5,
            question: 'Как оплатить участие?',
            answer: 'После одобрения вашей заявки появится окно для оплаты. Оплата доступна по следующей ссылке:',
            link: 'https://www.tinkoff.ru/rm/r_siiTwKksNK.AxwPmVgKGC/GwrnL13713'
          },
          {
            id: 6,
            question: 'Можно ли приехать с собакой?',
            answer: 'Да, но нужно обязательно указать это в разделе "Индивидуальные пожелания" при регистрации. Вы несёте полную ответственность за своего питомца.'
          },
          {
            id: 7,
            question: 'Будут ли ролевые игры?',
            answer: 'Да! При регистрации вы сможете указать, насколько активно хотите участвовать в ролевых ивентах: "Очень хочу", "Хочу частично" или "Вообще не хочу". Это поможет организаторам лучше распределить роли.'
          }
        ]
      }
    }
  }
  </script>
  
  <style scoped>
  .faq-container {
      max-width: 900px;
      margin: 0 auto;
      display: grid;
      gap: 1.5rem;
  }
  
  .faq-item {
      background: linear-gradient(
          135deg,
          rgba(61, 45, 36, 0.3) 0%,
          rgba(42, 31, 26, 0.2) 100%
      );
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s ease;
  }
  
  .faq-item:hover {
      background: linear-gradient(
          135deg,
          rgba(61, 45, 36, 0.5) 0%,
          rgba(42, 31, 26, 0.4) 100%
      );
  }
  
  .faq-question {
      padding: 1.5rem;
      font-family: 'Merriweather', serif;
      font-size: 1.3rem;
      color: var(--fire-glow);
      cursor: pointer;
      position: relative;
      padding-left: 3rem;
  }
  
  .faq-question::before {
      content: '\f059';
      font-family: 'Font Awesome 6 Free';
      font-weight: 400;
      position: absolute;
      left: 1rem;
      color: var(--fire);
      font-size: 1.5rem;
  }
  
  .faq-answer {
      padding: 0 1.5rem 1.5rem 3rem;
      color: var(--sage);
      line-height: 1.8;
      font-size: 1.05rem;
  }

  .faq-link {
      display: inline-block;
      margin: 0 1.5rem 1.5rem 3rem;
      color: var(--fire-glow);
      text-decoration: underline;
      font-size: 1.05rem;
      word-break: break-all;
  }

  .faq-link:hover {
      color: var(--fire);
  }
  
  @media (max-width: 768px) {
      .faq-question {
          font-size: 1.1rem;
          padding-left: 2.5rem;
      }
  
      .faq-question::before {
          font-size: 1.2rem;
          left: 0.75rem;
      }
  
      .faq-answer {
          padding-left: 2.5rem;
          font-size: 1rem;
      }
  }
  </style>