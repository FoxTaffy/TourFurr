<template>
    <div>
      <header>
        <nav>
          <a href="#" class="logo">
            <img :src="logoImg" alt="TourFurr" class="logo-img" />
            <span class="logo-text">TourFurr</span>
          </a>
          <ul class="nav-links">
            <li><a href="#event" @click.prevent="scrollTo('event')">О событии</a></li>
            <li><a href="#info" @click.prevent="scrollTo('info')">Информация</a></li>
            <li><a href="#rules" @click.prevent="scrollTo('rules')">Правила</a></li>
            <li><a href="#faq" @click.prevent="scrollTo('faq')">FAQ</a></li>
            <li><a href="#contacts" @click.prevent="scrollTo('contacts')">Контакты</a></li>
            <li v-if="showAuthButtons">
              <a href="/auth" class="auth-button">Войти</a>
            </li>
            <li v-if="showAuthButtons">
              <a href="/auth?tab=register" class="auth-button register">Регистрация</a>
            </li>
            <li v-if="!showAuthButtons && !isRegistrationOpen">
              <a href="#" @click.prevent="showPinModal = true" class="auth-button">Разблокировать</a>
            </li>
          </ul>
        </nav>
      </header>

      <!-- Pin Code Modal (outside header for full screen) -->
      <Teleport to="body">
        <div v-if="showPinModal" class="modal-overlay" @click="showPinModal = false">
          <div class="modal-content" @click.stop>
            <h3>Введите пин-код</h3>
            <p>Регистрация откроется 1 марта 2026 года</p>
            <input
              v-model="pinCode"
              type="text"
              placeholder="Введите пин-код"
              @keyup.enter="checkPinCode"
              class="pin-input"
            />
            <div class="modal-buttons">
              <button @click="checkPinCode" class="btn-submit">Подтвердить</button>
              <button @click="showPinModal = false" class="btn-cancel">Отмена</button>
            </div>
            <p v-if="pinError" class="error-message">{{ pinError }}</p>
          </div>
        </div>
      </Teleport>
    </div>
  </template>
  
  <script>
  import logoImg from '../assets/logo.png'

  const REGISTRATION_OPEN_DATE = new Date('2026-03-01T00:00:00')
  const ADMIN_PIN = 'tourfurr2026'

  export default {
    name: 'Header',
    data() {
      return {
        logoImg,
        showPinModal: false,
        pinCode: '',
        pinError: '',
        isPinUnlocked: false
      }
    },
    computed: {
      isRegistrationOpen() {
        return new Date() >= REGISTRATION_OPEN_DATE
      },
      showAuthButtons() {
        return this.isRegistrationOpen || this.isPinUnlocked
      }
    },
    mounted() {
      // Проверяем сохраненный статус разблокировки
      const unlocked = localStorage.getItem('registration_unlocked')
      if (unlocked === 'true') {
        this.isPinUnlocked = true
      }
    },
    methods: {
      scrollTo(id) {
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      },
      checkPinCode() {
        if (this.pinCode === ADMIN_PIN) {
          this.isPinUnlocked = true
          localStorage.setItem('registration_unlocked', 'true')
          this.showPinModal = false
          this.pinCode = ''
          this.pinError = ''
        } else {
          this.pinError = 'Неверный пин-код'
        }
      }
    }
  }
  </script>
  
  <style scoped>
  header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: linear-gradient(
          135deg,
          rgba(26, 17, 14, 0.7) 0%,
          rgba(42, 31, 26, 0.6) 100%
      );
      backdrop-filter: blur(20px) saturate(150%);
      -webkit-backdrop-filter: blur(20px) saturate(150%);
      border-bottom: 1px solid rgba(139, 111, 71, 0.3);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  }
  
  nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      max-width: 1400px;
      margin: 0 auto;
  }
  
  .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      transition: all 0.3s ease;
  }

  .logo-img {
      height: 40px;
      width: auto;
      object-fit: contain;
      transition: transform 0.3s ease;
  }

  .logo-text {
      font-family: 'Merriweather', serif;
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--fire-glow);
      transition: all 0.3s ease;
  }

  .logo:hover .logo-text {
      color: var(--amber);
      text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  }

  .logo:hover .logo-img {
      transform: scale(1.05);
  }
  
  .nav-links {
      display: flex;
      gap: 2.5rem;
      list-style: none;
  }
  
  .nav-links a {
      color: var(--sage);
      text-decoration: none;
      font-size: 1rem;
      font-weight: 500;
      transition: all 0.3s ease;
      position: relative;
      padding: 0.25rem 0;
      cursor: pointer;
  }
  
  .nav-links a::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, var(--fire), var(--fire-glow));
      transition: width 0.3s ease;
  }
  
  .nav-links a:hover {
      color: var(--fire-glow);
  }
  
  .nav-links a:hover::after {
      width: 100%;
  }
  
  @media (max-width: 768px) {
      nav {
          flex-direction: column;
          gap: 1rem;
          padding: 1rem;
      }

      .nav-links {
          flex-wrap: wrap;
          justify-content: center;
          gap: 1rem;
      }
  }

  /* Auth buttons */
  .auth-button {
      padding: 0.5rem 1.5rem !important;
      background: linear-gradient(135deg, var(--fire) 0%, var(--fire-glow) 100%);
      color: var(--forest-deep) !important;
      border-radius: 25px;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
  }

  .auth-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 107, 53, 0.5);
      color: var(--forest-deep) !important;
  }

  .auth-button:hover::after {
      width: 0;
  }

  .auth-button.register {
      background: linear-gradient(135deg, var(--amber) 0%, var(--fire-glow) 100%);
  }

  /* Modal styles */
  .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
  }

  .modal-content {
      background: linear-gradient(
          135deg,
          rgba(42, 31, 26, 0.95) 0%,
          rgba(61, 45, 36, 0.95) 100%
      );
      padding: 2.5rem;
      border-radius: 20px;
      max-width: 400px;
      width: 90%;
      text-align: center;
      border: 1px solid rgba(139, 111, 71, 0.5);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
  }

  .modal-content h3 {
      font-family: 'Merriweather', serif;
      color: var(--fire-glow);
      margin-bottom: 1rem;
      font-size: 1.8rem;
  }

  .modal-content p {
      color: var(--sage);
      margin-bottom: 1.5rem;
  }

  .pin-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid rgba(139, 111, 71, 0.3);
      background: rgba(26, 17, 14, 0.5);
      border-radius: 10px;
      color: var(--cream);
      font-size: 1rem;
      margin-bottom: 1.5rem;
      transition: all 0.3s ease;
      font-family: 'Inter', sans-serif;
  }

  .pin-input:focus {
      outline: none;
      border-color: var(--fire-glow);
      box-shadow: 0 0 15px rgba(255, 179, 71, 0.3);
  }

  .modal-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
  }

  .btn-submit,
  .btn-cancel {
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 25px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: 'Inter', sans-serif;
  }

  .btn-submit {
      background: linear-gradient(135deg, var(--fire) 0%, var(--fire-glow) 100%);
      color: var(--forest-deep);
  }

  .btn-submit:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 107, 53, 0.5);
  }

  .btn-cancel {
      background: rgba(61, 45, 36, 0.5);
      color: var(--sage);
      border: 1px solid rgba(139, 111, 71, 0.3);
  }

  .btn-cancel:hover {
      background: rgba(61, 45, 36, 0.8);
      color: var(--cream);
  }

  .error-message {
      color: var(--fire);
      margin-top: 1rem;
      font-size: 0.9rem;
  }
  </style>