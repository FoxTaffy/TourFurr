# Руководство по внедрению системы безопасности

## Быстрый старт

### 1. Интеграция в Auth Store

Откройте `src/stores/auth.ts` и добавьте импорты:

```typescript
import {
  rateLimiter,
  RATE_LIMITS,
  sanitizeInput,
  isValidEmail,
  checkPasswordStrength,
  detectSuspiciousActivity,
  securityLogger,
  getClientFingerprint
} from '@/utils/security'
```

### 2. Защита функции входа (login)

```typescript
async login(email: string, password: string) {
  const cleanEmail = sanitizeInput(email.toLowerCase())
  const fingerprint = getClientFingerprint()

  // Rate limiting
  if (!rateLimiter.isAllowed(cleanEmail, RATE_LIMITS.LOGIN)) {
    const blockedTime = rateLimiter.getBlockedTime(cleanEmail)
    securityLogger.log({
      type: 'rate_limit',
      identifier: cleanEmail,
      details: { action: 'login', fingerprint }
    })
    return {
      success: false,
      error: `Слишком много попыток входа. Попробуйте через ${Math.ceil(blockedTime / 60)} минут`
    }
  }

  // Email validation
  if (!isValidEmail(cleanEmail)) {
    return {
      success: false,
      error: 'Неверный формат email'
    }
  }

  // Detect suspicious activity
  if (detectSuspiciousActivity(email) || detectSuspiciousActivity(password)) {
    securityLogger.log({
      type: 'suspicious_activity',
      identifier: cleanEmail,
      details: { action: 'login', fingerprint }
    })
    return {
      success: false,
      error: 'Обнаружена подозрительная активность'
    }
  }

  securityLogger.log({
    type: 'login_attempt',
    identifier: cleanEmail,
    details: { fingerprint }
  })

  try {
    // Ваш существующий код входа...
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password
    })

    if (error) {
      securityLogger.log({
        type: 'login_failure',
        identifier: cleanEmail,
        details: { reason: error.message, fingerprint }
      })
      return { success: false, error: 'Неверный email или пароль' }
    }

    // При успехе сбросить rate limit
    rateLimiter.reset(cleanEmail)

    return { success: true }
  } catch (err: any) {
    securityLogger.log({
      type: 'login_failure',
      identifier: cleanEmail,
      details: { error: err.message, fingerprint }
    })
    return { success: false, error: 'Ошибка входа' }
  }
}
```

### 3. Защита функции регистрации (register)

```typescript
async register(data: RegisterData) {
  const cleanEmail = sanitizeInput(data.email.toLowerCase())
  const cleanNickname = sanitizeInput(data.nickname)
  const fingerprint = getClientFingerprint()

  // Rate limiting
  if (!rateLimiter.isAllowed(cleanEmail, RATE_LIMITS.REGISTER)) {
    const blockedTime = rateLimiter.getBlockedTime(cleanEmail)
    return {
      success: false,
      error: `Слишком много попыток регистрации. Попробуйте через ${Math.ceil(blockedTime / 60)} минут`
    }
  }

  // Email validation
  if (!isValidEmail(cleanEmail)) {
    return { success: false, error: 'Неверный формат email' }
  }

  // Password strength check
  const passwordCheck = checkPasswordStrength(data.password)
  if (!passwordCheck.isStrong) {
    return {
      success: false,
      error: `Пароль недостаточно надежный: ${passwordCheck.feedback.join(', ')}`
    }
  }

  // Detect suspicious activity
  const allInputs = [
    data.email,
    data.nickname,
    data.phone,
    data.telegram,
    data.description || ''
  ]

  if (allInputs.some(input => detectSuspiciousActivity(input))) {
    securityLogger.log({
      type: 'suspicious_activity',
      identifier: cleanEmail,
      details: { action: 'register', fingerprint }
    })
    return { success: false, error: 'Обнаружена подозрительная активность' }
  }

  securityLogger.log({
    type: 'registration',
    identifier: cleanEmail,
    details: { fingerprint }
  })

  try {
    // Ваш существующий код регистрации...
    // ...

    rateLimiter.reset(cleanEmail)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
```

