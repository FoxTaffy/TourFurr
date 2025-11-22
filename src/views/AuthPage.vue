<template>
  <div class="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Background Effects -->
    <div class="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-black"></div>
    <div class="absolute inset-0 opacity-30">
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl"></div>
    </div>

    <!-- Main Container -->
    <div class="relative z-10 w-full max-w-md">
      <!-- Logo/Title -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">
          Tour<span class="text-amber-500">Furr</span>
        </h1>
        <p class="text-gray-400">Добро пожаловать в мир приключений</p>
      </div>

      <!-- Auth Card -->
      <div class="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 shadow-2xl">
        <!-- Tabs -->
        <div class="flex mb-6 bg-gray-800 rounded-lg p-1">
          <button
            @click="activeTab = 'login'"
            class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300"
            :class="activeTab === 'login'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white'"
          >
            Вход
          </button>
          <button
            @click="activeTab = 'register'"
            class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300"
            :class="activeTab === 'register'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white'"
          >
            Регистрация
          </button>
        </div>

        <!-- Forms -->
        <Transition name="fade" mode="out-in">
          <LoginForm v-if="activeTab === 'login'" key="login" />
          <RegisterForm v-else key="register" />
        </Transition>
      </div>

      <!-- Back to Home -->
      <div class="text-center mt-6">
        <router-link
          to="/"
          class="text-sm text-gray-400 hover:text-amber-400 transition-colors inline-flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Вернуться на главную
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LoginForm from '../components/auth/LoginForm.vue'
import RegisterForm from '../components/auth/RegisterForm.vue'

const activeTab = ref<'login' | 'register'>('login')
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
