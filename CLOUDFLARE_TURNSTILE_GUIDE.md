# 🛡️ Cloudflare Turnstile - Руководство разработчика

**TourFurr 2026** | Дата: 25 января 2026

---

## 📋 Содержание

1. [Что такое Cloudflare Turnstile](#что-такое-cloudflare-turnstile)
2. [Настройка проекта](#настройка-проекта)
3. [Использование компонента](#использование-компонента)
4. [Проверка токенов на сервере](#проверка-токенов-на-сервере)
5. [Примеры интеграции](#примеры-интеграции)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## Что такое Cloudflare Turnstile

**Cloudflare Turnstile** - это современная альтернатива CAPTCHA от Cloudflare, которая:

- ✅ Невидима для большинства пользователей (работает в фоне)
- ✅ Не требует решения головоломок (в отличие от reCAPTCHA)
- ✅ Полностью соответствует GDPR и privacy законам
- ✅ Бесплатна для небольших сайтов (до 1M проверок/месяц)
- ✅ Защищает от ботов, скриптов и автоматизированных атак

**Почему мы мигрировали с hCaptcha на Turnstile:**
- Лучший UX (пользователи не видят капчу в 99% случаев)
- Выше скорость работы
- Меньше ложных срабатываний
- Cloudflare - индустриальный стандарт безопасности

---

## Настройка проекта

### 1. Переменные окружения

Добавьте в ваш `.env` файл:

```bash
# Cloudflare Turnstile (клиентский ключ - виден всем)
VITE_TURNSTILE_SITE_KEY=0x4AAAAAACQmENl2nYwq4ELx

# Cloudflare Turnstile Secret (серверный ключ - НИКОГДА не показывайте клиенту!)
TURNSTILE_SECRET_KEY=0x4AAAAAACQmEPOC8rEzQA6Afj-ICG9-bWk
```

### 2. Supabase Edge Function

Секретный ключ нужно установить в Supabase:

1. Откройте **Supabase Dashboard**
2. Перейдите в **Settings** → **Edge Functions** → **Secrets**
3. Добавьте секрет:
   - **Name:** `TURNSTILE_SECRET_KEY`
   - **Value:** `0x4AAAAAACQmEPOC8rEzQA6Afj-ICG9-bWk`

### 3. Деплой Edge Function

```bash
# Установите Supabase CLI
npm install -g supabase

# Войдите в Supabase
supabase login

# Деплой функции
cd supabase/functions
supabase functions deploy turnstile-verify
```

### 4. Настройка Cloudflare Dashboard

1. Откройте [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Перейдите в **Turnstile**
3. Найдите ваш сайт **TourFurr**
4. В разделе **Domains** добавьте:
   - `tourfurr.ru` (основной домен)
   - `localhost` (для разработки)
   - Ваш Vercel домен (например, `tourfurr.vercel.app`)

---

## Использование компонента

### Базовое использование

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <!-- Ваши поля формы -->

    <!-- Cloudflare Turnstile -->
    <CloudflareTurnstile
      :siteKey="turnstilesiteKey"
      theme="dark"
      @verify="handleTurnstileVerify"
      @error="handleTurnstileError"
      @expired="handleTurnstileExpired"
    />

    <button type="submit" :disabled="!turnstileToken">
      Отправить
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CloudflareTurnstile from '@/components/common/CloudflareTurnstile.vue'

const turnstilesiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAACQmENl2nYwq4ELx'
const turnstileToken = ref<string | null>(null)

function handleTurnstileVerify(token: string) {
  turnstileToken.value = token
  console.log('✅ Turnstile verified')
}

function handleTurnstileError(error: string) {
  turnstileToken.value = null
  console.error('❌ Turnstile error:', error)
}

function handleTurnstileExpired() {
  turnstileToken.value = null
  console.warn('⏰ Turnstile expired')
}

async function handleSubmit() {
  if (!turnstileToken.value) {
    alert('Пожалуйста, пройдите проверку безопасности')
    return
  }
  
  // Ваша логика отправки формы
}
</script>
```

### Props компонента CloudflareTurnstile

| Prop | Type | Default | Описание |
|------|------|---------|----------|
| `siteKey` | `string` | **required** | Публичный ключ Turnstile |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'dark'` | Тема виджета |
| `size` | `'normal' \| 'compact'` | `'normal'` | Размер виджета |
| `language` | `string` | `'ru'` | Язык виджета |
| `appearance` | `'always' \| 'execute' \| 'interaction-only'` | `'always'` | Режим отображения |
| `refreshExpired` | `'auto' \| 'manual' \| 'never'` | `'auto'` | Автообновление после истечения |

### Events компонента

| Event | Payload | Описание |
|-------|---------|----------|
| `@verify` | `token: string` | Успешная верификация |
| `@error` | `error: string` | Ошибка при верификации |
| `@expired` | - | Токен истек |
| `@timeout` | - | Таймаут верификации |
| `@beforeInteractive` | - | Перед интерактивным челленджем |
| `@afterInteractive` | - | После интерактивного челленджа |
| `@unsupported` | - | Браузер не поддерживается |

### Методы компонента (через ref)

```vue
<script setup>
import { ref } from 'vue'

const turnstileRef = ref(null)

// Сбросить виджет (например, после ошибки)
function resetTurnstile() {
  turnstileRef.value?.reset()
}

// Удалить виджет
function removeTurnstile() {
  turnstileRef.value?.remove()
}

// Получить текущий токен
function getToken() {
  return turnstileRef.value?.getResponse()
}
</script>

<template>
  <CloudflareTurnstile ref="turnstileRef" ... />
</template>
```

---

## Проверка токенов на сервере

### ⚠️ КРИТИЧНО: Всегда проверяйте токены на сервере!

**НИКОГДА** не доверяйте клиенту. Даже если токен получен, злоумышленник может подделать запрос.

### Через Supabase Edge Function (рекомендуется)

```typescript
// В вашем коде
const { data, error } = await supabase.functions.invoke('turnstile-verify', {
  body: { token: turnstileToken.value }
})

if (error || !data?.success) {
  alert('Проверка безопасности не пройдена')
  return
}

// Токен валиден - можно продолжать
```

### Прямой вызов API Cloudflare (альтернатива)

```typescript
const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    secret: 'YOUR_SECRET_KEY', // ⚠️ Только на сервере!
    response: turnstileToken,
    remoteip: userIP, // опционально
  }),
})

const result = await response.json()

if (result.success) {
  // Токен валиден
} else {
  // Токен невалиден
  console.error('Turnstile errors:', result['error-codes'])
}
```

### Возможные error-codes

| Код | Описание | Действие |
|-----|----------|----------|
| `missing-input-secret` | Не передан secret key | Проверьте конфигурацию |
| `invalid-input-secret` | Неверный secret key | Проверьте ключ в Supabase |
| `missing-input-response` | Не передан токен | Проверьте client код |
| `invalid-input-response` | Токен невалиден | Токен поддельный или истек |
| `bad-request` | Неверный запрос | Проверьте формат запроса |
| `timeout-or-duplicate` | Токен использован дважды или истек | Запросите новый токен |

---

## Примеры интеграции

### 1. Форма регистрации

Уже реализовано в `src/components/auth/RegisterForm.vue`:

```vue
<!-- Шаг 3: Проверка безопасности -->
<CloudflareTurnstile
  :siteKey="turnstilesiteKey"
  theme="dark"
  @verify="handleCaptchaVerify"
  @error="handleCaptchaError"
  @expired="handleCaptchaExpired"
/>

<!-- При submit проверяем токен -->
<script>
async function handleSubmit() {
  if (!captchaToken.value) {
    captchaError.value = 'Пожалуйста, пройдите проверку безопасности'
    return
  }
  
  // Продолжаем регистрацию...
}
</script>
```

### 2. Форма входа (после нескольких неудачных попыток)

Уже реализовано в `src/components/auth/LoginForm.vue`:

```vue
<!-- Показываем Turnstile после 2 неудачных попыток -->
<div v-if="showCaptcha" class="captcha-wrapper">
  <CloudflareTurnstile ... />
</div>

<script>
const loginAttempts = ref(0)
const showCaptcha = computed(() => loginAttempts.value >= 2)

async function handleSubmit() {
  // Проверяем CAPTCHA если она показана
  if (showCaptcha.value && !captchaToken.value) {
    captchaError.value = 'Пожалуйста, пройдите проверку CAPTCHA'
    return
  }
  
  const result = await authStore.login(form.email, form.password)
  
  if (!result.success) {
    loginAttempts.value++ // Увеличиваем счетчик неудач
  } else {
    loginAttempts.value = 0 // Сбрасываем при успехе
  }
}
</script>
```

### 3. Форма подачи заявки

Полный пример в `src/components/ApplicationForm.vue`:

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <!-- Поля формы... -->

    <!-- Turnstile обязателен всегда -->
    <CloudflareTurnstile
      ref="turnstileRef"
      :siteKey="turnstilesiteKey"
      theme="dark"
      @verify="handleTurnstileVerify"
      @error="handleTurnstileError"
      @expired="handleTurnstileExpired"
    />

    <button type="submit" :disabled="!turnstileToken">
      Отправить заявку
    </button>
  </form>
</template>

<script setup>
async function handleSubmit() {
  // 1. Проверяем токен локально
  if (!turnstileToken.value) {
    turnstileError.value = 'Пройдите проверку безопасности'
    return
  }

  // 2. Проверяем токен на сервере
  const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
    'turnstile-verify',
    { body: { token: turnstileToken.value } }
  )

  if (verifyError || !verifyData?.success) {
    turnstileError.value = 'Проверка не пройдена'
    turnstileRef.value?.reset() // Сбрасываем виджет
    return
  }

  // 3. Сохраняем заявку в БД
  const { data, error } = await supabase
    .from('applications')
    .insert({
      user_id: authStore.user.id,
      motivation: form.motivation,
      status: 'pending'
    })

  if (!error) {
    submitSuccess.value = true
  }
}
</script>
```

---

## Troubleshooting

### Проблема: Виджет не загружается

**Симптомы:** Пустое место вместо виджета

**Решение:**
1. Проверьте блокировщики рекламы (uBlock, AdBlock) - отключите для вашего сайта
2. Проверьте CSP headers в `vercel.json`:
   ```json
   {
     "key": "Content-Security-Policy",
     "value": "... script-src ... https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com ..."
   }
   ```
3. Откройте DevTools → Console - проверьте ошибки загрузки скрипта

### Проблема: "Invalid site key"

**Симптомы:** Ошибка в консоли "Site key is invalid"

**Решение:**
1. Проверьте `.env` файл:
   ```bash
   VITE_TURNSTILE_SITE_KEY=0x4AAAAAACQmENl2nYwq4ELx
   ```
2. Перезапустите dev server:
   ```bash
   npm run dev
   ```
3. Проверьте домен в Cloudflare Dashboard → Turnstile → Domains

### Проблема: Токен не проходит проверку на сервере

**Симптомы:** `success: false` в ответе от Edge Function

**Решение:**
1. Проверьте секретный ключ в Supabase:
   ```bash
   supabase secrets list
   ```
2. Убедитесь, что ключ правильный:
   ```bash
   supabase secrets set TURNSTILE_SECRET_KEY=0x4AAAAAACQmEPOC8rEzQA6Afj-ICG9-bWk
   ```
3. Проверьте логи Edge Function:
   ```bash
   supabase functions logs turnstile-verify
   ```

### Проблема: Токен истекает слишком быстро

**Симптомы:** Пользователь долго заполняет форму, токен истекает

**Решение:**
1. Добавьте обработчик `@expired`:
   ```vue
   <CloudflareTurnstile
     @expired="handleTurnstileExpired"
   />
   ```
2. Автоматически запрашивайте новый токен или показывайте уведомление

### Проблема: Виджет не работает в localhost

**Решение:**
1. Добавьте `localhost` в Cloudflare Dashboard → Turnstile → Domains
2. Или используйте тестовый ключ:
   ```bash
   # Для локальной разработки (всегда успешен)
   VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
   ```

---

## Best Practices

### ✅ DO

1. **Всегда проверяйте токены на сервере**
   ```typescript
   // ✅ Правильно
   await supabase.functions.invoke('turnstile-verify', { body: { token } })
   ```

2. **Сбрасывайте виджет после ошибки**
   ```typescript
   // ✅ Правильно
   if (error) {
     turnstileRef.value?.reset()
   }
   ```

3. **Показывайте понятные ошибки пользователю**
   ```vue
   <!-- ✅ Правильно -->
   <p v-if="turnstileError" class="error-text">
     {{ turnstileError }}
   </p>
   ```

4. **Используйте appearance="interaction-only" для невидимой защиты**
   ```vue
   <!-- ✅ Для максимально незаметной защиты -->
   <CloudflareTurnstile appearance="interaction-only" />
   ```

5. **Логируйте попытки взлома**
   ```typescript
   // ✅ В Edge Function
   if (!result.success) {
     console.warn('Failed verification:', { errors: result['error-codes'], ip: clientIp })
   }
   ```

### ❌ DON'T

1. **Не доверяйте токену на клиенте**
   ```typescript
   // ❌ НЕПРАВИЛЬНО - можно обойти!
   if (turnstileToken.value) {
     await createApplication() // Сохраняем без проверки
   }
   ```

2. **Не используйте секретный ключ в frontend коде**
   ```typescript
   // ❌ ОПАСНО! Утечка секретного ключа
   const secret = 'your-secret-key' // НИКОГДА так не делайте!
   ```

3. **Не игнорируйте ошибки**
   ```typescript
   // ❌ НЕПРАВИЛЬНО
   handleTurnstileError() {
     // Ничего не делаем
   }
   ```

4. **Не забывайте про accessibility**
   ```vue
   <!-- ❌ НЕПРАВИЛЬНО -->
   <div style="display: none;">
     <CloudflareTurnstile />
   </div>
   ```

5. **Не используйте один токен дважды**
   ```typescript
   // ❌ НЕПРАВИЛЬНО - токен одноразовый!
   await verifyToken(token)
   await verifyToken(token) // Ошибка: timeout-or-duplicate
   ```

---

## Дополнительные ресурсы

- [Официальная документация Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)
- [Server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Client-side rendering](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/)
- [Testing Turnstile](https://developers.cloudflare.com/turnstile/troubleshooting/testing/)

---

## Чеклист для запуска

- [x] Ключи Turnstile добавлены в `.env`
- [x] Секретный ключ установлен в Supabase Secrets
- [x] Edge Function `turnstile-verify` задеплоена
- [x] Домены добавлены в Cloudflare Turnstile Dashboard
- [x] CSP headers обновлены в `vercel.json`
- [x] Компонент `CloudflareTurnstile.vue` создан
- [x] Формы входа и регистрации обновлены
- [x] Форма заявки создана с интеграцией Turnstile
- [ ] Протестировать на localhost
- [ ] Протестировать на production
- [ ] Проверить работу с блокировщиками рекламы
- [ ] Протестировать error cases
- [ ] Проверить логи Edge Function

---

**Готово!** 🎉 Ваш сайт теперь защищен Cloudflare Turnstile!

Если остались вопросы - проверьте раздел [Troubleshooting](#troubleshooting) или обратитесь к [официальной документации](https://developers.cloudflare.com/turnstile/).
