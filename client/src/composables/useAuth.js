/**
 * Composable de Autenticación
 * Maneja el estado reactivo y coordinación de autenticación
 * Views → useAuth → Services → Modules → Supabase
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/api/supabase'
import { register as registerService } from '@/services/auth/register'
import { login as loginService } from '@/services/auth/login'
import { logout as logoutService } from '@/services/auth/logout'
import { getCurrentSession } from '@/services/auth/getCurrentSession'
import { translateAuthError, transformAuthUser } from '@/modules/auth'
import { showSuccess, showError } from '@/modules/notifications'

// Estado global de autenticación (singleton pattern)
const user = ref(null)
const session = ref(null)
const loading = ref(true)
const authStateChangeSubscription = ref(null)

export function useAuth() {
  const router = useRouter()

  // Computed properties
  const isAuthenticated = computed(() => !!session.value && !!user.value)
  const userEmail = computed(() => user.value?.email || null)
  const userId = computed(() => user.value?.id || null)

  /**
   * Registra un nuevo usuario
   * @param {Object} credentials - username, email, password
   */
  const register = async (credentials) => {
    loading.value = true
    try {
      const result = await registerService(credentials)
      
      await showSuccess('¡Cuenta creada!')

      return {
        success: true,
        requiresEmailConfirmation: result.requiresEmailConfirmation
      }
    } catch (error) {
      // Manejar error de usuario ya registrado
      if (error.message.includes('already registered') || 
          error.message.includes('User already registered')) {
        await showError('Este correo ya está registrado. Intenta iniciar sesión.')
        return { success: false, alreadyExists: true }
      }

      const translatedError = translateAuthError(error.message)
      await showError(translatedError)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Inicia sesión con email y contraseña
   * @param {Object} credentials - email, password
   */
  const login = async (credentials) => {
    loading.value = true
    try {
      const { user: authUser, session: authSession } = await loginService(credentials)
      
      user.value = transformAuthUser(authUser)
      session.value = authSession
      
      // Redirigir al dashboard
      router.push('/dashboard')
    } catch (error) {
      const translatedError = translateAuthError(error.message)
      await showError(translatedError)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Cierra sesión del usuario actual
   */
  const logout = async () => {
    loading.value = true
    try {
      await logoutService()
      
      user.value = null
      session.value = null
      
      // Redirigir al login
      router.push('/login')
    } catch (error) {
      await showError('Error al cerrar sesión: ' + error.message)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Verifica si hay una sesión activa
   */
  const checkAuth = async () => {
    loading.value = true
    try {
      const { user: currentUser, session: currentSession } = await getCurrentSession()
      
      if (currentUser && currentSession) {
        user.value = transformAuthUser(currentUser)
        session.value = currentSession
      } else {
        user.value = null
        session.value = null
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error)
      user.value = null
      session.value = null
    } finally {
      loading.value = false
    }
  }

  /**
   * Configura listener para cambios en el estado de autenticación
   */
  const setupAuthListener = () => {
    // Limpiar suscripción anterior si existe
    if (authStateChangeSubscription.value) {
      authStateChangeSubscription.value.unsubscribe()
    }

    // Crear nueva suscripción
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        // console.log('Auth event:', event)

        if (event === 'SIGNED_IN' && currentSession) {
          user.value = transformAuthUser(currentSession.user)
          session.value = currentSession
        } else if (event === 'SIGNED_OUT') {
          user.value = null
          session.value = null
        } else if (event === 'TOKEN_REFRESHED' && currentSession) {
          session.value = currentSession
        } else if (event === 'USER_UPDATED' && currentSession) {
          user.value = transformAuthUser(currentSession.user)
        }
      }
    )

    authStateChangeSubscription.value = subscription
  }

  // Lifecycle hooks
  onMounted(() => {
    setupAuthListener()
    checkAuth()
  })

  onUnmounted(() => {
    if (authStateChangeSubscription.value) {
      authStateChangeSubscription.value.unsubscribe()
    }
  })

  return {
    // State
    user,
    session,
    loading,
    
    // Computed
    isAuthenticated,
    userEmail,
    userId,
    
    // Methods
    register,
    login,
    logout,
    checkAuth
  }
}
