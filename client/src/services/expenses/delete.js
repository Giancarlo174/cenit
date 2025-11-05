/**
 * Service: Delete Expense
 * Elimina un gasto existente
 */

import { apiClient } from '@/api/supabase'

/**
 * Elimina un gasto por ID
 * @param {string} id - ID del gasto
 * @returns {Promise<void>}
 */
export const deleteExpense = async (id) => {
  try {
    await apiClient.delete('expenses', id)
  } catch (error) {
    if (error.message.includes('does not exist')) {
      throw new Error('Tabla "expenses" no configurada en Supabase')
    }
    throw new Error(`Error al eliminar gasto: ${error.message}`)
  }
}
