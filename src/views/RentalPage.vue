<template>
  <div class="rental-page-root">
    <div class="bg-forest"></div>
    <div class="fog"></div>

    <Header :isDashboard="false" />

    <main class="rental-page">
      <div class="page-container">
        <section id="rental-hero" class="rental-hero">
          <div class="container">
            <div class="hero-content glass-card">
              <h1 class="hero-title">Аренда снаряжения</h1>
              <p class="hero-subtitle">Полный комфорт без забот о снаряжении</p>
            </div>
          </div>
        </section>

      <section id="rental-equipment" class="rental-section">
        <div class="container">
          <div class="glass-card">
            <h2 class="section-title">Наши предложения</h2>
            
            <div class="equipment-grid">
              <!-- Equipment cards from images -->
              <div class="equipment-card" @click="openModal('/images/rental-1.jpg', 'Люкс палатка')">
                <div class="equipment-image">
                  <img src="/images/rental-1.jpg" alt="Люкс палатка" />
                </div>
                <h3 class="equipment-name">Люкс палатка</h3>
                <p class="equipment-price">25 000 ₽</p>
                <p class="equipment-desc">Полный комплект: палатка 2.5м, матрас, спальник, подушки, полотенца, фонари</p>
              </div>

              <div class="equipment-card" @click="openModal('/images/rental-2.jpg', 'Комфорт+')">
                <div class="equipment-image">
                  <img src="/images/rental-2.jpg" alt="Комфорт палатка" />
                </div>
                <h3 class="equipment-name">Комфорт+</h3>
                <p class="equipment-price">10 000 ₽</p>
                <p class="equipment-desc">Удобный вариант: палатка, большой матрас, тёплые пледы, подушки, столик, фонарь</p>
              </div>

              <div class="equipment-card" @click="openModal('/images/rental-3.jpg', 'Базовый комплект')">
                <div class="equipment-image">
                  <img src="/images/rental-3.jpg" alt="Базовый комплект" />
                </div>
                <h3 class="equipment-name">Базовый комплект</h3>
                <p class="equipment-price">5 000 ₽</p>
                <p class="equipment-desc">Оптимальный вариант: палатка на двоих, матрас, полотенца, спальник</p>
              </div>

              <div class="equipment-card" @click="openModal('/images/rental-4.jpg', 'Минимальный комплект')">
                <div class="equipment-image">
                  <img src="/images/rental-4.jpg" alt="Минимальный комплект" />
                </div>
                <h3 class="equipment-name">Минимальный комплект</h3>
                <p class="equipment-price">2 500 ₽</p>
                <p class="equipment-desc">Экономный вариант: палатка, матрас, спальный мешок</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="rental-info" class="rental-section">
        <div class="container">
          <div class="glass-card info-card">
            <h2 class="section-title">Важная информация</h2>
            
            <div class="info-content">
              <div class="info-item">
                <div class="info-number">1</div>
                <p>Рекомендуемая вместимость арендуемых палаток. Вы можете заселить в нее сколько угодно человек (в пределах разумного).</p>
              </div>

              <div class="info-item">
                <div class="info-number">2</div>
                <p>При аренде тарифов "комфорт+" и "люкс", при заселении большего количества человек, вы можете запросить необходимое количество дополнительных принадлежностей (тапочки, полотенца, простыни, раздельные матрасы и так далее).</p>
              </div>

              <div class="info-item">
                <div class="info-number">3</div>
                <p>Средства личного пользования - тапочки, полотенца, простыни, пледы - по желанию можно оставить себе.</p>
              </div>

              <div class="info-item">
                <div class="info-number">4</div>
                <p>При порче арендуемого имущества арендатору будет выставлен счёт на сумму его закупочной стоимости.</p>
              </div>

              <div class="info-item">
                <div class="info-number">5</div>
                <p>Матрас может быть заменен на комплект спальник+пенка по вашему желанию.</p>
              </div>
            </div>

            <div class="contact-section">
              <h3 class="contact-title">По вопросам аренды</h3>
              <p class="contact-text">Просьба связаться с Кусакой</p>
              <a href="https://t.me/Kusaka_Yep" target="_blank" rel="noopener noreferrer" class="contact-link">
                @Kusaka_Yep
              </a>
            </div>
          </div>
        </div>
      </section>
      </div>

      <!-- Modal for image viewing -->
      <div v-if="showModal" class="modal" @click="closeModal">
        <div class="modal-content" @click.stop>
          <button class="close-btn" @click="closeModal">&times;</button>
          <img :src="selectedImage" :alt="selectedName" class="modal-image" />
          <h3 class="modal-title">{{ selectedName }}</h3>
        </div>
      </div>

    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { ref } from 'vue'

const showModal = ref(false)
const selectedImage = ref('')
const selectedName = ref('')

