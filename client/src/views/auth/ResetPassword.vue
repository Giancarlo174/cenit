<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50 px-4">
    <Card v-if="!tokenChecked" class="w-full max-w-md">
      <div class="py-8 text-center">
        <AppIcon 
          name="material-symbols:lock-reset" 
          :size="48" 
          class="mx-auto mb-3 text-[#9333ea]" 
        />
        <h1 class="text-2xl font-bold text-gray-800 mb-4">Verificando enlace</h1>
        <div class="flex justify-center">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#9333ea]"></div>
        </div>
      </div>
    </Card>

    <Card v-else class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <AppIcon name="material-symbols:lock-reset" :size="48" class="mx-auto mb-3 text-[#9333ea]" />
          <h1 class="text-3xl font-bold text-gray-900">Restablecer Contraseña</h1>
          <p class="mt-2 text-sm text-gray-600">Ingresa tu nueva contraseña</p>
        </div>
      </template>

        <div v-if="tokenError" class="space-y-4">
          <div class="p-4 bg-red-50 border border-red-200 rounded-md">
            <p class="text-sm text-red-700">{{ tokenError }}</p>
          </div>
          <Button variant="primary" class="w-full" @click="goToForgotPassword">
            Solicitar nuevo enlace
          </Button>
        </div>

        <div v-else-if="resetComplete" class="space-y-4">
          <div class="p-4 bg-green-50 border border-green-200 rounded-md">
            <p class="text-sm text-green-700">
              Tu contraseña ha sido restablecida con éxito.
            </p>
          </div>
          <Button variant="primary" class="w-full" @click="goToLogin">
            Ir al inicio de sesión
          </Button>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Nueva Contraseña
            </label>
            <Input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Tu nueva contraseña"
              required
              :disabled="loading"
            >
              <template #suffix>
                <button
                  type="button"
                  class="text-gray-500 hover:text-gray-700 focus:outline-none"
                  @click="showPassword = !showPassword"
                  tabindex="-1"
                >
                  <AppIcon 
                    :name="showPassword ? 'material-symbols:visibility-off' : 'material-symbols:visibility'" 
                    :size="20" 
                  />
                </button>
              </template>
            </Input>
            <p class="mt-1 text-xs text-gray-500">Mínimo 6 caracteres</p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Contraseña
            </label>
            <Input
              id="confirmPassword"
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Confirma tu nueva contraseña"
              required
              :disabled="loading"
            >
              <template #suffix>
                <button
                  type="button"
                  class="text-gray-500 hover:text-gray-700 focus:outline-none"
                  @click="showConfirmPassword = !showConfirmPassword"
                  tabindex="-1"
                >
                  <AppIcon 
                    :name="showConfirmPassword ? 'material-symbols:visibility-off' : 'material-symbols:visibility'" 
                    :size="20" 
                  />
                </button>
              </template>
            </Input>
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
            {{ loading ? 'Restableciendo...' : 'Restablecer contraseña' }}
          </Button>
        </form>

      <template #footer>
        <div v-if="!tokenError && !resetComplete" class="text-center">
          <button
            type="button"
            @click="goToLogin"
            class="text-sm font-medium text-[#9333ea] hover:text-[#7e22ce]"
          >
            ← Volver al inicio de sesión
          </button>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/api/supabase'
import { resetPassword } from '@/services/auth/resetPassword'
import { translateAuthError } from '@/modules/auth'
import { showSuccess, showError } from '@/modules/notifications'
import Card from '@/components/UI/Card.vue'
import Input from '@/components/UI/Input.vue'
import Button from '@/components/UI/Button.vue'
import AppIcon from '@/components/UI/Icon.vue'

const router = useRouter()

const form = ref({
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const tokenChecked = ref(false)
const tokenError = ref(null)
const resetComplete = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const isFormValid = computed(() => {
  return (
    form.value.password.length >= 6 &&
    form.value.confirmPassword.length >= 6
  )
})

const checkTokenValidity = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      tokenError.value = 'Hubo un problema verificando tu sesión. Por favor solicita un nuevo enlace.'
    } else if (!data.session) {
      tokenError.value = 'Enlace de restablecimiento inválido o expirado. Por favor solicita un nuevo enlace.'
    }
  } catch (error) {
    tokenError.value = 'Ocurrió un error inesperado. Por favor intenta de nuevo.'
  } finally {
    tokenChecked.value = true
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    await resetPassword(form.value)
    
    resetComplete.value = true
    await showSuccess('Contraseña restablecida con éxito')
    
    // Cerrar sesión y redirigir al login después de 2 segundos
    setTimeout(async () => {
      await supabase.auth.signOut()
      router.push('/login')
    }, 2000)
  } catch (error) {
    const translatedError = translateAuthError(error.message)
    await showError(translatedError)
    
    if (error.message.includes('token') || error.message.includes('expired')) {
      tokenError.value = 'El enlace de restablecimiento es inválido o ha expirado. Por favor solicita un nuevo enlace.'
    }
  } finally {
    loading.value = false
  }
}

const goToLogin = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}

const goToForgotPassword = () => {
  router.push('/forgot-password')
}

onMounted(() => {
  checkTokenValidity()
})
</script>
