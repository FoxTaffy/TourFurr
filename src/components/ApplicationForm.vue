<template>
  <div class="application-form-wrapper">
    <div class="application-form-container">
      <h2 class="form-title">Подать заявку на участие</h2>
      <p class="form-description">
        Заполните форму ниже, чтобы подать заявку на участие в конвенте ТурФурр 2026.
        После проверки вы получите уведомление на email.
      </p>

      <!-- Event Status Info -->
      <div v-if="!isLoadingConfig && eventConfig" class="event-status-info">
        <div class="status-row">
          <span class="status-label">Регистрация открыта:</span>
          <span class="status-value">{{ new Date(eventConfig.registration_open_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) }}</span>
        </div>
        <div class="status-row">
          <span class="status-label">Дедлайн оплаты:</span>
          <span class="status-value">{{ new Date(eventConfig.payment_deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) }}</span>
        </div>
        <div class="status-row">
          <span class="status-label">Доступных мест:</span>
          <span class="status-value" :class="{ 'text-warning': approvedCount >= eventConfig.max_participants * 0.8 }">
            {{ eventConfig.max_participants - approvedCount }} из {{ eventConfig.max_participants }}
          </span>
        </div>
      </div>

      <!-- Registration Status Banner -->
      <div v-if="registrationStatus === 'not_open'" class="status-banner status-not-open">
        <svg class="status-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div>
          <h3>Регистрация ещё не открыта</h3>
          <p>Следите за обновлениями в наших социальных сетях</p>
        </div>
      </div>

      <div v-else-if="registrationStatus === 'full'" class="status-banner status-full">
        <svg class="status-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <div>
          <h3>Все места заняты</h3>
          <p>К сожалению, все {{ eventConfig?.max_participants }} мест уже забронированы. Следите за новостями на случай освобождения мест.</p>
        </div>
      </div>

      <div v-else-if="registrationStatus === 'closed'" class="status-banner status-closed">
        <svg class="status-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
        <div>
          <h3>Регистрация закрыта</h3>
          <p>Прием заявок на это мероприятие завершен</p>
        </div>
      </div>

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
      <form v-else-if="registrationStatus === 'open'" @submit.prevent="handleSubmit" class="application-form">
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
            <option value="beginner">Новичок (менее 1 года)</option>
            <option value="intermediate">Средний опыт (1-3 года)</option>
            <option value="experienced">Опытный (3-5 лет)</option>
            <option value="veteran">Ветеран (более 5 лет)</option>
          </select>
          <p v-if="errors.experience" class="error-text">{{ errors.experience }}</p>
        </div>

        <!-- RPG Interest -->
        <div class="form-group">
          <label class="form-label">
            Насколько активно вы хотите участвовать в сюжетно-ролевой игре? <span class="required">*</span>
          </label>
          <div class="rpg-options">
            <label class="rpg-option" :class="{ selected: form.rpgInterest === 'very_active' }">
              <input type="radio" v-model="form.rpgInterest" value="very_active" class="rpg-radio" />
              <span class="rpg-option-key">А</span>
              <span class="rpg-option-text">Очень хочу! Буду участвовать по максимуму</span>
            </label>
            <label class="rpg-option" :class="{ selected: form.rpgInterest === 'somewhat' }">
              <input type="radio" v-model="form.rpgInterest" value="somewhat" class="rpg-radio" />
              <span class="rpg-option-key">Б</span>
              <span class="rpg-option-text">Хочу, но немного — по настроению</span>
            </label>
            <label class="rpg-option" :class="{ selected: form.rpgInterest === 'not_interested' }">
              <input type="radio" v-model="form.rpgInterest" value="not_interested" class="rpg-radio" />
              <span class="rpg-option-key">В</span>
              <span class="rpg-option-text">Вообще не хочу участвовать</span>
            </label>
          </div>
          <p v-if="errors.rpgInterest" class="error-text">{{ errors.rpgInterest }}</p>
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

        <!-- Submit Button -->
        <button type="submit" :disabled="isLoading" class="submit-btn">
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../services/supabase'
import logger from '../utils/logger'
import * as yup from 'yup'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  motivation: '',
  experience: '',
  rpgInterest: '',
  skills: '',
  additionalInfo: ''
})

