<template>
    <section id="contacts">
      <div class="container">
        <div class="glass-card">
          <h2 class="section-title">Контакты</h2>
          <div class="contacts-content">
            <p class="contacts-text">
              Есть вопросы? Хочешь узнать больше? Напиши нам!
            </p>

            <!-- Telegram Channel -->
            <div class="telegram-channel">
              <a :href="telegramChannel.link" target="_blank" rel="noopener noreferrer" class="channel-link">
                <i :class="telegramChannel.icon"></i>
                <div class="channel-info">
                  <div class="channel-name">{{ telegramChannel.name }}</div>
                  <div class="channel-desc">{{ telegramChannel.description }}</div>
                </div>
              </a>
            </div>

            <!-- Organizers -->
            <div class="organizers-section">
              <h3 class="organizers-title">Организаторы</h3>
              <div class="organizers-grid">
                <a
                  v-for="organizer in organizers"
                  :key="organizer.id"
                  :href="organizer.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="organizer-card"
                >
                  <div class="organizer-avatar">
                    <img :src="organizer.avatar" :alt="organizer.name" />
                  </div>
                  <div class="organizer-info">
                    <div class="organizer-name">{{ organizer.name }}</div>
                    <div class="organizer-role">{{ organizer.role }}</div>
                  </div>
                </a>
              </div>
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
        telegramChannel: {
          name: 'TourFurr Official',
          description: 'Официальный канал события',
          icon: 'fab fa-telegram',
          link: 'https://t.me/tourfurr'
        },
        organizers: [
          {
            id: 1,
            name: 'FoxTaffy',
            role: 'Главный организатор',
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=FoxTaffy&backgroundColor=ff6b35',
            link: 'https://t.me/foxtaffy'
          },
          {
            id: 2,
            name: 'ForestWolf',
            role: 'Координатор мероприятий',
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ForestWolf&backgroundColor=ffb347',
            link: 'https://t.me/forestwolf'
          }
        ]
      }
    }
  }
  </script>
  
  <style scoped>
  .contacts-content {
      text-align: center;
      max-width: 800px;
      margin: 0 auto;
  }

  .contacts-text {
      color: var(--sage);
      font-size: 1.1rem;
      margin-bottom: 2.5rem;
  }

  /* Telegram Channel */
  .telegram-channel {
      margin-bottom: 3rem;
  }

  .channel-link {
      display: inline-flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.5rem 3rem;
      background: linear-gradient(
          135deg,
          rgba(61, 45, 36, 0.6) 0%,
          rgba(42, 31, 26, 0.5) 100%
      );
      border-radius: 20px;
      text-decoration: none;
      border: 1px solid rgba(139, 111, 71, 0.4);
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }

  .channel-link i {
      font-size: 3rem;
      color: var(--fire-glow);
      filter: drop-shadow(0 0 10px rgba(255, 179, 71, 0.5));
  }

  .channel-info {
      text-align: left;
  }

  .channel-name {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--fire-glow);
      margin-bottom: 0.25rem;
  }

  .channel-desc {
      color: var(--sage);
      font-size: 1rem;
  }

  .channel-link:hover {
      transform: translateY(-4px);
      border-color: var(--fire);
      box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
  }

  /* Organizers */
  .organizers-section {
      margin-top: 3rem;
  }

  .organizers-title {
      font-family: 'Merriweather', serif;
      font-size: 1.8rem;
      color: var(--fire-glow);
      margin-bottom: 2rem;
  }

  .organizers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      max-width: 600px;
      margin: 0 auto;
  }

  .organizer-card {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.5rem;
      background: linear-gradient(
          135deg,
          rgba(61, 45, 36, 0.5) 0%,
          rgba(42, 31, 26, 0.4) 100%
      );
      border-radius: 20px;
      text-decoration: none;
      border: 1px solid rgba(139, 111, 71, 0.3);
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }

  .organizer-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid var(--fire-glow);
      box-shadow: 0 0 20px rgba(255, 179, 71, 0.3);
      flex-shrink: 0;
  }

  .organizer-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
  }

  .organizer-info {
      text-align: left;
      flex: 1;
  }

  .organizer-name {
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--fire-glow);
      margin-bottom: 0.25rem;
  }

  .organizer-role {
      color: var(--sage);
      font-size: 0.95rem;
  }

  .organizer-card:hover {
      transform: translateY(-4px);
      border-color: var(--fire);
      box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
  }

  @media (max-width: 768px) {
      .channel-link {
          flex-direction: column;
          text-align: center;
          padding: 2rem;
      }

      .channel-info {
          text-align: center;
      }

      .organizers-grid {
          grid-template-columns: 1fr;
      }

      .organizer-card {
          flex-direction: column;
          text-align: center;
      }

      .organizer-info {
          text-align: center;
      }
  }
  </style>