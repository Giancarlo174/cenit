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
    const data = await apiClient.getAll('expenses', 'expense_date')
    
    // Filtra solo los gastos del usuario autenticado
    const userExpenses = data.filter(expense => expense.user_id === userId)
    
    // Transforma los datos desde la DB
    return userExpenses.map(transformDataFromDB)
  } catch (error) {
    if (error.message.includes('does not exist')) {
      throw new Error('Tabla "expenses" no configurada en Supabase')
    }
    throw new Error(`Error al obtener gastos: ${error.message}`)
  }
}
