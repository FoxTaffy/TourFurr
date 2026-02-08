<template>
    <div>
      <header>
        <nav>
          <a :href="isDashboard ? '/' : '#'" class="logo">
            <img :src="logoImg" alt="TourFurr" class="logo-img" />
            <span class="logo-text">TourFurr</span>
          </a>

          <!-- Mobile Menu Toggle -->
          <button
            v-if="!isDashboard"
            class="mobile-menu-toggle"
            @click="mobileMenuOpen = !mobileMenuOpen"
            :class="{ active: mobileMenuOpen }"
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <!-- Navigation Links (for home page) -->
          <ul v-if="!isDashboard" class="nav-links" :class="{ open: mobileMenuOpen }">
            <li><a href="#event" @click.prevent="scrollToAndClose('event')">О событии</a></li>
            <li><a href="#info" @click.prevent="scrollToAndClose('info')">Информация</a></li>
            <li><a href="#rules" @click.prevent="scrollToAndClose('rules')">Правила</a></li>
            <li><a href="#faq" @click.prevent="scrollToAndClose('faq')">FAQ</a></li>
            <li><a href="#contacts" @click.prevent="scrollToAndClose('contacts')">Контакты</a></li>
            <li v-if="showAuthButtons && !isAuthenticated">
              <a href="/auth" class="auth-button">Войти</a>
            </li>
            <li v-if="showAuthButtons && isAuthenticated">
              <a href="/teams" class="teams-nav-link">Дома</a>
            </li>
            <li v-if="showAuthButtons && isAuthenticated">
              <a href="/dashboard" class="user-mini-card-link">
                <div class="user-mini-card">
                  <img :src="currentUser.avatar || defaultAvatar" :alt="currentUser.nickname" class="user-avatar" />
                  <div class="user-info">
                    <div class="user-name">{{ currentUser.nickname }}<TeamBadge :teamId="currentUser.teamId" /></div>
                    <div class="user-status" :class="`status-${currentUser.status}`">{{ statusText }}</div>
                  </div>
                </div>
              </a>
            </li>
            <li v-if="!showAuthButtons && !isRegistrationOpen">
              <a href="#" @click.prevent="showPinModal = true" class="auth-button">Разблокировать</a>
            </li>
          </ul>

          <!-- Dashboard Actions -->
          <div v-else class="dashboard-actions">
            <a v-if="currentUser && currentUser.status === 'approved'" href="/schedule" class="schedule-btn">
              <svg class="schedule-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              Расписание
            </a>
            <a href="/teams" class="teams-btn">
              <svg class="teams-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/>
              </svg>
              Дома
            </a>
            <button @click="handleLogout" class="logout-btn">
              <svg class="logout-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Выйти
            </button>
          </div>
        </nav>
      </header>

      <!-- Mobile Menu Overlay -->
      <div
        v-if="!isDashboard && mobileMenuOpen"
        class="mobile-overlay"
        @click="mobileMenuOpen = false"
      ></div>

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
  import { useAuthStore } from '../stores/auth'
  import { computed } from 'vue'
  import { isRegistrationOpen, verifyAdminPin } from '../utils/env'
  import TeamBadge from './TeamBadge.vue'

  export default {
    name: 'Header',
    components: { TeamBadge },
    props: {
      isDashboard: {
        type: Boolean,
        default: false
      }
    },
    setup() {
      const authStore = useAuthStore()
      return {
        authStore,
        isAuthenticated: computed(() => authStore.isAuthenticated),
        currentUser: computed(() => authStore.user)
      }
    },
    data() {
      return {
        logoImg,
        showPinModal: false,
        pinCode: '',
        pinError: '',
        isPinUnlocked: false,
        mobileMenuOpen: false,
        defaultAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=default&backgroundColor=ff6b35'
      }
    },
    computed: {
      isRegistrationOpen() {
        return isRegistrationOpen()
      },
      showAuthButtons() {
        return this.isRegistrationOpen || this.isPinUnlocked
      },
      statusText() {
        if (!this.currentUser) return ''
        const statusMap = {
          pending: 'На рассмотрении',
          approved: 'Одобрено',
          rejected: 'Отклонено'
        }
        return statusMap[this.currentUser.status] || this.currentUser.status
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
      scrollToAndClose(id) {
        this.scrollTo(id)
        this.mobileMenuOpen = false
      },
      checkPinCode() {
        if (verifyAdminPin(this.pinCode)) {
          this.isPinUnlocked = true
          localStorage.setItem('registration_unlocked', 'true')
          this.showPinModal = false
          this.pinCode = ''
          this.pinError = ''
        } else {
          this.pinError = 'Неверный пин-код'
        }
      },
      handleLogout() {
        this.authStore.logout()
        window.location.href = '/auth'
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
      align-items: center;
      margin: 0;
      padding: 0;
  }

  .nav-links li {
      display: flex;
      align-items: center;
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
  
  /* Mobile Menu Toggle Button */
  .mobile-menu-toggle {
      display: none;
      flex-direction: column;
      justify-content: space-between;
      width: 30px;
      height: 24px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      z-index: 1001;
      transition: transform 0.3s ease;
  }

  .mobile-menu-toggle span {
      width: 100%;
      height: 3px;
      background: var(--fire-glow);
      border-radius: 2px;
      transition: all 0.3s ease;
      transform-origin: center;
  }

  .mobile-menu-toggle.active span:nth-child(1) {
      transform: translateY(10.5px) rotate(45deg);
  }

  .mobile-menu-toggle.active span:nth-child(2) {
      opacity: 0;
      transform: scaleX(0);
  }

  .mobile-menu-toggle.active span:nth-child(3) {
      transform: translateY(-10.5px) rotate(-45deg);
  }

  /* Mobile Overlay */
  .mobile-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 999;
      backdrop-filter: blur(4px);
  }

  @media (max-width: 768px) {
      nav {
          padding: 0.875rem 1rem;
      }

      .logo-text {
          font-size: 1.5rem;
      }

      .logo-img {
          height: 34px;
      }

      /* Show mobile menu toggle */
      .mobile-menu-toggle {
          display: flex;
      }

      /* Hide navigation by default on mobile */
      .nav-links {
          position: fixed;
          top: 0;
          right: 0;
          height: 100vh;
          width: 280px;
          max-width: 85vw;
          background: linear-gradient(
              135deg,
              rgba(26, 17, 14, 0.98) 0%,
              rgba(42, 31, 26, 0.98) 100%
          );
          backdrop-filter: blur(20px) saturate(150%);
          -webkit-backdrop-filter: blur(20px) saturate(150%);
          border-left: 1px solid rgba(139, 111, 71, 0.4);
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.5);
          flex-direction: column;
          justify-content: flex-start;
          align-items: stretch;
          gap: 0;
          padding: 5rem 0 2rem;
          z-index: 1000;
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
      }

      .nav-links.open {
          transform: translateX(0);
      }

      .mobile-overlay {
          display: block;
      }

      .nav-links li {
          width: 100%;
          border-bottom: 1px solid rgba(139, 111, 71, 0.2);
      }

      .nav-links li:last-child {
          border-bottom: none;
      }

      .nav-links a {
          display: block;
          padding: 1rem 1.5rem;
          font-size: 1rem;
          color: var(--cream);
          text-align: left;
          transition: all 0.3s ease;
      }

      .nav-links a:hover {
          background: rgba(255, 107, 53, 0.1);
          color: var(--fire-glow);
          padding-left: 2rem;
      }

      .nav-links a::after {
          display: none;
      }

      .user-mini-card {
          padding: 0.75rem 1.5rem;
          gap: 0.75rem;
          border-radius: 0;
          background: rgba(61, 45, 36, 0.3);
      }

      .user-mini-card-link:hover .user-mini-card {
          transform: none;
          box-shadow: none;
          background: rgba(61, 45, 36, 0.5);
      }

      .user-avatar {
          width: 38px;
          height: 38px;
      }

      .user-name {
          font-size: 0.95rem;
      }

      .user-status {
          font-size: 0.75rem;
      }

      .auth-button {
          display: block;
          text-align: center;
          padding: 0.875rem 1.5rem !important;
          font-size: 1rem;
          border-radius: 0;
          margin: 0;
      }

      .auth-button:hover {
          transform: none;
      }

      .logout-btn {
          padding: 10px 18px;
          font-size: 0.95rem;
      }

      .dashboard-actions {
          width: auto;
      }
  }

  @media (max-width: 480px) {
      .logo-text {
          font-size: 1.3rem;
      }

      .logo-img {
          height: 30px;
      }

      .nav-links {
          width: 100%;
          max-width: 100vw;
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

  /* User Mini Card */
  .user-mini-card-link {
      text-decoration: none;
      display: block;
  }

  .user-mini-card-link::after {
      display: none;
  }

  .user-mini-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 1rem;
      background: linear-gradient(
          135deg,
          rgba(61, 45, 36, 0.6) 0%,
          rgba(42, 31, 26, 0.5) 100%
      );
      border-radius: 25px;
      border: 1px solid rgba(139, 111, 71, 0.4);
      transition: all 0.3s ease;
      cursor: pointer;
  }

  .user-mini-card-link:hover .user-mini-card {
      border-color: var(--fire-glow);
      box-shadow: 0 4px 15px rgba(255, 179, 71, 0.3);
      transform: translateY(-2px);
  }

  .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--fire-glow);
  }

  .user-info {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
  }

  .user-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--cream);
      line-height: 1.2;
  }

  .user-status {
      font-size: 0.75rem;
      font-weight: 500;
      line-height: 1.2;
  }

  .user-status.status-pending {
      color: var(--amber);
  }

  .user-status.status-approved {
      color: #22c55e;
  }

  .user-status.status-rejected {
      color: #ef4444;
  }

  /* Dashboard Actions */
  .dashboard-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
  }

  .logout-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: rgba(255, 107, 53, 0.15);
      border: 1px solid rgba(255, 107, 53, 0.4);
      border-radius: 12px;
      color: var(--fire-glow);
      font-family: 'Inter', sans-serif;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
  }

  .logout-btn:hover {
      background: rgba(255, 107, 53, 0.25);
      transform: translateY(-2px);
  }

  .logout-icon {
      width: 18px;
      height: 18px;
  }

  /* Teams Navigation */
  .teams-nav-link {
      color: var(--fire-glow) !important;
      font-weight: 600 !important;
      padding: 0.4rem 1rem !important;
      border: 1px solid rgba(255, 179, 71, 0.4);
      border-radius: 20px;
      background: rgba(255, 179, 71, 0.1);
      transition: all 0.3s ease;
  }

  .teams-nav-link:hover {
      background: rgba(255, 179, 71, 0.2);
      border-color: var(--fire-glow);
      transform: translateY(-1px);
  }

  .teams-nav-link::after {
      display: none !important;
  }

  .schedule-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.4);
      border-radius: 12px;
      color: #22c55e;
      font-family: 'Inter', sans-serif;
      font-size: 1rem;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s ease;
  }

  .schedule-btn:hover {
      background: rgba(34, 197, 94, 0.2);
      transform: translateY(-2px);
  }

  .schedule-icon {
      width: 18px;
      height: 18px;
  }

  .teams-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: rgba(255, 179, 71, 0.1);
      border: 1px solid rgba(255, 179, 71, 0.4);
      border-radius: 12px;
      color: var(--fire-glow);
      font-family: 'Inter', sans-serif;
      font-size: 1rem;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s ease;
  }

  .teams-btn:hover {
      background: rgba(255, 179, 71, 0.2);
      transform: translateY(-2px);
  }

  .teams-icon {
      width: 18px;
      height: 18px;
  }
  </style>