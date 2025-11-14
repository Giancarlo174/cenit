/**
 * Module: Notifications
 * Sistema centralizado de notificaciones usando SweetAlert2
 */

import Swal from 'sweetalert2'

/**
 * Muestra una notificación de éxito
 * @param {string} message - Mensaje a mostrar
 */
export const showSuccess = async (message) => {
  return Swal.fire({
    icon: 'success',
    title: '¡Éxito!',
    text: message,
    confirmButtonColor: '#9333ea',
    timer: 3000,
    timerProgressBar: true
  })
}

/**
 * Muestra una notificación de error
 * @param {string} message - Mensaje a mostrar
 */
export const showError = async (message) => {
  return Swal.fire({
    icon: 'error',
    title: 'Error',
    text: message,
    confirmButtonColor: '#9333ea'
  })
}

/**
 * Muestra un diálogo de confirmación para eliminar
 * @param {string} itemName - Nombre del item a eliminar
 * @param {string} extraInfo - Información adicional opcional
 * @returns {Promise<boolean>} true si confirma, false si cancela
 */
export const confirmDelete = async (itemName, extraInfo = null) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: `Se eliminará "${itemName}" de forma permanente`,
    html: extraInfo ? `
      <p style="margin-bottom: 12px;">Se eliminará <strong>"${itemName}"</strong> de forma permanente</p>
      <p style="margin-bottom: 12px;">${extraInfo}</p>
    ` : undefined,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  })
  
  return result.isConfirmed
}

/**
 * Muestra un diálogo de confirmación genérico
 * @param {string} title - Título del diálogo
 * @param {string} message - Mensaje del diálogo
 * @param {string} confirmText - Texto del botón de confirmar (default: 'Confirmar')
 * @returns {Promise<boolean>} true si confirma, false si cancela
 */
export const confirmAction = async (title, message, confirmText = 'Confirmar') => {
  const result = await Swal.fire({
    title: title,
    text: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#9333ea',
    cancelButtonColor: '#6b7280',
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar'
  })
  
  return result.isConfirmed
}
