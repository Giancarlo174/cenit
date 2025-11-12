/**
 * Service: Get Uncategorized Transactions
 * Obtiene transacciones sin categoría de un tipo específico
 */

import { apiClient } from '@/api/supabase'
import { transformDataFromDB } from '@/modules/transactions'

/**
 * Obtiene transacciones sin categoría de un usuario y tipo específico
 * @param {string} userId - ID del usuario autenticado
 * @param {string} type - Tipo de transacción ('income' | 'expense')
 * @returns {Promise<Array>} Lista de transacciones sin categoría
 */
export const getUncategorized = async (userId, type) => {
  try {
    const data = await apiClient.getAll('transactions', {
      filters: { 
        user_id: userId,
        type: type,
        category_id: null
      },
      orderBy: { column: 'transaction_date', ascending: false }
    })

    // Transformar datos desde DB
    let transactions = data.map(item => transformDataFromDB(item))

    // Ordenar por fecha descendente y luego por created_at descendente
    transactions.sort((a, b) => {
      if (b.transactionDate !== a.transactionDate) {
        return b.transactionDate.localeCompare(a.transactionDate)
      }
      return b.createdAt.localeCompare(a.createdAt)
    })

    return transactions
  } catch (error) {
    if (error.message.includes('does not exist')) {
      throw new Error('Tabla "transactions" no configurada en Supabase')
    }
    throw new Error(`Error al obtener transacciones sin categoría: ${error.message}`)
  }
}
