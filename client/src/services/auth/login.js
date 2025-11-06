/**
 * Servicio de Inicio de Sesión
 * Maneja la autenticación de usuarios existentes
 */

import { supabase } from '@/api/supabase'
import { validateLoginData } from '@/modules/auth'

/**
 * Inicia sesión con email y contraseña
 * @param {Object} credentials - Credenciales del usuario
 * @param {string} credentials.email - Email del usuario
 * @param {string} credentials.password - Contraseña del usuario
 * @returns {Promise<{user: Object, session: Object}>}
 * @throws {Error} Si hay errores de validación o autenticación
 */
export const login = async (credentials) => {
  // Validar credenciales antes de enviar a Supabase
  const validation = validateLoginData(credentials)
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '))
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email.toLowerCase().trim(),
      password: credentials.password
    })

    if (error) {
      throw error
    }

    if (!data.user || !data.session) {
      throw new Error('No se pudo iniciar sesión')
    }

    return {
      user: data.user,
      session: data.session
    }
  } catch (error) {
    // Re-lanzar error para que el composable lo maneje
    throw error
  }
}
