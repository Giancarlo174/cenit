/**
 * Service: Get Transaction By ID
 * Obtiene una transacción específica por su ID
 */

import { apiClient } from '@/api/supabase'
import { transformDataFromDB } from '@/modules/transactions'

/**
 * Obtiene una transacción por ID
 * @param {string} id - ID de la transacción
 * @returns {Promise<Object>} Transacción
 */
export const getById = async (id) => {
  try {
    const data = await apiClient.getById('transactions', id)
    if (!data) {
      throw new Error('Transacción no encontrada')
    }
    return transformDataFromDB(data)
  } catch (error) {
    if (error.message.includes('does not exist')) {
      throw new Error('Tabla "transactions" no configurada en Supabase')
    }
    if (error.message.includes('no encontrada')) {
      throw error
    }
    throw new Error(`Error al obtener transacción: ${error.message}`)
  }
}
