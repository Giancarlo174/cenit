/**
 * Composable: useExpenses
 * Maneja el estado reactivo y coordinación para gastos
 */

import { ref, computed, watch } from 'vue'
import { getAll } from '@/services/expenses/getAll'
import { create } from '@/services/expenses/create'
import { deleteExpense } from '@/services/expenses/delete'
import { showSuccess, showError, confirmDelete } from '@/modules/notifications'
import { calculateTotalExpenses } from '@/modules/expenses'
import { useAuth } from '@/composables/useAuth'
import { useDashboard } from '@/composables/useDashboard'

// Estado global de gastos (singleton pattern)
const expenses = ref([])
const loading = ref(false)
const error = ref(null)
const searchTerm = ref('')
let hasInitialized = false

export function useExpenses() {
  // Obtener userId del sistema de autenticación
  const { userId } = useAuth()
  const { invalidateCache: invalidateDashboardCache } = useDashboard()

  // Gastos filtrados por búsqueda (descripción o monto)
  const filteredExpenses = computed(() => {
    if (!searchTerm.value.trim()) {
      return expenses.value
    }
    
    const search = searchTerm.value.toLowerCase()
    return expenses.value.filter(expense =>
      expense.description?.toLowerCase().includes(search) ||
      expense.amount.toString().includes(search)
    )
  })

  // Total de gastos
  const totalExpenses = computed(() => calculateTotalExpenses(expenses.value))

  // Indica si hay gastos
  const hasExpenses = computed(() => expenses.value.length > 0)

  /**
   * Obtiene todos los gastos del usuario
   */
  const fetchExpenses = async () => {
    // No intentar cargar si no hay usuario autenticado
    if (!userId.value) {
      console.warn('No hay usuario autenticado')
      return
    }

    loading.value = true
    error.value = null
    
    try {
      expenses.value = await getAll(userId.value)
    } catch (err) {
      error.value = err.message
      await showError(err.message)
    } finally {
      loading.value = false
    }
  }

  /**
   * Crea un nuevo gasto
   * @param {Object} expenseData - Datos del gasto
   */
  const createExpense = async (expenseData) => {
    loading.value = true
    error.value = null
    
    try {
      const newExpense = await create(expenseData, userId.value)
      expenses.value.unshift(newExpense)
      
      // Invalidar cache del dashboard para que se actualice
      invalidateDashboardCache()
      
      await showSuccess('Gasto registrado exitosamente')
      return newExpense
    } catch (err) {
      error.value = err.message
      await showError(err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Elimina un gasto con confirmación
   * @param {Object} expense - Gasto a eliminar
   */
  const removeExpense = async (expense) => {
    const itemName = expense.description || `Gasto de $${expense.amount}`
    const confirmed = await confirmDelete(itemName)
    if (!confirmed) return

    loading.value = true
    error.value = null
    
    try {
      await deleteExpense(expense.id)
      expenses.value = expenses.value.filter(exp => exp.id !== expense.id)
      
      // Invalidar cache del dashboard para que se actualice
      invalidateDashboardCache()
      
      await showSuccess('Gasto eliminado exitosamente')
    } catch (err) {
      error.value = err.message
      await showError(err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Watch para cargar gastos cuando userId esté disponible
  // Solo se ejecuta una vez gracias a hasInitialized
  if (!hasInitialized) {
    watch(
      userId,
      (newUserId) => {
        if (newUserId && expenses.value.length === 0) {
          fetchExpenses()
          hasInitialized = true
        } else if (!newUserId) {
          // Limpiar gastos cuando se cierra sesión
          expenses.value = []
          error.value = null
          searchTerm.value = ''
          hasInitialized = false
        }
      },
      { immediate: true }
    )
  }

  return {
    // Estado
    expenses,
    filteredExpenses,
    loading,
    error,
    searchTerm,
    hasExpenses,
    totalExpenses,
    
    // Métodos
    fetchExpenses,
    createExpense,
    removeExpense
  }
}
