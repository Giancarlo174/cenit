/**
 * Service: Bulk Update Order
 * Actualiza el orden de múltiples categorías en una sola operación
 */

import { supabase } from '@/api/supabase'

/**
 * Actualiza el position de múltiples categorías
 * @param {Array<string>} orderedIds - Array de IDs en el orden deseado
 * @param {string} userId - ID del usuario autenticado
 * @returns {Promise<void>}
 */
export const bulkUpdateOrder = async (orderedIds, userId) => {
  if (!orderedIds?.length) {
    throw new Error('No se proporcionaron categorías para ordenar')
  }

  if (!userId) {
    throw new Error('Usuario no autenticado')
  }

  try {
    // Actualizar cada categoría con su nuevo position
    // Usamos update en lugar de upsert para evitar problemas de constraint
    for (let index = 0; index < orderedIds.length; index++) {
      const { error } = await supabase
        .from('categories')
        .update({ position: index + 1 })
        .eq('id', orderedIds[index])
        .eq('user_id', userId)

      if (error) throw error
    }

  } catch (error) {
    if (error.message.includes('does not exist')) {
      throw new Error('Tabla "categories" no configurada en Supabase')
    }
    throw new Error(`Error al actualizar el orden: ${error.message}`)
  }
}
