# 🚀 Быстрый старт TourFurr 2026

## ⚡ Шаг 1: Настройка Supabase (КРИТИЧНО!)

### Получите ключи:

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **Settings** → **API**
4. Скопируйте:

```bash
Project URL: https://xxxxxx.supabase.co
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (⚠️ СЕКРЕТНЫЙ!)
```

### Обновите `.env` файл:

```bash
# Откройте .env и замените значения:
nano .env

# Или используйте sed:
sed -i 's|https://placeholder.supabase.co|https://ВАШ_PROJECT_ID.supabase.co|g' .env
sed -i 's|placeholder-key|ВАШ_ANON_KEY|g' .env
sed -i 's|placeholder-service-role-key|ВАШ_SERVICE_ROLE_KEY|g' .env
```

### Проверьте `.env`:

```bash
cat .env | grep VITE_SUPABASE_URL
# Должно быть: VITE_SUPABASE_URL=https://ваш-project.supabase.co
```

---

## ⚡ Шаг 2: Установка зависимостей

```bash
cd /home/user/TourFurr
npm install
```

---

## ⚡ Шаг 3: Настройка базы данных

### Выполните SQL скрипты в Supabase:

1. Откройте **SQL Editor** в Supabase Dashboard
2. Выполните по порядку:

#### a) Исправление RLS политик (КРИТИЧНО для безопасности!)

```sql
-- Скопируйте содержимое файла:
-- database/fix_rls_policies_security.sql
```

#### b) Создание таблицы заявок

```sql
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  motivation TEXT NOT NULL CHECK (char_length(motivation) >= 50 AND char_length(motivation) <= 1000),
  experience TEXT NOT NULL CHECK (experience IN ('newcomer', 'intermediate', 'experienced', 'veteran')),
  skills TEXT CHECK (char_length(skills) <= 500),
  additional_info TEXT CHECK (char_length(additional_info) <= 500),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Пользователи могут создавать только свои заявки
CREATE POLICY "Users can insert own applications" ON applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Пользователи видят только свои заявки
CREATE POLICY "Users can view own applications" ON applications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Админы видят все
CREATE POLICY "Admins can view all applications" ON applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Админы могут обновлять статус
CREATE POLICY "Admins can update applications" ON applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Индексы
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

-- Ограничение: одна заявка на пользователя
CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_user_unique ON applications(user_id);
```

#### c) Назначение админа

```sql
-- Замените email на свой!
UPDATE users 
SET is_admin = true 
WHERE email = 'TheFoxLaffyTaffy@gmail.com';
```

---

## ⚡ Шаг 4: Деплой Edge Function (Turnstile)

```bash
# Установите Supabase CLI (если еще нет)
npm install -g supabase

# Войдите
supabase login

# Свяжите проект (выберите ваш проект из списка)
supabase link

# Задеплойте функцию
supabase functions deploy turnstile-verify

# Установите секретный ключ
supabase secrets set TURNSTILE_SECRET_KEY=0x4AAAAAACQmEPOC8rEzQA6Afj-ICG9-bWk

# Проверьте
supabase secrets list
```

---

## ⚡ Шаг 5: Настройка Cloudflare Turnstile

1. Откройте [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Перейдите в **Turnstile**
3. Найдите ваш сайт (или создайте новый)
4. В **Domains** добавьте:
   - `localhost` (для разработки)
   - `tourfurr.ru` (основной домен)
   - `tourfurr.vercel.app` (Vercel)
   - Любые другие домены где будет работать сайт

---

## ⚡ Шаг 6: Запуск проекта

```bash
# Локально
npm run dev

# Откройте http://localhost:5173
```

### Проверьте что работает:

- [ ] Главная страница загружается
- [ ] Можно перейти на страницу регистрации
- [ ] Turnstile загружается (виден виджет)
- [ ] Форма регистрации работает
- [ ] Нет ошибок в консоли браузера

---

## ⚡ Шаг 7: Деплой на Vercel

```bash
# Пушим изменения
git add .
git commit -m "chore: configure environment"
git push

# Vercel автоматически задеплоит
```

### ⚠️ Важно: Настройте переменные окружения в Vercel!

1. Откройте [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите проект TourFurr
3. Settings → Environment Variables
4. Добавьте:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_TURNSTILE_SITE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `TURNSTILE_SECRET_KEY`
   - `CRON_SECRET`

---

## 🐛 Troubleshooting

### Ошибка: "Supabase credentials not found"

**Причина:** `.env` файл не настроен или пустой

**Решение:**
```bash
# Проверьте содержимое
cat .env

# Убедитесь что значения не placeholder
grep "placeholder" .env
# Не должно ничего выводить
```

### Ошибка: "Failed to fetch"

**Причина:** Неверный URL Supabase или нет интернета

**Решение:**
```bash
# Проверьте URL
curl https://ВАШ_PROJECT_ID.supabase.co/rest/v1/
# Должен вернуть JSON с версией
```

### Ошибка: CSP violation

**Причина:** Забыли обновить CSP headers

**Решение:** CSP уже обновлен в `vercel.json`, просто задеплойте изменения

### Turnstile не загружается

**Причина:** Блокировщик рекламы или домен не добавлен в Cloudflare

**Решение:**
1. Отключите блокировщики рекламы
2. Добавьте домен в Cloudflare Turnstile Dashboard

---

## 📚 Дополнительная документация

- `CLOUDFLARE_TURNSTILE_GUIDE.md` - полное руководство по Turnstile
- `SECURITY_AUDIT.md` - отчет по безопасности
- `database/fix_rls_policies_security.sql` - SQL для RLS

---

## ✅ Чеклист запуска

- [ ] `.env` настроен с реальными ключами Supabase
- [ ] `npm install` выполнен
- [ ] RLS политики применены в Supabase
- [ ] Таблица `applications` создана
- [ ] Админ назначен
- [ ] Edge Function задеплоена
- [ ] Секреты установлены в Supabase
- [ ] Домены добавлены в Cloudflare Turnstile
- [ ] Локально работает без ошибок
- [ ] Переменные окружения добавлены в Vercel
- [ ] Задеплоено на production

---

🎉 **Готово! Сайт должен работать.**

Если остались вопросы - смотрите детальную документацию или проверьте логи ошибок в консоли браузера.
