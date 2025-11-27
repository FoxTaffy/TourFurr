# Технический гайд: Email Verification для TourFurr

## Обзор

Этот документ описывает полную реализацию системы подтверждения email для проекта TourFurr с использованием Supabase.

## Архитектура

```
Регистрация → Отправка письма → Переход по ссылке → Подтверждение → Активация аккаунта
```

## 1. Настройка Supabase Email Auth

### 1.1. Включение Email Provider

1. Откройте Supabase Dashboard
2. Перейдите в **Authentication** → **Providers**
3. Найдите **Email** и убедитесь что он включен
4. Включите **Confirm email** (подтверждение email обязательно)

### 1.2. Настройка Email Templates

1. Перейдите в **Authentication** → **Email Templates**
2. Настройте **Confirm signup** template:

```html
<h2>Подтвердите ваш email</h2>
<p>Здравствуйте!</p>
<p>Спасибо за регистрацию на TourFurr. Пожалуйста, подтвердите ваш email адрес, нажав на кнопку ниже:</p>
<p><a href="{{ .ConfirmationURL }}">Подтвердить Email</a></p>
<p>Или скопируйте эту ссылку в браузер:</p>
<p>{{ .ConfirmationURL }}</p>
```

### 1.3. Настройка URL редиректа

1. В **Authentication** → **URL Configuration**
2. Установите **Site URL**: `https://tourfurr.vercel.app`
3. Добавьте **Redirect URLs**:
   - `https://tourfurr.vercel.app/auth/confirm`
   - `http://localhost:5173/auth/confirm` (для разработки)

## 2. Обновление базы данных

### 2.1. Добавление поля email_verified

```sql
-- Добавляем поле для отслеживания подтверждения email
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE;

-- Индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);

-- Комментарии
COMMENT ON COLUMN users.email_verified IS 'Indicates if user email has been verified';
COMMENT ON COLUMN users.email_verified_at IS 'Timestamp when email was verified';
```

## 3. Обновление кода

### 3.1. Обновление интерфейса User (src/stores/auth.ts)

```typescript
export interface User {
  // ... существующие поля
  emailVerified: boolean
  emailVerifiedAt?: string
}

function mapDbUserToUser(dbUser: any): User {
  return {
    // ... существующие поля
    emailVerified: dbUser.email_verified || false,
    emailVerifiedAt: dbUser.email_verified_at
  }
}
```

### 3.2. Обновление функции регистрации

```typescript
async function register(data: RegisterData) {
  isLoading.value = true
  error.value = null

  try {
    // 1. Регистрация пользователя через Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: sanitizeInput(data.email).toLowerCase(),
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
        data: {
          nickname: sanitizeInput(data.nickname),
          phone: sanitizeInput(data.phone),
          telegram: sanitizeInput(data.telegram)
        }
      }
    })

    if (authError) {
      error.value = authError.message
      return { success: false, error: error.value }
    }

    if (!authData.user) {
      error.value = 'Ошибка создания пользователя'
      return { success: false, error: error.value }
    }

    // 2. Загрузка аватара (если есть)
    let avatarUrl: string | null = null
    if (data.avatar) {
      const fileValidation = validateFile(data.avatar)
      if (!fileValidation.valid) {
        error.value = fileValidation.error!
        return { success: false, error: error.value }
      }

      const fileName = generateSecureFileName(data.avatar)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, data.avatar, {
          contentType: data.avatar.type,
          upsert: false
        })

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName)
        avatarUrl = urlData.publicUrl
      }
    }

    // 3. Создание записи в таблице users
    const { data: newUser, error: dbError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id, // Важно: используем ID из Supabase Auth
        email: authData.user.email,
        nickname: sanitizeInput(data.nickname),
        phone: sanitizeInput(data.phone),
        telegram: sanitizeInput(data.telegram),
        avatar_url: avatarUrl,
        description: data.description ? sanitizeInput(data.description) : null,
        status: 'pending',
        email_subscribed: data.emailSubscribed,
        email_verified: false, // Email еще не подтвержден
        has_allergies: data.hasAllergies,
        allergies_description: data.allergiesDescription ? sanitizeInput(data.allergiesDescription) : null,
        bringing_pet: data.bringingPet,
        pet_description: data.petDescription ? sanitizeInput(data.petDescription) : null,
        agree_rules: data.agreeRules,
        agree_privacy: data.agreePrivacy
      })
      .select()
      .single()

    if (dbError) {
      error.value = dbError.message
      return { success: false, error: error.value }
    }

    return {
      success: true,
      message: 'Проверьте вашу почту для подтверждения email'
    }
  } catch (err: any) {
    error.value = err.message || 'Ошибка регистрации'
    return { success: false, error: error.value }
  } finally {
    isLoading.value = false
  }
}
```

