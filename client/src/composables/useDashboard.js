/**
 * Composable: useDashboard
 * Maneja el estado reactivo y coordinación para el dashboard
 */

import { ref, computed, watch } from 'vue'
import { getStats } from '@/services/dashboard/getStats'
import { showError } from '@/modules/notifications'
import { useAuth } from '@/composables/useAuth'

// Estado global del dashboard (singleton pattern)
const stats = ref(null)
const loading = ref(false)
const error = ref(null)
let hasInitialized = false

export function useDashboard() {
  // Obtener userId del sistema de autenticación
  const { userId } = useAuth()

  // Computed properties para acceso fácil a los datos
  const currentBalance = computed(() => stats.value?.currentBalance || 0)
  const totalExpenses = computed(() => stats.value?.totalExpenses || 0)
  const initialBalance = computed(() => stats.value?.initialBalance || 0)
  const expenseCount = computed(() => stats.value?.expenseCount || 0)
  const categoryCount = computed(() => stats.value?.categoryCount || 0)
  const expensesByCategory = computed(() => stats.value?.expensesByCategory || [])
  const recentExpenses = computed(() => stats.value?.recentExpenses || [])
  const topCategory = computed(() => stats.value?.topCategory)
  const username = computed(() => stats.value?.username || 'Usuario')

  // Indica si hay datos para mostrar
  const hasData = computed(() => stats.value && expenseCount.value > 0)

  // Indica si el balance es positivo
  const hasPositiveBalance = computed(() => currentBalance.value > 0)

  // Porcentaje gastado del balance inicial
  const spentPercentage = computed(() => {
    if (initialBalance.value === 0) return 0
    return Math.min((totalExpenses.value / initialBalance.value) * 100, 100)
  })

  /**
   * Obtiene las estadísticas del dashboard
   */
  const fetchStats = async () => {
    // No intentar cargar si no hay usuario autenticado
    if (!userId.value) {
      console.warn('No hay usuario autenticado')
      return
    }

    loading.value = true
    error.value = null
    
    try {
      stats.value = await getStats(userId.value)
    } catch (err) {
      error.value = err.message
      await showError(`Error al obtener estadísticas: ${err.message}`)
    } finally {
      loading.value = false
    }
  }

  /**
   * Refresca las estadísticas del dashboard
   */
  const refreshStats = async () => {
    await fetchStats()
  }

  /**
   * Invalida el cache y fuerza recarga de estadísticas
   * Útil cuando se crean/eliminan gastos o categorías
   */
  const invalidateCache = () => {
    stats.value = null
    hasInitialized = false
  }

  // Watch para cargar estadísticas cuando userId esté disponible
  // Solo se ejecuta una vez gracias a hasInitialized
  if (!hasInitialized) {
    watch(
      userId,
      (newUserId) => {
        if (newUserId && !stats.value) {
          fetchStats()
          hasInitialized = true
        } else if (!newUserId) {
          // Limpiar estadísticas cuando se cierra sesión
          stats.value = null
          error.value = null
          hasInitialized = false
        }
      },
      { immediate: true }
    )
  }

  return {
    // Estado
    stats,
    loading,
    error,
    
    // Computed
    currentBalance,
    totalExpenses,
    initialBalance,
    expenseCount,
    categoryCount,
    expensesByCategory,
    recentExpenses,
    topCategory,
    username,
    hasData,
    hasPositiveBalance,
    spentPercentage,
    
    // Métodos
    fetchStats,
    refreshStats,
    invalidateCache
  }
}
