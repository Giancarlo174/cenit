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

    // Ordenar por fecha descendente y luego por created_at descendente (más reciente primero)
    // Comparar strings directamente para evitar problemas de zona horaria
    transactions.sort((a, b) => {
      // Primero ordenar por fecha de transacción (descendente)
      // YYYY-MM-DD se compara correctamente alfabéticamente
      if (b.transactionDate !== a.transactionDate) {
        return b.transactionDate.localeCompare(a.transactionDate)
      }
      
      // Si las fechas son iguales, ordenar por created_at (descendente)
      return b.createdAt.localeCompare(a.createdAt)
    })

    // Filtrar por rango de fechas si se especifica
    if (options.startDate && options.endDate) {
      transactions = transactions.filter(t => {
        // Comparar strings directamente (YYYY-MM-DD)
        return t.transactionDate >= options.startDate && t.transactionDate <= options.endDate
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
