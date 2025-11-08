/**
 * Composable: useCategories
 * Maneja el estado reactivo y coordinación para categorías
 */

import { ref, computed, watch } from 'vue'
import { getAll } from '@/services/categories/getAll'
import { create } from '@/services/categories/create'
import { deleteCategory } from '@/services/categories/delete'
import { showSuccess, showError, confirmDelete } from '@/modules/notifications'
import { getIncomeCategories, getExpenseCategories } from '@/modules/categories'
import { useAuth } from '@/composables/useAuth'
import { useDashboard } from '@/composables/useDashboard'

// Estado global de categorías (singleton pattern)
const categories = ref([])
const loading = ref(false)
const error = ref(null)
const searchTerm = ref('')
const selectedType = ref(null) // 'income' | 'expense' | null (todas)
let hasInitialized = false

export function useCategories() {
  // Obtener userId del sistema de autenticación
  const { userId } = useAuth()
  const { invalidateCache: invalidateDashboardCache } = useDashboard()

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

    return filtered
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
    const confirmed = await confirmDelete(category.name)
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
   * Establece el filtro por tipo
   * @param {'income' | 'expense' | null} type - Tipo a filtrar
   */
  const setTypeFilter = (type) => {
    selectedType.value = type
  }

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
    incomeCategories,
    expenseCategories,
    loading,
    error,
    searchTerm,
    selectedType,
    
    // Computed - Indicadores
    hasCategories,
    hasIncomeCategories,
    hasExpenseCategories,
    
    // Métodos
    fetchCategories,
    createCategory,
    removeCategory,
    setTypeFilter
  }
}
