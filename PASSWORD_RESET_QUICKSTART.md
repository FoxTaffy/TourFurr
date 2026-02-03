# Password Reset Quick Start Guide

## 🎯 Быстрый старт (5 минут)

### 1. Запустите SQL миграцию

**Через Supabase Dashboard:**
1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. SQL Editor → New Query
3. Вставьте содержимое `database/password_reset_codes.sql`
4. Run

### 2. Задеплойте Edge Functions

**Автоматически:**
```bash
./deploy-password-reset.sh
```

**Или вручную:**
```bash
supabase functions deploy send-password-reset-email --no-verify-jwt
supabase functions deploy update-password --no-verify-jwt
```

### 3. Проверьте секрет RESEND_API_KEY

```bash
# Посмотреть список секретов
supabase secrets list

# Если нет, установить
supabase secrets set RESEND_API_KEY=re_your_key_here
```

### 4. Тестирование

Откройте сайт и перейдите на `/reset-password`

---

## ✅ Что изменилось

### Раньше (Supabase Auth)
- ❌ Supabase отправлял письма с magic link
- ❌ Ограниченные возможности кастомизации email
- ❌ Зависимость от Supabase email сервиса

### Сейчас (Resend.com)
- ✅ 6-значные коды (как при регистрации)
- ✅ Красивые HTML письма через resend.com
- ✅ Коды действительны 15 минут
- ✅ Унифицированный дизайн с verification emails
- ✅ Полный контроль над процессом

---

## 📁 Новые файлы

### Backend
- `database/password_reset_codes.sql` - SQL миграция
- `supabase/functions/send-password-reset-email/index.ts` - отправка кодов
- `supabase/functions/update-password/index.ts` - обновление пароля

### Frontend
- `src/utils/passwordReset.ts` - утилиты для работы с кодами
- `src/views/VerifyResetCodePage.vue` - страница ввода кода
- `src/components/auth/ResetCodeInput.vue` - компонент ввода кода

### Обновленные файлы
- `src/views/ResetPasswordPage.vue` - использует resend.com
- `src/components/auth/LoginForm.vue` - форма "Забыли пароль?"
- `src/views/UpdatePasswordPage.vue` - работает с кодами
- `src/router/index.ts` - новый роут `/auth/verify-reset-code`

---

## 🔄 Новый флоу

```
┌─────────────────────┐
│ /reset-password     │  1. Пользователь вводит email
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Backend создает     │  2. Генерируется 6-значный код
│ код в БД            │     Отправляется email через resend.com
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ /auth/verify-       │  3. Пользователь вводит код
│ reset-code          │     Код проверяется
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ /auth/update-       │  4. Пользователь вводит новый пароль
│ password            │     Edge Function обновляет через admin API
└─────────────────────┘
```

---

## 🛠️ Дополнительная настройка

### Development режим

Для тестирования без отправки реальных писем:

```env
# .env
VITE_DISABLE_EMAIL=true
```

Коды будут показываться в консоли браузера.

### Настройка cron для очистки старых кодов

```sql
-- В Supabase SQL Editor
SELECT cron.schedule(
  'cleanup-password-reset-codes',
  '0 3 * * *', -- каждый день в 3:00
  $$SELECT cleanup_expired_reset_codes()$$
);
```

### Настройка rate limiting

Resend автоматически ограничивает количество писем:
- Free tier: 100 emails/день
- Pro: 50,000+ emails/месяц

---

## 📊 Мониторинг

### Логи Edge Functions

```bash
# Реального времени
supabase functions logs send-password-reset-email --tail

# Последние записи
supabase functions logs update-password
```

### Проверка кодов в БД

```sql
-- Активные коды
SELECT email, code, created_at, expires_at, attempts
FROM password_reset_codes
WHERE used = false AND expires_at > NOW()
ORDER BY created_at DESC;

-- Статистика
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE used = true) as used,
  COUNT(*) FILTER (WHERE attempts >= 3) as max_attempts
FROM password_reset_codes
WHERE created_at > NOW() - INTERVAL '24 hours';
```

---

## ❓ Troubleshooting

### Письмо не приходит

1. Проверьте логи Edge Function:
   ```bash
   supabase functions logs send-password-reset-email
   ```

2. Проверьте RESEND_API_KEY:
   ```bash
   supabase secrets list
   ```

3. Проверьте домен в Resend Dashboard

### Ошибка "User not found"

Проверьте, что пользователь существует:
```sql
SELECT * FROM users WHERE email = 'user@example.com';
```

### Не удается обновить пароль

1. Проверьте, что код был верифицирован
2. Проверьте sessionStorage в браузере (должен быть `reset_email`)
3. Проверьте логи update-password функции

---

## 📚 Полная документация

См. `PASSWORD_RESET_DEPLOYMENT.md` для детальной инструкции.

---

## 🆘 Помощь

**Основные команды:**

```bash
# Список функций
supabase functions list

# Список секретов
supabase secrets list

# Логи
supabase functions logs function-name

# Повторный деплой
supabase functions deploy function-name
```

**Полезные SQL запросы:**

```sql
-- Проверить таблицу
SELECT * FROM password_reset_codes LIMIT 5;

-- Проверить политики
SELECT * FROM pg_policies WHERE tablename = 'password_reset_codes';

-- Удалить все тестовые коды
DELETE FROM password_reset_codes WHERE email LIKE '%test%';
```
