/**
 * Module: Expenses
 * Lógica de negocio pura para gastos
 */

import { getCurrentDate } from '@/utils/formatters'

// Constantes de validación
export const VALIDATION_RULES = {
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 999999.99,
  MAX_DESCRIPTION_LENGTH: 500
}

/**
 * Valida los datos de un gasto
 * @param {Object} data - Datos del gasto
 * @param {number} data.amount - Monto del gasto
 * @param {string} [data.description] - Descripción opcional
 * @param {string} [data.expense_date] - Fecha del gasto
 * @returns {{isValid: boolean, errors: string[]}}
 */
export const validateExpenseData = (data) => {
  const errors = []
  
  // Validar monto
  if (!data.amount && data.amount !== 0) {
    errors.push('El monto es obligatorio')
  }
  
  if (data.amount < VALIDATION_RULES.MIN_AMOUNT) {
    errors.push(`El monto debe ser mayor a $${VALIDATION_RULES.MIN_AMOUNT}`)
  }
  
  if (data.amount > VALIDATION_RULES.MAX_AMOUNT) {
    errors.push(`El monto no puede exceder $${VALIDATION_RULES.MAX_AMOUNT}`)
  }
  
  // Validar descripción (opcional pero con límite)
  if (data.description && data.description.length > VALIDATION_RULES.MAX_DESCRIPTION_LENGTH) {
    errors.push(`La descripción no puede exceder ${VALIDATION_RULES.MAX_DESCRIPTION_LENGTH} caracteres`)
  }
  
  return { isValid: errors.length === 0, errors }
}

/**
 * Transforma datos de gasto para enviar a la base de datos
 * @param {Object} data - Datos del formulario
 * @param {string} userId - ID del usuario autenticado
 * @returns {Object} Datos formateados para Supabase
 */
export const transformDataForDB = (data, userId) => {
  return {
    user_id: userId,
    category_id: data.category_id || null,
    amount: parseFloat(data.amount),
    description: data.description?.trim() || null,
    expense_date: data.expense_date || getCurrentDate()
  }
}

/**
 * Transforma datos de gasto desde la base de datos
 * @param {Object} dbData - Datos desde Supabase
 * @returns {Object} Datos formateados para la aplicación
 */
export const transformDataFromDB = (dbData) => {
  return {
    id: dbData.id,
    userId: dbData.user_id,
    categoryId: dbData.category_id,
    amount: parseFloat(dbData.amount),
    description: dbData.description,
    expenseDate: dbData.expense_date,
    createdAt: dbData.created_at
  }
}

/**
 * Calcula el total de gastos
 * @param {Array} expenses - Array de gastos
 * @returns {number} Total de gastos
 */
export const calculateTotalExpenses = (expenses) => {
  return expenses.reduce((total, expense) => total + expense.amount, 0)
}
