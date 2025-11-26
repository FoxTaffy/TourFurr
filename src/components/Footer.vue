<template>
    <footer>
      <div class="container">
        <p class="copyright">
          © 2025 TourFurr | Сайт сделан при поддержке <a href="https://foxtaffy.fun" target="_blank" rel="noopener noreferrer" class="taffy-link">FoxTaffy.fun</a>
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

  .taffy-link {
      color: var(--fire-glow);
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
  }

  .taffy-link:hover {
      color: var(--amber);
      text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  }
  </style>