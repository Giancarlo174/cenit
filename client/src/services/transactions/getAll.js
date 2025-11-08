/**
 * Service: Get All Transactions
 * Obtiene todas las transacciones del usuario
 */

import { apiClient } from '@/api/supabase'
import { transformDataFromDB } from '@/modules/transactions'

/**
 * Obtiene todas las transacciones de un usuario
 * @param {string} userId - ID del usuario autenticado
 * @param {Object} [options] - Opciones de filtrado
 * @param {string} [options.type] - Filtrar por tipo (income/expense)
 * @param {string} [options.startDate] - Fecha inicio
 * @param {string} [options.endDate] - Fecha fin
 * @returns {Promise<Array>} Lista de transacciones
 */
export const getAll = async (userId, options = {}) => {
  try {
    const filters = { user_id: userId }
    
    // Agregar filtro por tipo si se especifica
    if (options.type) {
      filters.type = options.type
    }

    const data = await apiClient.getAll('transactions', {
      filters,
      orderBy: { column: 'transaction_date', ascending: false }
    })

    // Transformar datos desde DB
    let transactions = data.map(item => transformDataFromDB(item))

    // Filtrar por rango de fechas si se especifica
    if (options.startDate && options.endDate) {
      transactions = transactions.filter(t => {
        const date = new Date(t.transactionDate)
        return date >= new Date(options.startDate) && date <= new Date(options.endDate)
      })
    }

    return transactions
  } catch (error) {
    if (error.message.includes('does not exist')) {
      throw new Error('Tabla "transactions" no configurada en Supabase')
    }
    throw new Error(`Error al obtener transacciones: ${error.message}`)
  }
}
