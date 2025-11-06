/**
 * Composable: useProfile
 * Maneja el estado reactivo y coordinación para el perfil del usuario
 */

import { ref, computed, watch } from 'vue'
import { getProfile } from '@/services/profile/getProfile'
import { updateProfile } from '@/services/profile/updateProfile'
import { showSuccess, showError } from '@/modules/notifications'
import { useAuth } from '@/composables/useAuth'

// Estado global del perfil (singleton pattern)
const profile = ref(null)
const loading = ref(false)
const error = ref(null)
let hasInitialized = false

export function useProfile() {
  // Obtener userId del sistema de autenticación
  const { userId } = useAuth()

  // Computed properties
  const username = computed(() => profile.value?.username || '')
  const initialBalance = computed(() => profile.value?.initialBalance || 0)
  const hasProfile = computed(() => profile.value !== null)

  /**
   * Obtiene el perfil del usuario
   */
  const fetchProfile = async () => {
    // No intentar cargar si no hay usuario autenticado
    if (!userId.value) {
      return
    }

    loading.value = true
    error.value = null

    try {
      profile.value = await getProfile(userId.value)
    } catch (err) {
      error.value = err.message
      await showError(err.message)
    } finally {
      loading.value = false
    }
  }

  // Watch para cargar perfil cuando userId esté disponible
  // Solo se ejecuta una vez gracias a hasInitialized
  if (!hasInitialized) {
    watch(
      userId,
      (newUserId) => {
        if (newUserId && !profile.value) {
          fetchProfile()
          hasInitialized = true
        } else if (!newUserId) {
          // Limpiar perfil cuando se cierra sesión
          profile.value = null
          error.value = null
          hasInitialized = false
        }
      },
      { immediate: true }
    )
  }

  /**
   * Actualiza el perfil del usuario
   * @param {Object} data - Datos del perfil a actualizar
   */
  const update = async (data) => {
    if (!userId.value) {
      await showError('No hay usuario autenticado')
      return
    }

    loading.value = true
    error.value = null

    try {
      profile.value = await updateProfile(userId.value, data)
      await showSuccess('Perfil actualizado correctamente')
      return { success: true }
    } catch (err) {
      error.value = err.message
      await showError(err.message)
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  return {
    // Estado
    profile,
    loading,
    error,

    // Computed
    username,
    initialBalance,
    hasProfile,

    // Métodos
    fetchProfile,
    update
  }
}
