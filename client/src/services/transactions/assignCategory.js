/**
 * Service: Assign Category to Transaction
 * Asigna o remueve una categoría de una transacción
 */

import { apiClient } from '@/api/supabase'
import { transformDataFromDB } from '@/modules/transactions'

/**
 * Asigna una categoría a una transacción (o la remueve si categoryId es null)
 * @param {string} transactionId - ID de la transacción
 * @param {string|null} categoryId - ID de la categoría (null para remover)
 * @returns {Promise<Object>} Transacción actualizada
 */
export const assignCategory = async (transactionId, categoryId) => {
  try {
    const result = await apiClient.update('transactions', transactionId, {
      category_id: categoryId
    })
    return transformDataFromDB(result)
  } catch (error) {
    if (error.message.includes('does not exist')) {
      throw new Error('Tabla "transactions" no configurada en Supabase')
    }
    throw new Error(`Error al asignar categoría: ${error.message}`)
  }
}
