# Environment Variables

## 📝 Полный список переменных окружения для TourFurr

---

## 🎨 Frontend (Vercel / Local)

### Обязательные переменные

| Variable | Description | Example | Where to get |
|----------|-------------|---------|--------------|
| `VITE_SUPABASE_URL` | URL проекта Supabase | `https://xxx.supabase.co` | Supabase Dashboard → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Public anon key | `eyJhbGc...` | Supabase Dashboard → Settings → API → anon public |

### Опциональные переменные

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_DISABLE_EMAIL` | Отключить отправку email (dev mode) | `false` | `true` |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key | `1x00000000000000000000AA` | `0x4AAA...` |

---

## 🔧 Backend (Supabase Edge Functions)

### Автоматические переменные (уже доступны в Edge Functions)

| Variable | Description | Provided by |
|----------|-------------|-------------|
| `SUPABASE_URL` | URL проекта Supabase | Supabase (auto) |
| `SUPABASE_ANON_KEY` | Public anon key | Supabase (auto) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (admin) | Supabase (auto) |

### Ручные переменные (нужно установить)

| Variable | Description | Required for | How to set |
|----------|-------------|--------------|------------|
| `RESEND_API_KEY` | API key от resend.com | Email отправка | `supabase secrets set RESEND_API_KEY=re_xxx` |

---

## 🚀 Настройка для разных окружений

### Development (Локальная разработка)

Создайте файл `.env` в корне проекта:

```env
# .env
VITE_SUPABASE_URL=https://plugjsubjcfblzkabjja.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_DISABLE_EMAIL=true
VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
```

**Важно:**
- ✅ `.env` добавлен в `.gitignore`
- ✅ Используйте `VITE_DISABLE_EMAIL=true` для разработки
- ✅ Коды будут показываться в консоли браузера

### Staging/Preview (Vercel)

В Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Environments |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://plugjsubjcfblzkabjja.supabase.co` | ✅ Preview |
| `VITE_SUPABASE_ANON_KEY` | `your_anon_key` | ✅ Preview |
| `VITE_DISABLE_EMAIL` | `true` | ✅ Preview |
| `VITE_TURNSTILE_SITE_KEY` | `test_key` | ✅ Preview |

### Production (Vercel)

В Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Environments |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://plugjsubjcfblzkabjja.supabase.co` | ✅ Production |
| `VITE_SUPABASE_ANON_KEY` | `your_anon_key` | ✅ Production |
| `VITE_DISABLE_EMAIL` | `false` | ✅ Production |
| `VITE_TURNSTILE_SITE_KEY` | `0x4AAA...` (production key) | ✅ Production |

---

## 📧 Resend.com настройка

### Установка RESEND_API_KEY в Supabase

```bash
# 1. Получите API key от resend.com
# Dashboard → API Keys → Create API Key

# 2. Установите в Supabase secrets
supabase secrets set RESEND_API_KEY=re_your_actual_key_here

# 3. Проверьте установку
supabase secrets list

# Должно показать:
# RESEND_API_KEY (set)
```

### Проверка работы

После установки перезапустите Edge Functions:

```bash
supabase functions deploy send-password-reset-email
supabase functions deploy send-verification-email
```

Тест:

```bash
# Проверьте логи
supabase functions logs send-password-reset-email

# Должно быть сообщение:
# "Password reset email sent successfully"
```

---

## 🔐 Cloudflare Turnstile

### Получение ключей

