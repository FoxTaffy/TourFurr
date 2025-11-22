import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '../services/supabase'
import bcrypt from 'bcryptjs'

// Use Supabase if configured, otherwise mock mode
const USE_SUPABASE = isSupabaseConfigured

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

// Map database row to User interface
function mapDbUserToUser(dbUser: any): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    nickname: dbUser.nickname,
    phone: dbUser.phone,
    telegram: dbUser.telegram,
    avatar: dbUser.avatar_url,
    description: dbUser.description,
    status: dbUser.status,
    emailSubscribed: dbUser.email_subscribed,
    createdAt: dbUser.created_at
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const userStatus = computed(() => user.value?.status || null)

  // Load user from localStorage on init
  if (token.value) {
    const storedUser = localStorage.getItem('current_user')
    if (storedUser) {
      user.value = JSON.parse(storedUser)
    }
  }

  async function login(email: string, password: string) {
    isLoading.value = true
    error.value = null

    try {
      if (USE_SUPABASE) {
        // Supabase login
        const { data, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single()

        if (dbError || !data) {
          error.value = 'Неверный email или пароль'
          return { success: false, error: error.value }
        }

        // Verify password
        const isValid = await bcrypt.compare(password, data.password_hash)
        if (!isValid) {
          error.value = 'Неверный email или пароль'
          return { success: false, error: error.value }
        }

        const mappedUser = mapDbUserToUser(data)
        token.value = `token_${Date.now()}_${data.id}`
        user.value = mappedUser
        localStorage.setItem('auth_token', token.value)
        localStorage.setItem('current_user', JSON.stringify(mappedUser))

        return { success: true }
      } else {
        // Mock mode
        await new Promise(r => setTimeout(r, 500))
        const users = getStoredUsers()
        const foundUser = users.find(u => u.email === email && u.password === password)

        if (foundUser) {
          const { password: _, ...userWithoutPassword } = foundUser
          token.value = `mock_token_${Date.now()}`
          user.value = userWithoutPassword
          localStorage.setItem('auth_token', token.value)
          localStorage.setItem('current_user', JSON.stringify(userWithoutPassword))
          return { success: true }
        } else {
          error.value = 'Неверный email или пароль'
          return { success: false, error: error.value }
        }
      }
    } catch (err: any) {
      error.value = err.message || 'Ошибка входа'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function register(data: RegisterData) {
    isLoading.value = true
    error.value = null

    try {
      if (USE_SUPABASE) {
        // Hash password
        const passwordHash = await bcrypt.hash(data.password, 10)

        // Upload avatar if provided
        let avatarUrl: string | null = null
        if (data.avatar) {
          const fileExt = data.avatar.name.split('.').pop()
          const fileName = `${Date.now()}.${fileExt}`

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, data.avatar)

          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName)
            avatarUrl = urlData.publicUrl
          }
        }

        // Insert user
        const { data: newUser, error: dbError } = await supabase
          .from('users')
          .insert({
            email: data.email,
            password_hash: passwordHash,
            nickname: data.nickname,
            phone: data.phone,
            telegram: data.telegram,
            avatar_url: avatarUrl,
            description: data.description || null,
            status: 'pending',
            email_subscribed: data.emailSubscribed,
            agree_rules: data.agreeRules,
            agree_privacy: data.agreePrivacy
          })
          .select()
          .single()

        if (dbError) {
          if (dbError.code === '23505') {
            if (dbError.message.includes('email')) {
              error.value = 'Этот email уже зарегистрирован'
            } else if (dbError.message.includes('nickname')) {
              error.value = 'Этот никнейм уже занят'
            } else {
              error.value = 'Пользователь уже существует'
            }
          } else {
            error.value = dbError.message
          }
          return { success: false, error: error.value }
        }

        const mappedUser = mapDbUserToUser(newUser)
        token.value = `token_${Date.now()}_${newUser.id}`
        user.value = mappedUser
        localStorage.setItem('auth_token', token.value)
        localStorage.setItem('current_user', JSON.stringify(mappedUser))

        return { success: true }
      } else {
        // Mock mode
        await new Promise(r => setTimeout(r, 800))
        const users = getStoredUsers()

        if (users.some(u => u.email === data.email)) {
          error.value = 'Этот email уже зарегистрирован'
          return { success: false, error: error.value }
        }

        if (users.some(u => u.nickname === data.nickname)) {
          error.value = 'Этот никнейм уже занят'
          return { success: false, error: error.value }
        }

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

        return { success: true }
      }
    } catch (err: any) {
      error.value = err.message || 'Ошибка регистрации'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function checkEmailUnique(email: string): Promise<boolean> {
    if (USE_SUPABASE) {
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()
      return !data
    } else {
      const users = getStoredUsers()
      return !users.some(u => u.email === email)
    }
  }

  async function checkNicknameUnique(nickname: string): Promise<boolean> {
    if (USE_SUPABASE) {
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('nickname', nickname)
        .single()
      return !data
    } else {
      const users = getStoredUsers()
      return !users.some(u => u.nickname === nickname)
    }
  }

  async function fetchUser() {
    if (!token.value) return

    const storedUser = localStorage.getItem('current_user')
    if (storedUser) {
      user.value = JSON.parse(storedUser)
    } else {
      logout()
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
