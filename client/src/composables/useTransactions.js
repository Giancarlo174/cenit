/**
 * Composable: useTransactions
 * Maneja el estado reactivo y coordinación para transacciones (ingresos y gastos)
 */

import { ref, computed, watch } from 'vue'
import { getAll } from '@/services/transactions/getAll'
import { create } from '@/services/transactions/create'
import { update } from '@/services/transactions/update'
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
const selectedType = ref(null) // 'income' | 'expense' | null (sin filtro)
const sortOrder = ref(null) // 'desc' (mayor) | 'asc' (menor) | null (sin orden)
const dateFrom = ref('')
const dateTo = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(15)
let hasInitialized = false

export function useTransactions() {
  // Obtener userId del sistema de autenticación
  const { userId } = useAuth()
  const { invalidateCache: invalidateDashboardCache, refreshStats } = useDashboard()

  // Transacciones filtradas por búsqueda, tipo, fechas y ordenamiento
  const filteredTransactions = computed(() => {
    let filtered = transactions.value

    // Filtrar por tipo si está seleccionado
    if (selectedType.value) {
      filtered = filterByType(filtered, selectedType.value)
    }

    // Filtrar por rango de fechas
    // Usar transactionDate (camelCase) que viene transformado desde DB
    if (dateFrom.value) {
      filtered = filtered.filter(transaction => 
        transaction.transactionDate >= dateFrom.value
      )
    }
    
    if (dateTo.value) {
      filtered = filtered.filter(transaction => 
        transaction.transactionDate <= dateTo.value
      )
    }

    // Filtrar por búsqueda (nombre o monto)
    if (searchTerm.value.trim()) {
      const search = searchTerm.value.toLowerCase()
      filtered = filtered.filter(transaction =>
        transaction.name?.toLowerCase().includes(search) ||
        transaction.amount.toString().includes(search)
      )
    }

    // Ordenar por monto si está seleccionado
    if (sortOrder.value) {
      filtered = [...filtered].sort((a, b) => {
        if (sortOrder.value === 'desc') {
          return b.amount - a.amount // Mayor a menor
        } else {
          return a.amount - b.amount // Menor a mayor
        }
      })
    }

    return filtered
  })

  // Total de items filtrados
  const totalItems = computed(() => filteredTransactions.value.length)

  // Total de páginas
  const totalPages = computed(() => 
    Math.ceil(filteredTransactions.value.length / itemsPerPage.value)
  )

  // Índices para paginación
  const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
  const endIndex = computed(() => startIndex.value + itemsPerPage.value)

  // Transacciones paginadas
  const paginatedTransactions = computed(() => {
    return filteredTransactions.value.slice(startIndex.value, endIndex.value)
  })

  // Información de paginación para mostrar "Mostrando X-Y de Z"
  const paginationInfo = computed(() => {
    const start = totalItems.value === 0 ? 0 : startIndex.value + 1
    const end = Math.min(endIndex.value, totalItems.value)
    return { start, end, total: totalItems.value }
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
      
      // Invalidar cache del dashboard y refrescar estadísticas
      invalidateDashboardCache()
      await refreshStats()
      
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
    const itemName = transaction.name || `${type} de $${transaction.amount}`
    const confirmed = await confirmDelete(itemName)
    if (!confirmed) return

    loading.value = true
    error.value = null
    
    try {
      await deleteTransaction(transaction.id)
      transactions.value = transactions.value.filter(t => t.id !== transaction.id)
      
      // Invalidar cache del dashboard y refrescar estadísticas
      invalidateDashboardCache()
      await refreshStats()
      
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
   * Actualiza una transacción existente
   * @param {string} id - ID de la transacción
   * @param {Object} transactionData - Datos actualizados
   */
  const updateTransaction = async (id, transactionData) => {
    loading.value = true
    error.value = null
    
    try {
      const updatedTransaction = await update(id, transactionData, userId.value)
      
      // Actualizar en el array local
      const index = transactions.value.findIndex(t => t.id === id)
      if (index !== -1) {
        transactions.value[index] = updatedTransaction
      }
      
      // Invalidar cache del dashboard y refrescar estadísticas
      invalidateDashboardCache()
      await refreshStats()
      
      const type = transactionData.type === 'income' ? 'Ingreso' : 'Gasto'
      await showSuccess(`${type} actualizado exitosamente`)
      return updatedTransaction
    } catch (err) {
      error.value = err.message
      await showError(err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cambia a una página específica
   * @param {number} page - Número de página
   */
  const setPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  /**
   * Avanza a la siguiente página
   */
  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
    }
  }

  /**
   * Retrocede a la página anterior
   */
  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }

  /**
   * Va a la primera página
   */
  const firstPage = () => {
    currentPage.value = 1
  }

  /**
   * Va a la última página
   */
  const lastPage = () => {
    if (totalPages.value > 0) {
      currentPage.value = totalPages.value
    }
  }

  /**
   * Cambia la cantidad de items por página y resetea a página 1
   * @param {number} value - Cantidad de items por página
   */
  const setItemsPerPage = (value) => {
    itemsPerPage.value = value
    currentPage.value = 1
  }

  /**
   * Establece el filtro por tipo
   * @param {'income' | 'expense' | null} type - Tipo a filtrar
   */
  const setTypeFilter = (type) => {
    selectedType.value = type
    currentPage.value = 1 // Resetear a página 1 al cambiar filtro
  }

  /**
   * Limpia todos los filtros aplicados
   */
  const clearFilters = () => {
    searchTerm.value = ''
    selectedType.value = null
    sortOrder.value = null
    dateFrom.value = ''
    dateTo.value = ''
    currentPage.value = 1
  }

  // Watch para resetear página cuando cambien filtros
  watch([searchTerm, sortOrder, dateFrom, dateTo], () => {
    currentPage.value = 1
  })

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
          sortOrder.value = null
          dateFrom.value = ''
          dateTo.value = ''
          currentPage.value = 1
          itemsPerPage.value = 15
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
    paginatedTransactions,
    incomes,
    expenses,
    loading,
    error,
    searchTerm,
    selectedType,
    sortOrder,
    dateFrom,
    dateTo,
    currentPage,
    itemsPerPage,
    
    // Computed - Totales
    totalIncome,
    totalExpenses,
    currentBalance,
    
    // Computed - Indicadores
    hasTransactions,
    hasIncomes,
    hasExpenses,
    
    // Computed - Paginación
    totalItems,
    totalPages,
    paginationInfo,
    
    // Métodos
    fetchTransactions,
    createTransaction,
    updateTransaction,
    removeTransaction,
    setTypeFilter,
    clearFilters,
    
    // Métodos - Paginación
    setPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setItemsPerPage
  }
}
