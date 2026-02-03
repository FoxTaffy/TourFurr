# Деплой TourFurr на Vercel

## 🚀 Пошаговое руководство по развертыванию

---

## 📋 Предварительные требования

Перед деплоем убедитесь что:

- [x] ✅ SQL миграция выполнена (`database/password_reset_codes.sql`)
- [x] ✅ Edge Functions задеплоены (`send-password-reset-email`, `update-password`)
- [x] ✅ RESEND_API_KEY установлен в Supabase
- [x] ✅ Supabase email отключен (см. `DISABLE_SUPABASE_EMAIL.md`)
- [x] ✅ Код протестирован локально

---

## 🔧 Шаг 1: Подготовка проекта

### 1.1. Проверьте файлы конфигурации

Убедитесь что существуют:

```
TourFurr/
├── vercel.json           # Конфигурация Vercel
├── package.json          # Зависимости и скрипты
├── vite.config.ts        # Конфигурация Vite
└── .gitignore            # Игнорируемые файлы
```

### 1.2. Проверьте package.json scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 1.3. Проверьте vercel.json (если есть)

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Это нужно для корректной работы Vue Router в SPA режиме.

---

## 🌐 Шаг 2: Создание проекта на Vercel

### Вариант A: Через Vercel Dashboard (рекомендуется)