### 4. Защита проверки email

```typescript
async checkEmailUnique(email: string): Promise<boolean> {
  const cleanEmail = sanitizeInput(email.toLowerCase())

  // Rate limiting для предотвращения перебора
  if (!rateLimiter.isAllowed(`email_check_${cleanEmail}`, RATE_LIMITS.EMAIL_CHECK)) {
    return true // Вернуть true чтобы не раскрывать информацию
  }

  if (!isValidEmail(cleanEmail)) {
    return true
  }

  try {
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle()

    return !data
  } catch {
    return true
  }
}
```

## Добавление CAPTCHA (Опционально, но рекомендуется)

### 1. Установка hCaptcha

```bash
npm install @hcaptcha/vue3-hcaptcha
```

### 2. Регистрация на hCaptcha

1. Перейдите на https://www.hcaptcha.com/
2. Создайте аккаунт
3. Получите Site Key и Secret Key
4. Добавьте в `.env`:

```env
VITE_HCAPTCHA_SITE_KEY=your_site_key_here
```

### 3. Добавление в форму входа (LoginForm.vue)

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <!-- Ваши поля -->

    <!-- CAPTCHA -->
    <HCaptcha
      v-if="showCaptcha"
      :sitekey="captchaSiteKey"
      @verify="handleCaptchaVerify"
      @error="handleCaptchaError"
    />

    <button type="submit" :disabled="showCaptcha && !captchaToken">
      Войти
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import HCaptcha from '@hcaptcha/vue3-hcaptcha'
import { securityLogger } from '@/utils/security'

const captchaSiteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY
const captchaToken = ref<string | null>(null)

// Показывать CAPTCHA после 2 неудачных попыток
const loginAttempts = ref(0)
const showCaptcha = computed(() => loginAttempts.value >= 2)

function handleCaptchaVerify(token: string) {
  captchaToken.value = token
}

function handleCaptchaError() {
  captchaToken.value = null
  securityLogger.log({
    type: 'suspicious_activity',
    identifier: 'captcha',
    details: { error: 'CAPTCHA failed' }
  })
}

async function handleSubmit() {
  if (showCaptcha.value && !captchaToken.value) {
    error.value = 'Пожалуйста, пройдите проверку CAPTCHA'
    return
  }

  // Ваша логика входа...
  const result = await authStore.login(form.email, form.password)

  if (!result.success) {
    loginAttempts.value++
  } else {
    loginAttempts.value = 0
  }

  // Сброс CAPTCHA после попытки
  captchaToken.value = null
}
</script>
```

### 4. Добавление в форму регистрации (RegisterForm.vue)

Аналогично LoginForm.vue, добавьте CAPTCHA в RegisterForm на шаге 3 перед кнопкой "Зарегистрироваться".

## Настройка Supabase Edge Functions (Серверная защита)

### 1. Создание Edge Function для дополнительной проверки

```typescript
// supabase/functions/verify-registration/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { email, captchaToken } = await req.json()

  // Verify CAPTCHA on server
  const captchaResponse = await fetch('https://hcaptcha.com/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: Deno.env.get('HCAPTCHA_SECRET_KEY')!,
      response: captchaToken
    })
  })

  const captchaData = await captchaResponse.json()

  if (!captchaData.success) {
    return new Response(
      JSON.stringify({ error: 'CAPTCHA verification failed' }),
      { status: 400 }
    )
  }

  // Additional server-side checks...

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

## Дополнительные рекомендации

### 1. Environment Variables

Добавьте в `.env`:

