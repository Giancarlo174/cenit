/**
 * Módulo de Autenticación
 * Contiene toda la lógica de negocio relacionada con autenticación
 * Funciones puras sin side effects ni dependencias de Vue
 */

// Traducciones de errores de Supabase Auth
const ERROR_TRANSLATIONS = {
  'Invalid login credentials': 'Credenciales de inicio de sesión inválidas',
  'Email not confirmed': 'Correo electrónico no confirmado',
  'User already registered': 'El correo ya está registrado en el sistema',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
  'Email format is invalid': 'Formato de correo electrónico inválido',
  'Rate limit exceeded': 'Límite de intentos excedido. Intenta más tarde',
  'Auth api rate limit exceeded': 'Demasiados intentos. Intenta más tarde',
  'Service not available': 'Servicio no disponible temporalmente',
  'Invalid email or password': 'Email o contraseña inválidos',
  'Email rate limit exceeded': 'Demasiados correos enviados. Intenta más tarde',
  'Signup is not allowed': 'El registro está deshabilitado temporalmente',
  'Register is not allowed': 'El registro está deshabilitado temporalmente'
}

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {{isValid: boolean, error: string|null}}
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'El email es obligatorio' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Formato de email inválido' }
  }

  return { isValid: true, error: null }
}

/**
 * Valida contraseña según reglas de seguridad
 * @param {string} password - Contraseña a validar
 * @returns {{isValid: boolean, error: string|null}}
 */
export const validatePassword = (password) => {
  if (!password || !password.trim()) {
    return { isValid: false, error: 'La contraseña es obligatoria' }
  }

  if (password.length < 6) {
    return { isValid: false, error: 'La contraseña debe tener al menos 6 caracteres' }
  }

  return { isValid: true, error: null }
}

/**
 * Valida username
 * @param {string} username - Username a validar
 * @returns {{isValid: boolean, error: string|null}}
 */
export const validateUsername = (username) => {
  if (!username || !username.trim()) {
    return { isValid: false, error: 'El nombre de usuario es obligatorio' }
  }

  if (username.trim().length < 2) {
    return { isValid: false, error: 'El nombre de usuario debe tener al menos 2 caracteres' }
  }

  if (username.trim().length > 30) {
    return { isValid: false, error: 'El nombre de usuario no puede tener más de 30 caracteres' }
  }

  return { isValid: true, error: null }
}

/**
 * Valida datos completos de registro
 * @param {Object} data - Datos del formulario de registro
 * @param {string} data.username - Nombre de usuario
 * @param {string} data.email - Email del usuario
 * @param {string} data.password - Contraseña del usuario
 * @returns {{isValid: boolean, errors: string[]}}
 */
export const validateRegisterData = (data) => {
  const errors = []

  const usernameValidation = validateUsername(data.username)
  if (!usernameValidation.isValid) {
    errors.push(usernameValidation.error)
  }

  const emailValidation = validateEmail(data.email)
  if (!emailValidation.isValid) {
    errors.push(emailValidation.error)
  }

  const passwordValidation = validatePassword(data.password)
  if (!passwordValidation.isValid) {
    errors.push(passwordValidation.error)
  }

  return { isValid: errors.length === 0, errors }
}

/**
 * Valida datos de login
 * @param {Object} data - Datos del formulario de login
 * @param {string} data.email - Email del usuario
 * @param {string} data.password - Contraseña del usuario
 * @returns {{isValid: boolean, errors: string[]}}
 */
export const validateLoginData = (data) => {
  const errors = []

  const emailValidation = validateEmail(data.email)
  if (!emailValidation.isValid) {
    errors.push(emailValidation.error)
  }

  const passwordValidation = validatePassword(data.password)
  if (!passwordValidation.isValid) {
    errors.push(passwordValidation.error)
  }

  return { isValid: errors.length === 0, errors }
}

/**
 * Traduce mensajes de error de Supabase Auth al español
 * @param {string} errorMessage - Mensaje de error original de Supabase
 * @returns {string} Mensaje traducido
 */
export const translateAuthError = (errorMessage) => {
  // Buscar traducción exacta
  if (ERROR_TRANSLATIONS[errorMessage]) {
    return ERROR_TRANSLATIONS[errorMessage]
  }

  // Buscar por coincidencia parcial
  const errorKey = Object.keys(ERROR_TRANSLATIONS).find(key => 
    errorMessage.toLowerCase().includes(key.toLowerCase())
  )

  if (errorKey) {
    return ERROR_TRANSLATIONS[errorKey]
  }

  // Si no hay traducción, retornar mensaje formateado
  return `Error: ${errorMessage}`
}

/**
 * Transforma datos del usuario desde Supabase Auth
 * @param {Object} authData - Datos del usuario desde Supabase
 * @returns {Object} Datos transformados del usuario
 */
export const transformAuthUser = (authData) => {
  if (!authData) return null

  return {
    id: authData.id,
    email: authData.email,
    emailConfirmed: authData.email_confirmed_at !== null,
    createdAt: authData.created_at,
    lastSignIn: authData.last_sign_in_at
  }
}