const errors = reactive({
  motivation: '',
  experience: '',
  rpgInterest: ''
})

const isLoading = ref(false)
const serverError = ref('')
const submitSuccess = ref(false)

interface EventConfig {
  registration_open_date: string | null
  registration_close_date: string | null
  payment_deadline: string
  max_participants: number
}

// Event configuration state
const eventConfig = ref<EventConfig | null>(null)
const approvedCount = ref(0)
const isLoadingConfig = ref(true)
const registrationStatus = ref<'not_open' | 'open' | 'closed' | 'full'>('not_open')

// Validation schema
const schema = yup.object({
  motivation: yup.string()
    .required('Пожалуйста, расскажите о вашей мотивации')
    .min(50, 'Минимум 50 символов')
    .max(1000, 'Максимум 1000 символов'),
  experience: yup.string()
    .required('Пожалуйста, укажите ваш опыт'),
  rpgInterest: yup.string()
    .required('Пожалуйста, укажите ваш вариант')
    .oneOf(['very_active', 'somewhat', 'not_interested'], 'Неверный вариант')
})

// Load event configuration and check registration status
async function loadEventConfig() {
  try {
    isLoadingConfig.value = true

    // Get event info (единая таблица конфига)
    const { data: config, error: configError } = await supabase
      .from('event_info')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (configError) {
      logger.error('Error loading event config:', configError)
      serverError.value = 'Не удалось загрузить информацию о конвенте'
      return
    }

    if (!config) {
      serverError.value = 'Информация о конвенте не найдена'
      return
    }

    const currentConfig = config as EventConfig
    eventConfig.value = currentConfig

    // Get approved applications count
    const { data: countData, error: countError } = await supabase.rpc('get_approved_count')

    if (countError) {
      logger.error('Error getting approved count:', countError)
    } else {
      approvedCount.value = countData || 0
    }

    // Check registration status
    const now = new Date()
    const openDate = currentConfig.registration_open_date ? new Date(currentConfig.registration_open_date) : null
    const closeDate = currentConfig.registration_close_date ? new Date(currentConfig.registration_close_date) : null

    if (openDate && now < openDate) {
      registrationStatus.value = 'not_open'
    } else if (closeDate && now > closeDate) {
      registrationStatus.value = 'closed'
    } else if (approvedCount.value >= currentConfig.max_participants) {
      registrationStatus.value = 'full'
    } else {
      registrationStatus.value = 'open'
    }

    logger.log('Event config loaded:', {
      status: registrationStatus.value,
      approvedCount: approvedCount.value,
      maxParticipants: currentConfig.max_participants
    })

  } catch (err) {
    logger.error('Error in loadEventConfig:', err)
    serverError.value = 'Произошла ошибка при загрузке данных'
  } finally {
    isLoadingConfig.value = false
  }
}

// Load config on mount
onMounted(() => {
  loadEventConfig()
})

