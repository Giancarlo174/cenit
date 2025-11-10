/**
 * Module: Profile
 * Lógica de negocio para perfiles de usuario
 */

/**
 * Valida los datos de actualización de perfil
 * @param {Object} data - Datos del perfil
 * @param {string} data.username - Nombre de usuario
 * @returns {{isValid: boolean, errors: string[]}}
 */
export const validateProfileData = (data) => {
  const errors = []

  if (!data.username?.trim()) {
    errors.push('El nombre de usuario es obligatorio')
  }

  if (data.username?.trim().length < 2) {
    errors.push('El nombre de usuario debe tener al menos 2 caracteres')
  }

  if (data.username?.trim().length > 30) {
    errors.push('El nombre de usuario no puede exceder 30 caracteres')
  }

  return { isValid: errors.length === 0, errors }
}

/**
 * Transforma datos de perfil para enviar a la DB
 * @param {Object} data - Datos del formulario
 * @returns {Object} Datos transformados para Supabase
 */
export const transformProfileForDB = (data) => {
  return {
    username: data.username.trim()
  }
}

/**
 * Transforma datos de perfil desde la DB
 * @param {Object} dbData - Datos de Supabase
 * @returns {Object} Datos transformados para la UI
 */
export const transformProfileFromDB = (dbData) => {
  return {
    id: dbData.id,
    username: dbData.username,
    role: dbData.role,
    createdAt: dbData.created_at
  }
}
