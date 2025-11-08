/**
 * Service: Create Transaction
 * Crea una nueva transacción (ingreso o gasto)
 */

import { apiClient } from '@/api/supabase'
import { validateTransactionData, transformDataForDB, transformDataFromDB } from '@/modules/transactions'

/**
 * Crea una nueva transacción
 * @param {Object} data - Datos de la transacción
 * @param {string} data.type - Tipo (income o expense)
 * @param {number} data.amount - Monto
 * @param {string} data.category_id - ID de la categoría
 * @param {string} [data.description] - Descripción opcional
 * @param {string} [data.transaction_date] - Fecha de la transacción
 * @param {string} userId - ID del usuario autenticado
 * @returns {Promise<Object>} Transacción creada
 */
export const create = async (data, userId) => {
  // Validar datos usando el module
  const validation = validateTransactionData(data)
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '))
  }

  // Transformar datos para la BD
  const transformedData = transformDataForDB(data, userId)
  
  try {
    const result = await apiClient.create('transactions', transformedData)
    return transformDataFromDB(result)
  } catch (error) {
    if (error.message.includes('does not exist')) {
      throw new Error('Tabla "transactions" no configurada en Supabase')
    }
    throw new Error(`Error al crear transacción: ${error.message}`)
  }
}