1. Откройте [https://vercel.com](https://vercel.com)
2. Нажмите **"Add New"** → **"Project"**
3. Выберите **Import Git Repository**
4. Выберите репозиторий **FoxTaffy/TourFurr**
5. Vercel автоматически определит настройки:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Вариант B: Через Vercel CLI

```bash
# Установить Vercel CLI
npm install -g vercel

# Логин
vercel login

# Деплой (из корневой директории проекта)
cd /home/user/TourFurr
vercel

# Следуйте инструкциям:
# - Setup and deploy? Yes
# - Which scope? Ваш аккаунт
# - Link to existing project? No (или Yes если уже создан)
# - What's your project's name? tourfurr
# - In which directory is your code located? ./
# - Auto-detected Project Settings (Vite): Yes
```

---

## 🔐 Шаг 3: Настройка переменных окружения

### В Vercel Dashboard:

1. Откройте ваш проект на Vercel
2. **Settings** → **Environment Variables**
3. Добавьте следующие переменные:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://plugjsubjcfblzkabjja.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `your_supabase_anon_key` | Production, Preview, Development |
| `VITE_DISABLE_EMAIL` | `false` | Production |
| `VITE_DISABLE_EMAIL` | `true` | Preview, Development |
| `VITE_TURNSTILE_SITE_KEY` | `your_turnstile_site_key` | Production, Preview |

### Где взять значения:

#### VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY:
1. Supabase Dashboard → Settings → API
2. **Project URL** → `VITE_SUPABASE_URL`
3. **anon public** key → `VITE_SUPABASE_ANON_KEY`

#### VITE_TURNSTILE_SITE_KEY:
1. Cloudflare Dashboard → Turnstile
2. Создайте новый сайт для production домена
3. Скопируйте **Site Key**

---

## 🏗️ Шаг 4: Деплой

### Автоматический деплой через Git (рекомендуется)

После настройки проекта, каждый push в GitHub автоматически деплоится:

```bash
git add .
git commit -m "feat: ready for production deployment"
git push origin main
```

Vercel автоматически:
1. ✅ Обнаружит новый коммит
2. ✅ Запустит build
3. ✅ Задеплоит на production (для main branch)
4. ✅ Отправит уведомление

### Ручной деплой через CLI

```bash
# Production деплой
vercel --prod

# Preview деплой (для тестирования)
vercel
```

---

## 📊 Шаг 5: Проверка деплоя

### 5.1. Проверьте build logs

1. В Vercel Dashboard откройте проект
2. **Deployments** → выберите последний деплой
3. Проверьте логи:
   - ✅ Build должен завершиться успешно
   - ✅ Не должно быть ошибок TypeScript
   - ✅ Assets должны быть оптимизированы

### 5.2. Тестирование на production

```bash
# Откройте production URL
open https://tourfurr.vercel.app

# Или кастомный домен
open https://tourfurr.camp
```

**Чеклист тестирования:**

- [ ] Главная страница загружается
- [ ] Регистрация работает (проверьте email verification)
- [ ] Логин работает
- [ ] Password reset работает:
  - [ ] Запрос кода
  - [ ] Получение email через resend.com
  - [ ] Ввод кода
  - [ ] Установка нового пароля
- [ ] Dashboard доступен после логина
- [ ] Все стили загружаются корректно
- [ ] Нет ошибок в Console (F12)

---

## 🌍 Шаг 6: Настройка кастомного домена

### Если у вас есть домен (например tourfurr.camp):

1. Vercel Dashboard → проект → **Settings** → **Domains**
2. Нажмите **Add**
3. Введите ваш домен: `tourfurr.camp`
4. Vercel предоставит DNS записи:
   - **A Record**: `76.76.21.21`
   - **CNAME**: `cname.vercel-dns.com`

### Настройка DNS у регистратора:

Добавьте записи в вашем DNS провайдере (например Cloudflare, Namecheap):

```
Type: A
Name: @
Value: 76.76.21.21
TTL: Auto

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto
```

**Проверка:**
- Может занять до 48 часов (обычно 5-10 минут)
- Vercel автоматически выпустит SSL сертификат

---

## ⚡ Оптимизация производительности

### 6.1. Build оптимизация

Vercel автоматически оптимизирует:
- ✅ Минификация JavaScript/CSS
- ✅ Tree shaking неиспользуемого кода
- ✅ Code splitting
- ✅ Image optimization (если используете Vercel Image)

### 6.2. Кэширование

Добавьте в `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 6.3. Analytics

Включите Vercel Analytics:

```bash
npm install @vercel/analytics

# В main.ts добавьте:
import { inject } from '@vercel/analytics'
inject()
```

---

## 🔄 Шаг 7: Continuous Deployment (CI/CD)

### Автоматический деплой branch'ей

Vercel автоматически создает preview deployment для каждой ветки:

```bash
# Создайте feature branch
git checkout -b feature/new-feature

# Сделайте изменения и push
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

Vercel создаст preview URL:
- `https://tourfurr-git-feature-new-feature-foxTaffy.vercel.app`

### Production деплой

```bash
# Merge в main
git checkout main
git merge feature/new-feature
git push origin main

# Vercel автоматически задеплоит на production
```

---

## 📧 Шаг 8: Настройка Email (Resend)

### Убедитесь что Resend настроен:

1. **Домен верифицирован** в Resend Dashboard
2. **DNS записи добавлены**:
   - SPF: `v=spf1 include:_spf.resend.com ~all`
   - DKIM: предоставлен Resend
   - DMARC: `v=DMARC1; p=none`

3. **API Key установлен** в Supabase:
   ```bash
   supabase secrets set RESEND_API_KEY=re_your_key
   ```

4. **Тестирование**:
   - Запросите password reset на production
   - Проверьте [Resend Dashboard](https://resend.com/emails)
   - Email должен быть отправлен с `noreply@tourfurr.camp`

---

## 🛡️ Безопасность

### CORS настройки

В Supabase Dashboard:
1. **Settings** → **API**
2. **CORS Origins** добавьте:
   - `https://tourfurr.vercel.app`
   - `https://tourfurr.camp`
   - `https://www.tourfurr.camp`

### Turnstile (Cloudflare)

Обновите allowed domains:
1. Cloudflare Turnstile → ваш сайт
2. **Domains** добавьте:
   - `tourfurr.vercel.app`
   - `tourfurr.camp`

---

## 📊 Мониторинг

### Vercel Analytics

Просмотр метрик:
1. Vercel Dashboard → проект → **Analytics**
2. Доступны метрики:
   - Page views
   - Unique visitors
   - Top pages
   - Real User Monitoring (Web Vitals)

### Vercel Logs

```bash
# Через CLI
vercel logs tourfurr --follow

# Или в Dashboard
# Project → Logs
```

### Error Tracking

Рекомендуется подключить:
- **Sentry** для отслеживания ошибок
- **LogRocket** для session replay

```bash
npm install @sentry/vue

# В main.ts
import * as Sentry from "@sentry/vue"

Sentry.init({
  app,
  dsn: "YOUR_SENTRY_DSN",
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
})
```

---

## 🐛 Troubleshooting

### Build failed

**Проблема:** Build завершается с ошибкой

**Решение:**
1. Проверьте логи build в Vercel Dashboard
2. Убедитесь что `npm run build` работает локально
3. Проверьте TypeScript ошибки
4. Убедитесь что все зависимости в package.json

### 404 на роутах

**Проблема:** При обновлении страницы `/dashboard` выдает 404

**Решение:** Добавьте в `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Environment variables не работают

**Проблема:** `import.meta.env.VITE_*` возвращает undefined

**Решение:**
1. Проверьте что переменные начинаются с `VITE_`
2. Redeploy после добавления переменных
3. Проверьте что выбраны все environments (Production, Preview)

### Email не отправляются

**Проблема:** Password reset не работает на production

**Решение:**
1. Проверьте Edge Functions задеплоены
2. Проверьте `RESEND_API_KEY` в Supabase secrets
3. Проверьте домен верифицирован в Resend
4. Проверьте логи Edge Functions:
   ```bash
   supabase functions logs send-password-reset-email
   ```

---

## ✅ Чеклист деплоя

Перед production запуском:

### Backend (Supabase)
- [ ] SQL миграция выполнена
- [ ] Edge Functions задеплоены
- [ ] RESEND_API_KEY установлен
- [ ] Supabase email отключен
- [ ] RLS политики настроены
- [ ] CORS origins добавлены

### Frontend (Vercel)
- [ ] Проект создан на Vercel
- [ ] Environment variables настроены
- [ ] Build проходит успешно
- [ ] Кастомный домен настроен (если есть)
- [ ] SSL сертификат активен
- [ ] Analytics подключен

### Email (Resend)
- [ ] Домен верифицирован
- [ ] DNS записи добавлены (SPF, DKIM, DMARC)
- [ ] Тестовое письмо отправлено
- [ ] От адрес: `noreply@tourfurr.camp`

### Тестирование
- [ ] Регистрация работает
- [ ] Email verification работает
- [ ] Password reset работает (через resend.com!)
- [ ] Логин работает
- [ ] Dashboard доступен
- [ ] Нет ошибок в console
- [ ] Все роуты работают

---

## 🎉 Готово!

После выполнения всех шагов ваш сайт:
- ✅ Задеплоен на Vercel
- ✅ Доступен по кастомному домену
- ✅ Использует только resend.com для email
- ✅ Имеет SSL сертификат
- ✅ Автоматически деплоится при push
- ✅ Мониторится через Vercel Analytics

**Production URL:** https://tourfurr.camp (или ваш домен)

---

## 📚 Полезные ссылки

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Vite Production Build](https://vitejs.dev/guide/build.html)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Resend Documentation](https://resend.com/docs)

---

## 🆘 Поддержка

**Основные команды:**

```bash
# Проверить статус деплоя
vercel ls

# Посмотреть логи
vercel logs

# Redeploy
vercel --prod

# Удалить деплой
vercel rm deployment-url
```

**Полезные SQL запросы:**

```sql
-- Проверить активные reset codes
SELECT COUNT(*) FROM password_reset_codes
WHERE used = false AND expires_at > NOW();

-- Статистика писем
SELECT
  DATE(created_at) as date,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE used = true) as successful
FROM password_reset_codes
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```
