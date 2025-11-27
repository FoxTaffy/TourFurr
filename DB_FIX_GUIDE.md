# Исправление ошибки базы данных на проде

## Проблема
На продакшн версии (https://tourfurr.vercel.app/auth) возникает ошибка подключения/обработки БД, в то время как на ветке claude-auth-login-registration всё работает корректно.

## Причина
Отсутствуют или неправильно настроены переменные окружения Supabase на Vercel для основной ветки.

## Решение

### 1. Проверка переменных окружения в Vercel

1. Зайдите в настройки проекта на Vercel
2. Перейдите в раздел **Settings** → **Environment Variables**
3. Убедитесь, что следующие переменные установлены для **Production**:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Где взять значения

1. Откройте https://supabase.com/dashboard
2. Выберите свой проект TourFurr
3. Перейдите в **Settings** → **API**
4. Скопируйте:
   - **Project URL** → это ваш `VITE_SUPABASE_URL`
   - **Project API keys** → **anon/public** → это ваш `VITE_SUPABASE_ANON_KEY`

### 3. Применение миграции базы данных

Для поддержки новых полей (аллергии и животные), выполните SQL миграцию:

1. Откройте Supabase Dashboard
2. Перейдите в **SQL Editor**
3. Выполните содержимое файла `supabase-migrations.sql`

### 4. Перезагрузка Vercel

После установки переменных окружения:

1. Перейдите в **Deployments**
2. Найдите последний deployment основной ветки (main/master)
3. Нажмите **⋮** → **Redeploy**
4. Выберите **Use existing Build Cache** (можно снять для чистой сборки)
5. Нажмите **Redeploy**

### 5. Проверка

После редеплоя:
1. Откройте https://tourfurr.vercel.app/auth
2. Попробуйте зарегистрироваться или войти
3. Проверьте консоль браузера на отсутствие ошибок

## Дополнительные проверки

### Проверка кода в src/services/supabase.ts

Убедитесь, что код корректно обрабатывает переменные окружения:

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found, using mock mode')
}
```

### Если проблема сохраняется

1. Проверьте логи Vercel: **Deployments** → выберите deployment → **View Function Logs**
2. Проверьте, что ветка, которая работает, имеет те же переменные окружения
3. Сравните настройки между работающей и не работающей веткой

## Различия между работающей и не работающей веткой

Вероятно, на рабочей ветке:
- Переменные окружения настроены корректно
- Код БД актуальный

Чтобы это исправить для основной ветки:
1. Скопируйте переменные окружения из рабочей ветки
2. Примените их к основной ветке
3. Сделайте redeploy
