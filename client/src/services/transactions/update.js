/**
 * Service: Update Transaction
 * Actualiza una transacción existente
 */

import { apiClient } from '@/api/supabase'
import { validateTransactionData, transformDataForDB, transformDataFromDB } from '@/modules/transactions'

/**
 * Actualiza una transacción existente
 * @param {string} id - ID de la transacción a actualizar
 * @param {Object} data - Datos actualizados de la transacción
 * @param {string} data.type - Tipo (income o expense)
 * @param {number} data.amount - Monto
 * @param {string} data.category_id - ID de la categoría
 * @param {string} data.name - Nombre de la transacción
 * @param {string} [data.transaction_date] - Fecha de la transacción
 * @param {string} userId - ID del usuario autenticado
 * @returns {Promise<Object>} Transacción actualizada
 */
export const update = async (id, data, userId) => {
  // Validar datos usando el module
  const validation = validateTransactionData(data)
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '))
  }

  // Transformar datos para la BD
  const transformedData = transformDataForDB(data, userId)
  
  try {
    const result = await apiClient.update('transactions', id, transformedData)
    return transformDataFromDB(result)
  } catch (error) {
    if (error.message.includes('does not exist')) {
      throw new Error('Tabla "transactions" no configurada en Supabase')
    }
    throw new Error(`Error al actualizar transacción: ${error.message}`)
  }
}
