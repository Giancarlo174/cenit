/**
 * Servicio de Cierre de Sesión
 * Maneja el logout del usuario actual
 */

import { supabase } from '@/api/supabase'

/**
 * Cierra la sesión del usuario actual
 * @returns {Promise<void>}
 * @throws {Error} Si hay error al cerrar sesión
 */
export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }
  } catch (error) {
    throw error
  }
}
