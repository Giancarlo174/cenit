/**
 * Utils: Formatters
 * Funciones puras para formatear datos
 */

/**
 * Formatea un monto como moneda
 * @param {number} amount - Monto a formatear
 * @param {string} currency - Código de moneda (default: USD)
 * @returns {string} Monto formateado (ej: "$1,234.56")
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return '$0.00'
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Formatea una fecha en formato legible
 * @param {string|Date} date - Fecha a formatear
 * @param {string} locale - Locale para el formato (default: 'es-ES')
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, locale = 'es-ES') => {
  if (!date) return 'N/A'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return dateObj.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Formatea una fecha para input type="date"
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const formatDateForInput = (date) => {
  if (!date) {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toISOString().split('T')[0]
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 * @returns {string} Fecha actual
 */
export const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0]
}
