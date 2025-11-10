/**
 * Service: Update Category
 * Actualiza una categoría existente
 */

import { validateCategoryData, transformDataForDB } from '@/modules/categories'
import { supabase } from '@/api/supabase'

/**
 * Actualiza una categoría en la base de datos
 * @param {string} categoryId - ID de la categoría
 * @param {Object} categoryData - Datos de la categoría
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Categoría actualizada
 */
export const updateCategory = async (categoryId, categoryData, userId) => {
  // Validar datos
  const validation = validateCategoryData(categoryData)
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '))
  }

  // Transformar datos para DB
  const dbData = transformDataForDB(categoryData, userId)

  try {
    const { data, error } = await supabase
      .from('categories')
      .update(dbData)
      .eq('id', categoryId)
      .eq('user_id', userId) // Seguridad: solo actualizar categorías del usuario
      .select()
      .single()

    if (error) throw error

    // Transformar de vuelta a formato cliente
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      userId: data.user_id,
      createdAt: data.created_at
    }
  } catch (error) {
    throw new Error(`Error al actualizar categoría: ${error.message}`)
  }
}
