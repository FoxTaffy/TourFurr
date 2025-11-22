<template>
    <section class="hero">
      <div class="hero-content">
        <h1>TourFurr</h1>
        <p class="subtitle">Лесной кемп в сердце природы</p>
        <p class="dates">6–9 августа 2026</p>
        <a href="#registration" @click.prevent="scrollTo('registration')" class="cta-button">
          Зарегистрироваться
        </a>
      </div>
    </section>
  </template>
  
  <script>
  export default {
    name: 'Hero',
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
  .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 4rem 2rem;
      position: relative;
  }
  
  .hero-content {
      max-width: 800px;
      z-index: 2;
  }
  
  h1 {
      font-family: 'Playfair Display', serif;
      font-size: clamp(3rem, 8vw, 6rem);
      font-weight: 900;
      background: linear-gradient(135deg, var(--fire-glow) 0%, var(--amber) 50%, var(--fire) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 1.5rem;
      animation: titleGlow 3s ease-in-out infinite;
      letter-spacing: 0.02em;
  }
  
  @keyframes titleGlow {
      0%, 100% { 
          filter: drop-shadow(0 0 20px rgba(255, 179, 71, 0.4));
      }
      50% { 
          filter: drop-shadow(0 0 40px rgba(255, 179, 71, 0.7));
      }
  }
  
  .subtitle {
      font-size: clamp(1.2rem, 2.5vw, 1.8rem);
      color: var(--sage);
      margin-bottom: 1rem;
      font-style: italic;
  }
  
  .dates {
      font-size: 1.2rem;
      color: var(--fire-glow);
      font-weight: 600;
      margin-bottom: 3rem;
  }
  
  .cta-button {
      display: inline-block;
      padding: 1rem 3rem;
      background: linear-gradient(135deg, var(--fire) 0%, var(--fire-glow) 100%);
      color: var(--forest-deep);
      text-decoration: none;
      font-weight: 600;
      font-size: 1.1rem;
      border-radius: 50px;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 
          0 4px 15px rgba(255, 107, 53, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.3);
      position: relative;
      overflow: hidden;
      cursor: pointer;
  }
  
  .cta-button::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
  }
  
  .cta-button:hover::before {
      width: 300px;
      height: 300px;
  }
  
  .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 
          0 8px 30px rgba(255, 107, 53, 0.6),
          inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
  
  @media (max-width: 768px) {
      .hero {
          min-height: 80vh;
          padding: 3rem 1rem;
      }
  }
  </style>