/**
 * Service: Get Dashboard Stats
 * Obtiene todas las estadísticas del dashboard
 */

import { apiClient } from '@/api/supabase'
import { transformDataFromDB as transformTransaction } from '@/modules/transactions'
import { calculateDashboardStats } from '@/modules/dashboard'

/**
 * Obtiene estadísticas del dashboard para un usuario
 * @param {string} userId - ID del usuario autenticado
 * @returns {Promise<Object>} Estadísticas del dashboard
 */
export const getStats = async (userId) => {
  try {
    // Obtener perfil con username
    const profile = await apiClient.getById('profiles', userId)
    if (!profile) {
      throw new Error('Perfil de usuario no encontrado')
    }

    // Obtener todas las categorías del usuario
    const categoriesData = await apiClient.getAll('categories', {
      filters: { user_id: userId },
      orderBy: { column: 'name', ascending: true }
    })

    // Obtener todas las transacciones del usuario
    const transactionsData = await apiClient.getAll('transactions', {
      filters: { user_id: userId },
      orderBy: { column: 'transaction_date', ascending: false }
    })

    // Transformar transacciones
    const transactions = transactionsData.map(t => transformTransaction(t))

    // Transformar categorías
    const categories = categoriesData.map(cat => ({
      id: cat.id,
      name: cat.name,
      type: cat.type,
      createdAt: cat.created_at
    }))

    // Calcular estadísticas usando el module
    const stats = calculateDashboardStats({
      transactions,
      categories
    })

    return {
      ...stats,
      username: profile.username
    }
  } catch (error) {
    if (error.message.includes('does not exist')) {
      throw new Error('Tablas no configuradas en Supabase')
    }
    throw new Error(`Error al obtener estadísticas: ${error.message}`)
  }
}
