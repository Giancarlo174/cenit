/**
 * Service: Get All Categories
 * Obtiene todas las categorías del usuario autenticado
 */

import { apiClient } from '@/api/supabase'
import { transformDataFromDB } from '@/modules/categories'

/**
 * Obtiene todas las categorías del usuario
 * @param {string} userId - ID del usuario autenticado
 * @returns {Promise<Array>} Array de categorías transformadas
 */
export const getAll = async (userId) => {
  try {
    const data = await apiClient.getAll('categories')
    
    // Filtra solo las categorías del usuario autenticado
    const userCategories = data.filter(cat => cat.user_id === userId)
    
    // Transforma los datos desde la DB
    return userCategories.map(transformDataFromDB)
  } catch (error) {
    if (error.message.includes('does not exist')) {
      throw new Error('Tabla "categories" no configurada en Supabase')
    }
    throw new Error(`Error al obtener categorías: ${error.message}`)
  }
}
