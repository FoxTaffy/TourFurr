<template>
    <section id="contacts">
      <div class="container">
        <div class="glass-card">
          <h2 class="section-title">Контакты</h2>
          <div class="contacts-content">
            <p class="contacts-text">
              Есть вопросы? Хочешь узнать больше? Напиши нам!
            </p>

            <!-- Telegram Chat -->
            <div class="telegram-chat-hero">
              <a :href="telegramChannel.link" target="_blank" rel="noopener noreferrer" class="chat-hero-link">
                <div class="chat-hero-icon">
                  <i :class="telegramChannel.icon"></i>
                </div>
                <div class="chat-hero-body">
                  <span class="chat-badge">Telegram ЧАТ</span>
                  <div class="chat-hero-name">{{ telegramChannel.name }}</div>
                  <div class="chat-hero-desc">{{ telegramChannel.description }}</div>
                </div>
                <div class="chat-hero-arrow">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                  </svg>
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

            <!-- Support / Donate -->
            <div class="donate-section">
              <h3 class="donate-title">Поддержать нас</h3>
              <p class="donate-text">
                Если хочешь поддержать организацию события, можно отправить донат по ссылке или через QR-код.
              </p>
              <div class="donate-content">
                <a
                  :href="donationLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="donate-button"
                >
                  <i class="fas fa-heart"></i>
                  <span>Поддержать нас</span>
                </a>
                <a
                  :href="donationLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="donate-qr-wrapper"
                >
                  <img
                    :src="donationQrUrl"
                    alt="QR-код для поддержки TourFurr"
                    class="donate-qr"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </template>
  
  <script>
  const donationLink = 'https://t.tb.ru/c2c-qr-choose-bank?requisiteNumber=+79005742596&bankCode=100000000004'
  const donationQrUrl =
    'https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=' + encodeURIComponent(donationLink)

  export default {
    name: 'Contacts',
    data() {
      return {
        telegramChannel: {
          name: 'Чат участников TourFurr',
          description: 'Присоединяйтесь к нашему Telegram-чату — общение, объявления и поддержка',
          icon: 'fab fa-telegram',
          link: 'https://t.me/+kUEOJ68BbxZkZmRi'
        },
        organizers: [
          {
            id: 1,
            name: 'Кеса',
            role: 'Мастер над геральдикой и украшениями',
            avatar: '/avatars/Kesaran.jpg',
            link: 'https://t.me/Kesaran_Pasaran'
          },
          {
            id: 2,
            name: 'Алар',
            role: 'Верховный Лорд',
            avatar: '/avatars/Alar.jpg',
            link: 'https://t.me/Alar_Neigeux'
          },
          {
            id: 3,
            name: 'Рафф',
            role: 'Мастер над монетой',
            avatar: '/avatars/Raff.jpg',
            link: 'https://t.me/DontCoffeeRaff'
          },
          {
            id: 4,
            name: 'Диеро',
            role: 'Мейстор - архивариус',
            avatar: '/avatars/Diero.jpg',
            link: 'https://t.me/Tai_Lung4'
          }
        ],
        donationLink,
        donationQrUrl
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

  /* Telegram Chat Hero */
  .telegram-chat-hero {
      margin-bottom: 3rem;
  }

  .chat-hero-link {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.75rem 2rem;
      background: linear-gradient(
          135deg,
          rgba(41, 120, 191, 0.25) 0%,
          rgba(29, 91, 148, 0.2) 100%
      );
      border-radius: 20px;
      text-decoration: none;
      border: 2px solid rgba(41, 120, 191, 0.6);
      transition: all 0.3s ease;
      box-shadow: 0 6px 25px rgba(41, 120, 191, 0.25);
      position: relative;
      overflow: hidden;
  }

  .chat-hero-link::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(41, 120, 191, 0.1), transparent);
      pointer-events: none;
  }

  .chat-hero-icon {
      flex-shrink: 0;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(41, 120, 191, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(41, 120, 191, 0.7);
  }

  .chat-hero-icon i {
      font-size: 2rem;
      color: #5ba3e0;
      filter: drop-shadow(0 0 8px rgba(91, 163, 224, 0.7));
  }

  .chat-hero-body {
      flex: 1;
      text-align: left;
  }

  .chat-badge {
      display: inline-block;
      background: rgba(41, 120, 191, 0.4);
      border: 1px solid rgba(91, 163, 224, 0.6);
      color: #7dc4f5;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      padding: 0.2rem 0.6rem;
      border-radius: 50px;
      margin-bottom: 0.4rem;
      text-transform: uppercase;
  }

  .chat-hero-name {
      font-size: 1.4rem;
      font-weight: 700;
      color: #a3d4f7;
      margin-bottom: 0.3rem;
  }

  .chat-hero-desc {
      color: var(--sage);
      font-size: 0.95rem;
      line-height: 1.5;
  }

  .chat-hero-arrow {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      color: #5ba3e0;
      opacity: 0.7;
      transition: all 0.3s ease;
  }

  .chat-hero-arrow svg {
      width: 100%;
      height: 100%;
  }

  .chat-hero-link:hover {
      transform: translateY(-4px);
      border-color: #5ba3e0;
      box-shadow: 0 12px 35px rgba(41, 120, 191, 0.45);
  }

  .chat-hero-link:hover .chat-hero-arrow {
      opacity: 1;
      transform: translateX(4px);
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

    /* Donate / Support */
    .donate-section {
      margin-top: 3rem;
      padding-top: 2.5rem;
      border-top: 1px solid rgba(139, 111, 71, 0.3);
    }

    .donate-title {
      font-family: 'Merriweather', serif;
      font-size: 1.8rem;
      color: var(--fire-glow);
      margin-bottom: 1rem;
    }

    .donate-text {
      color: var(--sage);
      font-size: 1rem;
      max-width: 540px;
      margin: 0 auto 1.75rem auto;
    }

    .donate-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .donate-button {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.9rem 1.8rem;
      border-radius: 999px;
      border: 1px solid rgba(255, 179, 71, 0.7);
      background: radial-gradient(circle at top left, rgba(255, 179, 71, 0.3), rgba(61, 45, 36, 0.8));
      color: #fff;
      font-weight: 600;
      font-size: 1rem;
      text-decoration: none;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
      transition: all 0.25s ease;
    }

    .donate-button i {
      color: var(--fire-glow);
      filter: drop-shadow(0 0 8px rgba(255, 179, 71, 0.6));
    }

    .donate-button:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 8px 26px rgba(255, 107, 53, 0.5);
      border-color: var(--fire);
    }

    .donate-qr-wrapper {
      padding: 0.75rem;
      border-radius: 24px;
      background: linear-gradient(
        135deg,
        rgba(61, 45, 36, 0.7) 0%,
        rgba(42, 31, 26, 0.6) 100%
      );
      border: 1px solid rgba(139, 111, 71, 0.6);
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
      display: inline-block;
      transition: all 0.25s ease;
    }

    .donate-qr-wrapper:hover {
      transform: translateY(-2px);
      border-color: var(--fire);
      box-shadow: 0 8px 26px rgba(255, 107, 53, 0.4);
    }

    .donate-qr {
      display: block;
      width: 200px;
      height: 200px;
      object-fit: contain;
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

    .donate-text {
      margin-bottom: 1.5rem;
    }
  }
  </style>