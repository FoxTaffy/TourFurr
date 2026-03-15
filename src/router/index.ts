import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { supabase } from '../services/supabase'
import { safeStorage } from '../utils/safeStorage'
import { logger } from '../utils/logger'
import { getIsAdminFromToken } from '../utils/jwt'

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
    path: '/auth/update-password',
    name: 'UpdatePassword',
    component: () => import('../views/UpdatePasswordPage.vue')
  },
  {
    path: '/auth/verify-reset-code',
    name: 'VerifyResetCode',
    component: () => import('../views/VerifyResetCodePage.vue')
  },
  {
    path: '/teams',
    name: 'Teams',
    component: () => import('../views/TeamsPage.vue'),
    meta: { requiresAuth: true, requiresApproved: true }
  },
  {
    path: '/schedule',
    name: 'Schedule',
    component: () => import('../views/SchedulePage.vue'),
    meta: { requiresAuth: true, requiresApproved: true }
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
  let isAuthenticated = false

  try {
    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.access_token
    isAuthenticated = !!accessToken

    if (accessToken) {
      safeStorage.setItem('auth_token', accessToken)
    } else {
      safeStorage.removeItem('auth_token')
      safeStorage.removeItem('current_user')
    }
  } catch {
    isAuthenticated = false
    safeStorage.removeItem('auth_token')
    safeStorage.removeItem('current_user')
  }

  // Check guest routes
  if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'Dashboard' })
    return
  }

  // Check auth routes
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      next({ name: 'Auth' })
      return
    }
  }

  // Check approved-only routes (e.g. Schedule)
  if (to.meta.requiresApproved) {
    try {
      const storedUser = safeStorage.getItem('current_user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        if (userData.status !== 'approved' && userData.status !== 'paid') {
          next({ name: 'Dashboard' })
          return
        }
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: dbUser } = await supabase
            .from('users')
            .select('status')
            .eq('id', user.id)
            .single()

          if (!dbUser || (dbUser.status !== 'approved' && dbUser.status !== 'paid')) {
            next({ name: 'Dashboard' })
            return
          }
        }
      }
    } catch (err) {
      logger.error('Approved check error:', err)
      next({ name: 'Dashboard' })
      return
    }
  }

  // Check admin routes - CRITICAL SECURITY CHECK
  if (to.meta.requiresAdmin) {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        next({ name: 'Auth' })
        return
      }

      // Read is_admin from the signed JWT claim instead of making a separate
      // DB request.  A plain REST response can be intercepted and modified by
      // a proxy, but the JWT payload is HMAC-signed by the server — altering
      // it invalidates the signature and all subsequent API calls would be
      // rejected by Supabase.  Requires the custom_access_token_hook to be
      // deployed and enabled in Supabase Dashboard → Authentication → Hooks
      // (see database/custom_access_token_hook.sql).
      if (!getIsAdminFromToken(session.access_token)) {
        logger.warn('Access denied: User is not an admin')
        next({ name: 'Dashboard' })
        return
      }

      // User is admin — allow access
      next()
    } catch (err) {
      logger.error('Admin check error:', err)
      next({ name: 'Dashboard' })
    }
    return
  }

  next()
})

export default router
