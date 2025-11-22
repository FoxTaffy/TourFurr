# TourFurr - Лесной Кемп 2026 🏕️

Vue.js лендинг для фурри-кемпа с плавным скроллом и современным дизайном.

## Фичи ✨

- ✅ Плавная анимация скролла (`scroll-behavior: smooth`)
- ✅ Фиксированный хедер с блюром
- ✅ Прозрачные glass-карточки с блюром
- ✅ Font Awesome иконки
- ✅ Компонентная архитектура Vue 3
- ✅ Responsive дизайн
- ✅ Анимации и переходы

## Установка 🚀

```bash
# Установить зависимости
npm install

# Запустить dev сервер
npm run dev

# Билд для продакшна
npm run build

# Превью продакшн билда
npm run preview
```

## Структура проекта 📁

```
tourfurr-vue/
├── src/
│   ├── components/
│   │   ├── Header.vue      # Навигация
│   │   ├── Hero.vue        # Главный экран
│   │   ├── Event.vue       # О событии
│   │   ├── Info.vue        # Информация
│   │   ├── Rules.vue       # Правила
│   │   ├── FAQ.vue         # Вопросы-ответы
│   │   ├── Registration.vue # Регистрация
│   │   ├── Contacts.vue    # Контакты
│   │   └── Footer.vue      # Подвал
│   ├── assets/
│   │   └── style.css       # Глобальные стили
│   ├── App.vue             # Главный компонент
│   └── main.js             # Точка входа
├── index.html
├── package.json
└── vite.config.js
```

## Технологии 🛠️

- Vue 3 (Composition API)
- Vite
- Font Awesome 6
- Google Fonts (Playfair Display + Lora)

## Кастомизация 🎨

### Цвета
Цветовая палитра настраивается в `src/assets/style.css`:

```css
:root {
    --forest-dark: #2a1f1a;
    --fire: #ff6b35;
    --fire-glow: #ffb347;
    --amber: #ffd700;
    /* ... */
}
```

### Контент
Весь контент в компонентах в формате `data()` - легко редактировать.

## Особенности реализации 💡

### Плавный скролл
```css
html {
    scroll-behavior: smooth;
}
```

### Скролл через JS
```javascript
scrollTo(id) {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
```

## Деплой 🌐

Проект готов к деплою на любой статический хостинг:
- Vercel
- Netlify
- GitHub Pages
- И т.д.

Просто запусти `npm run build` и зальей папку `dist/`.

---

Сделано с 💚 для фурри-сообщества