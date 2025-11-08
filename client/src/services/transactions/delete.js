/**
 * Service: Delete Transaction
 * Elimina una transacción existente
 */

import { apiClient } from '@/api/supabase'

/**
 * Elimina una transacción por ID
 * @param {string} id - ID de la transacción
 * @returns {Promise<void>}
 */
export const deleteTransaction = async (id) => {
  try {
    await apiClient.delete('transactions', id)
  } catch (error) {
    if (error.message.includes('does not exist')) {
      throw new Error('Tabla "transactions" no configurada en Supabase')
    }
    throw new Error(`Error al eliminar transacción: ${error.message}`)
  }
}