const openModal = (image: string, name: string) => {
  selectedImage.value = image
  selectedName.value = name
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}
</script>

<style scoped>
.rental-page-root {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.rental-page {
  min-height: calc(100vh - 6rem);
  display: flex;
  flex-direction: column;
  background: transparent;
  position: relative;
  z-index: 1;
}

.page-container {
  flex: 1;
}

.rental-hero {
  background: linear-gradient(
    135deg,
    rgba(255, 179, 71, 0.15) 0%,
    rgba(139, 92, 246, 0.1) 100%
  );
  padding: 4rem 2rem;
  text-align: center;
  border-bottom: 1px solid rgba(255, 179, 71, 0.2);
}

.hero-content {
  max-width: 900px;
  margin: 0 auto;
}

.hero-title {
  font-family: 'Merriweather', serif;
  font-size: 3.5rem;
  font-weight: 700;
  color: var(--fire-glow);
  margin-bottom: 1rem;
  text-shadow: 0 2px 10px rgba(255, 179, 71, 0.3);
}

.hero-subtitle {
  font-size: 1.3rem;
  color: var(--sage);
  margin-bottom: 0;
}

.rental-section {
  padding: 4rem 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.glass-card {
  background: rgba(26, 17, 14, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(139, 111, 71, 0.2);
  border-radius: 20px;
  padding: 3rem;
}

.section-title {
  font-family: 'Merriweather', serif;
  font-size: 2.2rem;
  color: var(--fire-glow);
  margin-bottom: 2rem;
  text-align: center;
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(280px, 1fr));
  gap: 2rem;
  margin: 0 auto 2rem;
  max-width: 1040px;
  align-items: stretch;
}

.equipment-card {
  background: rgba(42, 31, 26, 0.5);
  border: 1px solid rgba(139, 111, 71, 0.3);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 100%;
}

.equipment-card:hover {
  border-color: rgba(255, 179, 71, 0.5);
  transform: translateY(-4px);
}

.equipment-image {
  width: 100%;
  height: 200px;
  background: rgba(139, 111, 71, 0.1);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.equipment-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.equipment-card > * {
  padding: 0 1rem;
}

.equipment-card > :first-child {
  margin: 0;
}

.equipment-name {
  font-family: 'Merriweather', serif;
  font-size: 1.2rem;
  color: var(--fire-glow);
  margin: 1.25rem 0 0.5rem 0;
}

.equipment-price {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--moss);
  margin: 0.5rem 0;
}

.equipment-desc {
  font-size: 0.9rem;
  color: var(--sage);
  line-height: 1.5;
  margin: 1rem 0 1.5rem 0;
}

.info-card {
  max-width: 1000px;
  margin: 0 auto;
}

.info-content {
  display: grid;
  gap: 2rem;
  margin-bottom: 3rem;
}

.info-item {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.info-number {
  flex-shrink: 0;
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, rgba(255, 179, 71, 0.2), rgba(139, 92, 246, 0.2));
  border: 2px solid var(--fire-glow);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--fire-glow);
  font-size: 1.1rem;
  margin-top: 0.25rem;
}

.info-item p {
  color: var(--sage);
  line-height: 1.8;
  font-size: 1.05rem;
  margin: 0;
}

.contact-section {
  margin-top: 3rem;
  padding-top: 3rem;
  border-top: 1px solid rgba(255, 179, 71, 0.2);
  text-align: center;
}

.contact-title {
  font-family: 'Merriweather', serif;
  font-size: 1.5rem;
  color: var(--fire-glow);
  margin-bottom: 1rem;
}

.contact-text {
  color: var(--sage);
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.contact-link {
  display: inline-block;
  background: linear-gradient(135deg, rgba(255, 179, 71, 0.15), rgba(139, 92, 246, 0.15));
  border: 2px solid var(--fire-glow);
  color: var(--fire-glow);
  padding: 1rem 2rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.contact-link:hover {
  background: linear-gradient(135deg, rgba(255, 179, 71, 0.25), rgba(139, 92, 246, 0.25));
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .rental-hero {
    padding: 2rem 1rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1.05rem;
  }

  .rental-section {
    padding: 2rem 1rem;
  }

  .glass-card {
    padding: 1.5rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .equipment-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .info-item {
    gap: 1rem;
  }

  .info-number {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: rgba(26, 17, 14, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(139, 111, 71, 0.5);
  border-radius: 20px;
  padding: 2rem;
  width: min(100%, 960px);
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  position: relative;
  text-align: center;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--fire-glow);
  font-size: 2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 179, 71, 0.2);
}

.modal-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 10px;
}

.modal-title {
  color: var(--fire-glow);
  margin-top: 1rem;
  font-family: 'Merriweather', serif;
  font-size: 1.5rem;
}
</style>
