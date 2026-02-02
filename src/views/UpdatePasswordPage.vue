<template>
  <div class="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Background Effects -->
    <div class="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-black"></div>

    <div class="relative z-10 w-full max-w-md">
      <!-- Logo/Title -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">
          Tour<span class="text-amber-500">Furr</span>
        </h1>
      </div>

      <!-- Update Password Card -->
      <div class="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-2xl">
        <h2 class="text-xl font-bold text-white mb-2">Новый пароль</h2>
        <p class="text-gray-400 text-sm mb-6">
          Введите новый пароль для вашего аккаунта.
        </p>

        <form v-if="!success" @submit.prevent="handleSubmit" class="space-y-4">
          <!-- New Password -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Новый пароль</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Минимум 8 символов"
                class="w-full bg-gray-800/50 border border-gray-600 rounded-lg py-3 px-4 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                :class="{ 'border-red-500': errors.password }"
              />
              <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300">
                <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-xs text-red-400">{{ errors.password }}</p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Подтверждение пароля</label>
            <input
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Повторите пароль"
              class="w-full bg-gray-800/50 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
              :class="{ 'border-red-500': errors.confirmPassword }"
            />
            <p v-if="errors.confirmPassword" class="mt-1 text-xs text-red-400">{{ errors.confirmPassword }}</p>
          </div>

          <!-- Server Error -->
          <div v-if="serverError" class="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p class="text-sm text-red-400">{{ serverError }}</p>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="isLoading" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            {{ isLoading ? 'Сохранение...' : 'Сохранить пароль' }}
          </button>
        </form>

        <!-- Success Message -->
        <div v-else class="text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-white mb-2">Пароль обновлен!</h3>
          <p class="text-sm text-gray-400 mb-4">
            Теперь вы можете войти с новым паролем.
          </p>
          <router-link
            to="/auth"
            class="inline-block bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold py-2 px-6 rounded-lg transition-all"
          >
            Перейти ко входу
          </router-link>
        </div>
      </div>

      <!-- Back to Login -->
      <div v-if="!success" class="text-center mt-6">
        <router-link
          to="/auth"
          class="text-sm text-gray-400 hover:text-amber-400 transition-colors inline-flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Вернуться к входу
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../services/supabase'

const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const serverError = ref('')
const success = ref(false)

const errors = reactive({
  password: '',
  confirmPassword: ''
})

onMounted(async () => {
  // Check if we have a valid session from the reset link
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    // No session - redirect to reset password page
    router.push('/reset-password')
  }
})

function validate(): boolean {
  errors.password = ''
  errors.confirmPassword = ''
  let isValid = true

  if (!password.value) {
    errors.password = 'Введите пароль'
    isValid = false
  } else if (password.value.length < 8) {
    errors.password = 'Минимум 8 символов'
    isValid = false
  } else if (!/[a-zA-Z]/.test(password.value)) {
    errors.password = 'Должен содержать буквы'
    isValid = false
  } else if (!/\d/.test(password.value)) {
    errors.password = 'Должен содержать цифры'
    isValid = false
  } else if (!/[^a-zA-Z0-9]/.test(password.value)) {
    errors.password = 'Должен содержать специальный символ'
    isValid = false
  }

  if (!confirmPassword.value) {
    errors.confirmPassword = 'Подтвердите пароль'
    isValid = false
  } else if (password.value !== confirmPassword.value) {
    errors.confirmPassword = 'Пароли не совпадают'
    isValid = false
  }

  return isValid
}

async function handleSubmit() {
  if (!validate()) return

  serverError.value = ''
  isLoading.value = true

  try {
    const { error } = await supabase.auth.updateUser({
      password: password.value
    })

    if (error) {
      console.error('Password update error:', error)
      serverError.value = 'Ошибка обновления пароля. Попробуйте снова.'
      return
    }

    success.value = true

    // Sign out so user can log in with new password
    await supabase.auth.signOut()
    localStorage.removeItem('auth_token')
    localStorage.removeItem('current_user')
  } catch (err: any) {
    console.error('Unexpected error:', err)
    serverError.value = 'Произошла ошибка. Попробуйте позже.'
  } finally {
    isLoading.value = false
  }
}
</script>
