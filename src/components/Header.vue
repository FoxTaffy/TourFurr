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
      </nav>
    </header>
  </template>
  
  <script>
  export default {
    name: 'Header',
    methods: {
      scrollTo(id) {
        const element = document.getElementById(id)
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
  </style>