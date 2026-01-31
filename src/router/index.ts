import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { supabase } from '../services/supabase'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomePage.vue')
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('../views/AuthPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/auth/confirm',
    name: 'EmailConfirm',
    component: () => import('../views/EmailConfirmPage.vue')
  },
  {
    path: '/auth/verify-email',
    name: 'VerifyEmail',
    component: () => import('../views/VerifyEmailPage.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/DashboardPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('../views/ResetPasswordPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach(async (to, _from, next) => {
  const token = localStorage.getItem('auth_token')
  const isAuthenticated = !!token

  // Check guest routes
  if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'Dashboard' })
    return
  }

  // Check auth routes
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Auth' })
    return
  }

  // Check admin routes - CRITICAL SECURITY CHECK
  if (to.meta.requiresAdmin) {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        next({ name: 'Auth' })
        return
      }

      // Check if user is admin in database
      const { data: userData, error } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (error || !userData || !userData.is_admin) {
        // User is not admin - redirect to dashboard with warning
        console.warn('Access denied: User is not an admin')
        next({ name: 'Dashboard' })
        return
      }

      // User is admin - allow access
      next()
    } catch (err) {
      console.error('Admin check error:', err)
      next({ name: 'Dashboard' })
    }
    return
  }

  next()
})

export default router
