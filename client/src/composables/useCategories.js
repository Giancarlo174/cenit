/**
 * Composable: useCategories
 * Maneja el estado reactivo y coordinación para categorías
 */

import { ref, computed, onMounted } from 'vue'
import { getAll } from '@/services/categories/getAll'
import { create } from '@/services/categories/create'
import { deleteCategory } from '@/services/categories/delete'
import { showSuccess, showError, confirmDelete } from '@/modules/notifications'

export function useCategories() {
  // Estado reactivo
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)
  const searchTerm = ref('')

  // TODO: Obtener userId del sistema de autenticación real
  const userId = ref('demo-user-id')

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
      await showSuccess('Categoría eliminada exitosamente')
    } catch (err) {
      error.value = err.message
      await showError(err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Carga inicial de categorías solo en la vista principal
  onMounted(() => {
    // Solo carga si es necesario (cuando hay searchTerm observable)
    if (searchTerm.value !== undefined) {
      fetchCategories()
    }
  })

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
