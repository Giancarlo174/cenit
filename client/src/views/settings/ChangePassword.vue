<template>
  <div class="dashboard-container">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <button
          @click="goBack"
          class="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <AppIcon name="material-symbols:arrow-back" :size="20" class="mr-2" />
          Volver
        </button>
        <h1 class="text-3xl font-bold text-gray-900">Cambiar Contraseña</h1>
        <p class="mt-2 text-gray-600">
          Actualiza tu contraseña para mantener tu cuenta segura
        </p>
      </div>

      <Card>
        <div v-if="changeComplete" class="space-y-4">
          <div class="p-4 bg-green-50 border border-green-200 rounded-md">
            <p class="text-sm text-green-700">
              Tu contraseña ha sido cambiada con éxito.
            </p>
          </div>
          <Button variant="primary" @click="goToDashboard">
            Volver al Dashboard
          </Button>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-1">
              Contraseña Actual
            </label>
            <Input
              id="currentPassword"
              v-model="form.currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              placeholder="Tu contraseña actual"
              required
              :disabled="loading"
            >
              <template #suffix>
                <button
                  type="button"
                  class="text-gray-500 hover:text-gray-700 focus:outline-none"
                  @click="showCurrentPassword = !showCurrentPassword"
                  tabindex="-1"
                >
                  <AppIcon 
                    :name="showCurrentPassword ? 'material-symbols:visibility-off' : 'material-symbols:visibility'" 
                    :size="20" 
                  />
                </button>
              </template>
            </Input>
          </div>

          <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">
              Nueva Contraseña
            </label>
            <Input
              id="newPassword"
              v-model="form.newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              placeholder="Tu nueva contraseña"
              required
              :disabled="loading"
            >
              <template #suffix>
                <button
                  type="button"
                  class="text-gray-500 hover:text-gray-700 focus:outline-none"
                  @click="showNewPassword = !showNewPassword"
                  tabindex="-1"
                >
                  <AppIcon 
                    :name="showNewPassword ? 'material-symbols:visibility-off' : 'material-symbols:visibility'" 
                    :size="20" 
                  />
                </button>
              </template>
            </Input>
            <p class="mt-1 text-xs text-gray-500">Mínimo 6 caracteres</p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Nueva Contraseña
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

          <div class="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              class="flex-1"
              @click="goBack"
              :disabled="loading"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              class="flex-1"
              :disabled="loading || !isFormValid"
            >
              <AppIcon 
                v-if="loading" 
                name="material-symbols:progress-activity" 
                class="inline mr-2 animate-spin" 
                :size="18" 
              />
              {{ loading ? 'Actualizando...' : 'Cambiar contraseña' }}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { changePassword } from '@/services/auth/changePassword'
import { translateAuthError } from '@/modules/auth'
import { showSuccess, showError } from '@/modules/notifications'
import Card from '@/components/UI/Card.vue'
import Input from '@/components/UI/Input.vue'
import Button from '@/components/UI/Button.vue'
import AppIcon from '@/components/UI/Icon.vue'

const router = useRouter()
const { userEmail } = useAuth()

const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const loading = ref(false)
const changeComplete = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const isFormValid = computed(() => {
  return (
    form.value.currentPassword.length >= 6 &&
    form.value.newPassword.length >= 6 &&
    form.value.confirmPassword.length >= 6
  )
})

const handleSubmit = async () => {
  loading.value = true
  try {
    await changePassword(form.value, userEmail.value)
    
    changeComplete.value = true
    await showSuccess('Contraseña actualizada con éxito')
    
    // Limpiar formulario
    form.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    
    // Volver al dashboard después de 2 segundos
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  } catch (error) {
    const translatedError = translateAuthError(error.message)
    await showError(translatedError)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

const goToDashboard = () => {
  router.push('/dashboard')
}
</script>