async function handleSubmit() {
  // Reset errors
  errors.motivation = ''
  errors.experience = ''
  serverError.value = ''

  // Check registration status
  if (registrationStatus.value === 'not_open') {
    serverError.value = 'Регистрация еще не открыта'
    return
  }

  if (registrationStatus.value === 'closed') {
    serverError.value = 'Регистрация закрыта'
    return
  }

  if (registrationStatus.value === 'full') {
    serverError.value = `Все ${eventConfig.value?.max_participants || 155} мест заняты. Следите за обновлениями в случае освобождения мест`
    return
  }

  // Validate form
  try {
    await schema.validate(form, { abortEarly: false })
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      err.inner.forEach((validationError) => {
        const path = validationError.path as keyof typeof errors | undefined
        if (path && path in errors) {
          errors[path] = validationError.message
        }
      })
    } else {
      logger.error('Unexpected validation error:', err)
      serverError.value = 'Не удалось проверить форму'
    }
    return
  }

  // Check if user is authenticated
  if (!authStore.isAuthenticated || !authStore.user) {
    serverError.value = 'Пожалуйста, войдите в систему для подачи заявки'
    router.push('/auth')
    return
  }

  // Check if user is approved
  if (authStore.user.status !== 'approved') {
    serverError.value = 'Ваш аккаунт должен быть одобрен администратором перед подачей заявки'
    return
  }

  isLoading.value = true

  try {
    // Create application in database
    const { error } = await supabase
      .from('applications')
      .insert({
        user_id: authStore.user.id,
        motivation: form.motivation.trim(),
        experience_level: form.experience,
        rpg_interest: form.rpgInterest,
        skills: form.skills.trim() || null,
        additional_info: form.additionalInfo.trim() || null,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      logger.error('Database error while creating application:', error)

      if (error.code === '23505') {
        serverError.value = 'Вы уже подали заявку'
      } else {
        serverError.value = 'Ошибка при отправке заявки. Попробуйте позже'
      }
      return
    }

    logger.log('Application submitted successfully')

    // Success!
    submitSuccess.value = true

    // Reset form
    form.motivation = ''
    form.experience = ''
    form.rpgInterest = ''
    form.skills = ''
    form.additionalInfo = ''
  } catch (err) {
    logger.error('Submission error:', err)
    serverError.value = err instanceof Error ? err.message : 'Произошла ошибка при отправке заявки'
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

/* Event Status Info */
.event-status-info {
  background: rgba(97, 137, 108, 0.1);
  border: 1px solid rgba(97, 137, 108, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(97, 137, 108, 0.2);
}

.status-row:last-child {
  border-bottom: none;
}

.status-label {
  color: var(--sage);
  font-size: 0.95rem;
}

.status-value {
  color: var(--fire-glow);
  font-weight: 600;
  font-size: 1rem;
}

.text-warning {
  color: #ff9800 !important;
}

/* Status Banners */
.status-banner {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.status-banner .status-icon {
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.status-banner h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.status-banner p {
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
}

.status-not-open {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #93c5fd;
}

.status-full {
  background: rgba(255, 152, 0, 0.1);
  border: 1px solid rgba(255, 152, 0, 0.3);
  color: #ffb74d;
}

.status-closed {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
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

/* RPG Interest Poll */
.rpg-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.rpg-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border: 1px solid rgba(97, 137, 108, 0.3);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  background: rgba(97, 137, 108, 0.05);
}

.rpg-option.selected {
  border-color: var(--fire);
  background: rgba(255, 107, 53, 0.1);
  box-shadow: 0 0 0 2px rgba(255, 107, 53, 0.2);
}

.rpg-option:hover {
  border-color: rgba(97, 137, 108, 0.6);
  background: rgba(97, 137, 108, 0.1);
}

.rpg-option.selected:hover {
  border-color: var(--fire);
  background: rgba(255, 107, 53, 0.12);
}

.rpg-radio {
  display: none;
}

.rpg-option-key {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(97, 137, 108, 0.2);
  border: 1px solid rgba(97, 137, 108, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--sage);
  transition: all 0.25s ease;
}

.rpg-option.selected .rpg-option-key {
  background: var(--fire);
  border-color: var(--fire);
  color: white;
}

.rpg-option-text {
  color: var(--cream);
  font-size: 0.95rem;
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

.captcha-wrapper {
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

  .captcha-wrapper :deep(> div) {
    transform: scale(0.85);
    transform-origin: center;
  }

  .status-banner {
    padding: 1.25rem;
    gap: 0.75rem;
  }

  .status-banner h3 {
    font-size: 1rem;
  }

  .status-banner p {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .application-form-container {
    padding: 1.5rem 1rem;
  }

  .form-title {
    font-size: 1.3rem;
  }

  .form-description {
    font-size: 0.85rem;
    margin-bottom: 1.5rem;
  }

  .form-textarea,
  .form-select {
    padding: 12px;
    font-size: 0.9rem;
  }

  .submit-btn {
    padding: 12px 20px;
    font-size: 0.95rem;
    min-height: 44px;
  }

  .event-status-info {
    padding: 1rem;
  }

  .status-label,
  .status-value {
    font-size: 0.85rem;
  }

  .captcha-wrapper :deep(> div) {
    transform: scale(0.8);
    transform-origin: center;
  }
}
</style>
