/**
 * Module: Dashboard
 * Lógica de negocio pura para el dashboard
 */

/**
 * Calcula el balance actual (ingresos - gastos)
 * @param {number} totalIncome - Total de ingresos
 * @param {number} totalExpenses - Total de gastos
 * @returns {number} Balance actual
 */
export const calculateBalance = (totalIncome, totalExpenses) => {
  return totalIncome - totalExpenses
}

/**
 * Agrupa transacciones por categoría y calcula totales
 * @param {Array} transactions - Lista de transacciones
 * @param {Array} categories - Lista de categorías
 * @param {string} type - Tipo de transacciones a agrupar ('income' o 'expense')
 * @returns {Array} Transacciones agrupadas por categoría con totales
 */
export const groupTransactionsByCategory = (transactions, categories, type) => {
  // Filtra transacciones por tipo
  const filteredTransactions = transactions.filter(t => t.type === type)
  
  // Crea un mapa de categorías para acceso rápido
  const categoryMap = categories
    .filter(cat => cat.type === type)
    .reduce((acc, cat) => {
      acc[cat.id] = { ...cat, total: 0, count: 0, percentage: 0 }
      return acc
    }, {})

  // Suma las transacciones por categoría
  filteredTransactions.forEach(transaction => {
    if (categoryMap[transaction.categoryId]) {
      categoryMap[transaction.categoryId].total += transaction.amount
      categoryMap[transaction.categoryId].count += 1
    }
  })

  // Calcula el total general
  const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0)

  // Convierte a array y calcula porcentajes
  const grouped = Object.values(categoryMap)
    .filter(cat => cat.count > 0)
    .map(cat => ({
      ...cat,
      percentage: total > 0 ? (cat.total / total) * 100 : 0
    }))
    .sort((a, b) => b.total - a.total)

  return grouped
}

/**
 * Obtiene las transacciones más recientes
 * @param {Array} transactions - Lista de transacciones
 * @param {number} limit - Cantidad de transacciones a retornar
 * @returns {Array} Transacciones recientes ordenadas por fecha
 */
export const getRecentTransactions = (transactions, limit = 10) => {
  return [...transactions]
    .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
    .slice(0, limit)
}

/**
 * Calcula estadísticas generales del dashboard
 * @param {Object} data - Datos del usuario
 * @param {Array} data.transactions - Lista de transacciones
 * @param {Array} data.categories - Lista de categorías
 * @returns {Object} Estadísticas del dashboard
 */
export const calculateDashboardStats = (data) => {
  const { transactions, categories } = data

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const currentBalance = calculateBalance(totalIncome, totalExpenses)
  
  const expensesByCategory = groupTransactionsByCategory(transactions, categories, 'expense')
  const incomeByCategory = groupTransactionsByCategory(transactions, categories, 'income')
  
  const recentTransactions = getRecentTransactions(transactions, 15)
  
  // Encuentra la categoría con más gastos
  const topExpenseCategory = expensesByCategory.length > 0 
    ? expensesByCategory[0] 
    : null

  // Encuentra la categoría con más ingresos
  const topIncomeCategory = incomeByCategory.length > 0
    ? incomeByCategory[0]
    : null

  return {
    currentBalance,
    totalIncome,
    totalExpenses,
    transactionCount: transactions.length,
    incomeCount: transactions.filter(t => t.type === 'income').length,
    expenseCount: transactions.filter(t => t.type === 'expense').length,
    categoryCount: categories.length,
    expensesByCategory,
    incomeByCategory,
    recentTransactions,
    topExpenseCategory,
    topIncomeCategory
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
