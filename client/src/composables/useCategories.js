/**
 * Composable: useCategories
 * Maneja el estado reactivo y coordinación para categorías
 */

import { ref, computed, watch } from 'vue'
import { getAll } from '@/services/categories/getAll'
import { create } from '@/services/categories/create'
import { deleteCategory } from '@/services/categories/delete'
import { updateCategory } from '@/services/categories/update'
import { bulkUpdateOrder } from '@/services/categories/bulkUpdateOrder'
import { getUncategorized } from '@/services/transactions/getUncategorized'
import { assignCategory } from '@/services/transactions/assignCategory'
import { showSuccess, showError, confirmDelete } from '@/modules/notifications'
import { getIncomeCategories, getExpenseCategories } from '@/modules/categories'
import { useAuth } from '@/composables/useAuth'
import { useDashboard } from '@/composables/useDashboard'
import { useTransactions } from '@/composables/useTransactions'

// Estado global de categorías (singleton pattern)
const categories = ref([])
const loading = ref(false)
const error = ref(null)
const searchTerm = ref('')
const selectedType = ref(null) // 'income' | 'expense' | null (todas)
const sortOrder = ref(null) // 'asc' (A-Z) | 'desc' (Z-A) | null (sin orden)
const currentPage = ref(1)
const itemsPerPage = ref(15)

// Estado para drag-and-drop
const isReorderMode = ref(false) // Modo de reordenamiento activo
const localCategoriesOrder = ref([]) // Orden local temporal
const isSavingOrder = ref(false) // Guardando orden en la BD

let hasInitialized = false

