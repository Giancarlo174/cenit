import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/api/supabase'

// Views - Auth
import Login from '@/views/auth/Login.vue'
import Register from '@/views/auth/Register.vue'
import Callback from '@/views/auth/Callback.vue'
import ForgotPassword from '@/views/auth/ForgotPassword.vue'
import ResetPassword from '@/views/auth/ResetPassword.vue'

// Views - App
import Dashboard from '@/views/dashboard/Dashboard.vue'
import CategoriesList from '@/views/categories/CategoriesList.vue'
import EditCategory from '@/views/categories/EditCategory.vue'
import TransactionsList from '@/views/transactions/TransactionsList.vue'
import ProfileSettings from '@/views/profile/ProfileSettings.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  // Rutas públicas (no requieren autenticación)
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: { requiresGuest: true }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword
    // Sin meta - accesible para todos (necesita token en URL)
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: Callback
  },
  // Rutas protegidas (requieren autenticación)
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/categories',
    name: 'CategoriesList',
    component: CategoriesList,
    meta: { requiresAuth: true }
  },
  {
    path: '/categories/:id',
    name: 'EditCategory',
    component: EditCategory,
    meta: { requiresAuth: true }
  },
  {
    path: '/transactions',
    name: 'TransactionsList',
    component: TransactionsList,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'ProfileSettings',
    component: ProfileSettings,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard para proteger rutas
router.beforeEach(async (to, from, next) => {
  // Verificar si la ruta requiere autenticación
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  // Obtener sesión actual
  const { data: { session } } = await supabase.auth.getSession()
  const isAuthenticated = !!session

  // Si la ruta requiere autenticación y no hay sesión
  if (requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  // Si la ruta requiere ser invitado (login/register) y ya hay sesión
  if (requiresGuest && isAuthenticated) {
    next('/dashboard')
    return
  }

  // Permitir navegación
  next()
})

export default router
