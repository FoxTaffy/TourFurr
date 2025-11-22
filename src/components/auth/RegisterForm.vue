<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Progress Indicator -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-gray-400">Шаг {{ currentStep }} из 3</span>
        <span class="text-sm text-gray-400">{{ stepTitles[currentStep - 1] }}</span>
      </div>
      <div class="flex gap-2">
        <div
          v-for="step in 3"
          :key="step"
          class="flex-1 h-1 rounded-full transition-all duration-300"
          :class="step <= currentStep ? 'bg-amber-500' : 'bg-gray-700'"
        />
      </div>
    </div>

    <!-- Step 1: Basic Info -->
    <div v-show="currentStep === 1" class="space-y-4">
      <!-- Email -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">
          Email <span class="text-red-400">*</span>
        </label>
        <input
          v-model="form.email"
          type="email"
          placeholder="email@example.com"
          class="w-full bg-gray-800/50 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
          :class="{ 'border-red-500': errors.email }"
          @blur="checkEmail"
        />
        <p v-if="errors.email" class="mt-1 text-xs text-red-400">{{ errors.email }}</p>
      </div>

      <!-- Password -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">
          Пароль <span class="text-red-400">*</span>
        </label>
        <div class="relative">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Минимум 8 символов"
            class="w-full bg-gray-800/50 border border-gray-600 rounded-lg py-3 px-4 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
            :class="{ 'border-red-500': errors.password }"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="showPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </button>
        </div>
        <p v-if="errors.password" class="mt-1 text-xs text-red-400">{{ errors.password }}</p>
        <!-- Password Strength -->
        <div v-if="form.password" class="mt-2">
          <div class="flex gap-1 mb-1">
            <div
              v-for="i in 4"
              :key="i"
              class="flex-1 h-1 rounded-full"
              :class="passwordStrength >= i ? strengthColors[passwordStrength - 1] : 'bg-gray-700'"
            />
          </div>
          <p class="text-xs" :class="strengthTextColors[passwordStrength - 1] || 'text-gray-500'">
            {{ strengthLabels[passwordStrength - 1] || 'Очень слабый' }}
          </p>
        </div>
      </div>

      <!-- Confirm Password -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">
          Подтверждение пароля <span class="text-red-400">*</span>
        </label>
        <input
          v-model="form.confirmPassword"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Повторите пароль"
          class="w-full bg-gray-800/50 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
          :class="{ 'border-red-500': errors.confirmPassword }"
        />
        <p v-if="errors.confirmPassword" class="mt-1 text-xs text-red-400">{{ errors.confirmPassword }}</p>
      </div>
    </div>

    <!-- Step 2: Profile -->
    <div v-show="currentStep === 2" class="space-y-4">
      <!-- Nickname -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">
          Никнейм <span class="text-red-400">*</span>
        </label>
        <input
          v-model="form.nickname"
          type="text"
          placeholder="3-30 символов"
          class="w-full bg-gray-800/50 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
          :class="{ 'border-red-500': errors.nickname }"
          @blur="checkNickname"
        />
        <p v-if="errors.nickname" class="mt-1 text-xs text-red-400">{{ errors.nickname }}</p>
      </div>

      <!-- Phone -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">
          Телефон <span class="text-red-400">*</span>
        </label>
        <input
          v-model="form.phone"
          v-maska
          data-maska="+7 (###) ###-##-##"
          type="tel"
          placeholder="+7 (XXX) XXX-XX-XX"
          class="w-full bg-gray-800/50 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
          :class="{ 'border-red-500': errors.phone }"
        />
        <p v-if="errors.phone" class="mt-1 text-xs text-red-400">{{ errors.phone }}</p>
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
    <div v-show="currentStep === 3" class="space-y-4">
      <!-- Avatar Upload -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">Аватар</label>
        <div
          class="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-amber-500/50 transition-colors cursor-pointer"
          :class="{ 'border-amber-500': isDragging }"
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
          <div v-if="avatarPreview" class="mb-3">
            <img :src="avatarPreview" alt="Preview" class="w-24 h-24 mx-auto rounded-full object-cover" />
          </div>
          <p class="text-gray-400 text-sm">
            {{ avatarPreview ? 'Нажмите чтобы заменить' : 'Перетащите файл или нажмите для выбора' }}
          </p>
          <p class="text-gray-500 text-xs mt-1">JPG, PNG, WebP до 5MB</p>
        </div>
        <p v-if="errors.avatar" class="mt-1 text-xs text-red-400">{{ errors.avatar }}</p>
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">О себе</label>
        <textarea
          v-model="form.description"
          rows="3"
          maxlength="500"
          placeholder="Расскажи о себе..."
          class="w-full bg-gray-800/50 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all resize-none"
        />
        <p class="text-right text-xs text-gray-500">{{ form.description.length }}/500</p>
      </div>

      <!-- Checkboxes -->
      <div class="space-y-3">
        <label class="flex items-start gap-3 cursor-pointer group">
          <input
            v-model="form.agreeRules"
            type="checkbox"
            class="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-amber-500 focus:ring-amber-500/50"
          />
          <span class="text-sm text-gray-300 group-hover:text-white transition-colors">
            Согласен с <a href="#" class="text-amber-400 hover:underline">правилами конвента</a>
            <span class="text-red-400">*</span>
          </span>
        </label>
        <p v-if="errors.agreeRules" class="ml-7 text-xs text-red-400">{{ errors.agreeRules }}</p>

        <label class="flex items-start gap-3 cursor-pointer group">
          <input
            v-model="form.agreePrivacy"
            type="checkbox"
            class="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-amber-500 focus:ring-amber-500/50"
          />
          <span class="text-sm text-gray-300 group-hover:text-white transition-colors">
            Согласен на <a href="#" class="text-amber-400 hover:underline">обработку персональных данных</a>
            <span class="text-red-400">*</span>
          </span>
        </label>
        <p v-if="errors.agreePrivacy" class="ml-7 text-xs text-red-400">{{ errors.agreePrivacy }}</p>

        <label class="flex items-start gap-3 cursor-pointer group">
          <input
            v-model="form.emailSubscribed"
            type="checkbox"
            class="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-amber-500 focus:ring-amber-500/50"
          />
          <span class="text-sm text-gray-300 group-hover:text-white transition-colors">
            Подписаться на email-рассылку
          </span>
        </label>
      </div>
    </div>

    <!-- Server Error -->
    <div v-if="serverError" class="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
      <p class="text-sm text-red-400">{{ serverError }}</p>
    </div>

    <!-- Navigation Buttons -->
    <div class="flex gap-3">
      <button
        v-if="currentStep > 1"
        type="button"
        @click="prevStep"
        class="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all"
      >
        Назад
      </button>
      <button
        v-if="currentStep < 3"
        type="button"
        @click="nextStep"
        class="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02]"
      >
        Далее
      </button>
      <button
        v-else
        type="submit"
        :disabled="isLoading"
        class="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
      >
        <svg v-if="isLoading" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        {{ isLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
      </button>
    </div>
  </form>

  <!-- Success Modal -->
  <Teleport to="body">
    <div v-if="showSuccessModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-900 border border-amber-500/30 rounded-xl p-6 max-w-md w-full text-center">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
          <svg class="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-white mb-2">Регистрация успешна!</h3>
        <p class="text-gray-400 mb-6">Ваша заявка на рассмотрении. Мы уведомим вас о решении.</p>
        <button
          @click="redirectToDashboard"
          class="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold py-3 px-4 rounded-lg transition-all"
        >
          Перейти в личный кабинет
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
/* Progress Bar */
.mb-8 {
  margin-bottom: 1.5rem;
}

.text-sm {
  font-size: 0.875rem;
}

.text-gray-400 {
  color: var(--sage);
}

/* Form Inputs Override */
input[type="email"],
input[type="password"],
input[type="text"],
input[type="tel"],
textarea {
  background: rgba(26, 17, 14, 0.6) !important;
  border: 1px solid var(--moss) !important;
  border-radius: 12px !important;
  color: var(--cream) !important;
  font-family: 'Lora', serif !important;
  transition: all 0.3s ease !important;
}

input::placeholder,
textarea::placeholder {
  color: var(--sage) !important;
  opacity: 0.7 !important;
}

input:focus,
textarea:focus {
  outline: none !important;
  border-color: var(--fire) !important;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1), 0 0 20px rgba(255, 107, 53, 0.1) !important;
}

/* Labels */
label {
  color: var(--cream) !important;
  font-weight: 500 !important;
}

.text-red-400 {
  color: var(--fire) !important;
}

/* Progress Steps */
.bg-amber-500 {
  background: linear-gradient(90deg, var(--fire), var(--fire-glow)) !important;
}

.bg-gray-700 {
  background: var(--moss) !important;
}

/* Buttons */
button[type="button"],
button[type="submit"] {
  font-family: 'Lora', serif !important;
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
}

.bg-gradient-to-r {
  background: linear-gradient(135deg, var(--fire), var(--fire-glow)) !important;
}

.bg-gradient-to-r:hover:not(:disabled) {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4) !important;
}

