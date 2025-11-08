/**
 * Composable: useTransactions
 * Maneja el estado reactivo y coordinación para transacciones (ingresos y gastos)
 */

import { ref, computed, watch } from 'vue'
import { getAll } from '@/services/transactions/getAll'
import { create } from '@/services/transactions/create'
import { deleteTransaction } from '@/services/transactions/delete'
import { showSuccess, showError, confirmDelete } from '@/modules/notifications'
import { 
  calculateTotalIncome, 
  calculateTotalExpenses,
  filterByType 
} from '@/modules/transactions'
import { useAuth } from '@/composables/useAuth'
import { useDashboard } from '@/composables/useDashboard'

// Estado global de transacciones (singleton pattern)
const transactions = ref([])
const loading = ref(false)
const error = ref(null)
const searchTerm = ref('')
const selectedType = ref(null) // 'income' | 'expense' | null (todas)
let hasInitialized = false

export function useTransactions() {
  // Obtener userId del sistema de autenticación
  const { userId } = useAuth()
  const { invalidateCache: invalidateDashboardCache } = useDashboard()

  // Transacciones filtradas por búsqueda y tipo
  const filteredTransactions = computed(() => {
    let filtered = transactions.value

    // Filtrar por tipo si está seleccionado
    if (selectedType.value) {
      filtered = filterByType(filtered, selectedType.value)
    }

    // Filtrar por búsqueda (descripción o monto)
    if (searchTerm.value.trim()) {
      const search = searchTerm.value.toLowerCase()
      filtered = filtered.filter(transaction =>
        transaction.description?.toLowerCase().includes(search) ||
        transaction.amount.toString().includes(search)
      )
    }

    return filtered
  })

  // Solo ingresos
  const incomes = computed(() => filterByType(transactions.value, 'income'))

  // Solo gastos
  const expenses = computed(() => filterByType(transactions.value, 'expense'))

  // Totales
  const totalIncome = computed(() => calculateTotalIncome(transactions.value))
  const totalExpenses = computed(() => calculateTotalExpenses(transactions.value))
  const currentBalance = computed(() => totalIncome.value - totalExpenses.value)

  // Indica si hay transacciones
  const hasTransactions = computed(() => transactions.value.length > 0)
  const hasIncomes = computed(() => incomes.value.length > 0)
  const hasExpenses = computed(() => expenses.value.length > 0)

  /**
   * Obtiene todas las transacciones del usuario
   * @param {Object} filters - Filtros opcionales { type, startDate, endDate }
   */
  const fetchTransactions = async (filters = {}) => {
    // No intentar cargar si no hay usuario autenticado
    if (!userId.value) {
      console.warn('No hay usuario autenticado')
      return
    }

    loading.value = true
    error.value = null
    
    try {
      transactions.value = await getAll(userId.value, filters)
    } catch (err) {
      error.value = err.message
      await showError(err.message)
    } finally {
      loading.value = false
    }
  }

  /**
   * Crea una nueva transacción (ingreso o gasto)
   * @param {Object} transactionData - Datos de la transacción
   */
  const createTransaction = async (transactionData) => {
    loading.value = true
    error.value = null
    
    try {
      const newTransaction = await create(transactionData, userId.value)
      transactions.value.unshift(newTransaction)
      
      // Invalidar cache del dashboard para refrescar estadísticas
      invalidateDashboardCache()
      
      const type = transactionData.type === 'income' ? 'Ingreso' : 'Gasto'
      await showSuccess(`${type} registrado exitosamente`)
      return newTransaction
    } catch (err) {
      error.value = err.message
      await showError(err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Elimina una transacción con confirmación
   * @param {Object} transaction - Transacción a eliminar
   */
  const removeTransaction = async (transaction) => {
    const type = transaction.type === 'income' ? 'ingreso' : 'gasto'
    const itemName = transaction.description || `${type} de $${transaction.amount}`
    const confirmed = await confirmDelete(itemName)
    if (!confirmed) return

    loading.value = true
    error.value = null
    
    try {
      await deleteTransaction(transaction.id)
      transactions.value = transactions.value.filter(t => t.id !== transaction.id)
      
      // Invalidar cache del dashboard para refrescar estadísticas
      invalidateDashboardCache()
      
      await showSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} eliminado exitosamente`)
    } catch (err) {
      error.value = err.message
      await showError(err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Establece el filtro por tipo
   * @param {'income' | 'expense' | null} type - Tipo a filtrar
   */
  const setTypeFilter = (type) => {
    selectedType.value = type
  }

  // Watch para cargar transacciones cuando userId esté disponible
  // Solo se ejecuta una vez gracias a hasInitialized
  if (!hasInitialized) {
    watch(
      userId,
      (newUserId) => {
        if (newUserId && transactions.value.length === 0) {
          fetchTransactions()
          hasInitialized = true
        } else if (!newUserId) {
          // Limpiar transacciones cuando se cierra sesión
          transactions.value = []
          error.value = null
          searchTerm.value = ''
          selectedType.value = null
          hasInitialized = false
        }
      },
      { immediate: true }
    )
  }

  return {
    // Estado
    transactions,
    filteredTransactions,
    incomes,
    expenses,
    loading,
    error,
    searchTerm,
    selectedType,
    
    // Computed - Totales
    totalIncome,
    totalExpenses,
    currentBalance,
    
    // Computed - Indicadores
    hasTransactions,
    hasIncomes,
    hasExpenses,
    
    // Métodos
    fetchTransactions,
    createTransaction,
    removeTransaction,
    setTypeFilter
  }
}
