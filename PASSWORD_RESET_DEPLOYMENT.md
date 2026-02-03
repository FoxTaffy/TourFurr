# Password Reset Deployment Guide

Руководство по развертыванию новой системы сброса пароля через resend.com

## 📋 Обзор

Система сброса пароля была переключена с Supabase Auth на resend.com:
- ✅ 6-значные коды вместо magic links
- ✅ Красивые email-письма через resend.com
- ✅ Коды действительны 15 минут
- ✅ Безопасное обновление паролей через Edge Function

## 🔧 Шаг 1: Запуск SQL миграции

### Через Supabase Dashboard

1. Откройте Supabase Dashboard: https://supabase.com/dashboard
2. Выберите ваш проект **TourFurr**
3. Перейдите в **SQL Editor** (левое меню)
4. Нажмите **New Query**
5. Скопируйте содержимое файла `database/password_reset_codes.sql`
6. Вставьте в редактор и нажмите **Run**

### Проверка успешности

После выполнения запроса проверьте:

```sql
-- Проверить, что таблица создана
SELECT * FROM password_reset_codes LIMIT 1;

-- Проверить политики RLS
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'password_reset_codes';

-- Проверить функцию очистки
SELECT proname FROM pg_proc WHERE proname = 'cleanup_expired_reset_codes';
```

Должны быть созданы:
- Таблица `password_reset_codes`
- 3 RLS политики
- Функция `cleanup_expired_reset_codes()`

---

## 🚀 Шаг 2: Деплой Edge Functions

### 2.1. Установка Supabase CLI (если еще не установлен)

```bash
npm install -g supabase
```

### 2.2. Логин в Supabase

```bash
supabase login
```

### 2.3. Link проекта (если еще не сделано)

```bash
# Получите reference ID из Supabase Dashboard (Settings > General > Reference ID)
supabase link --project-ref your-project-ref-id
```

### 2.4. Деплой функции send-password-reset-email

```bash
cd /home/user/TourFurr
supabase functions deploy send-password-reset-email
```

**Ожидаемый вывод:**
```
Deploying function send-password-reset-email...
Function send-password-reset-email deployed successfully!
Function URL: https://[project-ref].supabase.co/functions/v1/send-password-reset-email
```

### 2.5. Деплой функции update-password

```bash
supabase functions deploy update-password
```

**Ожидаемый вывод:**
```
Deploying function update-password...
Function update-password deployed successfully!
Function URL: https://[project-ref].supabase.co/functions/v1/update-password
```

### 2.6. Проверка деплоя

Проверьте в Supabase Dashboard:
1. Перейдите в **Edge Functions** (левое меню)
2. Должны быть видны:
   - ✅ `send-verification-email` (уже существует)
   - ✅ `send-password-reset-email` (новая)
   - ✅ `update-password` (новая)

---

## 🔐 Шаг 3: Проверка переменных окружения

### В Supabase Dashboard

1. Перейдите в **Edge Functions** → **Manage secrets**
2. Убедитесь, что существует секрет: `RESEND_API_KEY`

**Если секрета нет:**

```bash
supabase secrets set RESEND_API_KEY=re_your_actual_api_key_here
```

### Автоматические переменные

Эти переменные уже доступны в Edge Functions автоматически:
- `SUPABASE_URL` - автоматически
- `SUPABASE_SERVICE_ROLE_KEY` - автоматически
- `SUPABASE_ANON_KEY` - автоматически

---

## 🧪 Шаг 4: Тестирование

### 4.1. Тест через Supabase Dashboard

1. Перейдите в **Edge Functions**
2. Выберите `send-password-reset-email`
3. Нажмите **Invoke function**
4. Используйте тестовый payload:

```json
{
  "email": "your-test-email@example.com",
  "code": "123456"
}
```

5. Проверьте, что письмо пришло на указанный email

### 4.2. Тест update-password функции

