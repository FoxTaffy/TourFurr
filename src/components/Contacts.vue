<template>
    <section id="contacts">
      <div class="container">
        <div class="glass-card">
          <h2 class="section-title">Контакты</h2>
          <div class="contacts-content">
            <p class="contacts-text">
              Есть вопросы? Хочешь узнать больше? Напиши нам!
            </p>
            <div class="socials">
              <a 
                v-for="social in socials" 
                :key="social.id" 
                :href="social.link" 
                class="social-link"
              >
                <i :class="social.icon"></i>
                <span>{{ social.name }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </template>
  
  <script>
  export default {
    name: 'Contacts',
    data() {
      return {
        socials: [
          {
            id: 1,
            name: 'Telegram',
            icon: 'fab fa-telegram',
            link: '#'
          },
          {
            id: 2,
            name: 'Discord',
            icon: 'fab fa-discord',
            link: '#'
          },
          {
            id: 3,
            name: 'Email',
            icon: 'fas fa-envelope',
            link: '#'
          }
        ]
      }
    }
  }
  </script>
  
  <style scoped>
  .contacts-content {
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
  }
  
  .contacts-text {
      color: var(--sage);
      font-size: 1.1rem;
      margin-bottom: 2.5rem;
  }
  
  .socials {
      display: flex;
      justify-content: center;
      gap: 2rem;
      flex-wrap: wrap;
  }
  
  .social-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 2rem;
      background: linear-gradient(
          135deg,
          rgba(61, 45, 36, 0.4) 0%,
          rgba(42, 31, 26, 0.3) 100%
      );
      border-radius: 50px;
      text-decoration: none;
      color: var(--sage);
      font-weight: 500;
      transition: all 0.3s ease;
      border: 1px solid rgba(139, 111, 71, 0.3);
  }
  
  .social-link i {
      font-size: 1.5rem;
  }
  
  .social-link:hover {
      background: linear-gradient(
          135deg,
          rgba(61, 45, 36, 0.6) 0%,
          rgba(42, 31, 26, 0.5) 100%
      );
      transform: translateY(-4px);
      border-color: var(--fire);
      color: var(--fire-glow);
      box-shadow: 0 8px 20px rgba(255, 107, 53, 0.3);
  }
  
  @media (max-width: 768px) {
      .socials {
          flex-direction: column;
          align-items: stretch;
      }
  
      .social-link {
          justify-content: center;
      }
  }
  </style>