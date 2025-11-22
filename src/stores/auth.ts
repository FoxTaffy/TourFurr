import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export interface User {
  id: string
  email: string
  nickname: string
  phone: string
  telegram: string
  avatar?: string
  description?: string
  status: 'pending' | 'approved' | 'rejected'
  emailSubscribed: boolean
  createdAt: string
}

export interface RegisterData {
  email: string
  password: string
  nickname: string
  phone: string
  telegram: string
  avatar?: File
  description?: string
  agreeRules: boolean
  agreePrivacy: boolean
  emailSubscribed: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const userStatus = computed(() => user.value?.status || null)

  async function login(email: string, password: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post('/auth/login', { email, password })
      token.value = response.data.token
      user.value = response.data.user
      localStorage.setItem('auth_token', response.data.token)
      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Ошибка входа. Проверьте email и пароль.'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function register(data: RegisterData) {
    isLoading.value = true
    error.value = null

    try {
      const formData = new FormData()
      formData.append('email', data.email)
      formData.append('password', data.password)
      formData.append('nickname', data.nickname)
      formData.append('phone', data.phone)
      formData.append('telegram', data.telegram)
      formData.append('agreeRules', String(data.agreeRules))
      formData.append('agreePrivacy', String(data.agreePrivacy))
      formData.append('emailSubscribed', String(data.emailSubscribed))

      if (data.avatar) {
        formData.append('avatar', data.avatar)
      }
      if (data.description) {
        formData.append('description', data.description)
      }

      const response = await api.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      token.value = response.data.token
      user.value = response.data.user
      localStorage.setItem('auth_token', response.data.token)

      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Ошибка регистрации. Попробуйте позже.'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function checkEmailUnique(email: string): Promise<boolean> {
    try {
      const response = await api.get(`/auth/check-email?email=${encodeURIComponent(email)}`)
      return response.data.available
    } catch {
      return true // Assume available on error
    }
  }

  async function checkNicknameUnique(nickname: string): Promise<boolean> {
    try {
      const response = await api.get(`/auth/check-nickname?nickname=${encodeURIComponent(nickname)}`)
      return response.data.available
    } catch {
      return true // Assume available on error
    }
  }

  async function fetchUser() {
    if (!token.value) return

    try {
      const response = await api.get('/auth/me')
      user.value = response.data.user
    } catch {
      logout()
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
  }

  function clearError() {
    error.value = null
  }

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    userStatus,
    login,
    register,
    checkEmailUnique,
    checkNicknameUnique,
    fetchUser,
    logout,
    clearError
  }
})
