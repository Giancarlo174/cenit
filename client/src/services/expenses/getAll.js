/**
 * Service: Get All Expenses
 * Obtiene todos los gastos del usuario autenticado
 */

import { apiClient } from '@/api/supabase'
import { transformDataFromDB } from '@/modules/expenses'

/**
 * Obtiene todos los gastos del usuario
 * @param {string} userId - ID del usuario autenticado
 * @returns {Promise<Array>} Array de gastos transformados
 */
export const getAll = async (userId) => {
  try {
    // Obtener solo los gastos del usuario, ordenados por fecha descendente
    const data = await apiClient.getAll('expenses', {
      filters: { user_id: userId },
      orderBy: { column: 'expense_date', ascending: false }
    })
    
    // Transforma los datos desde la DB
    return data.map(transformDataFromDB)
  } catch (error) {
    if (error.message.includes('does not exist')) {
      throw new Error('Tabla "expenses" no configurada en Supabase')
    }
    throw new Error(`Error al obtener gastos: ${error.message}`)
  }
}
