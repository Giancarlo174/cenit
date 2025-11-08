/**
 * Service: Create Category
 * Crea una nueva categoría
 */

import { apiClient } from '@/api/supabase'
import { validateCategoryData, transformDataForDB, transformDataFromDB } from '@/modules/categories'

/**
 * Crea una nueva categoría
 * @param {Object} data - Datos de la categoría
 * @param {string} data.name - Nombre de la categoría
 * @param {string} data.type - Tipo (income o expense)
 * @param {string} userId - ID del usuario autenticado
 * @returns {Promise<Object>} Categoría creada
 */
export const create = async (data, userId) => {
  // Valida los datos usando el module
  const validation = validateCategoryData(data)
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '))
  }

  // Transforma los datos para la DB
  const transformedData = transformDataForDB(data, userId)
  
  try {
    const result = await apiClient.create('categories', transformedData)
    return transformDataFromDB(result)
  } catch (error) {
    if (error.message.includes('duplicate key')) {
      throw new Error('Ya existe una categoría con ese nombre y tipo')
    }
    if (error.message.includes('does not exist')) {
      throw new Error('Tabla "categories" no configurada en Supabase')
    }
    throw new Error(`Error al crear categoría: ${error.message}`)
  }
}