1. Откройте [Cloudflare Dashboard](https://dash.cloudflare.com)
2. **Turnstile** → **Add Site**
3. Заполните:
   - **Domain**: `tourfurr.camp` (production) или `localhost` (dev)
   - **Widget Mode**: Managed
4. Получите:
   - **Site Key** → `VITE_TURNSTILE_SITE_KEY`
   - **Secret Key** → (не используется во frontend)

### Для разных окружений

| Environment | Site Key | Domain |
|-------------|----------|--------|
| Development | `1x00000000000000000000AA` (test key) | `localhost` |
| Staging | `1x00000000000000000000AB` (test key) | `*.vercel.app` |
| Production | `0x4AAA...` (real key) | `tourfurr.camp` |

---

## 🧪 Проверка переменных

### Локально (в браузере)

Откройте консоль браузера (F12):

```javascript
// Проверить Supabase URL
console.log(import.meta.env.VITE_SUPABASE_URL)

// Проверить все VITE_ переменные
console.log(import.meta.env)

// Проверить Supabase подключение
console.log(supabase.supabaseUrl)
```

### На Vercel

```bash
# Список всех переменных проекта
vercel env ls

# Получить значение конкретной переменной
vercel env pull
```

### В Supabase Edge Functions

Проверьте в логах:

```bash
supabase functions logs send-password-reset-email

# Если RESEND_API_KEY не установлен, будет ошибка:
# "RESEND_API_KEY is not set"
```

---

## 🛡️ Безопасность

### Что НЕ добавлять в .env

❌ **НЕ добавляйте:**
- `SUPABASE_SERVICE_ROLE_KEY` (только в Supabase Edge Functions)
- `RESEND_API_KEY` (только в Supabase secrets)
- Любые приватные ключи

✅ **Можно добавлять:**
- `VITE_*` переменные (публичные, попадают в frontend bundle)
- `SUPABASE_URL` и `SUPABASE_ANON_KEY` (публичные)

### RLS защита

Даже если `VITE_SUPABASE_ANON_KEY` публичный, данные защищены через:
- ✅ Row Level Security (RLS) политики
- ✅ Auth проверка токенов
- ✅ Edge Functions с Service Role Key

---

## 📋 Чеклист настройки

### Frontend (Vercel)

- [ ] `VITE_SUPABASE_URL` установлен для всех environments
- [ ] `VITE_SUPABASE_ANON_KEY` установлен для всех environments
- [ ] `VITE_DISABLE_EMAIL=false` для Production
- [ ] `VITE_DISABLE_EMAIL=true` для Preview/Development
- [ ] `VITE_TURNSTILE_SITE_KEY` настроен для Production

### Backend (Supabase)

- [ ] `RESEND_API_KEY` установлен в secrets
- [ ] Edge Functions перезапущены после установки
- [ ] Тестовое письмо отправлено успешно

### Локальная разработка

- [ ] `.env` файл создан
- [ ] `.env` добавлен в `.gitignore`
- [ ] Все переменные работают локально

---

## 🔄 Обновление переменных

### Через Vercel Dashboard

1. Vercel Dashboard → проект → **Settings** → **Environment Variables**
2. Найдите переменную
3. **Edit** → измените значение
4. **Save**
5. **Redeploy** проект для применения изменений

### Через Vercel CLI

```bash
# Добавить/обновить переменную
vercel env add VITE_NEW_VARIABLE

# Удалить переменную
vercel env rm VITE_OLD_VARIABLE

# Загрузить переменные локально
vercel env pull .env.local
```

### Через Supabase CLI

```bash
# Обновить секрет
supabase secrets set RESEND_API_KEY=new_key

# Удалить секрет
supabase secrets unset RESEND_API_KEY

# Список секретов
supabase secrets list
```

---

## 🐛 Troubleshooting

### Переменная undefined в коде

**Проблема:** `import.meta.env.VITE_SUPABASE_URL` возвращает `undefined`

**Причины:**
1. Переменная не начинается с `VITE_`
2. `.env` файл не в корне проекта
3. Нужен restart dev server после изменения `.env`

**Решение:**
```bash
# 1. Проверьте имя переменной (должна начинаться с VITE_)
# 2. Перезапустите dev server
npm run dev

# 3. Проверьте что .env в корне проекта
ls -la .env
```

### RESEND_API_KEY не работает

**Проблема:** Email не отправляются, в логах "RESEND_API_KEY is not set"

**Решение:**
```bash
# 1. Установите заново
supabase secrets set RESEND_API_KEY=re_your_key

# 2. Перезапустите функции
supabase functions deploy send-password-reset-email
supabase functions deploy send-verification-email

# 3. Проверьте логи
supabase functions logs send-password-reset-email
```

### Vercel не видит переменные

**Проблема:** После деплоя переменные не работают

**Решение:**
1. Проверьте что выбраны правильные environments (Production/Preview)
2. Нажмите **Redeploy** после добавления переменных
3. Проверьте логи деплоя на наличие ошибок

---

## 📚 Дополнительные ресурсы

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Edge Functions Secrets](https://supabase.com/docs/guides/functions/secrets)
- [Resend API Keys](https://resend.com/docs/dashboard/api-keys/introduction)

---

## ✅ Итоговая таблица

| Variable | Frontend | Backend | Value Type | Example |
|----------|----------|---------|------------|---------|
| `VITE_SUPABASE_URL` | ✅ Vercel | ❌ | String | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ✅ Vercel | ❌ | String | `eyJhbGc...` |
| `VITE_DISABLE_EMAIL` | ✅ Vercel | ❌ | Boolean | `true`/`false` |
| `VITE_TURNSTILE_SITE_KEY` | ✅ Vercel | ❌ | String | `0x4AAA...` |
| `RESEND_API_KEY` | ❌ | ✅ Supabase | String | `re_xxx...` |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ | ✅ Auto | String | (auto) |

**Готово! Все переменные настроены правильно ✅**
