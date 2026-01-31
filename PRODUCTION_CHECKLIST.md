# 🚀 Production Deployment Checklist

## ⚠️ КРИТИЧЕСКИЕ ЗАДАЧИ (обязательно!)

### 1. 🔒 Безопасность

- [ ] **Применить PRODUCTION_SECURE_RLS.sql** в Supabase
  ```bash
  # Откройте Supabase SQL Editor:
  # https://supabase.com/dashboard/project/gczgcatmsrlncjbqdghu/editor
  # Скопируйте и выполните весь файл database/PRODUCTION_SECURE_RLS.sql
  ```

- [ ] **Изменить VITE_DISABLE_EMAIL в Vercel**
  - Зайдите: https://vercel.com → TourFurr → Settings → Environment Variables
  - Найдите `VITE_DISABLE_EMAIL`
  - Измените значение с `true` на `false`
  - **Save** и **Redeploy**

- [ ] **Изменить VITE_ADMIN_PIN в Vercel**
  - Сгенерируйте случайный PIN (минимум 8 символов):
    ```bash
    # Используйте генератор паролей или команду:
    openssl rand -base64 12
    ```
  - Зайдите: Vercel → Settings → Environment Variables
  - Найдите `VITE_ADMIN_PIN`
  - Измените на сгенерированный PIN
  - **ЗАПИШИТЕ PIN В БЕЗОПАСНОЕ МЕСТО!**
  - **Save** и **Redeploy**

- [ ] **Настроить Supabase Email Provider**
  - Authentication → Providers → Email
  - ✅ Enable Email provider: **ON**
  - ✅ Confirm email: **ON**
  - ✅ Secure email change: **ON**
  - ✅ Minimum password length: **8**
  - Password Requirements: **Рекомендуется "Symbols and Numbers"**
  - **Save**

### 2. 📧 Email Configuration

- [ ] **Настроить Resend API**
  1. Получите API ключ на https://resend.com
  2. Добавьте домен в Resend
  3. Настройте DNS записи (SPF, DKIM, DMARC)
  4. Добавьте в Supabase Secrets:
     ```bash
     supabase secrets set RESEND_API_KEY=re_ваш_ключ_здесь
     ```

- [ ] **Настроить Email Templates в Supabase**
  - Authentication → Email Templates
  - Customize:
    - **Confirm signup** - письмо с кодом подтверждения
    - **Magic Link** - магическая ссылка для входа
    - **Change Email** - подтверждение смены email

### 3. 🔐 Supabase RLS (Row Level Security)

- [ ] **Включить RLS для всех таблиц**
  ```sql
  -- Выполните в Supabase SQL Editor:
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE email_verification_codes ENABLE ROW LEVEL SECURITY;
  ```

- [ ] **Проверить политики после применения PRODUCTION_SECURE_RLS.sql**
  ```sql
  -- Должны быть политики:
  SELECT tablename, policyname, cmd FROM pg_policies
  WHERE tablename IN ('users', 'email_verification_codes');
  ```

### 4. 🌐 Domain & SSL

- [ ] **Настроить кастомный домен в Vercel**
  - Settings → Domains
  - Add your domain (например: fourfurr.camp)
  - Настроить DNS записи

- [ ] **Проверить SSL сертификат**
  - Vercel автоматически выдаёт Let's Encrypt сертификат
  - Убедитесь что сайт открывается по HTTPS

- [ ] **Обновить Supabase Site URL**
  - Authentication → URL Configuration
  - Site URL: `https://fourfurr.camp` (ваш домен)
  - Redirect URLs: добавьте `https://fourfurr.camp/**`

### 5. 🧪 Тестирование

- [ ] **Полный цикл регистрации**
  1. Зарегистрироваться с реальным email
  2. Получить письмо с кодом
  3. Подтвердить email
  4. Войти в систему
  5. Обновить профиль
  6. Загрузить аватар

- [ ] **Проверить защиту админ-панели**
  1. Войти как обычный пользователь
  2. Попытаться открыть /admin
  3. Должен редиректить на /dashboard

