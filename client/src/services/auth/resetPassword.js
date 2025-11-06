/**
 * Servicio de Restablecimiento de Contraseña
 * Actualiza la contraseña usando token de recuperación
 */

import { supabase } from '@/api/supabase'
import { validateResetPasswordData } from '@/modules/password'

/**
 * Restablece la contraseña del usuario con token de recuperación
 * @param {Object} data - Datos del formulario
 * @param {string} data.password - Nueva contraseña
 * @param {string} data.confirmPassword - Confirmación de contraseña
 * @returns {Promise<{success: boolean}>}
 * @throws {Error} Si hay error al restablecer
 */
export const resetPassword = async (data) => {
  // Validar datos
  const validation = validateResetPasswordData(data)
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '))
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: data.password
    })

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    throw error
  }
}
