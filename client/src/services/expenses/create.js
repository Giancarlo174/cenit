/**
 * Service: Create Expense
 * Crea un nuevo gasto
 */

import { apiClient } from '@/api/supabase'
import { validateExpenseData, transformDataForDB, transformDataFromDB } from '@/modules/expenses'

/**
 * Crea un nuevo gasto
 * @param {Object} data - Datos del gasto
 * @param {number} data.amount - Monto del gasto
 * @param {string} data.category_id - ID de la categoría
 * @param {string} [data.description] - Descripción opcional
 * @param {string} [data.expense_date] - Fecha del gasto
 * @param {string} userId - ID del usuario autenticado
 * @returns {Promise<Object>} Gasto creado
 */
export const create = async (data, userId) => {
  // Valida los datos usando el module
  const validation = validateExpenseData(data)
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '))
  }

  // Transforma los datos para la DB
  const transformedData = transformDataForDB(data, userId)
  
  try {
    const result = await apiClient.create('expenses', transformedData)
    return transformDataFromDB(result)
  } catch (error) {
    if (error.message.includes('does not exist')) {
      throw new Error('Tabla "expenses" no configurada en Supabase')
    }
    throw new Error(`Error al crear gasto: ${error.message}`)
  }
}
