# ✅ Финальный чеклист для Production

## 📊 Проверка переменных Vercel (по вашему скриншоту)

### ✅ Frontend переменные (правильно настроены):

| Variable | Production | Pre-Production | Status |
|----------|------------|----------------|--------|
| `VITE_SUPABASE_URL` | ✅ Set | ✅ Set | ✅ OK |
| `VITE_SUPABASE_ANON_KEY` | ✅ Set | ✅ Set | ✅ OK |
| `VITE_TURNSTILE_SITE_KEY` | ✅ `0x4AAAAACW...` | ✅ `0x4AAAAACW...` | ✅ OK |
| `VITE_DISABLE_EMAIL` | ✅ `false` | ✅ `true` | ✅ OK (правильно!) |
| `VITE_YANDEX_MAPS_API_KEY` | ✅ Set | ✅ Set | ✅ OK |
| `VITE_ADMIN_PIN` | ✅ Set | ✅ Set | ✅ OK |

### ✅ Backend переменные (видны в скриншоте):

| Variable | Status | Notes |
|----------|--------|-------|
| `RESEND_API_KEY` | ✅ Set | Для resend.com email |
| `TURNSTILE_SECRET_KEY` | ✅ Set | Для Cloudflare Turnstile |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Set | Для админских операций |
| `NODE_ENV` | ✅ Set | Production/Development |

---

## 🎯 Что нужно сделать дальше

### 1️⃣ Запустите SQL миграцию в Supabase

**Если еще не сделали:**

```sql
-- Откройте Supabase Dashboard → SQL Editor
-- Скопируйте содержимое файла database/password_reset_codes.sql
-- Нажмите Run
```

**Проверка:**
```sql
-- Проверить что таблица создана
SELECT * FROM password_reset_codes LIMIT 1;

-- Проверить политики
SELECT policyname FROM pg_policies
WHERE tablename = 'password_reset_codes';
```

Должны быть 3 политики:
- `Users can read own reset codes`
- `Anyone can insert reset codes`
- `Anyone can update reset codes`

---

### 2️⃣ Проверьте RESEND_API_KEY в Supabase

**Важно:** `RESEND_API_KEY` должен быть установлен в **Supabase Secrets**, не в Vercel!

```bash
# Проверьте через Supabase CLI
supabase secrets list

# Должно показать:
# RESEND_API_KEY (set)
```

**Если нет, установите:**
```bash
supabase secrets set RESEND_API_KEY=re_your_actual_resend_api_key
```