### 3.3. Создание страницы подтверждения email

Создайте файл `src/views/EmailConfirmPage.vue`:

```vue
<template>
  <div class="confirm-page">
    <div class="bg-forest"></div>
    <div class="fog"></div>

    <div class="confirm-container">
      <!-- Loading State -->
      <div v-if="isLoading" class="confirm-card">
        <div class="spinner-large"></div>
        <h2>Подтверждение email...</h2>
        <p>Пожалуйста, подождите</p>
      </div>

      <!-- Success State -->
      <div v-else-if="isSuccess" class="confirm-card success">
        <svg class="icon-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h2>Email успешно подтвержден!</h2>
        <p>Теперь вы можете войти в систему</p>
        <router-link to="/auth" class="btn-primary">Войти</router-link>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="confirm-card error">
        <svg class="icon-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h2>Ошибка подтверждения</h2>
        <p>{{ error }}</p>
        <router-link to="/auth" class="btn-secondary">Вернуться ко входу</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../services/supabase'

const route = useRoute()
const isLoading = ref(true)
const isSuccess = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    // Получаем токены из URL
    const token_hash = route.query.token_hash as string
    const type = route.query.type as string

    if (!token_hash || type !== 'email') {
      throw new Error('Неверная ссылка подтверждения')
    }

    // Подтверждаем email через Supabase Auth
    const { data, error: authError } = await supabase.auth.verifyOtp({
      token_hash,
      type: 'email'
    })

    if (authError) throw authError
    if (!data.user) throw new Error('Пользователь не найден')

    // Обновляем запись в таблице users
    const { error: dbError } = await supabase
      .from('users')
      .update({
        email_verified: true,
        email_verified_at: new Date().toISOString()
      })
      .eq('id', data.user.id)

    if (dbError) throw dbError

    isSuccess.value = true
  } catch (err: any) {
    error.value = err.message || 'Произошла ошибка'
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.confirm-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
}

.confirm-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 500px;
}

.confirm-card {
  background: linear-gradient(135deg, rgba(42, 31, 26, 0.95), rgba(61, 45, 36, 0.95));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(139, 111, 71, 0.5);
  border-radius: 24px;
  padding: 3rem;
  text-align: center;
}

.spinner-large {
  width: 60px;
  height: 60px;
  margin: 0 auto 2rem;
  border: 4px solid rgba(255, 179, 71, 0.2);
  border-top-color: var(--fire-glow);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

.icon-success,
.icon-error {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
}

.icon-success {
  color: #22c55e;
}

.icon-error {
  color: #ef4444;
}

h2 {
  font-family: 'Merriweather', serif;
  font-size: 2rem;
  color: var(--cream);
  margin-bottom: 1rem;
}

p {
  color: var(--sage);
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.btn-primary,
.btn-secondary {
  display: inline-block;
  padding: 1rem 2rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, var(--fire), var(--fire-glow));
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
}

.btn-secondary {
  background: rgba(61, 45, 36, 0.8);
  border: 1px solid rgba(139, 111, 71, 0.4);
  color: var(--cream);
}

.btn-secondary:hover {
  background: rgba(61, 45, 36, 1);
}
</style>
```

