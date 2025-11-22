import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// MOCK MODE - работает без бэкенда
const MOCK_MODE = true

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

interface StoredUser extends User {
  password: string
}

// Mock storage helpers
function getStoredUsers(): StoredUser[] {
  const data = localStorage.getItem('mock_users')
  return data ? JSON.parse(data) : []
}

function saveStoredUsers(users: StoredUser[]) {
  localStorage.setItem('mock_users', JSON.stringify(users))
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const userStatus = computed(() => user.value?.status || null)

  // Load user from localStorage on init
  if (token.value && MOCK_MODE) {
    const storedUser = localStorage.getItem('current_user')
    if (storedUser) {
      user.value = JSON.parse(storedUser)
    }
  }

  async function login(email: string, password: string) {
    isLoading.value = true
    error.value = null

    // Simulate network delay
    await new Promise(r => setTimeout(r, 500))

    if (MOCK_MODE) {
      const users = getStoredUsers()
      const foundUser = users.find(u => u.email === email && u.password === password)

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser
        token.value = `mock_token_${Date.now()}`
        user.value = userWithoutPassword
        localStorage.setItem('auth_token', token.value)
        localStorage.setItem('current_user', JSON.stringify(userWithoutPassword))
        isLoading.value = false
        return { success: true }
      } else {
        error.value = 'Неверный email или пароль'
        isLoading.value = false
        return { success: false, error: error.value }
      }
    }

    // Real API call would go here
    isLoading.value = false
    return { success: false, error: 'API не настроен' }
  }

  async function register(data: RegisterData) {
    isLoading.value = true
    error.value = null

    // Simulate network delay
    await new Promise(r => setTimeout(r, 800))

    if (MOCK_MODE) {
      const users = getStoredUsers()

      // Check if email exists
      if (users.some(u => u.email === data.email)) {
        error.value = 'Этот email уже зарегистрирован'
        isLoading.value = false
        return { success: false, error: error.value }
      }

      // Check if nickname exists
      if (users.some(u => u.nickname === data.nickname)) {
        error.value = 'Этот никнейм уже занят'
        isLoading.value = false
        return { success: false, error: error.value }
      }

      // Convert avatar to base64 if provided
      let avatarBase64: string | undefined
      if (data.avatar) {
        avatarBase64 = await fileToBase64(data.avatar)
      }

      const newUser: StoredUser = {
        id: `user_${Date.now()}`,
        email: data.email,
        password: data.password,
        nickname: data.nickname,
        phone: data.phone,
        telegram: data.telegram,
        avatar: avatarBase64,
        description: data.description,
        status: 'pending',
        emailSubscribed: data.emailSubscribed,
        createdAt: new Date().toISOString()
      }

      users.push(newUser)
      saveStoredUsers(users)

      const { password: _, ...userWithoutPassword } = newUser
      token.value = `mock_token_${Date.now()}`
      user.value = userWithoutPassword
      localStorage.setItem('auth_token', token.value)
      localStorage.setItem('current_user', JSON.stringify(userWithoutPassword))

      isLoading.value = false
      return { success: true }
    }

    isLoading.value = false
    return { success: false, error: 'API не настроен' }
  }

  async function checkEmailUnique(email: string): Promise<boolean> {
    if (MOCK_MODE) {
      const users = getStoredUsers()
      return !users.some(u => u.email === email)
    }
    return true
  }

  async function checkNicknameUnique(nickname: string): Promise<boolean> {
    if (MOCK_MODE) {
      const users = getStoredUsers()
      return !users.some(u => u.nickname === nickname)
    }
    return true
  }

  async function fetchUser() {
    if (!token.value) return

    if (MOCK_MODE) {
      const storedUser = localStorage.getItem('current_user')
      if (storedUser) {
        user.value = JSON.parse(storedUser)
      } else {
        logout()
      }
      return
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('current_user')
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
