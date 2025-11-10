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
 * @param {string|Date} date - Fecha a formatear (preferiblemente string YYYY-MM-DD)
 * @param {string} locale - Locale para el formato (default: 'es-ES')
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, locale = 'es-ES') => {
  if (!date) return 'N/A'
  
  let dateObj
  
  // Si es un string en formato YYYY-MM-DD, parsearlo manualmente para evitar timezone
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-').map(Number)
    // Crear Date en hora local (no UTC)
    dateObj = new Date(year, month - 1, day)
  } else {
    // Si es otro formato o ya es Date, usar como está
    dateObj = typeof date === 'string' ? new Date(date) : date
  }
  
  return dateObj.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Formatea una fecha para input type="date" (zona horaria local)
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const formatDateForInput = (date) => {
  if (!date) {
    return getCurrentDate()
  }
  
  // Si ya es un string en formato YYYY-MM-DD, retornarlo directamente
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date
  }
  
  // Si es un objeto Date, extraer componentes en zona horaria local
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD (zona horaria local)
 * @returns {string} Fecha actual
 */
export const getCurrentDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
