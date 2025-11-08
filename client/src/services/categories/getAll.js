/**
 * Service: Get All Categories
 * Obtiene todas las categorías del usuario autenticado
 */

import { apiClient } from '@/api/supabase'
import { transformDataFromDB } from '@/modules/categories'

/**
 * Obtiene todas las categorías del usuario
 * @param {string} userId - ID del usuario autenticado
 * @param {Object} [options] - Opciones de filtrado
 * @param {string} [options.type] - Filtrar por tipo (income/expense)
 * @returns {Promise<Array>} Array de categorías transformadas
 */
export const getAll = async (userId, options = {}) => {
  try {
    const filters = { user_id: userId }
    
    // Agregar filtro por tipo si se especifica
    if (options.type) {
      filters.type = options.type
    }

    // Obtener categorías del usuario, ordenadas por nombre
    const data = await apiClient.getAll('categories', {
      filters,
      orderBy: { column: 'name', ascending: true }
    })
    
    // Transforma los datos desde la DB
    return data.map(transformDataFromDB)
  } catch (error) {
    if (error.message.includes('does not exist')) {
      throw new Error('Tabla "categories" no configurada en Supabase')
    }
    throw new Error(`Error al obtener categorías: ${error.message}`)
  }
}
