<template>
  <section id="contacts">
    <div class="container">
      <h2 class="section-title">Контакты</h2>

      <!-- Telegram канал -->
      <div class="glass-card telegram-card">
        <h3 class="channel-title">
          <i class="fab fa-telegram"></i>
          Telegram-канал
        </h3>
        <p class="channel-description">
          Следи за новостями и обновлениями о TourFurr
        </p>
        <a href="#" class="telegram-link" target="_blank" rel="noopener noreferrer">
          <i class="fab fa-telegram"></i>
          @tourfurr_camp
        </a>
      </div>

      <!-- Организаторы -->
      <div class="organizers-section">
        <h3 class="organizers-title">Организаторы</h3>
        <div class="organizers-grid">
          <div
            v-for="organizer in organizers"
            :key="organizer.id"
            class="glass-card organizer-card"
          >
            <img
              :src="organizer.avatar"
              :alt="organizer.name"
              class="organizer-avatar"
            />
            <h4 class="organizer-name">{{ organizer.name }}</h4>
            <p class="organizer-role">{{ organizer.role }}</p>
            <a
              :href="organizer.telegram"
              class="organizer-contact"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i class="fab fa-telegram"></i>
              {{ organizer.telegramNick }}
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
      organizers: [
        {
          id: 1,
          name: 'FoxTaffy',
          role: 'Главный организатор',
          avatar: '/images/avatars/default-avatar.jpg',
          telegram: 'https://t.me/foxtaffy',
          telegramNick: '@foxtaffy'
        },
        {
          id: 2,
          name: 'Организатор 2',
          role: 'Со-организатор',
          avatar: '/images/avatars/default-avatar.jpg',
          telegram: 'https://t.me/organizer2',
          telegramNick: '@organizer2'
        }
      ]
    }
  }
}
</script>

<style scoped>
.telegram-card {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2.5rem !important;
}

.channel-title {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  color: var(--fire-glow);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.channel-title i {
  font-size: 2.5rem;
}

.channel-description {
  color: var(--sage);
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.telegram-link {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  background: linear-gradient(135deg, #0088cc 0%, #00aced 100%);
  color: white;
  text-decoration: none;
  font-size: 1.2rem;
  font-weight: 600;
  border-radius: 50px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 136, 204, 0.3);
}

.telegram-link i {
  font-size: 1.5rem;
}

.telegram-link:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 136, 204, 0.5);
}

.organizers-section {
  margin-top: 3rem;
}

.organizers-title {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  color: var(--fire-glow);
  text-align: center;
  margin-bottom: 2rem;
}

.organizers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.organizer-card {
  text-align: center;
  padding: 2rem !important;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.organizer-card:hover {
  transform: translateY(-8px) scale(1.02);
}

.organizer-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 1.5rem;
  border: 3px solid var(--fire-glow);
  box-shadow: 0 4px 20px rgba(255, 179, 71, 0.3);
}

.organizer-name {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  color: var(--fire-glow);
  margin-bottom: 0.5rem;
}

.organizer-role {
  color: var(--moss);
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1.5rem;
}

.organizer-contact {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
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

.organizer-contact i {
  font-size: 1.2rem;
}

.organizer-contact:hover {
  background: linear-gradient(
    135deg,
    rgba(61, 45, 36, 0.6) 0%,
    rgba(42, 31, 26, 0.5) 100%
  );
  transform: translateY(-2px);
  border-color: var(--fire);
  color: var(--fire-glow);
  box-shadow: 0 6px 15px rgba(255, 107, 53, 0.3);
}

@media (max-width: 768px) {
  .organizers-grid {
    grid-template-columns: 1fr;
  }
}
</style>
