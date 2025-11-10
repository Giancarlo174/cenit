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
    .sort((a, b) => {
      // Comparar fechas como strings (YYYY-MM-DD se compara correctamente alfabéticamente)
      if (b.transactionDate !== a.transactionDate) {
        return b.transactionDate.localeCompare(a.transactionDate)
      }
      // Si las fechas son iguales, ordenar por createdAt
      return b.createdAt.localeCompare(a.createdAt)
    })
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
    allTransactions: transactions, // Todas las transacciones para el gráfico
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

/**
 * Formatea una fecha a YYYY-MM-DD
 * @param {Date} date - Fecha a formatear
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
const formatDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Agrupa transacciones por semana completa (7 días)
 * Modo "Días": Muestra los 7 días de una semana específica del mes
 * @param {Array} transactions - Lista de transacciones
 * @param {Object} selection - { year, month, week }
 * @returns {Array} Array de 7 objetos {date, income, expense}
 */
export const groupTransactionsByDay = (transactions, selection) => {
  const { year, month, week } = selection
  
  // Calcular el primer día de la semana seleccionada
  // Semana 1: días 1-7, Semana 2: días 8-14, etc.
  const startDay = (week - 1) * 7 + 1
  const weekData = []
  
  // Generar los 7 días de la semana
  for (let i = 0; i < 7; i++) {
    const day = startDay + i
    const currentDate = new Date(year, month - 1, day) // month - 1 porque Date usa 0-11
    
    // Verificar si el día existe en el mes (evitar desbordamiento)
    if (currentDate.getMonth() !== month - 1) {
      // Si nos pasamos al siguiente mes, detenernos
      break
    }
    
    const dateKey = formatDateKey(currentDate)
    
    const dayTransactions = transactions.filter(t => {
      // Comparar directamente el string de fecha (YYYY-MM-DD)
      return t.transactionDate === dateKey
    })
    
    const income = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const expense = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    weekData.push({
      date: dateKey,
      dateObj: new Date(currentDate),
      income,
      expense
    })
  }
  
  return weekData
}

/**
 * Agrupa transacciones por semanas de un mes
 * Modo "Semanas": Muestra todas las semanas de un mes específico
 * @param {Array} transactions - Lista de transacciones
 * @param {Object} selection - { year, month }
 * @returns {Array} Array de objetos {date, income, expense} por semana
 */
export const groupTransactionsByWeek = (transactions, selection) => {
  const { year, month } = selection
  
  // Calcular cuántos días tiene el mes
  const lastDay = new Date(year, month, 0).getDate() // month porque Date.getDate(0) da último día del mes anterior
  const weeksInMonth = Math.ceil(lastDay / 7)
  
  const weekData = []
  
  // Generar datos para cada semana del mes
  for (let week = 1; week <= weeksInMonth; week++) {
    const startDay = (week - 1) * 7 + 1
    const endDay = Math.min(week * 7, lastDay)
    
    // Filtrar transacciones de esta semana
    const weekTransactions = transactions.filter(t => {
      // IMPORTANTE: Extraer año-mes-día como números para evitar problemas de zona horaria
      const [tYear, tMonth, tDay] = t.transactionDate.split('-').map(Number)
      
      return tYear === year && 
             tMonth === month && 
             tDay >= startDay && 
             tDay <= endDay
    })
    
    const income = weekTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const expense = weekTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    // Fecha representativa: primer día de la semana
    const representativeDate = new Date(year, month - 1, startDay)
    
    weekData.push({
      date: `Semana ${startDay}-${endDay}`, // Mostrar rango de días
      dateObj: representativeDate,
      weekNumber: week,
      startDay,
      endDay,
      income,
      expense
    })
  }
  
  return weekData
}

/**
 * Agrupa transacciones por meses de un año
 * Modo "Meses": Muestra los 12 meses de un año específico
 * @param {Array} transactions - Lista de transacciones
 * @param {Object} selection - { year }
 * @returns {Array} Array de 12 objetos {date, income, expense}
 */
export const groupTransactionsByMonth = (transactions, selection) => {
  const { year } = selection
  
  const monthNames = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ]
  
  const monthData = []
  
  // Generar datos para los 12 meses
  for (let month = 1; month <= 12; month++) {
    const monthTransactions = transactions.filter(t => {
      // Extraer año-mes-día como string para evitar problemas de zona horaria
      const [tYear, tMonth] = t.transactionDate.split('-').map(Number)
      return tYear === year && tMonth === month
    })
    
    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const expense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    // Fecha representativa: primer día del mes
    const representativeDate = new Date(year, month - 1, 1)
    
    monthData.push({
      date: monthNames[month - 1],
      dateObj: representativeDate,
      monthNumber: month,
      income,
      expense
    })
  }
  
  return monthData
}

/**
 * Agrupa transacciones según el periodo seleccionado
 * @param {Array} transactions - Lista de transacciones
 * @param {string} period - Periodo: 'day' (semana completa), 'week' (semanas del mes), 'month' (12 meses)
 * @param {Object} selection - { year, month, week } según el periodo
 * @returns {Array} Array de objetos {date, income, expense}
 */
export const groupTransactionsByPeriod = (transactions, period, selection) => {
  switch (period) {
    case 'day':
      // Modo "Días": muestra 7 días de la semana seleccionada
      return groupTransactionsByDay(transactions, selection)
    case 'week':
      // Modo "Semanas": muestra semanas del mes seleccionado
      return groupTransactionsByWeek(transactions, selection)
    case 'month':
      // Modo "Meses": muestra 12 meses del año seleccionado
      return groupTransactionsByMonth(transactions, selection)
    default:
      return groupTransactionsByMonth(transactions, selection)
  }
}
