# 🔐 Production Secrets - TourFurr 2026

## ⚠️ КРИТИЧНО: КОНФИДЕНЦИАЛЬНАЯ ИНФОРМАЦИЯ

Этот файл содержит все секретные ключи для развертывания TourFurr в production.

**НИКОГДА не коммитьте этот файл в Git!**

---

## 📋 Переменные окружения для Vercel/Netlify

### Frontend Variables (добавить в настройках проекта)

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Cloudflare Turnstile
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key_here

# Email Configuration
VITE_DISABLE_EMAIL=false

# Registration Date (ISO 8601)
VITE_REGISTRATION_OPEN_DATE=2026-03-01T00:00:00

# Admin PIN (замените на свой!)
VITE_ADMIN_PIN=ВАШ_СЕКРЕТНЫЙ_PIN

# Production Mode
NODE_ENV=production

# Grace Period
VITE_GRACE_PERIOD_MINUTES=15
```

---

## 🔑 Секреты для Supabase Edge Functions

Установить через CLI:

```bash
supabase secrets set RESEND_API_KEY="re_2BH5TbAW_2zFqeY8vzfUsyEKeMKJHHYep"
supabase secrets set TURNSTILE_SECRET_KEY="your_turnstile_secret_here"
```

Или через Dashboard:
1. Supabase Dashboard → Edge Functions → Manage secrets
2. Добавить:
   - `RESEND_API_KEY` = `re_2BH5TbAW_2zFqeY8vzfUsyEKeMKJHHYep`
   - `TURNSTILE_SECRET_KEY` = `your_secret_here`

---

## 📝 Список всех секретов

### 1. **VITE_SUPABASE_URL**
- **Где получить**: Supabase Dashboard → Project Settings → API → Project URL
- **Формат**: `https://xxxxx.supabase.co`
- **Где использовать**: Vercel/Netlify environment variables

### 2. **VITE_SUPABASE_ANON_KEY**
- **Где получить**: Supabase Dashboard → Project Settings → API → anon/public key
- **Формат**: `eyJhbGciOiJI...` (длинная строка)
- **Где использовать**: Vercel/Netlify environment variables
- **⚠️ Безопасность**: Этот ключ можно показывать в клиенте (anon key)

### 3. **VITE_TURNSTILE_SITE_KEY**
- **Где получить**: Cloudflare Dashboard → Turnstile → Site Key
- **Формат**: `0x4AA...`
- **Где использовать**: Vercel/Netlify environment variables
- **⚠️ Безопасность**: Этот ключ можно показывать в клиенте

### 4. **VITE_ADMIN_PIN**
- **Создать**: Придумайте сложный PIN (например: `TourFurr2026!Secure`)
- **Формат**: Любая строка
- **Где использовать**: Vercel/Netlify environment variables
- **⚠️ КРИТИЧНО**: НИКОГДА не храните в коде! Только в .env

### 5. **VITE_REGISTRATION_OPEN_DATE**
- **Значение**: `2026-03-01T00:00:00`
- **Формат**: ISO 8601 дата/время
- **Где использовать**: Vercel/Netlify environment variables

### 6. **RESEND_API_KEY**
- **Где получить**: Resend Dashboard → API Keys
- **Текущий ключ**: `re_2BH5TbAW_2zFqeY8vzfUsyEKeMKJHHYep`
- **Где использовать**: Supabase secrets (только backend!)
- **⚠️ КРИТИЧНО**: Этот ключ НЕЛЬЗЯ показывать в клиенте!

### 7. **TURNSTILE_SECRET_KEY**
- **Где получить**: Cloudflare Dashboard → Turnstile → Secret Key
- **Где использовать**: Supabase secrets (только backend!)
- **⚠️ КРИТИЧНО**: Этот ключ НЕЛЬЗЯ показывать в клиенте!

---

## 🚀 Быстрая настройка