.bg-gray-700 {
  background: rgba(26, 17, 14, 0.8) !important;
  border: 1px solid var(--moss) !important;
}

.bg-gray-700:hover {
  background: rgba(42, 31, 26, 0.9) !important;
}

/* Checkboxes */
input[type="checkbox"] {
  accent-color: var(--fire) !important;
}

/* Error States */
.border-red-500 {
  border-color: #ef4444 !important;
}

.text-xs.text-red-400,
.mt-1.text-xs.text-red-400 {
  color: #fca5a5 !important;
}

/* Avatar Upload */
.border-dashed {
  border-color: var(--moss) !important;
  background: rgba(26, 17, 14, 0.4) !important;
  border-radius: 16px !important;
  transition: all 0.3s ease !important;
}

.border-dashed:hover {
  border-color: var(--fire) !important;
  background: rgba(255, 107, 53, 0.05) !important;
}

.border-amber-500 {
  border-color: var(--fire) !important;
}

/* Textarea */
textarea {
  resize: none !important;
}

/* Modal */
.fixed.inset-0 {
  backdrop-filter: blur(8px);
}

.bg-gray-900 {
  background: linear-gradient(135deg, rgba(42, 31, 26, 0.95), rgba(26, 17, 14, 0.98)) !important;
  border: 1px solid var(--moss) !important;
}

.bg-amber-500\/20 {
  background: rgba(255, 107, 53, 0.2) !important;
}

.text-amber-500 {
  color: var(--fire) !important;
}

/* Password Strength */
.bg-red-500 { background: #ef4444 !important; }
.bg-orange-500 { background: #f97316 !important; }
.bg-yellow-500 { background: #eab308 !important; }
.bg-green-500 { background: #22c55e !important; }

/* Server Error */
.bg-red-500\/10 {
  background: rgba(239, 68, 68, 0.1) !important;
  border-color: rgba(239, 68, 68, 0.3) !important;
}

/* Links */
a {
  color: var(--fire-glow) !important;
  transition: color 0.3s ease !important;
}

a:hover {
  color: var(--fire) !important;
}
</style>
