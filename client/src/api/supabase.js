/**
 * API Configuration: Supabase Client
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Cliente API genérico para operaciones CRUD
 */
export const apiClient = {
  /**
   * Obtiene todos los registros de una tabla
   * @param {string} table - Nombre de la tabla
   * @param {string} orderBy - Campo por el cual ordenar
   * @returns {Promise<Array>} Array de registros
   */
  async getAll(table, orderBy = 'created_at') {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(orderBy, { ascending: false })
    
    if (error) throw error
    return data
  },

  /**
   * Obtiene un registro por ID
   * @param {string} table - Nombre de la tabla
   * @param {string} id - ID del registro
   * @returns {Promise<Object>} Registro encontrado
   */
  async getById(table, id) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Crea un nuevo registro
   * @param {string} table - Nombre de la tabla
   * @param {Object} data - Datos a insertar
   * @returns {Promise<Object>} Registro creado
   */
  async create(table, data) {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    return result
  },

  /**
   * Actualiza un registro existente
   * @param {string} table - Nombre de la tabla
   * @param {string} id - ID del registro
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} Registro actualizado
   */
  async update(table, id, data) {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return result
  },

  /**
   * Elimina un registro
   * @param {string} table - Nombre de la tabla
   * @param {string} id - ID del registro
   * @returns {Promise<void>}
   */
  async delete(table, id) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}
