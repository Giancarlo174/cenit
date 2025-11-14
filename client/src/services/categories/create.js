/**
 * Service: Create Category
 * Crea una nueva categoría
 */

import { supabase } from '@/api/supabase'
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

  try {
    // PASO 1: Obtener todas las categorías existentes del usuario y actualizarlas
    const { data: existingCategories, error: fetchError } = await supabase
      .from('categories')
      .select('id, position')
      .eq('user_id', userId)

    if (fetchError) throw fetchError

    // Incrementar position de todas las categorías existentes
    if (existingCategories && existingCategories.length > 0) {
      // Actualizar cada categoría individualmente para evitar problemas de constraint
      for (const cat of existingCategories) {
        const { error: updateError } = await supabase
          .from('categories')
          .update({ position: cat.position + 1 })
          .eq('id', cat.id)
          .eq('user_id', userId)

        if (updateError) throw updateError
      }
    }

    // PASO 2: Transformar datos para la DB (incluye position = 1)
    const transformedData = transformDataForDB(data, userId)
    
    // PASO 3: Insertar nueva categoría en posición 1
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
