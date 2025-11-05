/**
 * Composable: useDashboard
 * Maneja el estado reactivo y coordinación para el dashboard
 */

import { ref, computed, onMounted } from 'vue'
import { getStats } from '@/services/dashboard/getStats'
import { showError } from '@/modules/notifications'

export function useDashboard() {
  // Estado reactivo
  const stats = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // TODO: Obtener userId del sistema de autenticación real
  const userId = ref('demo-user-id')

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
    loading.value = true
    error.value = null
    
    try {
      stats.value = await getStats(userId.value)
    } catch (err) {
      error.value = err.message
      await showError(err.message)
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

  // Cargar estadísticas al montar
  onMounted(() => {
    fetchStats()
  })

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
    refreshStats
  }
}
