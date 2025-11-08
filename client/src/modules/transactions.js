/**
 * Module: Transactions
 * Lógica de negocio pura para transacciones (ingresos y gastos)
 */

// Constantes de validación
export const VALIDATION_RULES = {
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 40,
  MIN_AMOUNT: 0.01
}

/**
 * Valida los datos de una transacción
 * @param {Object} data - Datos de la transacción
 * @param {number} data.amount - Monto
 * @param {string} data.category_id - ID de categoría
 * @param {string} data.type - Tipo (income o expense)
 * @param {string} data.name - Nombre de la transacción
 * @param {string} [data.transaction_date] - Fecha de la transacción
 * @returns {{isValid: boolean, errors: string[]}}
 */
export const validateTransactionData = (data) => {
  const errors = []

  if (!data.amount || data.amount <= 0) {
    errors.push('El monto debe ser mayor a 0')
  }

  if (!data.category_id?.trim()) {
    errors.push('Debe seleccionar una categoría')
  }

  if (!data.type || !['income', 'expense'].includes(data.type)) {
    errors.push('El tipo debe ser "ingreso" o "gasto"')
  }

  if (!data.name?.trim()) {
    errors.push('El nombre es obligatorio')
  }

  if (data.name?.trim().length < VALIDATION_RULES.MIN_NAME_LENGTH) {
    errors.push(`El nombre debe tener al menos ${VALIDATION_RULES.MIN_NAME_LENGTH} caracteres`)
  }

  if (data.name?.trim().length > VALIDATION_RULES.MAX_NAME_LENGTH) {
    errors.push(`El nombre no puede exceder ${VALIDATION_RULES.MAX_NAME_LENGTH} caracteres`)
  }

  return { isValid: errors.length === 0, errors }
}

/**
 * Transforma datos del formulario para la base de datos
 * @param {Object} data - Datos del formulario
 * @param {string} userId - ID del usuario
 * @returns {Object} Datos formateados para Supabase
 */
export const transformDataForDB = (data, userId) => {
  return {
    user_id: userId,
    category_id: data.category_id,
    type: data.type,
    amount: parseFloat(data.amount),
    name: data.name.trim(),
    transaction_date: data.transaction_date || new Date().toISOString().split('T')[0]
  }
}

/**
 * Transforma datos de la base de datos al formato del cliente
 * @param {Object} dbData - Datos de Supabase
 * @returns {Object} Datos formateados para el cliente
 */
export const transformDataFromDB = (dbData) => {
  return {
    id: dbData.id,
    userId: dbData.user_id,
    categoryId: dbData.category_id,
    type: dbData.type,
    amount: parseFloat(dbData.amount),
    name: dbData.name || '',
    transactionDate: dbData.transaction_date,
    createdAt: dbData.created_at
  }
}

/**
 * Calcula el total de transacciones
 * @param {Array} transactions - Lista de transacciones
 * @param {string} [type] - Filtrar por tipo (income/expense), opcional
 * @returns {number} Total
 */
export const calculateTotal = (transactions, type = null) => {
  return transactions
    .filter(t => !type || t.type === type)
    .reduce((sum, t) => sum + t.amount, 0)
}

/**
 * Calcula el total de ingresos
 * @param {Array} transactions - Lista de transacciones
 * @returns {number} Total de ingresos
 */
export const calculateTotalIncome = (transactions) => {
  return calculateTotal(transactions, 'income')
}

/**
 * Calcula el total de gastos
 * @param {Array} transactions - Lista de transacciones
 * @returns {number} Total de gastos
 */
export const calculateTotalExpenses = (transactions) => {
  return calculateTotal(transactions, 'expense')
}

/**
 * Calcula el balance actual
 * @param {Array} transactions - Lista de transacciones
 * @returns {number} Balance (ingresos - gastos)
 */
export const calculateBalance = (transactions) => {
  const income = calculateTotalIncome(transactions)
  const expenses = calculateTotalExpenses(transactions)
  return income - expenses
}

/**
 * Filtra transacciones por tipo
 * @param {Array} transactions - Lista de transacciones
 * @param {string} type - Tipo (income o expense)
 * @returns {Array} Transacciones filtradas
 */
export const filterByType = (transactions, type) => {
  return transactions.filter(t => t.type === type)
}

/**
 * Filtra transacciones por rango de fechas
 * @param {Array} transactions - Lista de transacciones
 * @param {string} startDate - Fecha inicio (YYYY-MM-DD)
 * @param {string} endDate - Fecha fin (YYYY-MM-DD)
 * @returns {Array} Transacciones filtradas
 */
export const filterByDateRange = (transactions, startDate, endDate) => {
  return transactions.filter(t => {
    const date = new Date(t.transactionDate)
    return date >= new Date(startDate) && date <= new Date(endDate)
  })
}
