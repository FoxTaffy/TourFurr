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
    path: '/auth/update-password',
    name: 'UpdatePassword',
    component: () => import('../views/UpdatePasswordPage.vue')
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

  // Check auth routes - verify token AND email_verified status
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      next({ name: 'Auth' })
      return
    }

    // CRITICAL: Verify email is confirmed before allowing access to protected routes
    try {
      const storedUser = localStorage.getItem('current_user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        // Check if email is verified
        if (!userData.emailVerified) {
          // Clear auth data and redirect to verification
          localStorage.removeItem('auth_token')
          localStorage.removeItem('current_user')
          await supabase.auth.signOut()
          next({
            name: 'VerifyEmail',
            query: { email: userData.email }
          })
          return
        }
      } else {
        // No user data stored - check from Supabase
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: dbUser } = await supabase
            .from('users')
            .select('email, email_verified')
            .eq('id', user.id)
            .single()

          if (dbUser && !dbUser.email_verified) {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('current_user')
            await supabase.auth.signOut()
            next({
              name: 'VerifyEmail',
              query: { email: dbUser.email }
            })
            return
          }
        }
      }
    } catch (err) {
      console.error('Email verification check error:', err)
      // On error, clear auth and redirect to login
      localStorage.removeItem('auth_token')
      localStorage.removeItem('current_user')
      next({ name: 'Auth' })
      return
    }
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
