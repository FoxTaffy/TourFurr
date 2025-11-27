# Руководство по безопасности TourFurr 2026

## Обзор системы безопасности

TourFurr 2026 использует многоуровневую систему защиты от различных типов атак, включая DDoS, брутфорс, XSS, SQL-инъекции и другие угрозы.

## Реализованные меры безопасности

### 1. Rate Limiting (Ограничение частоты запросов)

#### Защита от DDoS и брутфорса

**Конфигурации:**

| Действие | Макс. попыток | Временное окно | Блокировка |
|----------|---------------|----------------|------------|
| Вход (Login) | 5 попыток | 15 минут | 30 минут |
| Регистрация | 3 попытки | 1 час | 2 часа |
| Сброс пароля | 3 попытки | 1 час | 1 час |
| Проверка email | 20 попыток | 1 минута | 5 минут |

**Как работает:**
- Отслеживание попыток по email/IP
- Автоматическая блокировка при превышении лимита
- Очистка старых записей каждые 5 минут

**Пример использования:**

```typescript
import { rateLimiter, RATE_LIMITS } from '@/utils/security'

// Проверка перед входом
if (!rateLimiter.isAllowed(email, RATE_LIMITS.LOGIN)) {
  const blockedTime = rateLimiter.getBlockedTime(email)
  throw new Error(`Слишком много попыток. Повторите через ${blockedTime} секунд`)
}
```

### 2. Input Sanitization (Очистка входных данных)

#### Защита от XSS атак

**Функции:**
- Удаление HTML тегов (`<>`)
- Блокировка `javascript:` протокола
- Удаление обработчиков событий (`onclick=`, `onerror=` и т.д.)
- Ограничение длины до 1000 символов

```typescript
import { sanitizeInput } from '@/utils/security'

const cleanEmail = sanitizeInput(userInput.email)
const cleanNickname = sanitizeInput(userInput.nickname)
```

### 3. Password Security (Безопасность паролей)

#### Требования к паролям

- ✅ Минимум 8 символов (рекомендуется 12+)
- ✅ Строчные и заглавные буквы
- ✅ Цифры
- ✅ Специальные символы
- ❌ Запрещены простые пароли (password, 123456, qwerty и т.д.)

#### Оценка надежности

```typescript
import { checkPasswordStrength } from '@/utils/security'

const strength = checkPasswordStrength(password)
// strength.score: 0-4
// strength.isStrong: boolean
// strength.feedback: string[]
```

**Шкала надежности:**
- 0-1: Очень слабый (❌)
- 2: Слабый (⚠️)
- 3: Хороший (✅)
- 4: Отличный (✅✅)

#### Хеширование

```typescript
// На сервере используется bcrypt с автоматическим salt
import bcrypt from 'bcrypt'

const saltRounds = 12
const passwordHash = await bcrypt.hash(password, saltRounds)
```

### 4. Email Validation (Валидация email)

#### Строгая проверка формата

```typescript
import { isValidEmail } from '@/utils/security'

if (!isValidEmail(email)) {
  throw new Error('Неверный формат email')
}
```

**Проверки:**
- Соответствие RFC 5322
- Максимум 254 символа
- Локальная часть до 64 символов
- Валидные символы и структура

### 5. Suspicious Activity Detection (Обнаружение подозрительной активности)

#### Паттерны атак

Система автоматически определяет подозрительные паттерны:

- XSS: `<script>`, `javascript:`, `onerror=`
- SQL-инъекции: `SELECT FROM`, `UNION SELECT`, `DROP TABLE`
- Code injection: `eval()`, `expression()`, `import`
- HTML injection: `<iframe>`, `<object>`

```typescript
import { detectSuspiciousActivity } from '@/utils/security'

if (detectSuspiciousActivity(userInput)) {
  securityLogger.log({
    type: 'suspicious_activity',
    identifier: email,
    details: { input: userInput }
  })
  throw new Error('Обнаружена подозрительная активность')
}
```

### 6. CSRF Protection (Защита от CSRF атак)

#### Токены одноразового использования

```typescript
import { csrfManager } from '@/utils/security'

// Генерация токена
const token = csrfManager.generate()

// Валидация токена (удаляется после использования)
if (!csrfManager.validate(token)) {
  throw new Error('Недействительный CSRF токен')
}
```

**Характеристики:**
- Криптографически стойкие токены (32 байта)
- Время жизни: 1 час
- Одноразовое использование
- Автоматическая очистка устаревших

### 7. Security Logging (Журналирование безопасности)

#### Типы событий

