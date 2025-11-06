/**
 * Módulo de Gestión de Contraseñas
 * Contiene validaciones y lógica de negocio para cambio y recuperación de contraseñas
 * Funciones puras sin side effects
 */

/**
 * Valida que dos contraseñas coincidan
 * @param {string} password - Contraseña principal
 * @param {string} confirmPassword - Contraseña de confirmación
 * @returns {{isValid: boolean, error: string|null}}
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Las contraseñas no coinciden' }
  }
  return { isValid: true, error: null }
}

/**
 * Valida la fortaleza de una contraseña
 * @param {string} password - Contraseña a validar
 * @returns {{isValid: boolean, error: string|null}}
 */
export const validatePasswordStrength = (password) => {
  if (!password || !password.trim()) {
    return { isValid: false, error: 'La contraseña es obligatoria' }
  }

  if (password.length < 6) {
    return { isValid: false, error: 'La contraseña debe tener al menos 6 caracteres' }
  }

  return { isValid: true, error: null }
}

/**
 * Valida que la nueva contraseña sea diferente de la actual
 * @param {string} currentPassword - Contraseña actual
 * @param {string} newPassword - Nueva contraseña
 * @returns {{isValid: boolean, error: string|null}}
 */
export const validatePasswordDifferent = (currentPassword, newPassword) => {
  if (currentPassword === newPassword) {
    return { 
      isValid: false, 
      error: 'La nueva contraseña debe ser diferente a la actual' 
    }
  }
  return { isValid: true, error: null }
}

/**
 * Valida datos completos para cambio de contraseña
 * @param {Object} data - Datos del formulario
 * @param {string} data.currentPassword - Contraseña actual
 * @param {string} data.newPassword - Nueva contraseña
 * @param {string} data.confirmPassword - Confirmación de nueva contraseña
 * @returns {{isValid: boolean, errors: string[]}}
 */
export const validateChangePasswordData = (data) => {
  const errors = []

  // Validar contraseña actual
  if (!data.currentPassword || !data.currentPassword.trim()) {
    errors.push('Por favor ingresa tu contraseña actual')
  }

  // Validar nueva contraseña
  const strengthValidation = validatePasswordStrength(data.newPassword)
  if (!strengthValidation.isValid) {
    errors.push(strengthValidation.error)
  }

  // Validar coincidencia
  const matchValidation = validatePasswordMatch(data.newPassword, data.confirmPassword)
  if (!matchValidation.isValid) {
    errors.push(matchValidation.error)
  }

  // Validar que sea diferente
  if (data.currentPassword && data.newPassword) {
    const differentValidation = validatePasswordDifferent(
      data.currentPassword, 
      data.newPassword
    )
    if (!differentValidation.isValid) {
      errors.push(differentValidation.error)
    }
  }

  return { isValid: errors.length === 0, errors }
}

/**
 * Valida datos para reset de contraseña
 * @param {Object} data - Datos del formulario
 * @param {string} data.password - Nueva contraseña
 * @param {string} data.confirmPassword - Confirmación de contraseña
 * @returns {{isValid: boolean, errors: string[]}}
 */
export const validateResetPasswordData = (data) => {
  const errors = []

  // Validar fortaleza
  const strengthValidation = validatePasswordStrength(data.password)
  if (!strengthValidation.isValid) {
    errors.push(strengthValidation.error)
  }

  // Validar coincidencia
  const matchValidation = validatePasswordMatch(data.password, data.confirmPassword)
  if (!matchValidation.isValid) {
    errors.push(matchValidation.error)
  }

  return { isValid: errors.length === 0, errors }
}
