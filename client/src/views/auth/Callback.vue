<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
    <Card class="w-full max-w-md text-center">
      <div class="py-8">
        <AppIcon 
          name="material-symbols:mail-outline" 
          :size="64" 
          class="mx-auto mb-4 text-[#9333ea]" 
        />
        <h1 class="text-2xl font-bold text-gray-800 mb-4">
          Verificando tu cuenta
        </h1>
        <p class="text-gray-600 mb-8">
          {{ message }}
        </p>
        <div class="flex justify-center">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#9333ea]"></div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { showSuccess, showError } from '@/modules/notifications'
import Card from '@/components/UI/Card.vue'
import AppIcon from '@/components/UI/Icon.vue'

const router = useRouter()
const route = useRoute()
const { checkAuth } = useAuth()

const message = ref('Estamos procesando la verificación de tu correo electrónico...')

onMounted(async () => {
  // Esperar a que la URL tenga los parámetros
  if (!route.query.access_token && !route.query.code) {
    message.value = 'No se encontró código de verificación. Redirigiendo...'
    await showError('Link de verificación inválido')
    setTimeout(() => router.push('/login'), 2000)
    return
  }

  try {
    // Esperar un momento para que Supabase procese el token
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Verificar si ahora hay sesión activa
    await checkAuth()

    message.value = 'Verificación completa. Redirigiendo...'
    await showSuccess('¡Cuenta verificada correctamente! Bienvenido a Cenit.')
    
    // Redirigir al dashboard
    setTimeout(() => router.push('/dashboard'), 1500)
  } catch (error) {
    console.error('Error en verificación:', error)
    message.value = 'Ocurrió un error al verificar tu cuenta. Por favor, intenta iniciar sesión.'
    await showError('Error en la verificación. Intenta iniciar sesión manualmente.')
    setTimeout(() => router.push('/login'), 3000)
  }
})
</script>