- [ ] **Проверить rate limiting**
  1. Попытаться войти 6 раз с неверным паролем
  2. Должна появиться блокировка на 30 минут

- [ ] **Проверить XSS защиту**
  1. Попробовать ввести в nickname: `<script>alert('XSS')</script>`
  2. Должна появиться ошибка или теги должны удалиться

---

## 📊 Рекомендуемые задачи

### 6. 🔍 Monitoring & Logging

- [ ] **Настроить Supabase Logs**
  - Logs → API logs
  - Мониторить ошибки аутентификации
  - Мониторить подозрительную активность

- [ ] **Настроить Vercel Analytics**
  - Analytics → Enable
  - Отслеживать посещаемость и ошибки

- [ ] **Настроить Error Tracking (опционально)**
  - Sentry.io или аналог
  - Отлавливать JS ошибки в продакшене

### 7. 📈 Performance

- [ ] **Включить Compression в Vercel**
  - Обычно включено по умолчанию
  - Проверьте в Network DevTools

- [ ] **Оптимизировать изображения**
  - Сжать logo и background images
  - Использовать WebP формат где возможно

- [ ] **Включить CDN caching**
  - Vercel автоматически кэширует статику
  - Проверить Cache-Control headers

### 8. 🛡️ Дополнительная безопасность

- [ ] **Настроить CSP (Content Security Policy)**
  ```javascript
  // vercel.json
  {
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self' 'unsafe-inline' challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co"
          }
        ]
      }
    ]
  }
  ```

- [ ] **Включить HSTS**
  ```javascript
  // vercel.json
  {
    "key": "Strict-Transport-Security",
    "value": "max-age=31536000; includeSubDomains"
  }
  ```

- [ ] **Настроить X-Frame-Options**
  ```javascript
  {
    "key": "X-Frame-Options",
    "value": "DENY"
  }
  ```

### 9. 📝 Backup & Recovery

- [ ] **Настроить автобэкапы Supabase**
  - Settings → Database → Backups
  - Включить Point-in-Time Recovery (платная функция)

- [ ] **Экспортировать схему БД**
  ```bash
  # Сохранить на всякий случай:
  pg_dump --schema-only > schema_backup.sql
  ```

### 10. 📚 Документация

- [ ] **Обновить README.md**
  - Инструкции по деплою
  - Переменные окружения
  - Контакты для поддержки

- [ ] **Создать CHANGELOG.md**
  - Версии и изменения
  - Breaking changes

---

## ✅ Финальная проверка

Перед запуском убедитесь:

- [ ] ✅ Все критические задачи выполнены
- [ ] ✅ VITE_DISABLE_EMAIL = false
- [ ] ✅ VITE_ADMIN_PIN изменён
- [ ] ✅ RLS политики применены
- [ ] ✅ Email отправка работает
- [ ] ✅ SSL сертификат установлен
- [ ] ✅ Тестирование пройдено
- [ ] ✅ Нет ошибок в консоли
- [ ] ✅ Нет ошибок в Supabase Logs

---

## 🚨 Если что-то пошло не так

### Откат изменений

1. **Откатить RLS политики:**
   ```sql
   -- Выполните старый файл database/FINAL_FIX_ALL_RLS.sql
   ```

2. **Откатить код:**
   ```bash
   git revert HEAD
   git push
   ```

3. **Откатить Vercel env:**
   - Верните VITE_DISABLE_EMAIL = true (временно)

### Проверка логов

1. **Supabase Logs:**
   - https://supabase.com/dashboard/project/gczgcatmsrlncjbqdghu/logs

2. **Vercel Logs:**
   - https://vercel.com/dashboard → TourFurr → Deployments → Latest → Logs

3. **Browser Console:**
   - F12 → Console (проверьте ошибки JS)

---

## 📞 Контакты

Если возникли проблемы:
- GitHub Issues: https://github.com/FoxTaffy/TourFurr/issues
- Email: support@fourfurr.camp (замените на реальный)

---

**Дата создания:** 2026-01-31
**Версия:** 1.0.0
**Статус:** Production Ready ✅
