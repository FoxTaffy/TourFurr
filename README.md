# TourFurr - Лесной Кемп 2026

Веб-приложение для фурри-кемпа с системой регистрации, подачи заявок, голосования и админ-панелью.

## Технологии

- **Frontend:** Vue 3 (Composition API) + TypeScript + Vite
- **Стили:** TailwindCSS 4
- **Стейт:** Pinia
- **Роутинг:** Vue Router 4
- **Backend:** Supabase (PostgreSQL + Edge Functions + Auth)
- **Email:** Resend API
- **CAPTCHA:** Cloudflare Turnstile
- **Валидация:** Yup

## Функциональность

- Лендинг с информацией о мероприятии
- Регистрация и авторизация пользователей с подтверждением email
- Подача заявок на участие
- Система голосования
- Админ-панель для управления заявками
- Сброс пароля через email
- Защита от ботов (Cloudflare Turnstile)
- Rate limiting и защита от подбора

## Установка

```bash
# Установить зависимости
npm install

# Запустить dev-сервер
npm run dev

# Билд для продакшна
npm run build
```

## Настройка окружения

Скопируйте `.env.example` в `.env` и заполните значения:

```bash
cp .env.example .env
```

Необходимые переменные описаны в `.env.example`.

### Supabase Edge Functions

Секреты для Edge Functions устанавливаются через CLI:

```bash
supabase secrets set RESEND_API_KEY="your_key"
supabase secrets set TURNSTILE_SECRET_KEY="your_key"
```

## Структура проекта

```
src/
  components/     # Vue компоненты (auth, common, UI)
  views/          # Страницы (Home, Auth, Dashboard, Admin, etc.)
  stores/         # Pinia stores (auth)
  services/       # API клиент, Supabase клиент
  utils/          # Утилиты (security, validation, logging)
  router/         # Vue Router конфигурация
  assets/         # Стили и изображения
  types/          # TypeScript типы
supabase/
  functions/      # Edge Functions (email, turnstile, cleanup)
  migrations/     # Миграции БД
database/         # SQL-скрипты для настройки БД
```

## База данных

Финальная схема: `database/SETUP_ALL_IN_ONE.sql`
RLS политики: `database/PRODUCTION_SECURE_RLS.sql`
