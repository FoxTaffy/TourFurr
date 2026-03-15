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
          name: 'TourFurr News',
          description: 'Официальный канал события',
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