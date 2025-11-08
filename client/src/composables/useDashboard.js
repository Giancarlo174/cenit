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
  const totalIncome = computed(() => stats.value?.totalIncome || 0)
  const totalExpenses = computed(() => stats.value?.totalExpenses || 0)
  const transactionCount = computed(() => stats.value?.transactionCount || 0)
  const incomeCount = computed(() => stats.value?.incomeCount || 0)
  const expenseCount = computed(() => stats.value?.expenseCount || 0)
  const categoryCount = computed(() => stats.value?.categoryCount || 0)
  const expensesByCategory = computed(() => stats.value?.expensesByCategory || [])
  const incomeByCategory = computed(() => stats.value?.incomeByCategory || [])
  const recentTransactions = computed(() => stats.value?.recentTransactions || [])
  const topExpenseCategory = computed(() => stats.value?.topExpenseCategory)
  const topIncomeCategory = computed(() => stats.value?.topIncomeCategory)
  const username = computed(() => stats.value?.username || 'Usuario')

  // Indica si hay datos para mostrar
  const hasData = computed(() => stats.value && transactionCount.value > 0)

  // Indica si el balance es positivo
  const hasPositiveBalance = computed(() => currentBalance.value > 0)

  // Porcentaje gastado respecto al total de ingresos
  const spentPercentage = computed(() => {
    if (totalIncome.value === 0) return 0
    return Math.min((totalExpenses.value / totalIncome.value) * 100, 100)
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
   * Útil cuando se crean/eliminan transacciones o categorías
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
    
    // Computed - Balance
    currentBalance,
    totalIncome,
    totalExpenses,
    hasPositiveBalance,
    spentPercentage,
    
    // Computed - Contadores
    transactionCount,
    incomeCount,
    expenseCount,
    categoryCount,
    
    // Computed - Categorías
    expensesByCategory,
    incomeByCategory,
    topExpenseCategory,
    topIncomeCategory,
    
    // Computed - Otros
    recentTransactions,
    username,
    hasData,
    
    // Métodos
    fetchStats,
    refreshStats,
    invalidateCache
  }
}
