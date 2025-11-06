/**
 * Service: Update Profile
 * Actualiza el perfil del usuario autenticado
 */

import { apiClient } from '@/api/supabase'
import { validateProfileData, transformProfileForDB, transformProfileFromDB } from '@/modules/profile'

/**
 * Actualiza el perfil del usuario
 * @param {string} userId - ID del usuario autenticado
 * @param {Object} data - Datos del perfil a actualizar
 * @returns {Promise<Object>} Perfil actualizado
 */
export const updateProfile = async (userId, data) => {
  // Validar datos
  const validation = validateProfileData(data)
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '))
  }

  // Transformar datos para la DB
  const transformedData = transformProfileForDB(data)

  try {
    const result = await apiClient.update('profiles', userId, transformedData)
    return transformProfileFromDB(result)
  } catch (error) {
    if (error.message.includes('does not exist')) {
      throw new Error('Tabla "profiles" no configurada en Supabase')
    }
    throw new Error(`Error al actualizar perfil: ${error.message}`)
  }
}
