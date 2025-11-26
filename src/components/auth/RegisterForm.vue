<template>
  <form @submit.prevent="handleSubmit" class="register-form">
    <!-- Progress Indicator -->
    <div class="progress-section">
      <div class="progress-header">
        <span class="progress-step">Шаг {{ currentStep }} из 3</span>
        <span class="progress-title">{{ stepTitles[currentStep - 1] }}</span>
      </div>
      <div class="progress-bar">
        <div
          v-for="step in 3"
          :key="step"
          class="progress-segment"
          :class="{ active: step <= currentStep }"
        />
      </div>
    </div>

    <!-- Step 1: Basic Info -->
    <div v-show="currentStep === 1" class="form-step">
      <!-- Email -->
      <div class="form-group">
        <label class="form-label">
          Email <span class="required">*</span>
        </label>
        <input
          v-model="form.email"
          type="email"
          placeholder="email@example.com"
          class="form-input"
          :class="{ 'has-error': errors.email }"
          @blur="checkEmail"
        />
        <p v-if="errors.email" class="error-text">{{ errors.email }}</p>
      </div>

      <!-- Password -->
      <div class="form-group">
        <label class="form-label">
          Пароль <span class="required">*</span>
        </label>
        <div class="input-wrapper">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Минимум 8 символов"
            class="form-input"
            :class="{ 'has-error': errors.password }"
          />
          <button type="button" @click="showPassword = !showPassword" class="toggle-password">
            <svg class="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="showPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </button>
        </div>
        <p v-if="errors.password" class="error-text">{{ errors.password }}</p>
        <!-- Password Strength -->
        <div v-if="form.password" class="strength-meter">
          <div class="strength-bar">
            <div
              v-for="i in 4"
              :key="i"
              class="strength-segment"
              :class="{ [`strength-${passwordStrength}`]: passwordStrength >= i }"
            />
          </div>
          <p class="strength-text" :class="`strength-${passwordStrength}`">
            {{ strengthLabels[passwordStrength - 1] || 'Очень слабый' }}
          </p>
        </div>
      </div>

      <!-- Confirm Password -->
      <div class="form-group">
        <label class="form-label">
          Подтверждение пароля <span class="required">*</span>
        </label>
        <input
          v-model="form.confirmPassword"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Повторите пароль"
          class="form-input"
          :class="{ 'has-error': errors.confirmPassword }"
        />
        <p v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</p>
      </div>
    </div>

    <!-- Step 2: Profile -->
    <div v-show="currentStep === 2" class="form-step">
      <!-- Nickname -->
      <div class="form-group">
        <label class="form-label">
          Никнейм <span class="required">*</span>
        </label>
        <input
          v-model="form.nickname"
          type="text"
          placeholder="3-30 символов"
          class="form-input"
          :class="{ 'has-error': errors.nickname }"
          @blur="checkNickname"
        />
        <p v-if="errors.nickname" class="error-text">{{ errors.nickname }}</p>
      </div>

      <!-- Phone -->
      <div class="form-group">
        <label class="form-label">
          Телефон <span class="required">*</span>
        </label>
        <input
          v-model="form.phone"
          v-maska
          data-maska="+7 (###) ###-##-##"
          type="tel"
          placeholder="+7 (XXX) XXX-XX-XX"
          class="form-input"
          :class="{ 'has-error': errors.phone }"
        />
        <p v-if="errors.phone" class="error-text">{{ errors.phone }}</p>
      </div>

      <!-- Telegram -->
      <TelegramInput
        v-model="form.telegram"
        label="Telegram"
        :required="true"
        :has-error="!!errors.telegram"
        :error-message="errors.telegram"
        @converted="handleTelegramConverted"
      />
    </div>

    <!-- Step 3: Additional -->
    <div v-show="currentStep === 3" class="form-step">
      <!-- Avatar Upload -->
      <div class="form-group">
        <label class="form-label">Аватар</label>
        <div
          class="avatar-upload"
          :class="{ dragging: isDragging }"
          @click="triggerFileInput"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="handleDrop"
        >
          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="hidden"
            @change="handleFileSelect"
          />
          <div v-if="avatarPreview" class="avatar-preview">
            <img :src="avatarPreview" alt="Preview" />
          </div>
          <p class="upload-text">
            {{ avatarPreview ? 'Нажмите чтобы заменить' : 'Перетащите файл или нажмите' }}
          </p>
          <p class="upload-hint">JPG, PNG, WebP до 5MB</p>
          <div class="badge-warning">
            <svg class="warning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <span>Этот аватар будет напечатан на вашем физическом бейджике!</span>
          </div>
        </div>
        <p v-if="errors.avatar" class="error-text">{{ errors.avatar }}</p>
      </div>

      <!-- Description -->
      <div class="form-group">
        <label class="form-label">О себе</label>
        <textarea
          v-model="form.description"
          rows="3"
          maxlength="500"
          placeholder="Расскажи о себе..."
          class="form-input form-textarea"
        />
        <p class="char-count">{{ form.description.length }}/500</p>
      </div>

      <!-- Checkboxes -->
      <div class="checkbox-group">
        <label class="checkbox-label">
          <input v-model="form.agreeRules" type="checkbox" class="checkbox" />
          <span>
            Согласен с <a href="#">правилами конвента</a>
            <span class="required">*</span>
          </span>
        </label>
        <p v-if="errors.agreeRules" class="error-text checkbox-error">{{ errors.agreeRules }}</p>

        <label class="checkbox-label">
          <input v-model="form.agreePrivacy" type="checkbox" class="checkbox" />
          <span>
            Согласен на <a href="#">обработку персональных данных</a>
            <span class="required">*</span>
          </span>
        </label>
        <p v-if="errors.agreePrivacy" class="error-text checkbox-error">{{ errors.agreePrivacy }}</p>

        <label class="checkbox-label">
          <input v-model="form.emailSubscribed" type="checkbox" class="checkbox" />
          <span>Подписаться на email-рассылку</span>
        </label>
      </div>
    </div>

    <!-- Server Error -->
    <div v-if="serverError" class="server-error">
      <p>{{ serverError }}</p>
    </div>

    <!-- Navigation Buttons -->
    <div class="form-buttons">
      <button v-if="currentStep > 1" type="button" @click="prevStep" class="btn btn-secondary">
        Назад
      </button>
      <button v-if="currentStep < 3" type="button" @click="nextStep" class="btn btn-primary">
        Далее
      </button>
      <button v-else type="submit" :disabled="isLoading" class="btn btn-primary">
        <svg v-if="isLoading" class="spinner" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        {{ isLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
      </button>
    </div>
  </form>

  <!-- Success Modal -->
  <Teleport to="body">
    <div v-if="showSuccessModal" class="success-overlay">
      <div class="success-modal">
        <!-- Animated Background -->
        <div class="modal-glow"></div>

        <!-- Icon with animation -->
        <div class="success-icon-wrapper">
          <div class="success-icon-bg"></div>
          <svg class="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <div class="success-particles">
            <span v-for="i in 8" :key="i" class="particle"></span>
          </div>
        </div>

        <!-- Content -->
        <h3 class="success-title">Регистрация успешна!</h3>
        <p class="success-text">Ваша заявка на рассмотрении.<br>Мы уведомим вас о решении.</p>

        <!-- Status indicator -->
        <div class="status-badge">
          <span class="status-dot"></span>
          Статус: На рассмотрении
        </div>

        <!-- Button -->
        <button @click="redirectToDashboard" class="success-btn">
          <span class="btn-glow"></span>
          <span class="btn-content">
            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            Перейти в личный кабинет
          </span>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { vMaska } from 'maska/vue'
import { useAuthStore } from '../../stores/auth'
import TelegramInput from './TelegramInput.vue'
import * as yup from 'yup'

const router = useRouter()
const authStore = useAuthStore()

const currentStep = ref(1)
const showPassword = ref(false)
const isLoading = ref(false)
const serverError = ref('')
const showSuccessModal = ref(false)
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const avatarPreview = ref<string | null>(null)

const stepTitles = ['Основное', 'Профиль', 'Дополнительно']

const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  phone: '',
  telegram: '',
  telegramConverted: '',
  avatar: null as File | null,
  description: '',
  agreeRules: false,
  agreePrivacy: false,
  emailSubscribed: false
})

