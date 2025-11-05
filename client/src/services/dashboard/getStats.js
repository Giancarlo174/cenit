/**
 * Service: Get Dashboard Stats
 * Obtiene todas las estadísticas del dashboard
 */

import { apiClient } from '@/api/supabase'
import { transformDataFromDB as transformExpense } from '@/modules/expenses'
import { calculateDashboardStats } from '@/modules/dashboard'

/**
 * Obtiene estadísticas del dashboard para un usuario
 * @param {string} userId - ID del usuario autenticado
 * @returns {Promise<Object>} Estadísticas del dashboard
 */
export const getStats = async (userId) => {
  try {
    // Obtener perfil con balance inicial
    const profile = await apiClient.getById('profiles', userId)
    if (!profile) {
      throw new Error('Perfil de usuario no encontrado')
    }

    // Obtener todas las categorías del usuario
    const categoriesData = await apiClient.getAll('categories', {
      filters: { user_id: userId },
      orderBy: { column: 'name', ascending: true }
    })

    // Obtener todos los gastos del usuario
    const expensesData = await apiClient.getAll('expenses', {
      filters: { user_id: userId },
      orderBy: { column: 'expense_date', ascending: false }
    })

    // Transformar gastos
    const expenses = expensesData.map(exp => transformExpense(exp))

    // Transformar categorías (formato simple)
    const categories = categoriesData.map(cat => ({
      id: cat.id,
      name: cat.name,
      createdAt: cat.created_at
    }))

    // Calcular estadísticas usando el module
    const stats = calculateDashboardStats({
      initialBalance: profile.initial_balance || 0,
      expenses,
      categories
    })

    return {
      ...stats,
      initialBalance: profile.initial_balance || 0,
      username: profile.username
    }
  } catch (error) {
    if (error.message.includes('does not exist')) {
      throw new Error('Tablas no configuradas en Supabase')
    }
    throw new Error(`Error al obtener estadísticas: ${error.message}`)
  }
}
