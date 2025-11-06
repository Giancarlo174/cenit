/**
 * Composable: useCategories
 * Maneja el estado reactivo y coordinación para categorías
 */

import { ref, computed, watch } from 'vue'
import { getAll } from '@/services/categories/getAll'
import { create } from '@/services/categories/create'
import { deleteCategory } from '@/services/categories/delete'
import { showSuccess, showError, confirmDelete } from '@/modules/notifications'
import { useAuth } from '@/composables/useAuth'
import { useDashboard } from '@/composables/useDashboard'

// Estado global de categorías (singleton pattern)
const categories = ref([])
const loading = ref(false)
const error = ref(null)
const searchTerm = ref('')
let hasInitialized = false

export function useCategories() {
  // Obtener userId del sistema de autenticación
  const { userId } = useAuth()
  const { invalidateCache: invalidateDashboardCache } = useDashboard()

  // Categorías filtradas por búsqueda
  const filteredCategories = computed(() => {
    if (!searchTerm.value.trim()) {
      return categories.value
    }
    
    return categories.value.filter(cat =>
      cat.name.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  })

  // Indica si hay categorías
  const hasCategories = computed(() => categories.value.length > 0)

  /**
   * Obtiene todas las categorías del usuario
   */
  const fetchCategories = async () => {
    // No intentar cargar si no hay usuario autenticado
    if (!userId.value) {
      console.warn('No hay usuario autenticado')
      return
    }

    loading.value = true
    error.value = null
    
    try {
      categories.value = await getAll(userId.value)
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
    loading,
    error,
    searchTerm,
    hasCategories,
    
    // Métodos
    fetchCategories,
    createCategory,
    removeCategory
  }
}