```typescript
import { securityLogger } from '@/utils/security'

// Логирование события
securityLogger.log({
  type: 'login_failure',
  identifier: email,
  details: { reason: 'Invalid password', ip: '...' }
})

// Получение истории
const failures = securityLogger.getRecentFailures(email, 3600000) // За последний час
```

**Отслеживаемые события:**
- `login_attempt` - Попытка входа
- `login_failure` - Неудачный вход
- `registration` - Регистрация
- `rate_limit` - Срабатывание ограничения
- `suspicious_activity` - Подозрительная активность
- `account_locked` - Блокировка аккаунта

### 8. Client Fingerprinting (Идентификация клиента)

#### Отпечаток браузера

```typescript
import { getClientFingerprint } from '@/utils/security'

const fingerprint = getClientFingerprint()
// Используется для дополнительной идентификации
```

**Учитываемые параметры:**
- User Agent
- Язык браузера
- Глубина цвета
- Разрешение экрана
- Часовой пояс
- Наличие storage API

## Рекомендации по безопасности

### Для разработчиков

1. **Всегда используйте sanitizeInput** для пользовательского ввода
2. **Проверяйте rate limits** перед критическими операциями
3. **Логируйте все события безопасности** для анализа
4. **Не храните пароли в открытом виде** - только хеши
5. **Валидируйте данные на клиенте И сервере**
6. **Используйте HTTPS** для всех запросов
7. **Регулярно обновляйте зависимости**

### Для администраторов

1. **Мониторинг логов безопасности**
   ```typescript
   // Проверка последних событий
   const events = securityLogger.getEvents()
   ```

2. **Настройка rate limits** под нагрузку сервера

3. **Резервное копирование** базы данных

4. **Обновление системы безопасности** при обнаружении уязвимостей

## Архитектура безопасности

```
┌─────────────────┐
│  Client (Vue)   │
│  - Rate Limit   │
│  - Validation   │
│  - Sanitization │
└────────┬────────┘
         │
         │ HTTPS
         │
┌────────▼────────┐
│   Supabase      │
│  - Row Level    │
│    Security     │
│  - Auth Tokens  │
│  - Encryption   │
└─────────────────┘
```

## Обработка инцидентов

### При обнаружении атаки:

1. **Автоматическая блокировка** через rate limiter
2. **Логирование события** в securityLogger
3. **Уведомление пользователя** о блокировке
4. **Анализ логов** для выявления паттернов

### Разблокировка пользователя:

```typescript
rateLimiter.reset(email)
securityLogger.log({
  type: 'manual_unblock',
  identifier: email,
  details: { admin: 'admin_id' }
})
```

## Контрольный список безопасности

- [x] Rate limiting на всех endpoint'ах
- [x] Sanitization всех пользовательских данных
- [x] Валидация email и паролей
- [x] Защита от XSS атак
- [x] Защита от SQL инъекций
- [x] CSRF токены для форм
- [x] Логирование событий безопасности
- [x] Fingerprinting для идентификации
- [x] Блокировка по подозрительной активности
- [x] Безопасное хеширование паролей

## Конфигурация Supabase

### Row Level Security (RLS)

```sql
-- Пример политики безопасности
CREATE POLICY "Users can only read their own data"
ON users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Authenticated users can update their own data"
ON users
FOR UPDATE
USING (auth.uid() = id);
```

### Триггеры безопасности

```sql
-- Логирование неудачных попыток входа
CREATE OR REPLACE FUNCTION log_failed_login()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO security_logs (event_type, user_email, created_at)
  VALUES ('login_failure', NEW.email, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## Тестирование безопасности

### Проверка rate limiting

```typescript
describe('Rate Limiter', () => {
  it('should block after max attempts', () => {
    for (let i = 0; i < 6; i++) {
      rateLimiter.isAllowed('test@example.com', RATE_LIMITS.LOGIN)
    }
    expect(rateLimiter.isAllowed('test@example.com', RATE_LIMITS.LOGIN)).toBe(false)
  })
})
```

### Проверка sanitization

```typescript
describe('Input Sanitization', () => {
  it('should remove HTML tags', () => {
    const malicious = '<script>alert("XSS")</script>Hello'
    const clean = sanitizeInput(malicious)
    expect(clean).not.toContain('<script>')
  })
})
```

## Обновления безопасности

Регулярно проверяйте:
- Новые CVE в используемых пакетах
- Обновления Supabase
- Изменения в best practices безопасности

## Контакты

По вопросам безопасности:
- Email: security@tourfurr.ru
- Ответственный: Security Team

---

**Важно:** Никогда не комми́тьте в репозиторий:
- API ключи
- Пароли
- Приватные токены
- Конфигурацию production базы данных
