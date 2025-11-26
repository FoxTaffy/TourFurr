<template>
    <header>
      <nav>
        <a href="#" class="logo">
          <i class="fas fa-campground"></i>
          TourFurr
        </a>
        <ul class="nav-links">
          <li><a href="#event" @click.prevent="scrollTo('event')">О событии</a></li>
          <li><a href="#info" @click.prevent="scrollTo('info')">Информация</a></li>
          <li><a href="#rules" @click.prevent="scrollTo('rules')">Правила</a></li>
          <li><a href="#faq" @click.prevent="scrollTo('faq')">FAQ</a></li>
          <li><a href="#contacts" @click.prevent="scrollTo('contacts')">Контакты</a></li>
        </ul>

        <div class="auth-buttons">
          <!-- Кнопка админ-доступа (показывается только до 1 марта 2026 и если нет доступа) -->
          <button
            v-if="!isRegistrationOpen && !hasAdminAccess"
            @click="openPinModal"
            class="btn-admin"
            title="Админ-доступ"
          >
            <i class="fas fa-key"></i>
          </button>

          <!-- Кнопки входа/регистрации (показываются после 1 марта или с админ-доступом) -->
          <template v-if="isRegistrationOpen || hasAdminAccess">
            <button @click="login" class="btn-auth btn-login">Войти</button>
            <button @click="register" class="btn-auth btn-register">Регистрация</button>
          </template>
        </div>
      </nav>

      <AdminPinModal
        :isOpen="isPinModalOpen"
        @close="closePinModal"
        @pin-verified="onPinVerified"
      />
    </header>
  </template>
  
  <script>
  import AdminPinModal from './AdminPinModal.vue'

  export default {
    name: 'Header',
    components: {
      AdminPinModal
    },
    data() {
      return {
        hasAdminAccess: false,
        isPinModalOpen: false
      }
    },
    computed: {
      isRegistrationOpen() {
        const now = new Date()
        const openingDate = new Date('2026-03-01T00:00:00')
        return now >= openingDate
      }
    },
    mounted() {
      // Проверяем сохраненный админ-доступ
      this.hasAdminAccess = localStorage.getItem('admin_access') === 'true'
    },
    methods: {
      scrollTo(id) {
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      },
      openPinModal() {
        this.isPinModalOpen = true
      },
      closePinModal() {
        this.isPinModalOpen = false
      },
      onPinVerified() {
        this.hasAdminAccess = true
        alert('Добро пожаловать, администратор!')
      },
      login() {
        // TODO: Реализовать логику входа
        alert('Функция входа будет реализована позже')
      },
      register() {
        const element = document.getElementById('registration')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
      font-family: 'Playfair Display', serif;
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--fire-glow);
      text-decoration: none;
      transition: all 0.3s ease;
  }
  
  .logo i {
      font-size: 2rem;
      animation: pulse 2s ease-in-out infinite;
  }
  
  @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
  }
  
  .logo:hover {
      color: var(--amber);
      text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
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
  
  /* Auth buttons */
  .auth-buttons {
      display: flex;
      gap: 1rem;
      align-items: center;
  }

  .btn-admin {
      background: rgba(93, 74, 58, 0.3);
      border: 1px solid rgba(139, 111, 71, 0.4);
      color: var(--sage);
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1rem;
  }

  .btn-admin:hover {
      background: rgba(139, 111, 71, 0.4);
      color: var(--fire-glow);
      border-color: var(--fire-glow);
  }

  .btn-auth {
      padding: 0.625rem 1.25rem;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
  }

  .btn-login {
      background: rgba(93, 74, 58, 0.3);
      color: var(--sage);
      border: 1px solid rgba(139, 111, 71, 0.4);
  }

  .btn-login:hover {
      background: rgba(93, 74, 58, 0.5);
      color: var(--cream);
      border-color: var(--sage);
  }

  .btn-register {
      background: linear-gradient(135deg, var(--fire) 0%, var(--fire-glow) 100%);
      color: var(--forest-deep);
  }

  .btn-register:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
  }

  @media (max-width: 1024px) {
      nav {
          flex-wrap: wrap;
          gap: 1rem;
      }

      .nav-links {
          order: 3;
          width: 100%;
          justify-content: center;
          gap: 1.5rem;
          flex-wrap: wrap;
      }

      .auth-buttons {
          order: 2;
      }
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

      .auth-buttons {
          width: 100%;
          justify-content: center;
      }
  }
  </style>