### Шаг 1: Настройте Vercel/Netlify

1. Перейдите в Project Settings → Environment Variables
2. Добавьте все переменные из раздела "Frontend Variables"
3. Важно: Убедитесь что `VITE_DISABLE_EMAIL=false`

### Шаг 2: Настройте Supabase

```bash
# Войдите в Supabase
supabase login

# Свяжите проект
supabase link --project-ref YOUR_PROJECT_REF

# Установите секреты
supabase secrets set RESEND_API_KEY="re_2BH5TbAW_2zFqeY8vzfUsyEKeMKJHHYep"
supabase secrets set TURNSTILE_SECRET_KEY="YOUR_TURNSTILE_SECRET"

# Разверните Edge Functions
supabase functions deploy send-verification-email
supabase functions deploy cleanup-unverified-accounts
```

### Шаг 3: Отключите Supabase Email Confirmations

1. Supabase Dashboard → Authentication → Email Templates
2. Прокрутите вниз до "Settings"
3. **Снимите галочку** "Enable email confirmations"

### Шаг 4: Проверьте deployment

```bash
# После деплоя, проверьте что все работает
curl https://your-domain.com

# Проверьте что секреты установлены
supabase secrets list
```

---

## 🔒 Безопасность

### ✅ Что безопасно показывать в клиенте:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (это anon key, не service_role!)
- `VITE_TURNSTILE_SITE_KEY` (это site key, не secret!)
- `VITE_REGISTRATION_OPEN_DATE`
- `VITE_DISABLE_EMAIL`
- `VITE_GRACE_PERIOD_MINUTES`

### ❌ Что НЕЛЬЗЯ показывать в клиенте:
- `VITE_ADMIN_PIN` - хранится в env, но НЕ отображается в коде
- `RESEND_API_KEY` - только на сервере (Supabase secrets)
- `TURNSTILE_SECRET_KEY` - только на сервере (Supabase secrets)
- `SUPABASE_SERVICE_ROLE_KEY` - только на сервере (НЕ используется в клиенте)

### 🛡️ Защита от утечек:
1. ✅ Все секреты в `.env` (не в коде)
2. ✅ `.env` в `.gitignore`
3. ✅ `console.log` удаляются в production build
4. ✅ Source maps отключены в production
5. ✅ Admin PIN проверяется с constant-time comparison
6. ✅ Все критичные ключи только на сервере

---

## 📊 Чеклист перед deployment

- [ ] Все переменные установлены в Vercel/Netlify
- [ ] `VITE_ADMIN_PIN` изменен на уникальный
- [ ] `VITE_DISABLE_EMAIL=false` в production
- [ ] Supabase secrets установлены
- [ ] Edge Functions развернуты
- [ ] Supabase Email Confirmations отключены
- [ ] Домен `tourfurr.ru` верифицирован в Resend (опционально)
- [ ] Протестирована регистрация
- [ ] Протестирована отправка email
- [ ] Протестирован admin доступ с PIN

---

## 🆘 Troubleshooting

### Ошибка: "Missing required environment variable"

**Решение**:
1. Проверьте что ВСЕ переменные установлены
2. Перезапустите build
3. Проверьте названия переменных (VITE_ префикс обязателен для фронтенда!)

### Email не отправляются

**Проверьте**:
1. `VITE_DISABLE_EMAIL=false` в production
2. `RESEND_API_KEY` установлен в Supabase
3. Edge Function развернута
4. Supabase Email Confirmations отключены

### Admin PIN не работает

**Проверьте**:
1. `VITE_ADMIN_PIN` установлен в environment variables
2. Не используйте специальные символы, которые могут быть заэскейплены
3. Проверьте что переменная правильно читается в production

---

## 📞 Контакты

Если возникли проблемы с deployment:
1. Проверьте логи Vercel/Netlify
2. Проверьте логи Supabase Edge Functions
3. Проверьте логи Resend Dashboard

