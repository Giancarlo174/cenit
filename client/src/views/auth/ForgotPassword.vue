<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50 px-4">
    <Card class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <AppIcon name="material-symbols:lock-reset" :size="48" class="mx-auto mb-3 text-[#9333ea]" />
          <h1 class="text-3xl font-bold text-gray-900">Recuperar Contraseña</h1>
          <p class="mt-2 text-sm text-gray-600">
            Te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>
      </template>

      <div v-if="emailSent" class="space-y-4">
        <div class="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 class="text-md font-semibold text-blue-700 mb-2">
            <AppIcon name="material-symbols:mail-outline" :size="20" class="inline mr-2" />
            Correo enviado
          </h3>
          <p class="text-sm text-blue-600 mb-2">
            Se ha enviado un correo electrónico a <strong>{{ form.email }}</strong> con instrucciones para restablecer tu contraseña.
          </p>
          <p class="text-sm text-blue-600">
            Por favor revisa tu bandeja de entrada (o la carpeta de spam) y sigue las instrucciones del correo.
          </p>
        </div>

        <Button 
          variant="primary" 
          class="w-full"
          @click="handleBackToLogin"
        >
          Volver al inicio de sesión
        </Button>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            Correo Electrónico
          </label>
          <Input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="tu@email.com"
            required
            :disabled="loading"
          />
          <p class="mt-1 text-xs text-gray-500">
            Ingresa el email que usaste para registrarte
          </p>
        </div>

        <Button 
          type="submit" 
          variant="primary" 
          class="w-full"
          :disabled="loading || !isFormValid"
        >
          <AppIcon 
            v-if="loading" 
            name="material-symbols:progress-activity" 
            class="inline mr-2 animate-spin" 
            :size="18" 
          />
          {{ loading ? 'Enviando...' : 'Enviar enlace de recuperación' }}
        </Button>
      </form>

      <template #footer>
        <div class="text-center">
          <router-link 
            to="/login" 
            class="text-sm font-medium text-[#9333ea] hover:text-[#7e22ce]"
          >
            ← Volver al inicio de sesión
          </router-link>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { forgotPassword } from '@/services/auth/forgotPassword'
import { translateAuthError } from '@/modules/auth'
import { showSuccess, showError } from '@/modules/notifications'
import Card from '@/components/UI/Card.vue'
import Input from '@/components/UI/Input.vue'
import Button from '@/components/UI/Button.vue'
import AppIcon from '@/components/UI/Icon.vue'

const router = useRouter()

const form = ref({
  email: ''
})

const loading = ref(false)
const emailSent = ref(false)

const isFormValid = computed(() => {
  return form.value.email.trim().length > 0 && form.value.email.includes('@')
})

const handleSubmit = async () => {
  loading.value = true
  try {
    await forgotPassword(form.value.email)
    
    emailSent.value = true
    await showSuccess(
      'Se ha enviado un correo con instrucciones para restablecer tu contraseña',
      6000
    )
  } catch (error) {
    const translatedError = translateAuthError(error.message)
    await showError(translatedError)
  } finally {
    loading.value = false
  }
}

const handleBackToLogin = () => {
  router.push('/login')
}
</script>
