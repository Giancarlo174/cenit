/**
 * Servicio de Registro de Usuario
 * Maneja el registro de nuevos usuarios en Supabase Auth
 */

import { supabase } from '@/api/supabase'
import { validateRegisterData } from '@/modules/auth'

/**
 * Registra un nuevo usuario en el sistema
 * @param {Object} data - Datos del nuevo usuario
 * @param {string} data.username - Nombre de usuario
 * @param {string} data.email - Email del usuario
 * @param {string} data.password - Contraseña del usuario
 * @returns {Promise<{user: Object, requiresEmailConfirmation: boolean}>}
 * @throws {Error} Si hay errores de validación o en el registro
 */
export const register = async (data) => {
  // Validar datos antes de enviar a Supabase
  const validation = validateRegisterData(data)
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '))
  }

  try {
    // Registrar usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email.toLowerCase().trim(),
      password: data.password,
      options: {
        // URL de callback para verificación de email
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // Metadata adicional que se guardará en auth.users
        data: {
          username: data.username.trim()
        }
      }
    })

    if (authError) {
      // Manejar error específico de usuario ya registrado
      if (authError.message.includes('already registered') || 
          authError.message.includes('already been registered')) {
        throw new Error('User already registered')
      }
      throw authError
    }

    // Verificar si se creó el usuario
    if (!authData.user) {
      throw new Error('No se pudo crear el usuario')
    }

    // El perfil se crea automáticamente mediante el trigger on_auth_user_created
    // que ejecuta la función handle_new_user() en la base de datos

    return {
      user: authData.user,
      // Supabase envía email de confirmación por defecto
      requiresEmailConfirmation: true
    }
  } catch (error) {
    // Re-lanzar error para que el composable lo maneje
    throw error
  }
}
