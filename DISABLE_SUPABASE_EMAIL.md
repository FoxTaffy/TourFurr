# Отключение Supabase Auth Email

## ⚠️ ВАЖНО: Отключите встроенные письма Supabase

Чтобы **только resend.com** отправлял письма, нужно отключить email функционал Supabase Auth.

---

## 🔧 Шаг 1: Отключение Email Auth в Supabase

### В Supabase Dashboard:

1. Откройте ваш проект **TourFurr**
2. Перейдите в **Authentication** → **Providers**
3. Найдите **Email** провайдера
4. **ОТКЛЮЧИТЕ** опцию **"Confirm email"**

Это отключит автоматическую отправку email от Supabase Auth для:
- ✅ Password reset (теперь через resend.com)
- ✅ Email verification (уже используется resend.com)

---

## 📧 Шаг 2: Отключение SMTP (опционально)

Если вы используете собственный SMTP в Supabase, отключите его:

1. **Authentication** → **Settings**
2. Найдите секцию **SMTP Settings**
3. Очистите все поля SMTP
4. Нажмите **Save**

---

## 🔒 Шаг 3: Отключение Email Templates

В **Authentication** → **Email Templates**, убедитесь что шаблоны не используются:

### Для Password Recovery:

Шаблон может остаться, но он **не будет использоваться**, потому что:
- ✅ В коде используется `createPasswordResetCode()` + `sendPasswordResetEmail()` через resend.com
- ✅ Нигде не вызывается `supabase.auth.resetPasswordForEmail()`

Можете оставить шаблон для истории или удалить.

---

## ✅ Проверка что используется только resend.com

### Текущая реализация:

#### Password Reset:
```typescript
// src/views/ResetPasswordPage.vue
import { createPasswordResetCode, sendPasswordResetEmail } from '../utils/passwordReset'

// Создает код в БД
const result = await createPasswordResetCode(cleanEmail)

// Отправляет через resend.com
await sendPasswordResetEmail(cleanEmail, result.code)
```

#### Email Verification:
```typescript
// src/utils/emailVerification.ts
// Уже настроено, использует resend.com
await supabase.functions.invoke('send-verification-email', {
  body: { email, code }
})
```

#### Password Update:
```typescript
// src/views/UpdatePasswordPage.vue
// Использует Edge Function с Service Role Key
await supabase.functions.invoke('update-password', {
  body: { email: resetEmail, newPassword: password.value }
})
```

---

## 🧪 Тестирование

### 1. Проверьте что Supabase НЕ отправляет письма:

```sql
-- В Supabase SQL Editor
-- Проверить что нет записей в auth.audit_log_entries для email
SELECT
  created_at,
  payload->>'action' as action,
  payload->>'email' as email
FROM auth.audit_log_entries
WHERE payload->>'action' LIKE '%password%'
ORDER BY created_at DESC
LIMIT 10;
```

### 2. Проверьте что resend.com отправляет:

1. Запросите сброс пароля на сайте
2. Проверьте [Resend Dashboard](https://resend.com/emails)
3. Должно быть письмо с темой: **"Код сброса пароля TourFurr: XXXXXX"**

---

## 📊 Мониторинг отправки через resend.com

### Resend Dashboard:

1. Откройте [https://resend.com/emails](https://resend.com/emails)
2. Фильтруйте по:
   - **Subject**: "Код сброса пароля TourFurr"
   - **Subject**: "Код подтверждения TourFurr"
3. Проверяйте статусы:
   - ✅ **Delivered** - успешно
   - ❌ **Bounced** - email не существует
   - ⏳ **Queued** - в очереди

### Через Supabase Edge Function Logs:

```bash
# Проверить логи отправки password reset
supabase functions logs send-password-reset-email --tail

# Должны видеть:
# "Password reset email sent successfully: { email: ..., messageId: ... }"
```

---

## 🚫 Что НЕ используется (Supabase Auth)

Эти методы больше **НЕ вызываются** в коде:

```typescript
// ❌ НЕ ИСПОЛЬЗУЕТСЯ
await supabase.auth.resetPasswordForEmail(email)

// ❌ НЕ ИСПОЛЬЗУЕТСЯ
await supabase.auth.signUp({
  email,
  password,
  options: { emailRedirectTo: '...' }
})
```

Вместо этого:

```typescript
// ✅ ИСПОЛЬЗУЕТСЯ
import { createPasswordResetCode, sendPasswordResetEmail } from './utils/passwordReset'
await createPasswordResetCode(email)
await sendPasswordResetEmail(email, code)

// ✅ ИСПОЛЬЗУЕТСЯ для регистрации
import { createVerificationCode, sendVerificationEmail } from './utils/emailVerification'
await createVerificationCode(email)
await sendVerificationEmail(email, code)
```

---

## 🔐 Безопасность

### Почему это безопасно:

1. **Коды хранятся в БД** с временем истечения (15 минут)
2. **RLS политики** контролируют доступ
3. **Rate limiting** в resend.com
4. **Edge Functions** используют Service Role Key для обновления паролей
5. **Попытки ограничены** (максимум 3 попытки на код)

### Дополнительная защита:

```sql
-- Добавить индекс для быстрой очистки
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_expires
ON password_reset_codes(expires_at)
WHERE used = false;

-- Настроить автоочистку (каждый час)
SELECT cron.schedule(
  'cleanup-password-reset-codes',
  '0 * * * *', -- каждый час
  $$SELECT cleanup_expired_reset_codes()$$
);
```

---

## 📝 Чеклист настройки

После выполнения всех шагов:

- [ ] В Supabase Auth отключена опция "Confirm email"
- [ ] SMTP настройки очищены (если были)
- [ ] Email templates не используются активно
- [ ] Тестовое письмо прошло через resend.com
- [ ] В Resend Dashboard видны отправленные письма
- [ ] В логах Edge Functions нет ошибок
- [ ] В Supabase audit log нет записей об email от Auth
- [ ] Password reset работает E2E через UI

---

## 🆘 Проблемы

### Supabase все еще отправляет письма?

**Причина:** Где-то в коде осталось использование Supabase Auth методов

**Решение:**
```bash
# Поиск использования Supabase Auth email методов
grep -r "resetPasswordForEmail" src/
grep -r "auth.signUp" src/ | grep emailRedirectTo

# Не должно быть результатов!
```

### Письма не приходят вообще?

**Проверьте:**
1. RESEND_API_KEY установлен в Supabase secrets
2. Edge Functions задеплоены
3. Домен верифицирован в Resend
4. Логи Edge Functions на ошибки

```bash
supabase secrets list | grep RESEND_API_KEY
supabase functions logs send-password-reset-email
```

---

## ✅ Итого

После выполнения этих шагов:

- ❌ Supabase Auth не отправляет письма
- ✅ Все письма идут через resend.com
- ✅ Единый дизайн писем
- ✅ Полный контроль над процессом
- ✅ Логи и мониторинг в Resend Dashboard

**Все письма TourFurr теперь отправляются только через resend.com! 🎉**
