/**
 * Composable: useDashboard
 * Maneja el estado reactivo y coordinación para el dashboard
 */

import { ref, computed, watch } from 'vue'
import { getStats } from '@/services/dashboard/getStats'
import { showError } from '@/modules/notifications'
import { groupTransactionsByPeriod } from '@/modules/dashboard'
import { useAuth } from '@/composables/useAuth'

// Estado global del dashboard (singleton pattern)
const stats = ref(null)
const loading = ref(false)
const error = ref(null)
const period = ref('month') // 'day' | 'week' | 'month' (renombrado a 'dias', 'semanas', 'meses' conceptualmente)

// Sistema jerárquico de navegación temporal
const today = new Date()
const selectedYear = ref(today.getFullYear())
const selectedMonth = ref(today.getMonth() + 1) // 1-12
const selectedWeek = ref(1) // 1-5 (semana del mes)

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

  // Datos agrupados para el gráfico según periodo y selección jerárquica
  const chartData = computed(() => {
    if (!stats.value || !stats.value.allTransactions) {
      return []
    }
    
    return groupTransactionsByPeriod(
      stats.value.allTransactions, // Usar TODAS las transacciones, no solo recientes
      period.value,
      {
        year: selectedYear.value,
        month: selectedMonth.value,
        week: selectedWeek.value
      }
    )
  })

  // Años disponibles basados en transacciones
  const availableYears = computed(() => {
    if (!stats.value || !stats.value.allTransactions) return [today.getFullYear()]
    
    const years = new Set()
    stats.value.allTransactions.forEach(t => {
      // IMPORTANTE: Extraer año del string para evitar problemas de zona horaria
      const [year] = t.transactionDate.split('-').map(Number)
      years.add(year)
    })
    
    return Array.from(years).sort((a, b) => b - a) // Más reciente primero
  })

  // Meses disponibles para el año seleccionado (1-12)
  const availableMonths = computed(() => {
    if (!stats.value || !stats.value.allTransactions) return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    
    const months = new Set()
    stats.value.allTransactions.forEach(t => {
      // Extraer año-mes del string para evitar problemas de zona horaria
      const [tYear, tMonth] = t.transactionDate.split('-').map(Number)
      if (tYear === selectedYear.value) {
        months.add(tMonth)
      }
    })
    
    // Si no hay meses con datos, retornar todos para que el selector funcione
    return months.size > 0 
      ? Array.from(months).sort((a, b) => a - b)
      : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  })

  // Semanas disponibles para el mes seleccionado (1-5)
  const availableWeeks = computed(() => {
    // Calcular cuántas semanas tiene el mes seleccionado
    const year = selectedYear.value
    const month = selectedMonth.value - 1 // Date usa 0-11
    const lastDay = new Date(year, month + 1, 0).getDate()
    const weeks = Math.ceil(lastDay / 7)
    
    return Array.from({ length: weeks }, (_, i) => i + 1)
  })

  // Label descriptivo del periodo actual
  const periodLabel = computed(() => {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    
    switch (period.value) {
      case 'day': {
        // "Semana 1-7 de Noviembre 2025"
        const monthName = monthNames[selectedMonth.value - 1]
        const startDay = (selectedWeek.value - 1) * 7 + 1
        const lastDayOfMonth = new Date(selectedYear.value, selectedMonth.value, 0).getDate()
        const endDay = Math.min(selectedWeek.value * 7, lastDayOfMonth)
        
        return `Semana ${startDay}-${endDay} de ${monthName} ${selectedYear.value}`
      }
      
      case 'week': {
        // "Octubre 2025"
        const monthName = monthNames[selectedMonth.value - 1]
        return `${monthName} ${selectedYear.value}`
      }
      
      case 'month': {
        // "2025"
        return `${selectedYear.value}`
      }
      
      default:
        return ''
    }
  })

  /**
   * Obtiene las estadísticas del dashboard
   */
  const fetchStats = async () => {
    // No intentar cargar si no hay usuario autenticado
    if (!userId.value) {
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
   * Cambia el periodo de visualización del gráfico
   * @param {string} newPeriod - 'day' | 'week' | 'month'
   */
  const setPeriod = (newPeriod) => {
    if (['day', 'week', 'month'].includes(newPeriod)) {
      period.value = newPeriod
      
      // Al cambiar de periodo, ajustar selecciones para que tenga sentido
      if (newPeriod === 'month') {
        // Modo meses: solo necesitamos año
        // Mantener año actual
      } else if (newPeriod === 'week') {
        // Modo semanas: necesitamos año y mes
        // Si no hay mes seleccionado válido, usar el actual
        const currentMonth = new Date().getMonth() + 1
        if (!availableMonths.value.includes(selectedMonth.value)) {
          selectedMonth.value = currentMonth
        }
      } else if (newPeriod === 'day') {
        // Modo días: necesitamos año, mes y semana
        // Asegurar que mes y semana sean válidos
        const currentMonth = new Date().getMonth() + 1
        if (!availableMonths.value.includes(selectedMonth.value)) {
          selectedMonth.value = currentMonth
        }
        if (!availableWeeks.value.includes(selectedWeek.value)) {
          selectedWeek.value = 1
        }
      }
    }
  }

  /**
   * Cambia el año seleccionado
   * @param {number} year
   */
  const setYear = (year) => {
    selectedYear.value = year
    
    // Validar que el mes actual exista en el nuevo año
    // Si no, seleccionar el primer mes disponible
    const months = availableMonths.value
    if (!months.includes(selectedMonth.value)) {
      selectedMonth.value = months[0] || 1
    }
    
    // Re-validar semana
    const weeks = availableWeeks.value
    if (!weeks.includes(selectedWeek.value)) {
      selectedWeek.value = 1
    }
  }

  /**
   * Cambia el mes seleccionado
   * @param {number} month - 1-12
   */
  const setMonth = (month) => {
    selectedMonth.value = month
    
    // Re-validar semana para el nuevo mes
    const weeks = availableWeeks.value
    if (!weeks.includes(selectedWeek.value)) {
      selectedWeek.value = 1
    }
  }

  /**
   * Cambia la semana seleccionada
   * @param {number} week - 1-5
   */
  const setWeek = (week) => {
    selectedWeek.value = week
  }

  /**
   * Navega hacia adelante o atrás en el tiempo según el periodo (LEGACY - mantener por compatibilidad)
   * @param {number} direction - 1 para adelante, -1 para atrás
   */
  const navigateDate = (direction) => {
    switch (period.value) {
      case 'day':
        // Navegar semanas
        setWeek(selectedWeek.value + direction)
        break
      case 'week':
        // Navegar meses
        setMonth(selectedMonth.value + direction)
        break
      case 'month':
        // Navegar años
        setYear(selectedYear.value + direction)
        break
    }
  }

  /**
   * Vuelve a la fecha actual (hoy)
   */
  const goToToday = () => {
    const now = new Date()
    selectedYear.value = now.getFullYear()
    selectedMonth.value = now.getMonth() + 1
    
    // Calcular semana actual del mes
    const day = now.getDate()
    selectedWeek.value = Math.ceil(day / 7)
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
          period.value = 'month'
          
          const now = new Date()
          selectedYear.value = now.getFullYear()
          selectedMonth.value = now.getMonth() + 1
          selectedWeek.value = Math.ceil(now.getDate() / 7)
          
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
    period,
    
    // Estado jerárquico temporal
    selectedYear,
    selectedMonth,
    selectedWeek,
    availableYears,
    availableMonths,
    availableWeeks,
    
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
    
    // Computed - Gráfico
    chartData,
    periodLabel,
    
    // Métodos
    fetchStats,
    refreshStats,
    invalidateCache,
    
    // Métodos - Gráfico
    setPeriod,
    setYear,
    setMonth,
    setWeek,
    navigateDate, // Legacy
    goToToday
  }
}