const errors = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  phone: '',
  telegram: '',
  avatar: '',
  agreeRules: '',
  agreePrivacy: ''
})

// Password strength calculation
const passwordStrength = computed(() => {
  const pwd = form.password
  if (!pwd) return 0
  let strength = 0
  if (pwd.length >= 8) strength++
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
  if (/\d/.test(pwd)) strength++
  if (/[^a-zA-Z0-9]/.test(pwd)) strength++
  return strength
})

const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']
const strengthTextColors = ['text-red-400', 'text-orange-400', 'text-yellow-400', 'text-green-400']
const strengthLabels = ['Слабый', 'Средний', 'Хороший', 'Отличный']

// Validation schemas per step
const step1Schema = yup.object({
  email: yup.string().required('Email обязателен').email('Неверный формат email'),
  password: yup.string()
    .required('Пароль обязателен')
    .min(8, 'Минимум 8 символов')
    .matches(/[a-zA-Z]/, 'Должен содержать буквы')
    .matches(/\d/, 'Должен содержать цифры'),
  confirmPassword: yup.string()
    .required('Подтвердите пароль')
    .oneOf([yup.ref('password')], 'Пароли не совпадают')
})

const step2Schema = yup.object({
  nickname: yup.string()
    .required('Никнейм обязателен')
    .min(3, 'Минимум 3 символа')
    .max(30, 'Максимум 30 символов')
    .matches(/^[a-zA-Z0-9_]+$/, 'Только буквы, цифры и подчеркивание'),
  phone: yup.string()
    .required('Телефон обязателен')
    .matches(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/, 'Неверный формат телефона'),
  telegram: yup.string().required('Telegram обязателен')
})

