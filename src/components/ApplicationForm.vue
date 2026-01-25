<template>
  <div class="application-form-wrapper">
    <div class="application-form-container">
      <h2 class="form-title">Подать заявку на участие</h2>
      <p class="form-description">
        Заполните форму ниже, чтобы подать заявку на участие в конвенте ТурФурр 2026.
        После проверки вы получите уведомление на email.
      </p>

      <!-- Success Message -->
      <div v-if="submitSuccess" class="success-message">
        <svg class="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div>
          <h3>Заявка успешно отправлена!</h3>
          <p>Мы рассмотрим вашу заявку и свяжемся с вами в ближайшее время.</p>
        </div>
      </div>

      <!-- Application Form -->
      <form v-else @submit.prevent="handleSubmit" class="application-form">
        <!-- Motivation -->
        <div class="form-group">
          <label for="motivation" class="form-label">
            Почему вы хотите участвовать в ТурФурре? <span class="required">*</span>
          </label>
          <textarea
            id="motivation"
            v-model="form.motivation"
            rows="5"
            placeholder="Расскажите о вашей мотивации..."
            class="form-textarea"
            :class="{ error: errors.motivation }"
            maxlength="1000"
          ></textarea>
          <div class="char-counter">{{ form.motivation.length }} / 1000</div>
          <p v-if="errors.motivation" class="error-text">{{ errors.motivation }}</p>
        </div>

        <!-- Furry Experience -->
        <div class="form-group">
          <label for="experience" class="form-label">
            Ваш опыт в furry-сообществе <span class="required">*</span>
          </label>
          <select
            id="experience"
            v-model="form.experience"
            class="form-select"
            :class="{ error: errors.experience }"
          >
            <option value="">Выберите вариант</option>
            <option value="newcomer">Новичок (менее 1 года)</option>
            <option value="intermediate">Средний опыт (1-3 года)</option>
            <option value="experienced">Опытный (3-5 лет)</option>
            <option value="veteran">Ветеран (более 5 лет)</option>
          </select>
          <p v-if="errors.experience" class="error-text">{{ errors.experience }}</p>
        </div>

        <!-- Skills/Talents -->
        <div class="form-group">
          <label for="skills" class="form-label">
            Ваши навыки или таланты (опционально)
          </label>
          <textarea
            id="skills"
            v-model="form.skills"
            rows="3"
            placeholder="Например: рисование, создание фурсьютов, музыка..."
            class="form-textarea"
            maxlength="500"
          ></textarea>
          <div class="char-counter">{{ form.skills.length }} / 500</div>
        </div>

        <!-- Additional Info -->
        <div class="form-group">
          <label for="additionalInfo" class="form-label">
            Дополнительная информация
          </label>
          <textarea
            id="additionalInfo"
            v-model="form.additionalInfo"
            rows="3"
            placeholder="Что еще нам следует знать о вас?"
            class="form-textarea"
            maxlength="500"
          ></textarea>
          <div class="char-counter">{{ form.additionalInfo.length }} / 500</div>
        </div>

        <!-- Server Error -->
        <div v-if="serverError" class="server-error">
          <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p>{{ serverError }}</p>
        </div>

        <!-- Cloudflare Turnstile -->
        <div class="turnstile-wrapper">
          <CloudflareTurnstile
            ref="turnstileRef"
            :siteKey="turnstilesiteKey"
            theme="dark"
            @verify="handleTurnstileVerify"
            @error="handleTurnstileError"
            @expired="handleTurnstileExpired"
          />
          <p v-if="turnstileError" class="error-text">{{ turnstileError }}</p>
        </div>

        <!-- Submit Button -->
        <button type="submit" :disabled="isLoading || !turnstileToken" class="submit-btn">
          <span class="btn-glow"></span>
          <span class="btn-content">
            <svg v-if="isLoading" class="spinner" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <svg v-else class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ isLoading ? 'Отправка...' : 'Отправить заявку' }}
          </span>
        </button>

        <!-- Info Note -->
        <div class="info-note">
          <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p>
            Защита от ботов активна. Если вы не видите проверку безопасности выше, 
            попробуйте обновить страницу или отключить блокировщики рекламы.
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../services/supabase'
import CloudflareTurnstile from './common/CloudflareTurnstile.vue'
import * as yup from 'yup'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  motivation: '',
  experience: '',
  skills: '',
  additionalInfo: ''
})

const errors = reactive({
  motivation: '',
  experience: ''
})

const isLoading = ref(false)
const serverError = ref('')
const submitSuccess = ref(false)

// Cloudflare Turnstile state
const turnstilesiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAACQmENl2nYwq4ELx'
const turnstileToken = ref<string | null>(null)
const turnstileError = ref('')
const turnstileRef = ref<InstanceType<typeof CloudflareTurnstile> | null>(null)

// Validation schema
const schema = yup.object({
  motivation: yup.string()
    .required('Пожалуйста, расскажите о вашей мотивации')
    .min(50, 'Минимум 50 символов')
    .max(1000, 'Максимум 1000 символов'),
  experience: yup.string()
    .required('Пожалуйста, укажите ваш опыт')
})

// Cloudflare Turnstile handlers
function handleTurnstileVerify(token: string) {
  turnstileToken.value = token
  turnstileError.value = ''
  console.log('✅ Turnstile verified')
}

function handleTurnstileError(error: string) {
  turnstileToken.value = null
  turnstileError.value = error || 'Ошибка проверки безопасности. Попробуйте еще раз'
  console.error('❌ Turnstile error:', error)
}

