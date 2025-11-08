/**
 * Module: Categories
 * Lógica de negocio pura para categorías
 */

// Constantes de validación
export const VALIDATION_RULES = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100
}

// Tipos de categorías permitidos
export const CATEGORY_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense'
}

/**
 * Valida los datos de una categoría
 * @param {Object} data - Datos de la categoría
 * @param {string} data.name - Nombre de la categoría
 * @param {string} data.type - Tipo (income o expense)
 * @returns {{isValid: boolean, errors: string[]}}
 */
export const validateCategoryData = (data) => {
  const errors = []
  
  if (!data.name?.trim()) {
    errors.push('El nombre es obligatorio')
  }
  
  if (data.name?.trim().length < VALIDATION_RULES.MIN_NAME_LENGTH) {
    errors.push(`El nombre debe tener al menos ${VALIDATION_RULES.MIN_NAME_LENGTH} caracteres`)
  }
  
  if (data.name?.trim().length > VALIDATION_RULES.MAX_NAME_LENGTH) {
    errors.push(`El nombre no puede exceder ${VALIDATION_RULES.MAX_NAME_LENGTH} caracteres`)
  }

  if (!data.type || !Object.values(CATEGORY_TYPES).includes(data.type)) {
    errors.push('Debe especificar un tipo válido (ingreso o gasto)')
  }
  
  return { isValid: errors.length === 0, errors }
}

/**
 * Transforma datos de categoría para enviar a la base de datos
 * @param {Object} data - Datos del formulario
 * @param {string} userId - ID del usuario autenticado
 * @returns {Object} Datos formateados para Supabase
 */
export const transformDataForDB = (data, userId) => {
  return {
    user_id: userId,
    name: data.name.trim(),
    type: data.type
  }
}

/**
 * Transforma datos de categoría desde la base de datos
 * @param {Object} dbData - Datos desde Supabase
 * @returns {Object} Datos formateados para la aplicación
 */
export const transformDataFromDB = (dbData) => {
  return {
    id: dbData.id,
    userId: dbData.user_id,
    name: dbData.name,
    type: dbData.type,
    createdAt: dbData.created_at
  }
}

/**
 * Filtra categorías por tipo
 * @param {Array} categories - Lista de categorías
 * @param {string} type - Tipo (income o expense)
 * @returns {Array} Categorías filtradas
 */
export const filterByType = (categories, type) => {
  return categories.filter(cat => cat.type === type)
}

/**
 * Obtiene categorías de ingresos
 * @param {Array} categories - Lista de categorías
 * @returns {Array} Categorías de ingresos
 */
export const getIncomeCategories = (categories) => {
  return filterByType(categories, CATEGORY_TYPES.INCOME)
}

/**
 * Obtiene categorías de gastos
 * @param {Array} categories - Lista de categorías
 * @returns {Array} Categorías de gastos
 */
export const getExpenseCategories = (categories) => {
  return filterByType(categories, CATEGORY_TYPES.EXPENSE)
}
