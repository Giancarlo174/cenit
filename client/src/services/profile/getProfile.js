/**
 * Service: Get Profile
 * Obtiene el perfil del usuario autenticado
 */

import { apiClient } from '@/api/supabase'
import { transformProfileFromDB } from '@/modules/profile'

/**
 * Obtiene el perfil del usuario
 * @param {string} userId - ID del usuario autenticado
 * @returns {Promise<Object>} Perfil del usuario
 */
export const getProfile = async (userId) => {
  try {
    const data = await apiClient.getById('profiles', userId)
    
    if (!data) {
      throw new Error('Perfil no encontrado')
    }

    return transformProfileFromDB(data)
  } catch (error) {
    if (error.message.includes('does not exist')) {
      throw new Error('Tabla "profiles" no configurada en Supabase')
    }
    throw new Error(`Error al obtener perfil: ${error.message}`)
  }
}