const step3Schema = yup.object({
  agreeRules: yup.boolean().oneOf([true], 'Необходимо согласиться с правилами'),
  agreePrivacy: yup.boolean().oneOf([true], 'Необходимо дать согласие')
})

function clearErrors() {
  Object.keys(errors).forEach(key => {
    (errors as any)[key] = ''
  })
}

async function validateStep(step: number) {
  clearErrors()
  const schemas = [step1Schema, step2Schema, step3Schema]

  try {
    await schemas[step - 1].validate(form, { abortEarly: false })
    return true
  } catch (err: any) {
    err.inner.forEach((e: any) => {
      if (e.path in errors) {
        (errors as any)[e.path] = e.message
      }
    })
    return false
  }
}

async function nextStep() {
  if (await validateStep(currentStep.value)) {
    currentStep.value++
  }
}

function prevStep() {
  currentStep.value--
}

async function checkEmail() {
  if (!form.email) return
  const isUnique = await authStore.checkEmailUnique(form.email)
  if (!isUnique) {
    errors.email = 'Этот email уже зарегистрирован'
  }
}

async function checkNickname() {
  if (!form.nickname) return
  const isUnique = await authStore.checkNicknameUnique(form.nickname)
  if (!isUnique) {
    errors.nickname = 'Этот никнейм уже занят'
  }
}

function handleTelegramConverted(value: string) {
  form.telegramConverted = value
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) processFile(file)
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file) processFile(file)
}

function processFile(file: File) {
  // Validate file
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    errors.avatar = 'Недопустимый формат файла'
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    errors.avatar = 'Файл слишком большой (макс. 5MB)'
    return
  }

  form.avatar = file
  errors.avatar = ''

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