```env
# Security
VITE_ENABLE_RATE_LIMITING=true
VITE_ENABLE_CAPTCHA=true
VITE_HCAPTCHA_SITE_KEY=your_site_key

# Supabase (если еще не добавлено)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Git Ignore

Убедитесь, что `.env` в `.gitignore`:

```gitignore
# Environment
.env
.env.local
.env.*.local
```

### 3. Мониторинг

Создайте дашборд для мониторинга безопасности:

```typescript
// src/views/SecurityDashboard.vue (для админов)
<script setup lang="ts">
import { securityLogger } from '@/utils/security'

const recentEvents = securityLogger.getEvents()
const suspiciousActivity = securityLogger.getEvents(undefined, 'suspicious_activity')
const failedLogins = securityLogger.getEvents(undefined, 'login_failure')
</script>

<template>
  <div class="security-dashboard">
    <h2>Security Dashboard</h2>

    <div class="stats">
      <div class="stat-card">
        <h3>Recent Events</h3>
        <p>{{ recentEvents.length }}</p>
      </div>

      <div class="stat-card warning">
        <h3>Suspicious Activity</h3>
        <p>{{ suspiciousActivity.length }}</p>
      </div>

      <div class="stat-card error">
        <h3>Failed Logins</h3>
        <p>{{ failedLogins.length }}</p>
      </div>
    </div>

    <div class="events-list">
      <div v-for="event in recentEvents.slice(0, 20)" :key="event.timestamp">
        <span>{{ new Date(event.timestamp).toLocaleString() }}</span>
        <span>{{ event.type }}</span>
        <span>{{ event.identifier }}</span>
      </div>
    </div>
  </div>
</template>
```

## Тестирование

### 1. Тест rate limiting

```typescript
// tests/security.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { rateLimiter, RATE_LIMITS } from '@/utils/security'

describe('Security - Rate Limiting', () => {
  beforeEach(() => {
    rateLimiter.reset('test@example.com')
  })

  it('should allow requests within limit', () => {
    for (let i = 0; i < 5; i++) {
      const allowed = rateLimiter.isAllowed('test@example.com', RATE_LIMITS.LOGIN)
      expect(allowed).toBe(true)
    }
  })

  it('should block after exceeding limit', () => {
    for (let i = 0; i < 6; i++) {
      rateLimiter.isAllowed('test@example.com', RATE_LIMITS.LOGIN)
    }

    const allowed = rateLimiter.isAllowed('test@example.com', RATE_LIMITS.LOGIN)
    expect(allowed).toBe(false)
  })

  it('should provide blocked time', () => {
    for (let i = 0; i < 6; i++) {
      rateLimiter.isAllowed('test@example.com', RATE_LIMITS.LOGIN)
    }

    const blockedTime = rateLimiter.getBlockedTime('test@example.com')
    expect(blockedTime).toBeGreaterThan(0)
  })
})
```

### 2. Тест sanitization

```typescript
describe('Security - Input Sanitization', () => {
  it('should remove XSS attempts', () => {
    const malicious = '<script>alert("XSS")</script>Hello'
    const clean = sanitizeInput(malicious)
    expect(clean).toBe('scriptalert("XSS")/scriptHello')
    expect(clean).not.toContain('<')
  })

  it('should remove event handlers', () => {
    const malicious = '<img onerror="alert(1)" src="x">'
    const clean = sanitizeInput(malicious)
    expect(clean).not.toContain('onerror=')
  })
})
```

## Деплой

При деплое на production:

1. ✅ Убедитесь, что все env переменные установлены
2. ✅ CAPTCHA ключи настроены
3. ✅ HTTPS включен
4. ✅ Rate limiting активирован
5. ✅ Security headers настроены

### Vercel настройки

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

## Поддержка

Вопросы по безопасности: security@tourfurr.ru

---

**Следующие шаги:**
1. Интегрируйте security utils в auth store
2. Добавьте CAPTCHA в формы
3. Настройте мониторинг логов
4. Протестируйте все функции
5. Задеплойте с правильными настройками