1. Выберите `update-password`
2. Нажмите **Invoke function**
3. Используйте тестовый payload:

```json
{
  "email": "existing-user@example.com",
  "newPassword": "NewTestPassword123!"
}
```

4. Должен вернуться успешный ответ:

```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

### 4.3. E2E тест через UI

1. Откройте сайт TourFurr
2. Перейдите на страницу `/reset-password`
3. Введите существующий email
4. Проверьте email - должен прийти код
5. Введите код на странице `/auth/verify-reset-code`
6. Установите новый пароль на `/auth/update-password`
7. Войдите с новым паролем

---

## 📊 Шаг 5: Мониторинг

### Просмотр логов Edge Functions

```bash
# Логи send-password-reset-email
supabase functions logs send-password-reset-email

# Логи update-password
supabase functions logs update-password

# Следить за логами в реальном времени
supabase functions logs send-password-reset-email --tail
```

### Через Supabase Dashboard

1. **Edge Functions** → выберите функцию
2. Вкладка **Logs**
3. Можно фильтровать по уровню (info, error, warn)

---

## 🔧 Troubleshooting

### Ошибка: "RESEND_API_KEY is not set"

**Решение:**
```bash
supabase secrets set RESEND_API_KEY=re_your_key_here
```

После установки секрета нужно передеплоить функции:
```bash
supabase functions deploy send-password-reset-email
```

### Ошибка: "User not found"

**Причина:** Пользователя нет в таблице `users` или в Supabase Auth

**Проверка:**
```sql
-- Проверить в таблице users
SELECT * FROM users WHERE email = 'user@example.com';

-- Проверить в Supabase Auth
-- Authentication → Users (в Dashboard)
```

### Ошибка: "Failed to update password"

**Причины:**
1. Недостаточно прав у Service Role Key
2. Пользователь не найден в auth.users

**Решение:**
- Убедитесь, что `SUPABASE_SERVICE_ROLE_KEY` доступен в Edge Function (автоматически)
- Проверьте, что пользователь существует в Supabase Auth

### Ошибка: "Email rate limit exceeded"

**Причина:** Превышен лимит отправки писем в Resend

**Решение:**
- В development: установите `VITE_DISABLE_EMAIL=true` в `.env`
- В production: проверьте лимиты в Resend Dashboard

---

## 🎯 Следующие шаги

После успешного деплоя:

1. ✅ Тестируйте в production с реальными пользователями
2. ✅ Мониторьте логи первые 24 часа
3. ✅ Настройте cron job для очистки старых кодов:

```sql
-- Запускать каждый день
SELECT cron.schedule(
  'cleanup-password-reset-codes',
  '0 3 * * *', -- каждый день в 3:00
  $$SELECT cleanup_expired_reset_codes()$$
);
```

4. ✅ Обновите документацию для пользователей
5. ✅ Добавьте аналитику для отслеживания использования

---

## 📝 Чеклист развертывания

- [ ] SQL миграция выполнена успешно
- [ ] Таблица `password_reset_codes` создана
- [ ] RLS политики настроены
- [ ] Edge Function `send-password-reset-email` задеплоена
- [ ] Edge Function `update-password` задеплоена
- [ ] `RESEND_API_KEY` установлен в секретах
- [ ] Тестовое письмо отправлено и получено
- [ ] E2E тест пройден успешно
- [ ] Логи проверены на отсутствие ошибок
- [ ] Production тест выполнен

---

## 🆘 Поддержка

Если возникли проблемы:

1. Проверьте логи Edge Functions
2. Проверьте RLS политики
3. Убедитесь, что RESEND_API_KEY валидный
4. Проверьте, что домен верифицирован в Resend

**Полезные команды:**

```bash
# Просмотр всех секретов
supabase secrets list

# Просмотр всех функций
supabase functions list

# Удалить функцию (если нужно)
supabase functions delete function-name
```

---

## 📚 Дополнительные ресурсы

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Resend Documentation](https://resend.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