async function handleSubmit() {
  if (!(await validateStep(3))) return

  serverError.value = ''
  isLoading.value = true

  const result = await authStore.register({
    email: form.email,
    password: form.password,
    nickname: form.nickname,
    phone: form.phone,
    telegram: form.telegramConverted || form.telegram,
    avatar: form.avatar || undefined,
    description: form.description,
    agreeRules: form.agreeRules,
    agreePrivacy: form.agreePrivacy,
    emailSubscribed: form.emailSubscribed
  })

  isLoading.value = false

  if (result.success) {
    showSuccessModal.value = true
  } else {
    serverError.value = result.error || 'Ошибка регистрации'
  }
}

function redirectToDashboard() {
  showSuccessModal.value = false
  router.push('/dashboard')
}
</script>

<style scoped>
/* Form Base */
.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Progress Section */
.progress-section {
  margin-bottom: 0.5rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.progress-step,
.progress-title {
  font-size: 0.8rem;
  color: var(--sage);
}

.progress-bar {
  display: flex;
  gap: 0.5rem;
}

.progress-segment {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--moss);
  transition: all 0.3s ease;
}

.progress-segment.active {
  background: linear-gradient(90deg, var(--fire), var(--fire-glow));
}

/* Form Steps */
.form-step {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Form Groups */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--cream);
}

.required {
  color: var(--fire);
}

/* Form Inputs */
.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(26, 17, 14, 0.6);
  border: 1px solid var(--moss);
  border-radius: 10px;
  color: var(--cream);
  font-family: 'Lora', serif;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.form-input::placeholder {
  color: var(--sage);
  opacity: 0.7;
}

.form-input:focus {
  outline: none;
  border-color: var(--fire);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.form-input.has-error {
  border-color: #ef4444;
}

.form-textarea {
  resize: none;
  min-height: 80px;
}

/* Input Wrapper for Password */
.input-wrapper {
  position: relative;
}

.input-wrapper .form-input {
  padding-right: 3rem;
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: var(--sage);
  transition: color 0.3s ease;
}

.toggle-password:hover {
  color: var(--cream);
}

.toggle-icon {
  width: 18px;
  height: 18px;
}

/* Error Text */
.error-text {
  font-size: 0.75rem;
  color: #fca5a5;
}

/* Strength Meter */
.strength-meter {
  margin-top: 0.5rem;
}

.strength-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 0.25rem;
}

.strength-segment {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--moss);
  transition: all 0.3s ease;
}

.strength-segment.strength-1 { background: #ef4444; }
.strength-segment.strength-2 { background: #f97316; }
.strength-segment.strength-3 { background: #eab308; }
.strength-segment.strength-4 { background: #22c55e; }

.strength-text {
  font-size: 0.75rem;
  color: var(--sage);
}

.strength-text.strength-1 { color: #ef4444; }
.strength-text.strength-2 { color: #f97316; }
.strength-text.strength-3 { color: #eab308; }
.strength-text.strength-4 { color: #22c55e; }

/* Avatar Upload */
.avatar-upload {
  border: 2px dashed var(--moss);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(26, 17, 14, 0.4);
}

.avatar-upload:hover,
.avatar-upload.dragging {
  border-color: var(--fire);
  background: rgba(255, 107, 53, 0.05);
}

.avatar-preview {
  margin-bottom: 0.75rem;
}

.avatar-preview img {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  border-radius: 50%;
  object-fit: cover;
}

.upload-text {
  font-size: 0.85rem;
  color: var(--sage);
}

.upload-hint {
  font-size: 0.75rem;
  color: var(--sage);
  opacity: 0.7;
  margin-top: 0.25rem;
}

.badge-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, rgba(255, 179, 71, 0.15), rgba(255, 107, 53, 0.15));
  border: 1.5px solid var(--fire-glow);
  border-radius: 10px;
  color: var(--fire-glow);
  font-size: 0.85rem;
  font-weight: 600;
}

.warning-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: var(--amber);
}

.char-count {
  text-align: right;
  font-size: 0.75rem;
  color: var(--sage);
}

/* Checkboxes */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--sage);
  transition: color 0.3s ease;
}

.checkbox-label:hover {
  color: var(--cream);
}

.checkbox-label span {
  line-height: 1.4;
}

.checkbox {
  margin-top: 2px;
  width: 16px;
  height: 16px;
  accent-color: var(--fire);
  flex-shrink: 0;
}

.checkbox-label a {
  color: var(--fire-glow);
  text-decoration: none;
}

.checkbox-label a:hover {
  text-decoration: underline;
}

.checkbox-error {
  margin-left: 1.75rem;
}

/* Server Error */
.server-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  padding: 0.75rem 1rem;
}

.server-error p {
  font-size: 0.85rem;
  color: #fca5a5;
}

/* Buttons */
.form-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-family: 'Lora', serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--fire), var(--fire-glow));
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: rgba(26, 17, 14, 0.8);
  border: 1px solid var(--moss);
  color: var(--cream);
}