### 3.4. Обновление router

Добавьте новый маршрут в `src/router/index.ts`:

```typescript
{
  path: '/auth/confirm',
  name: 'email-confirm',
  component: () => import('../views/EmailConfirmPage.vue')
}
```

### 3.5. Проверка email при логине

Обновите функцию `login` в `src/stores/auth.ts`:

```typescript
async function login(email: string, password: string) {
  isLoading.value = true
  error.value = null

  try {
    const sanitizedEmail = sanitizeInput(email).toLowerCase()

    // Используем Supabase Auth для логина
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password: password
    })

    if (authError) {
      error.value = authError.message
      return { success: false, error: error.value }
    }

    if (!authData.user) {
      error.value = 'Пользователь не найден'
      return { success: false, error: error.value }
    }

    // Проверяем подтверждение email
    if (!authData.user.email_confirmed_at) {
      error.value = 'Пожалуйста, подтвердите ваш email. Проверьте вашу почту.'
      await supabase.auth.signOut() // Выходим
      return { success: false, error: error.value }
    }

    // Получаем данные пользователя из таблицы users
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (dbError || !userData) {
      error.value = 'Ошибка получения данных пользователя'
      return { success: false, error: error.value }
    }

    const mappedUser = mapDbUserToUser(userData)
    token.value = authData.session?.access_token || crypto.randomUUID()
    user.value = mappedUser
    localStorage.setItem('auth_token', token.value)
    localStorage.setItem('current_user', JSON.stringify(mappedUser))

    return { success: true }
  } catch (err: any) {
    error.value = err.message || 'Ошибка входа'
    return { success: false, error: error.value }
  } finally {
    isLoading.value = false
  }
}
```

## 4. Настройка SMTP (опционально)

Для production рекомендуется использовать собственный SMTP сервер:

1. Перейдите в **Project Settings** → **Auth**
2. Прокрутите до **SMTP Settings**
3. Включите **Enable Custom SMTP**
4. Настройте:
   - **Host**: smtp.gmail.com (для Gmail)
   - **Port**: 587
   - **Username**: your-email@gmail.com
   - **Password**: ваш app password (не обычный пароль!)
   - **Sender email**: your-email@gmail.com
   - **Sender name**: TourFurr

## 5. Тестирование

### 5.1. Локальное тестирование

1. Запустите проект: `npm run dev`
2. Зарегистрируйте нового пользователя
3. Проверьте почту (или Supabase Dashboard → Authentication → Users → Email)
4. Перейдите по ссылке подтверждения
5. Убедитесь, что можете войти

### 5.2. Production тестирование

1. Задеплойте на Vercel
2. Убедитесь, что переменные окружения настроены
3. Повторите тестирование

## 6. Troubleshooting

### Письмо не приходит

- Проверьте спам
- Проверьте Supabase Dashboard → Authentication → Users → проверьте статус email
- Проверьте SMTP настройки (если используете custom SMTP)
- Проверьте rate limits в Supabase

### Ошибка "Invalid link"

- Проверьте правильность Redirect URLs в Supabase
- Убедитесь, что используете правильный URL (https для production)
- Проверьте, что ссылка не истекла (обычно 24 часа)

### Email подтверждается, но флаг в БД не обновляется

- Проверьте правильность update query в EmailConfirmPage
- Убедитесь, что у пользователя есть права на обновление таблицы users
- Проверьте RLS policies в Supabase

## 7. Безопасность

- ✅ Используйте HTTPS в production
- ✅ Настройте правильные Redirect URLs
- ✅ Включите RLS (Row Level Security) в Supabase
- ✅ Валидируйте email на сервере
- ✅ Используйте rate limiting для предотвращения спама

## Заключение

После внедрения этой системы:
- Пользователи будут обязаны подтверждать email
- Повысится безопасность
- Уменьшится количество поддельных аккаунтов
- Улучшится качество базы пользователей
