/**
 * Module: Dashboard
 * Lógica de negocio pura para el dashboard
 */

/**
 * Calcula el balance actual (balance inicial - total gastado)
 * @param {number} initialBalance - Balance inicial del perfil
 * @param {number} totalExpenses - Total de gastos
 * @returns {number} Balance disponible
 */
export const calculateCurrentBalance = (initialBalance, totalExpenses) => {
  return initialBalance - totalExpenses
}

/**
 * Agrupa gastos por categoría y calcula totales
 * @param {Array} expenses - Lista de gastos
 * @param {Array} categories - Lista de categorías
 * @returns {Array} Gastos agrupados por categoría con totales
 */
export const groupExpensesByCategory = (expenses, categories) => {
  // Crea un mapa de categorías para acceso rápido
  const categoryMap = categories.reduce((acc, cat) => {
    acc[cat.id] = { ...cat, total: 0, count: 0, percentage: 0 }
    return acc
  }, {})

  // Suma los gastos por categoría
  expenses.forEach(expense => {
    if (categoryMap[expense.categoryId]) {
      categoryMap[expense.categoryId].total += expense.amount
      categoryMap[expense.categoryId].count += 1
    }
  })

  // Calcula el total general de gastos
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  // Convierte a array y calcula porcentajes
  const grouped = Object.values(categoryMap)
    .filter(cat => cat.count > 0) // Solo categorías con gastos
    .map(cat => ({
      ...cat,
      percentage: totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0
    }))
    .sort((a, b) => b.total - a.total) // Ordenar por total descendente

  return grouped
}

/**
 * Obtiene los gastos más recientes
 * @param {Array} expenses - Lista de gastos
 * @param {number} limit - Cantidad de gastos a retornar
 * @returns {Array} Gastos recientes ordenados por fecha
 */
export const getRecentExpenses = (expenses, limit = 10) => {
  return [...expenses]
    .sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate))
    .slice(0, limit)
}

/**
 * Calcula estadísticas generales del dashboard
 * @param {Object} data - Datos del usuario
 * @param {number} data.initialBalance - Balance inicial
 * @param {Array} data.expenses - Lista de gastos
 * @param {Array} data.categories - Lista de categorías
 * @returns {Object} Estadísticas del dashboard
 */
export const calculateDashboardStats = (data) => {
  const { initialBalance, expenses, categories } = data

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const currentBalance = calculateCurrentBalance(initialBalance, totalExpenses)
  const expensesByCategory = groupExpensesByCategory(expenses, categories)
  const recentExpenses = getRecentExpenses(expenses, 15)
  
  // Encuentra la categoría con más gastos
  const topCategory = expensesByCategory.length > 0 
    ? expensesByCategory[0] 
    : null

  return {
    currentBalance,
    totalExpenses,
    expenseCount: expenses.length,
    categoryCount: categories.length,
    expensesByCategory,
    recentExpenses,
    topCategory
  }
}

/**
 * Genera colores para el gráfico de categorías
 * @param {number} count - Cantidad de colores necesarios
 * @returns {Array} Array de colores en formato hex
 */
export const generateChartColors = (count) => {
  const colors = [
    '#9333ea', // purple-600
    '#ec4899', // pink-500
    '#f59e0b', // amber-500
    '#10b981', // emerald-500
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#f97316', // orange-500
    '#06b6d4', // cyan-500
    '#84cc16', // lime-500
    '#ef4444', // red-500
  ]
  
  return colors.slice(0, count)
}
