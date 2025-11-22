<template>
    <footer>
      <div class="container">
        <p class="copyright">
          © 2025–2026 TourFurr. Сделано с <i class="fas fa-heart"></i> для фурри-сообщества
        </p>
      </div>
    </footer>
  </template>
  
  <script>
  export default {
    name: 'Footer'
  }
  </script>
  
  <style scoped>
  footer {
      padding: 2rem 0;
      text-align: center;
      background: linear-gradient(
          180deg,
          transparent 0%,
          rgba(26, 17, 14, 0.6) 100%
      );
      border-top: 1px solid rgba(139, 111, 71, 0.2);
  }
  
  .copyright {
      color: var(--moss);
      font-size: 0.95rem;
  }
  
  .copyright i {
      color: var(--fire);
  }
  </style>