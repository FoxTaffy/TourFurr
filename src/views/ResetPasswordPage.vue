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

      <!-- Reset Card -->
      <div class="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-2xl">
        <h2 class="text-xl font-bold text-white mb-2">Восстановление пароля</h2>
        <p class="text-gray-400 text-sm mb-6">
          Введите email, указанный при регистрации, и мы отправим ссылку для сброса пароля.
        </p>

        <form v-if="!submitted" @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              v-model="email"
              type="email"
              placeholder="email@example.com"
              class="w-full bg-gray-800/50 border border-gray-600 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
              :class="{ 'border-red-500': error }"
            />
            <p v-if="error" class="mt-1 text-xs text-red-400">{{ error }}</p>
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
            {{ isLoading ? 'Отправка...' : 'Отправить ссылку' }}
          </button>
        </form>

        <!-- Success Message -->
        <div v-else class="text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-white mb-2">Email подтвержден!</h3>
          <p class="text-sm text-gray-400 mb-3">
            Пользователь с email {{ email }} найден.
          </p>
          <p class="text-xs text-amber-400">
            Функция отправки письма для сброса пароля будет реализована позже. Обратитесь к администратору для сброса пароля.
          </p>
        </div>
      </div>

      <!-- Back to Login -->
      <div class="text-center mt-6">
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
import { ref } from 'vue'
import { supabase } from '../services/supabase'

const email = ref('')
const error = ref('')
const isLoading = ref(false)
const submitted = ref(false)

async function handleSubmit() {
  error.value = ''

  if (!email.value) {
    error.value = 'Введите email'
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    error.value = 'Неверный формат email'
    return
  }

  isLoading.value = true

  try {
    // Check if user exists
    const { data: user, error: dbError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email.value.trim().toLowerCase())
      .single()

    if (dbError || !user) {
      error.value = 'Пользователь с таким email не найден'
      return
    }

    // For now, just show success message
    // TODO: Implement actual password reset with email sending
    submitted.value = true
  } catch (err: any) {
    error.value = 'Ошибка отправки. Попробуйте позже.'
  } finally {
    isLoading.value = false
  }
}
</script>
