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
   * @param {Object|string} options - Opciones de consulta o string de orderBy (retrocompatibilidad)
   * @param {Object} options.filters - Filtros a aplicar (ej: { user_id: 'abc' })
   * @param {Object|string} options.orderBy - Campo para ordenar o objeto { column, ascending }
   * @returns {Promise<Array>} Array de registros
   */
  async getAll(table, options = {}) {
    // Retrocompatibilidad: si options es un string, es el orderBy
    if (typeof options === 'string') {
      options = { orderBy: options }
    }

    // Valores por defecto
    const { 
      filters = {}, 
      orderBy = 'created_at' 
    } = options

    // Construir consulta
    let query = supabase.from(table).select('*')

    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      // Si el valor es null, usar .is() en lugar de .eq()
      if (value === null) {
        query = query.is(key, null)
      } else {
        query = query.eq(key, value)
      }
    })

    // Aplicar ordenamiento
    if (typeof orderBy === 'string') {
      query = query.order(orderBy, { ascending: false })
    } else if (orderBy && orderBy.column) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false })
    }

    const { data, error } = await query
    
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
