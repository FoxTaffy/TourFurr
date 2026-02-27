<template>
    <section id="registration">
      <div class="container">
        <div class="glass-card">
          <h2 class="section-title">Готов к приключениям?</h2>
          <p class="registration-text">
            Регистрация открыта! <br>
            Событие пройдёт <strong>6–9 августа 2026</strong>. <br>
            Мест для участия: <strong>121</strong>. <br><br>
            Заполни анкету и присоединяйся к нам!
          </p>
          <a href="/auth" class="cta-button">
            Зарегистрироваться
          </a>
        </div>
      </div>
    </section>
  </template>
  
  <script>
  export default {
    name: 'Registration',
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
  .glass-card {
      text-align: center;
  }
  
  .registration-text {
      color: var(--sage);
      font-size: 1.2rem;
      margin-bottom: 2.5rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
  }
  
  .registration-text strong {
      color: var(--fire-glow);
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
  </style>