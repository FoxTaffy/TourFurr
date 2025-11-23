import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../services/supabase'
import bcrypt from 'bcryptjs'

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
    } catch (err: any) {
      error.value = err.message || 'Ошибка регистрации'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function checkEmailUnique(email: string): Promise<boolean> {
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()
    return !data
  }

  async function checkNicknameUnique(nickname: string): Promise<boolean> {
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('nickname', nickname)
      .single()
    return !data
  }

  async function fetchUser() {
    if (!token.value) return

    const storedUser = localStorage.getItem('current_user')
    if (!storedUser) {
      logout()
      return
    }

    const cachedUser = JSON.parse(storedUser)
    user.value = cachedUser

    // Fetch fresh data from database to get updated status
    try {
      const { data, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('id', cachedUser.id)
        .single()

      if (!dbError && data) {
        const freshUser = mapDbUserToUser(data)
        user.value = freshUser
        localStorage.setItem('current_user', JSON.stringify(freshUser))
      }
    } catch (err) {
      // Keep cached user if fetch fails
      console.error('Failed to fetch fresh user data:', err)
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

  async function updateProfile(updates: {
    nickname?: string
    phone?: string
    telegram?: string
    description?: string
    avatar?: File
  }) {
    if (!user.value) return { success: false, error: 'Не авторизован' }

    isLoading.value = true
    error.value = null

    try {
      const updateData: any = {}

      if (updates.nickname) updateData.nickname = updates.nickname
      if (updates.phone) updateData.phone = updates.phone
      if (updates.telegram) updateData.telegram = updates.telegram
      if (updates.description !== undefined) updateData.description = updates.description || null

      // Handle avatar upload
      if (updates.avatar) {
        // Delete old avatar if exists
        if (user.value.avatar) {
          const oldFileName = user.value.avatar.split('/').pop()
          if (oldFileName) {
            await supabase.storage.from('avatars').remove([oldFileName])
          }
        }

        // Upload new avatar
        const fileExt = updates.avatar.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, updates.avatar)

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName)
          updateData.avatar_url = urlData.publicUrl
        }
      }

      const { data, error: dbError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.value.id)
        .select()
        .single()

      if (dbError) {
        if (dbError.code === '23505' && dbError.message.includes('nickname')) {
          error.value = 'Этот никнейм уже занят'
        } else {
          error.value = dbError.message
        }
        return { success: false, error: error.value }
      }

      const updatedUser = mapDbUserToUser(data)
      user.value = updatedUser
      localStorage.setItem('current_user', JSON.stringify(updatedUser))

      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'Ошибка обновления'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function deleteAccount() {
    if (!user.value) return { success: false, error: 'Не авторизован' }

    isLoading.value = true
    error.value = null

    try {
      // Delete avatar from storage if exists
      if (user.value.avatar) {
        const fileName = user.value.avatar.split('/').pop()
        if (fileName) {
          await supabase.storage.from('avatars').remove([fileName])
        }
      }

      // Delete user from database
      const { error: dbError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.value.id)

      if (dbError) {
        error.value = dbError.message
        return { success: false, error: error.value }
      }

      // Logout
      logout()

      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'Ошибка удаления'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
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
    clearError,
    updateProfile,
    deleteAccount
  }
})