function handleTurnstileExpired() {
  turnstileToken.value = null
  turnstileError.value = 'Проверка истекла. Пожалуйста, пройдите проверку снова'
  console.warn('⏰ Turnstile expired')
}

async function handleSubmit() {
  // Reset errors
  errors.motivation = ''
  errors.experience = ''
  serverError.value = ''
  turnstileError.value = ''

  // Validate form
  try {
    await schema.validate(form, { abortEarly: false })
  } catch (err: any) {
    err.inner.forEach((e: any) => {
      if (e.path in errors) {
        (errors as any)[e.path] = e.message
      }
    })
    return
  }

  // Check Turnstile token
  if (!turnstileToken.value) {
    turnstileError.value = 'Пожалуйста, пройдите проверку безопасности'
    return
  }

  // Check if user is authenticated
  if (!authStore.isAuthenticated || !authStore.user) {
    serverError.value = 'Пожалуйста, войдите в систему для подачи заявки'
    router.push('/auth/login')
    return
  }

  isLoading.value = true

  try {
    // Step 1: Verify Turnstile token with Edge Function
    console.log('🔐 Verifying Turnstile token...')
    const { data: verifyData, error: verifyError } = await supabase.functions.invoke('turnstile-verify', {
      body: { token: turnstileToken.value }
    })

    if (verifyError || !verifyData?.success) {
      console.error('❌ Turnstile verification failed:', verifyError || verifyData)
      turnstileError.value = 'Проверка безопасности не пройдена. Попробуйте еще раз'
      turnstileRef.value?.reset() // Reset Turnstile widget
      return
    }

    console.log('✅ Turnstile verification successful')

    // Step 2: Create application in database
    const { data, error } = await supabase
      .from('applications')
      .insert({
        user_id: authStore.user.id,
        motivation: form.motivation.trim(),
        experience: form.experience,
        skills: form.skills.trim() || null,
        additional_info: form.additionalInfo.trim() || null,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Database error:', error)
      
      if (error.code === '23505') {
        serverError.value = 'Вы уже подали заявку'
      } else {
        serverError.value = 'Ошибка при отправке заявки. Попробуйте позже'
      }
      return
    }

    console.log('✅ Application submitted successfully:', data)

    // Success!
    submitSuccess.value = true

    // Reset form
    form.motivation = ''
    form.experience = ''
    form.skills = ''
    form.additionalInfo = ''
    turnstileToken.value = null

  } catch (err: any) {
    console.error('❌ Submission error:', err)
    serverError.value = err.message || 'Произошла ошибка при отправке заявки'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.application-form-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(26, 17, 14, 0.95), rgba(45, 31, 25, 0.95));
  padding: 4rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.application-form-container {
  max-width: 700px;
  width: 100%;
  background: rgba(26, 17, 14, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(97, 137, 108, 0.3);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.form-title {
  font-family: 'Merriweather', serif;
  font-size: 2rem;
  color: var(--fire-glow);
  text-align: center;
  margin-bottom: 0.5rem;
}

.form-description {
  text-align: center;
  color: var(--sage);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.application-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.95rem;
  color: var(--cream);
  font-weight: 500;
}

.required {
  color: var(--fire);
}

.form-textarea {
  width: 100%;
  padding: 14px;
  background: rgba(26, 17, 14, 0.6);
  border: 1px solid var(--moss);
  border-radius: 12px;
  color: var(--cream);
  font-family: 'Lora', serif;
  font-size: 0.95rem;
  resize: vertical;
  transition: all 0.3s ease;
}

.form-select {
  width: 100%;
  padding: 14px;
  background: rgba(26, 17, 14, 0.6);
  border: 1px solid var(--moss);
  border-radius: 12px;
  color: var(--cream);
  font-family: 'Lora', serif;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--fire);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1), 0 0 20px rgba(255, 107, 53, 0.1);
}

.form-textarea.error,
.form-select.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.char-counter {
  text-align: right;
  font-size: 0.8rem;
  color: var(--sage);
  margin-top: -4px;
}

.error-text {
  font-size: 0.8rem;
  color: #ef4444;
  margin-top: 4px;
}

.server-error {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  color: #fca5a5;
  font-size: 0.9rem;
}

.error-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.success-message {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 20px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 12px;
  color: #86efac;
}

.success-icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  margin-top: 2px;
}

.success-message h3 {
  font-size: 1.1rem;
  margin-bottom: 0.3rem;
  color: #86efac;
}

.success-message p {
  font-size: 0.9rem;
  line-height: 1.5;
}

.turnstile-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  padding: 1rem 0;
}

.submit-btn {
  position: relative;
  padding: 14px 24px;
  background: linear-gradient(135deg, var(--fire), var(--fire-glow));
  border: none;
  border-radius: 12px;
  color: white;
  font-family: 'Lora', serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-100%);
}

.submit-btn:hover:not(:disabled) .btn-glow {
  animation: shimmer 0.8s ease;
}

@keyframes shimmer {
  100% { transform: translateX(100%); }
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.btn-icon {
  width: 20px;
  height: 20px;
}

.spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

.info-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 10px;
  color: #93c5fd;
  font-size: 0.85rem;
  line-height: 1.5;
}

.info-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  margin-top: 2px;
}

@media (max-width: 640px) {
  .application-form-container {
    padding: 2rem 1.5rem;
  }

  .form-title {
    font-size: 1.5rem;
  }

  .turnstile-wrapper :deep(> div) {
    transform: scale(0.85);
    transform-origin: center;
  }
}
</style>
