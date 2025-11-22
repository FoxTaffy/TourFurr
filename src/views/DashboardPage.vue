<template>
  <div class="min-h-screen bg-gray-950">
    <!-- Header -->
    <header class="bg-gray-900 border-b border-gray-800">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <router-link to="/" class="text-2xl font-bold text-white">
          Tour<span class="text-amber-500">Furr</span>
        </router-link>
        <div class="flex items-center gap-4">
          <span class="text-gray-400">{{ user?.email }}</span>
          <button
            @click="handleLogout"
            class="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Выйти
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-8">
      <!-- Status Banner -->
      <div
        v-if="user?.status === 'pending'"
        class="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6"
      >
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="text-amber-400">Ваша заявка на рассмотрении. Мы уведомим вас о решении.</p>
        </div>
      </div>

      <div
        v-else-if="user?.status === 'rejected'"
        class="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6"
      >
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          <p class="text-red-400">К сожалению, ваша заявка была отклонена.</p>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div class="grid md:grid-cols-2 gap-6">
        <!-- Profile Card -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 class="text-xl font-bold text-white mb-4">Профиль</h2>
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                <img
                  v-if="user?.avatar"
                  :src="user.avatar"
                  alt="Avatar"
                  class="w-full h-full rounded-full object-cover"
                />
                <span v-else class="text-2xl text-gray-500">{{ user?.nickname?.[0]?.toUpperCase() }}</span>
              </div>
              <div>
                <p class="font-semibold text-white">{{ user?.nickname }}</p>
                <p class="text-sm text-gray-400">{{ user?.email }}</p>
              </div>
            </div>
            <div class="pt-4 border-t border-gray-800 space-y-2">
              <p class="text-sm">
                <span class="text-gray-400">Телефон:</span>
                <span class="text-white ml-2">{{ user?.phone }}</span>
              </p>
              <p class="text-sm">
                <span class="text-gray-400">Telegram:</span>
                <a :href="'https://' + user?.telegram" target="_blank" class="text-amber-400 ml-2 hover:underline">
                  {{ user?.telegram }}
                </a>
              </p>
            </div>
          </div>
        </div>

        <!-- Status Card -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 class="text-xl font-bold text-white mb-4">Статус заявки</h2>
          <div class="flex items-center gap-3">
            <div
              class="w-3 h-3 rounded-full"
              :class="{
                'bg-amber-500': user?.status === 'pending',
                'bg-green-500': user?.status === 'approved',
                'bg-red-500': user?.status === 'rejected'
              }"
            />
            <span class="text-white capitalize">
              {{ statusLabels[user?.status || 'pending'] }}
            </span>
          </div>
          <p class="mt-4 text-sm text-gray-400">
            {{ statusDescriptions[user?.status || 'pending'] }}
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user)

const statusLabels: Record<string, string> = {
  pending: 'На рассмотрении',
  approved: 'Одобрено',
  rejected: 'Отклонено'
}

const statusDescriptions: Record<string, string> = {
  pending: 'Ваша заявка находится на рассмотрении. Обычно это занимает 1-2 рабочих дня.',
  approved: 'Поздравляем! Ваша заявка одобрена. Вы можете участвовать в мероприятии.',
  rejected: 'К сожалению, ваша заявка была отклонена. Свяжитесь с нами для уточнения.'
}

onMounted(() => {
  authStore.fetchUser()
})

function handleLogout() {
  authStore.logout()
  router.push('/auth')
}
</script>
