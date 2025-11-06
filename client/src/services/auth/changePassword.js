/**
 * Servicio de Cambio de Contraseña
 * Cambia la contraseña del usuario autenticado
 */

import { supabase } from '@/api/supabase'
import { validateChangePasswordData } from '@/modules/password'

/**
 * Cambia la contraseña del usuario actual
 * @param {Object} data - Datos del formulario
 * @param {string} data.currentPassword - Contraseña actual
 * @param {string} data.newPassword - Nueva contraseña
 * @param {string} data.confirmPassword - Confirmación de nueva contraseña
 * @param {string} userEmail - Email del usuario autenticado
 * @returns {Promise<{success: boolean}>}
 * @throws {Error} Si hay error al cambiar contraseña
 */
export const changePassword = async (data, userEmail) => {
  // Validar datos
  const validation = validateChangePasswordData(data)
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '))
  }

  try {
    // Primero verificar que la contraseña actual es correcta
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: data.currentPassword
    })

    if (signInError) {
      throw new Error('Contraseña actual incorrecta')
    }

    // Actualizar la contraseña
    const { error } = await supabase.auth.updateUser({
      password: data.newPassword
    })

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    throw error
  }
}
