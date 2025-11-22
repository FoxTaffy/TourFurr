<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Email -->
    <div>
      <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
        Email <span class="text-red-400">*</span>
      </label>
      <input
        id="email"
        v-model="form.email"
        type="email"
        placeholder="email@example.com"
        class="w-full bg-gray-800/50 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
        :class="{ 'border-red-500': errors.email }"
      />
      <p v-if="errors.email" class="mt-1 text-xs text-red-400">{{ errors.email }}</p>
    </div>

    <!-- Password -->
    <div>
      <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
        Пароль <span class="text-red-400">*</span>
      </label>
      <div class="relative">
        <input
          id="password"
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Введите пароль"
          class="w-full bg-gray-800/50 border border-gray-600 rounded-lg py-3 px-4 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
          :class="{ 'border-red-500': errors.password }"
        />
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
        >
          <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
        </button>
      </div>
      <p v-if="errors.password" class="mt-1 text-xs text-red-400">{{ errors.password }}</p>
    </div>

    <!-- Server Error -->
    <div v-if="serverError" class="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
      <p class="text-sm text-red-400">{{ serverError }}</p>
    </div>

    <!-- Submit Button -->
    <button
      type="submit"
      :disabled="isLoading"
      class="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
    >
      <svg v-if="isLoading" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
      {{ isLoading ? 'Вход...' : 'Войти' }}
    </button>

    <!-- Forgot Password -->
    <div class="text-center">
      <router-link
        to="/reset-password"
        class="text-sm text-amber-400 hover:text-amber-300 transition-colors"
      >
        Забыли пароль?
      </router-link>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import * as yup from 'yup'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: ''
})

const showPassword = ref(false)
const isLoading = ref(false)
const serverError = ref('')

const schema = yup.object({
  email: yup.string().required('Email обязателен').email('Неверный формат email'),
  password: yup.string().required('Пароль обязателен')
})

async function handleSubmit() {
  // Clear errors
  errors.email = ''
  errors.password = ''
  serverError.value = ''

  // Validate
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

  // Submit
  isLoading.value = true
  const result = await authStore.login(form.email, form.password)
  isLoading.value = false

  if (result.success) {
    router.push('/dashboard')
  } else {
    serverError.value = result.error || 'Ошибка входа'
  }
}
</script>