**Где взять ключ:**
1. Откройте [Resend Dashboard](https://resend.com/api-keys)
2. Скопируйте ваш API Key (начинается с `re_`)
3. Установите в Supabase

---

### 3️⃣ Задеплойте Edge Functions

```bash
# Из корня проекта
cd /home/user/TourFurr

# Автоматический деплой
./deploy-password-reset.sh

# Или вручную по одной:
supabase functions deploy send-password-reset-email --no-verify-jwt
supabase functions deploy update-password --no-verify-jwt
supabase functions deploy send-verification-email --no-verify-jwt
```

**Проверка:**
```bash
# Посмотреть список функций
supabase functions list

# Должны быть:
# - send-verification-email (уже есть)
# - send-password-reset-email (новая)
# - update-password (новая)
```

---

### 4️⃣ Отключите Supabase Auth Email

**В Supabase Dashboard:**

1. **Authentication** → **Providers**
2. Найдите **Email** провайдер
3. **Settings** (шестеренка)
4. **ОТКЛЮЧИТЕ** опцию **"Confirm email"**
5. **Save**

**Почему это важно:**
- ✅ Гарантирует что **только resend.com** отправляет письма
- ✅ Supabase Auth НЕ будет отправлять свои письма
- ✅ Единый источник всех email

**Проверка:**
```sql
-- В Supabase SQL Editor
-- Не должно быть записей об email от Auth
SELECT created_at, payload->>'action' as action
FROM auth.audit_log_entries
WHERE payload->>'action' LIKE '%password%'
ORDER BY created_at DESC
LIMIT 10;
```

---

### 5️⃣ Настройте домен в Resend (если еще не сделали)

**Resend Dashboard:**

1. Откройте [Resend Domains](https://resend.com/domains)
2. Добавьте ваш домен: `tourfurr.camp`
3. Добавьте DNS записи у вашего регистратора:

```
Type: TXT
Name: _resend
Value: (предоставлен Resend)

Type: MX
Name: @
Value: feedback-smtp.resend.com
Priority: 10
```

4. Дождитесь верификации (обычно 5-10 минут)

**Проверка:**
- В Resend Dashboard статус должен быть **"Verified"** ✅

---

### 6️⃣ Тестирование на Production

#### A. Через UI (рекомендуется)

1. Откройте ваш production сайт
2. Перейдите на `/reset-password`
3. Введите существующий email
4. **Проверьте почту** - должно прийти письмо с 6-значным кодом
5. Введите код на `/auth/verify-reset-code`
6. Установите новый пароль
7. Войдите с новым паролем ✅

#### B. Проверка через Resend Dashboard

1. Откройте [Resend Emails](https://resend.com/emails)
2. Фильтруйте по Subject: "Код сброса пароля TourFurr"
3. Должны видеть отправленное письмо
4. Статус: **Delivered** ✅

#### C. Проверка логов Edge Functions

```bash
# Логи отправки password reset
supabase functions logs send-password-reset-email --tail

# Должно быть:
# "Password reset email sent successfully: { email: ..., messageId: ... }"

# Логи обновления пароля
supabase functions logs update-password

# Должно быть:
# "Password updated successfully for user: ..."
```

---

## 🔍 Финальная проверка

### Чеклист перед production:

#### Backend (Supabase)
- [ ] SQL миграция выполнена
- [ ] Таблица `password_reset_codes` существует
- [ ] 3 RLS политики созданы
- [ ] Edge Functions задеплоены:
  - [ ] `send-password-reset-email`
  - [ ] `update-password`
  - [ ] `send-verification-email` (уже был)
- [ ] `RESEND_API_KEY` установлен в Supabase secrets
- [ ] Supabase Auth email **ОТКЛЮЧЕН** ⚠️

#### Frontend (Vercel) - ✅ Уже настроено!
- [x] `VITE_SUPABASE_URL` - ✅
- [x] `VITE_SUPABASE_ANON_KEY` - ✅
- [x] `VITE_DISABLE_EMAIL=false` (Production) - ✅
- [x] `VITE_DISABLE_EMAIL=true` (Preview) - ✅
- [x] `VITE_TURNSTILE_SITE_KEY` - ✅

#### Email (Resend.com)
- [ ] Домен верифицирован в Resend
- [ ] DNS записи добавлены (SPF, DKIM, MX)
- [ ] API Key валидный и активный
- [ ] Тестовое письмо отправлено

#### Тестирование
- [ ] E2E тест password reset пройден
- [ ] Письмо приходит от `noreply@tourfurr.camp`
- [ ] Код корректно проверяется
- [ ] Пароль успешно обновляется
- [ ] Можно войти с новым паролем

---

## 🚨 ВАЖНЫЕ МОМЕНТЫ

### ⚠️ RESEND_API_KEY должен быть в Supabase, не в Vercel!

Я вижу `RESEND_API_KEY` в вашем скриншоте Vercel, но Edge Functions работают на Supabase, поэтому ключ должен быть там:

```bash
# В Supabase (НЕ Vercel!)
supabase secrets set RESEND_API_KEY=re_your_key

# Затем перезапустите функции
supabase functions deploy send-password-reset-email
```

### ⚠️ VITE_DISABLE_EMAIL правильно настроен! ✅

Вижу что:
- **Production**: `false` ✅ (письма будут отправляться)
- **Preview**: `true` ✅ (коды в консоли для тестирования)

Это правильно!

---

## 🎉 Команды для финального деплоя

```bash
# 1. Перейдите в проект
cd /home/user/TourFurr

# 2. Задеплойте Edge Functions
./deploy-password-reset.sh

# 3. Проверьте логи
supabase functions logs send-password-reset-email
supabase functions logs update-password

# 4. Тест на production
# Откройте сайт и запросите password reset
```

---

## 📊 Мониторинг после деплоя

### Первые 24 часа:

```bash
# Следите за логами
supabase functions logs send-password-reset-email --tail

# Проверяйте активные коды
psql -c "SELECT COUNT(*) FROM password_reset_codes WHERE used=false AND expires_at > NOW();"
```

### В Resend Dashboard:
- Проверяйте доставляемость (Delivery Rate)
- Следите за bounce rate
- Проверяйте что нет spam complaints

---

## ✅ Итог

**Что готово:**
- ✅ Все переменные в Vercel настроены правильно
- ✅ `VITE_DISABLE_EMAIL` правильно: false для Production, true для Preview
- ✅ Код полностью переключен на resend.com
- ✅ Документация создана

**Что нужно сделать:**
1. ⚠️ Запустить SQL миграцию (если еще не сделали)
2. ⚠️ Установить `RESEND_API_KEY` в **Supabase** secrets (не в Vercel!)
3. ⚠️ Задеплоить Edge Functions
4. ⚠️ Отключить Supabase Auth email
5. ⚠️ Верифицировать домен в Resend
6. ✅ Протестировать на production

**После этого все будет работать через resend.com! 🎉**

---

## 🆘 Если что-то не работает

**Письма не приходят?**
```bash
# 1. Проверьте RESEND_API_KEY в Supabase
supabase secrets list

# 2. Проверьте логи
supabase functions logs send-password-reset-email

# 3. Проверьте домен в Resend Dashboard
```

**Ошибка в коде?**
- Проверьте что SQL миграция выполнена
- Проверьте RLS политики
- Проверьте Edge Functions задеплоены

**Нужна помощь?**
- См. `PASSWORD_RESET_DEPLOYMENT.md` - полная документация
- См. `DISABLE_SUPABASE_EMAIL.md` - как отключить Supabase
- См. `test-password-reset.http` - примеры тестирования