export function useCategories() {
  // Obtener userId del sistema de autenticación
  const { userId } = useAuth()
  const { invalidateCache: invalidateDashboardCache } = useDashboard()
  
  // Obtener transacciones para calcular montos por categoría
  const { transactions } = useTransactions()

  /**
   * Calcula el monto total de transacciones para una categoría
   * @param {string} categoryId - ID de la categoría
   * @returns {number} Monto total
   */
  const calculateCategoryAmount = (categoryId) => {
    if (!categoryId) return 0
    
    return transactions.value
      .filter(t => t.categoryId === categoryId)
      .reduce((sum, t) => sum + t.amount, 0)
  }

  // Categorías filtradas por búsqueda y tipo
  const filteredCategories = computed(() => {
    let filtered = categories.value

    // Filtrar por tipo si está seleccionado
    if (selectedType.value === 'income') {
      filtered = getIncomeCategories(filtered)
    } else if (selectedType.value === 'expense') {
      filtered = getExpenseCategories(filtered)
    }

    // Filtrar por búsqueda
    if (searchTerm.value.trim()) {
      filtered = filtered.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.value.toLowerCase())
      )
    }

    // IMPORTANTE: Si hay orden por monto, usar ese
    // Si NO hay orden por monto, ordenar por position (orden manual)
    if (sortOrder.value) {
      filtered = [...filtered].sort((a, b) => {
        const amountA = calculateCategoryAmount(a.id)
        const amountB = calculateCategoryAmount(b.id)
        
        if (sortOrder.value === 'desc') {
          return amountB - amountA // Mayor a menor
        } else {
          return amountA - amountB // Menor a mayor
        }
      })
    } else {
      // Orden por position (manual del usuario)
      filtered = [...filtered].sort((a, b) => a.position - b.position)
    }

    return filtered
  })

  // Total de items filtrados
  const totalItems = computed(() => filteredCategories.value.length)

  // Total de páginas
  const totalPages = computed(() => 
    Math.ceil(filteredCategories.value.length / itemsPerPage.value)
  )

  // Índices para paginación
  const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
  const endIndex = computed(() => startIndex.value + itemsPerPage.value)

  // Categorías paginadas
  const paginatedCategories = computed(() => {
    return filteredCategories.value.slice(startIndex.value, endIndex.value)
  })

  // Categorías paginadas enriquecidas con monto total
  const paginatedCategoriesWithAmount = computed(() => {
    return paginatedCategories.value.map(category => ({
      ...category,
      totalAmount: calculateCategoryAmount(category.id)
    }))
  })

  // Información de paginación para mostrar "Mostrando X-Y de Z"
  const paginationInfo = computed(() => {
    const start = totalItems.value === 0 ? 0 : startIndex.value + 1
    const end = Math.min(endIndex.value, totalItems.value)
    return { start, end, total: totalItems.value }
  })

  // Solo categorías de ingresos
  const incomeCategories = computed(() => getIncomeCategories(categories.value))

  // Solo categorías de gastos
  const expenseCategories = computed(() => getExpenseCategories(categories.value))

  // Indica si hay categorías
  const hasCategories = computed(() => categories.value.length > 0)
  const hasIncomeCategories = computed(() => incomeCategories.value.length > 0)
  const hasExpenseCategories = computed(() => expenseCategories.value.length > 0)

  /**
   * Obtiene todas las categorías del usuario
   * @param {Object} filters - Filtros opcionales { type: 'income' | 'expense' }
   */
  const fetchCategories = async (filters = {}) => {
    // No intentar cargar si no hay usuario autenticado
    if (!userId.value) {
      console.warn('No hay usuario autenticado')
      return
    }

    loading.value = true
    error.value = null
    
    try {
      categories.value = await getAll(userId.value, filters)
    } catch (err) {
      error.value = err.message
      await showError(err.message)
    } finally {
      loading.value = false
    }
  }

  /**
   * Crea una nueva categoría
   * @param {Object} categoryData - Datos de la categoría
   */
  const createCategory = async (categoryData) => {
    loading.value = true
    error.value = null
    
    try {
      const newCategory = await create(categoryData, userId.value)
      categories.value.unshift(newCategory)
      
      // Invalidar cache del dashboard para que se actualice el conteo
      invalidateDashboardCache()
      
      await showSuccess('Categoría creada exitosamente')
      return newCategory
    } catch (err) {
      error.value = err.message
      await showError(err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Elimina una categoría con confirmación
   * @param {Object} category - Categoría a eliminar
   */
  const removeCategory = async (category) => {
    const confirmed = await confirmDelete(
      category.name,
      'Las transacciones de esta categoría no serán eliminadas'
    )
    if (!confirmed) return

    loading.value = true
    error.value = null
    
    try {
      await deleteCategory(category.id)
      categories.value = categories.value.filter(cat => cat.id !== category.id)
      
      // Invalidar cache del dashboard para que se actualice el conteo
      invalidateDashboardCache()
      
      await showSuccess('Categoría eliminada exitosamente')
    } catch (err) {
      error.value = err.message
      await showError(err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualiza una categoría existente
   * @param {string} categoryId - ID de la categoría
   * @param {Object} categoryData - Datos actualizados
   */
  const updateCategoryData = async (categoryId, categoryData) => {
    if (!userId.value) return

    loading.value = true
    error.value = null

    try {
      const updatedCategory = await updateCategory(categoryId, categoryData, userId.value)
      
      // Actualizar en el array local
      const index = categories.value.findIndex(c => c.id === categoryId)
      if (index !== -1) {
        categories.value[index] = updatedCategory
      }
      
      await showSuccess('Categoría actualizada exitosamente')
      invalidateDashboardCache()
      return updatedCategory
    } catch (err) {
      error.value = err.message
      await showError(err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene transacciones sin categoría de un tipo específico
   * @param {string} type - Tipo de transacción ('income' | 'expense')
   * @returns {Promise<Array>} Lista de transacciones sin categoría
   */
  const fetchUncategorizedTransactions = async (type) => {
    if (!userId.value) return []

    loading.value = true
    error.value = null

    try {
      const uncategorized = await getUncategorized(userId.value, type)
      return uncategorized
    } catch (err) {
      error.value = err.message
      await showError(err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Asigna una transacción a una categoría
   * @param {string} transactionId - ID de la transacción
   * @param {string} categoryId - ID de la categoría
   */
  const assignTransactionToCategory = async (transactionId, categoryId) => {
    loading.value = true
    error.value = null

    try {
      await assignCategory(transactionId, categoryId)
      
      // Actualizar estado de transacciones
      const { fetchTransactions } = useTransactions()
      await fetchTransactions()
      
      invalidateDashboardCache()
    } catch (err) {
      error.value = err.message
      await showError(err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Remueve una transacción de su categoría (category_id = null)
   * @param {string} transactionId - ID de la transacción
   */
  const removeTransactionFromCategory = async (transactionId) => {
    loading.value = true
    error.value = null

    try {
      await assignCategory(transactionId, null)
      
      // Actualizar estado de transacciones
      const { fetchTransactions } = useTransactions()
      await fetchTransactions()
      
      invalidateDashboardCache()
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
    currentPage.value = 1 // Resetear a página 1 al cambiar filtro
  }

  /**
   * Limpia todos los filtros aplicados
   */
  const clearFilters = () => {
    searchTerm.value = ''
    selectedType.value = null
    sortOrder.value = null
    currentPage.value = 1
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
   * Activa el modo de reordenamiento
   */
  const enableReorderMode = () => {
    // Guardar el orden actual como backup
    localCategoriesOrder.value = categories.value.map(c => c.id)
    isReorderMode.value = true
    
    // Deshabilitar filtros durante reordenamiento
    searchTerm.value = ''
    selectedType.value = null
    sortOrder.value = null
    currentPage.value = 1
  }

  /**
   * Cancela el modo de reordenamiento sin guardar
   */
  const cancelReorderMode = () => {
    isReorderMode.value = false
    localCategoriesOrder.value = []
    
    // Recargar categorías para restaurar orden original
    fetchCategories()
  }

  /**
   * Actualiza el orden local cuando el usuario arrastra
   * @param {number} oldIndex - Índice anterior
   * @param {number} newIndex - Nuevo índice
   */
  const updateLocalOrder = (oldIndex, newIndex) => {
    if (oldIndex === newIndex) return
    
    const item = categories.value.splice(oldIndex, 1)[0]
    categories.value.splice(newIndex, 0, item)
  }

  /**
   * Guarda el nuevo orden en la base de datos
   */
  const saveOrder = async () => {
    if (!userId.value) return

    isSavingOrder.value = true
    error.value = null

    try {
      // Obtener IDs en el orden actual
      const orderedIds = categories.value.map(c => c.id)
      
      // Enviar a la BD
      await bulkUpdateOrder(orderedIds, userId.value)
      
      // Salir del modo reordenamiento
      isReorderMode.value = false
      
      // Recargar desde DB para obtener los position actualizados
      await fetchCategories()
      
      // Invalidar cache del dashboard
      invalidateDashboardCache()
      
      await showSuccess('Orden guardado exitosamente')
    } catch (err) {
      error.value = err.message
      await showError(err.message)
      
      // Recargar categorías para restaurar orden original
      await fetchCategories()
    } finally {
      isSavingOrder.value = false
    }
  }

  /**
   * Verifica si hay cambios pendientes en el orden
   */
  const hasOrderChanges = computed(() => {
    if (!isReorderMode.value) return false
    
    const currentOrder = categories.value.map(c => c.id).join(',')
    const savedOrder = localCategoriesOrder.value.join(',')
    
    return currentOrder !== savedOrder
  })

  /**
   * Verifica si se pueden aplicar filtros (no está en modo reordenamiento)
   */
  const canFilter = computed(() => !isReorderMode.value)

  // Watch para resetear página cuando cambien filtros
  watch([searchTerm, sortOrder], () => {
    currentPage.value = 1
  })

  // Watch para cargar categorías cuando userId esté disponible
  // Solo se ejecuta una vez gracias a hasInitialized
  if (!hasInitialized) {
    watch(
      userId,
      (newUserId) => {
        if (newUserId && categories.value.length === 0) {
          fetchCategories()
          hasInitialized = true
        } else if (!newUserId) {
          // Limpiar categorías cuando se cierra sesión
          categories.value = []
          error.value = null
          searchTerm.value = ''
          selectedType.value = null
          sortOrder.value = null
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
    categories,
    filteredCategories,
    paginatedCategories,
    paginatedCategoriesWithAmount,
    incomeCategories,
    expenseCategories,
    loading,
    error,
    searchTerm,
    selectedType,
    sortOrder,
    currentPage,
    itemsPerPage,
    
    // Estado - Reordenamiento
    isReorderMode,
    isSavingOrder,
    hasOrderChanges,
    canFilter,
    
    // Computed - Indicadores
    hasCategories,
    hasIncomeCategories,
    hasExpenseCategories,
    
    // Computed - Paginación
    totalItems,
    totalPages,
    paginationInfo,
    
    // Métodos
    fetchCategories,
    createCategory,
    removeCategory,
    updateCategoryData,
    setTypeFilter,
    clearFilters,
    calculateCategoryAmount,
    fetchUncategorizedTransactions,
    assignTransactionToCategory,
    removeTransactionFromCategory,
    
    // Métodos - Paginación
    setPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setItemsPerPage,
    
    // Métodos - Reordenamiento
    enableReorderMode,
    cancelReorderMode,
    updateLocalOrder,
    saveOrder
  }
}
