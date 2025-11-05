/**
 * Composable: useExpenses
 * Maneja el estado reactivo y coordinación para gastos
 */

import { ref, computed, onMounted } from 'vue'
import { getAll } from '@/services/expenses/getAll'
import { create } from '@/services/expenses/create'
import { deleteExpense } from '@/services/expenses/delete'
import { showSuccess, showError, confirmDelete } from '@/modules/notifications'
import { calculateTotalExpenses } from '@/modules/expenses'

export function useExpenses() {
  // Estado reactivo
  const expenses = ref([])
  const loading = ref(false)
  const error = ref(null)
  const searchTerm = ref('')

  // TODO: Obtener userId del sistema de autenticación real
  const userId = ref('demo-user-id')

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
      await showSuccess('Gasto eliminado exitosamente')
    } catch (err) {
      error.value = err.message
      await showError(err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Carga inicial de gastos
  onMounted(() => {
    fetchExpenses()
  })

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