.btn-secondary:hover {
  background: rgba(42, 31, 26, 0.9);
}

.spinner {
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

.hidden {
  display: none;
}

/* Success Modal */
.success-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.success-modal {
  position: relative;
  background: linear-gradient(135deg, rgba(42, 31, 26, 0.95), rgba(26, 17, 14, 0.98));
  border: 1px solid var(--moss);
  border-radius: 24px;
  padding: 2.5rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(255, 107, 53, 0.1);
  overflow: hidden;
}

.modal-glow {
  position: absolute;
  top: -50%;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 107, 53, 0.3), transparent 70%);
  filter: blur(40px);
  animation: pulse-glow 3s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

.success-icon-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
}

.success-icon-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--fire), var(--fire-glow));
  border-radius: 50%;
  animation: icon-pulse 2s ease-in-out infinite;
}

@keyframes icon-pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.5; }
}

.success-icon {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 20px;
  color: white;
  z-index: 1;
  animation: check-draw 0.5s ease-out 0.3s both;
}

@keyframes check-draw {
  0% { stroke-dashoffset: 100; opacity: 0; }
  100% { stroke-dashoffset: 0; opacity: 1; }
}

.success-particles {
  position: absolute;
  inset: 0;
}

.success-particles .particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: var(--fire-glow);
  border-radius: 50%;
  animation: particle-burst 1s ease-out forwards;
}

.success-particles .particle:nth-child(1) { top: 50%; left: 50%; --angle: 0deg; }
.success-particles .particle:nth-child(2) { top: 50%; left: 50%; --angle: 45deg; }
.success-particles .particle:nth-child(3) { top: 50%; left: 50%; --angle: 90deg; }
.success-particles .particle:nth-child(4) { top: 50%; left: 50%; --angle: 135deg; }
.success-particles .particle:nth-child(5) { top: 50%; left: 50%; --angle: 180deg; }
.success-particles .particle:nth-child(6) { top: 50%; left: 50%; --angle: 225deg; }
.success-particles .particle:nth-child(7) { top: 50%; left: 50%; --angle: 270deg; }
.success-particles .particle:nth-child(8) { top: 50%; left: 50%; --angle: 315deg; }

@keyframes particle-burst {
  0% { transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1); opacity: 1; }
  100% { transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-50px) scale(0); opacity: 0; }
}

.success-title {
  font-family: 'Merriweather', serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--cream);
  margin-bottom: 0.75rem;
}

.success-text {
  color: var(--sage);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 179, 71, 0.1);
  border: 1px solid rgba(255, 179, 71, 0.3);
  border-radius: 20px;
  color: var(--fire-glow);
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: var(--fire-glow);
  border-radius: 50%;
  animation: dot-pulse 1.5s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.success-btn {
  position: relative;
  width: 100%;
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
}

.success-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
}

.success-btn .btn-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-100%);
}

.success-btn:hover .btn-glow {
  animation: shimmer 0.8s ease;
}

@keyframes shimmer {
  100% { transform: translateX(100%); }
}

.success-btn .btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.success-btn .btn-icon {
  width: 20px;
  height: 20px;
}
</style>
