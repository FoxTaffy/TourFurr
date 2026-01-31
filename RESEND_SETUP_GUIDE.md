# 📧 Resend Email Setup Guide

Пошаговая инструкция по настройке отправки email через Resend для TourFurr.

---

## Шаг 1: Создание аккаунта Resend

1. **Перейдите на https://resend.com**
2. **Sign Up** - зарегистрируйтесь
3. **Verify email** - подтвердите свой email

---

## Шаг 2: Добавление домена

### 2.1 Добавить домен

1. В dashboard Resend нажмите **Domains** → **Add Domain**
2. Введите ваш домен (например: `fourfurr.camp`)
3. **Add Domain**

### 2.2 Настроить DNS записи

Resend покажет вам 3 DNS записи, которые нужно добавить:

#### SPF Record
```
Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all
```

#### DKIM Record
```
Type: TXT
Name: resend._domainkey
Value: [Resend даст вам значение, например]
p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
```

#### DMARC Record
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@fourfurr.camp
```

### 2.3 Добавить DNS записи

**Если используете Vercel для домена:**

1. Vercel Dashboard → Domains → fourfurr.camp → DNS Records
2. Add Record для каждой из 3 записей выше

**Если используете Cloudflare:**

1. Cloudflare Dashboard → DNS
2. Add Record для каждой

**Если используете другого провайдера:**

Следуйте инструкциям вашего DNS провайдера.

### 2.4 Верификация

1. Вернитесь в Resend Dashboard
2. Нажмите **Verify** напротив вашего домена
3. Подождите 5-10 минут (DNS propagation)
4. Статус изменится на **Verified** ✅

---

## Шаг 3: Получение API ключа

1. В Resend Dashboard перейдите в **API Keys**
2. **Create API Key**
3. Name: `TourFurr Production`
4. Permission: `Full Access`
5. **Create**
6. **СКОПИРУЙТЕ КЛЮЧ** - он показывается только один раз!
   ```
   re_123456789abcdefghijklmnop
   ```

---

## Шаг 4: Создание Supabase Edge Function

### 4.1 Создать функцию

```bash
# В корне проекта
mkdir -p supabase/functions/send-verification-email
```

### 4.2 Создать файл функции

**Файл: `supabase/functions/send-verification-email/index.ts`**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, code } = await req.json()

    // Validate input
    if (!email || !code) {
      throw new Error('Missing email or code')
    }

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'TourFurr <noreply@fourfurr.camp>', // Замените на ваш домен
        to: [email],
        subject: 'Подтверждение email - TourFurr 2026',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: #0a0806;
                color: #F5DEB3;
                margin: 0;
                padding: 40px 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: linear-gradient(135deg, #2a1f1a 0%, #3d2d24 100%);
                border-radius: 16px;
                padding: 40px;
                border: 1px solid #8b6f47;
              }
              h1 {
                color: #FFB347;
                margin: 0 0 20px 0;
                font-size: 28px;
              }
              .code-box {
                background: rgba(255, 179, 71, 0.1);
                border: 2px solid #FFB347;
                border-radius: 12px;
                padding: 30px;
                text-align: center;
                margin: 30px 0;
              }
              .code {
                font-size: 48px;
                font-weight: bold;
                color: #22c55e;
                letter-spacing: 8px;
                font-family: 'Courier New', monospace;
              }
              .expires {
                color: #FFB347;
                font-size: 14px;
                margin-top: 10px;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid rgba(139, 111, 71, 0.3);
                font-size: 14px;
                color: #8b6f47;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🎉 Добро пожаловать в TourFurr!</h1>
              <p>Спасибо за регистрацию на конвент TourFurr 2026!</p>
              <p>Для подтверждения вашего email введите следующий код:</p>

              <div class="code-box">
                <div class="code">${code}</div>
                <div class="expires">⏰ Код действителен 15 минут</div>
              </div>

              <p>Если вы не регистрировались на TourFurr, просто проигнорируйте это письмо.</p>

              <div class="footer">
                <p>© 2026 TourFurr. Все права защищены.</p>
                <p>Это автоматическое письмо, не отвечайте на него.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Failed to send email')
    }

    return new Response(
      JSON.stringify({ success: true, messageId: data.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
```

---

## Шаг 5: Деплой Edge Function

### 5.1 Установить Supabase CLI (если еще не установлен)

```bash
npm install -g supabase
```

### 5.2 Войти в Supabase

```bash
supabase login
```

### 5.3 Link проект

```bash
supabase link --project-ref gczgcatmsrlncjbqdghu
```

### 5.4 Установить secrets

```bash
# Установите ваш Resend API ключ
supabase secrets set RESEND_API_KEY=re_ваш_ключ_здесь

# Эти переменные уже установлены автоматически:
# SUPABASE_URL
# SUPABASE_SERVICE_ROLE_KEY
```

### 5.5 Деплой функции

```bash
supabase functions deploy send-verification-email
```

---

## Шаг 6: Проверка

### 6.1 Тестовый запрос

```bash
curl -X POST 'https://gczgcatmsrlncjbqdghu.supabase.co/functions/v1/send-verification-email' \
  -H 'Authorization: Bearer ВАYOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","code":"123456"}'
```

### 6.2 Проверить email

- Проверьте что письмо пришло
- Проверьте что код отображается
- Проверьте что ссылки работают

---

## Шаг 7: Обновить Vercel Environment Variables

1. Vercel Dashboard → TourFurr → Settings → Environment Variables
2. Найдите `VITE_DISABLE_EMAIL`
3. Измените значение с `true` на `false`
4. **Save**
5. **Redeploy** проект

---

## 📊 Мониторинг

### Resend Dashboard

- **Emails** - все отправленные письма
- **Analytics** - статистика доставки
- **Logs** - детальные логи

### Supabase Dashboard

- **Edge Functions** → **send-verification-email** → **Logs**
- Проверяйте ошибки и производительность

---

## ⚠️ Troubleshooting

### Письма не приходят?

1. **Проверьте DNS записи:**
   ```bash
   dig TXT fourfurr.camp
   dig TXT resend._domainkey.fourfurr.camp
   dig TXT _dmarc.fourfurr.camp
   ```

2. **Проверьте Resend Dashboard:**
   - Emails → найдите письмо
   - Статус должен быть "Delivered"

3. **Проверьте папку Spam**

### Edge Function не работает?

1. **Проверьте Logs:**
   ```bash
   supabase functions logs send-verification-email
   ```

2. **Проверьте Secrets:**
   ```bash
   supabase secrets list
   ```

3. **Проверьте CORS:**
   - Убедитесь что ваш домен разрешен

---

## 🎯 Best Practices

1. **Используйте субдомен для email:**
   - `noreply@mail.fourfurr.camp` вместо `noreply@fourfurr.camp`
   - Защищает основной домен от spam репутации

2. **Добавьте unsubscribe link** (для mass emails)

3. **Мониторьте bounce rate**
   - Высокий bounce rate вредит репутации

4. **Используйте разные API ключи:**
   - Production: `re_prod_...`
   - Development: `re_dev_...`

---

## 📞 Поддержка

- Resend Docs: https://resend.com/docs
- Resend Support: support@resend.com
- Supabase Edge Functions: https://supabase.com/docs/guides/functions

---

**Готово! Email настроен и готов к использованию.** ✅
