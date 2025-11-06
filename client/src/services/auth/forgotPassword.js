/**
 * Servicio de Recuperación de Contraseña
 * Envía email con link para restablecer contraseña
 */

import { supabase } from '@/api/supabase'
import { validateEmail } from '@/modules/auth'

/**
 * Solicita email de recuperación de contraseña
 * @param {string} email - Email del usuario
 * @returns {Promise<{success: boolean}>}
 * @throws {Error} Si hay error al enviar el email
 */
export const forgotPassword = async (email) => {
  // Validar email
  const validation = validateEmail(email)
  if (!validation.isValid) {
    throw new Error(validation.error)
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.toLowerCase().trim(),
      {
        redirectTo: `${window.location.origin}/reset-password`
      }
    )

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    throw error
  }
}
