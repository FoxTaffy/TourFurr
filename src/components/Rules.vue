<template>
    <section id="rules">
      <div class="container">
        <div class="glass-card">
          <h2 class="section-title">Правила лагеря</h2>
          <ul class="rules-list">
            <li 
              v-for="rule in rules" 
              :key="rule.id"
              :data-icon="rule.icon"
            >
              {{ rule.text }}
            </li>
          </ul>
        </div>
      </div>
    </section>
  </template>
  
  <script>
  export default {
    name: 'Rules',
    data() {
      return {
        rules: [
          {
            id: 1,
            icon: '\uf2b5',
            text: 'Будь добр к людям и к природе. Мы здесь, чтобы кайфовать, а не конфликтовать!'
          },
          {
            id: 2,
            icon: '\uf51a',
            text: 'Чисто не там, где убирают, а где не мусорят — но если захочешь помочь кому-то ещё, будет вообще круто.'
          },
          {
            id: 3,
            icon: '\uf06d',
            text: 'Вода и огонь — наши союзники, если обращаться с ними с уважением. Соблюдай технику безопасности, и не разжигай огонь рядом с горючими предметами!'
          },
          {
            id: 4,
            icon: '\uf0e7',
            text: 'Есть вопрос или идея? Модераторы рядом.'
          },
          {
            id: 5,
            icon: '\uf11b',
            text: 'В играх будь активным, но не забывай про безопасность. Никакой агрессии, толчков и укусов!'
          },
          {
            id: 6,
            icon: '\uf554',
            text: 'Если хочешь прогуляться за пределы лагеря — просто сообщи организаторам, чтобы мы не переживали.'
          },
          {
            id: 7,
            icon: '\uf5d2',
            text: 'Следи за вещами, особенно если они тебе дороги. Лучше взять то, с чем не страшно бегать по лесу. Администрация не несёт ответственности за потеряшки, хоть и будет рада вам помочь их отыскать.'
          },
          {
            id: 8,
            icon: '\uf6fc',
            text: 'Нужен душ, еда, зарядка, плед или даже обнимашка — загляни в штаб, мы рядом.'
          },
          {
            id: 9,
            icon: '\uf1bb',
            text: 'Не обижай лес! Не нужно рубить или обдирать деревья если они живы. Смотри то, что уже опало.'
          },
          {
            id: 10,
            icon: '\uf017',
            text: 'Помни о спящих! У нас есть "тихий лагерь" в котором с 22:00 и до 8:00 действует "Комендантский час" во время которого просим вас быть потише, что бы не тревожить покой спящих граждан.'
          },
          {
            id: 11,
            icon: '\uf5a0',
            text: 'Уходя из гостей прояви уважение к хозяевам и не забудь собрать и забрать с собою весь свой мусор. Пусть лес останется таким же, каким мы в него вошли!'
          }
        ]
      }
    }
  }
  </script>
  
  <style scoped>
  .rules-list {
      list-style: none;
      display: grid;
      gap: 1.5rem;
      max-width: 900px;
      margin: 0 auto;
  }
  
  .rules-list li {
      padding: 1.5rem 1.5rem 1.5rem 4rem;
      background: linear-gradient(
          135deg,
          rgba(61, 45, 36, 0.3) 0%,
          rgba(42, 31, 26, 0.2) 100%
      );
      border-radius: 16px;
      border-left: 4px solid var(--fire);
      position: relative;
      transition: all 0.3s ease;
      color: var(--sage);
      font-size: 1.05rem;
      line-height: 1.7;
  }
  
  .rules-list li::before {
      content: attr(data-icon);
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.8rem;
      font-family: 'Font Awesome 6 Free';
      font-weight: 900;
      color: var(--fire-glow);
  }
  
  .rules-list li:hover {
      background: linear-gradient(
          135deg,
          rgba(61, 45, 36, 0.5) 0%,
          rgba(42, 31, 26, 0.4) 100%
      );
      transform: translateX(10px);
  }
  
  @media (max-width: 768px) {
      .rules-list li {
          padding: 1.2rem 1rem 1.2rem 3.5rem;
          font-size: 1rem;
      }
  
      .rules-list li::before {
          left: 0.75rem;
          font-size: 1.5rem;
      }
  }
  </style>