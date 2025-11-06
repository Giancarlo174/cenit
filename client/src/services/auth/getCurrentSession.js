/**
 * Servicio para obtener sesión actual
 * Verifica y retorna la sesión activa del usuario
 */

import { supabase } from '@/api/supabase'

/**
 * Obtiene la sesión actual del usuario
 * @returns {Promise<{user: Object|null, session: Object|null}>}
 */
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      throw error
    }

    return {
      user: session?.user || null,
      session: session || null
    }
  } catch (error) {
    console.error('Error al obtener sesión:', error)
    return {
      user: null,
      session: null
    }
  }
}
