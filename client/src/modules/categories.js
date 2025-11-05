/**
 * Module: Categories
 * Lógica de negocio pura para categorías
 */

// Constantes de validación
export const VALIDATION_RULES = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100
}

/**
 * Valida los datos de una categoría
 * @param {Object} data - Datos de la categoría
 * @param {string} data.name - Nombre de la categoría
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
    name: data.name.trim()
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
    createdAt: dbData.created_at
  }
}
