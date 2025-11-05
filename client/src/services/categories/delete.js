/**
 * Service: Delete Category
 * Elimina una categoría existente
 */

import { apiClient } from '@/api/supabase'

/**
 * Elimina una categoría por ID
 * @param {string} id - ID de la categoría
 * @returns {Promise<void>}
 */
export const deleteCategory = async (id) => {
  try {
    await apiClient.delete('categories', id)
  } catch (error) {
    if (error.message.includes('does not exist')) {
      throw new Error('Tabla "categories" no configurada en Supabase')
    }
    throw new Error(`Error al eliminar categoría: ${error.message}`)
  }
}
