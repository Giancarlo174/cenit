<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p class="text-gray-600 mt-1">Administra tu información personal</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !profile" class="flex justify-center items-center py-12">
      <Icon name="mdi:loading" class="animate-spin text-purple-600" :size="48" />
    </div>

    <!-- Contenido -->
    <div v-else>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Tarjeta de Información General -->
        <Card>
          <template #header>
            <h2 class="text-lg font-semibold text-gray-900">Información General</h2>
          </template>

          <form @submit.prevent="handleUpdateProfile" class="space-y-4">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
                Nombre de Usuario
              </label>
              <Input
                id="username"
                v-model="form.username"
                type="text"
                placeholder="Ingresa tu nombre"
                :maxlength="30"
                required
                :disabled="loading"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              :disabled="loading || !isFormValid"
            >
              <Icon
                v-if="loading"
                name="material-symbols:progress-activity"
                class="inline mr-2 animate-spin"
                :size="18"
              />
              {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
            </Button>
          </form>
        </Card>

        <!-- Tarjeta de Cambiar Contraseña -->
        <Card>
          <template #header>
            <h2 class="text-lg font-semibold text-gray-900">Cambiar Contraseña</h2>
          </template>

          <form @submit.prevent="handleChangePassword" class="space-y-4">
            <div>
              <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-1">
                Contraseña Actual
              </label>
              <Input
                id="currentPassword"
                v-model="passwordForm.currentPassword"
                :type="showCurrentPassword ? 'text' : 'password'"
                placeholder="Ingresa contraseña actual"
                required
                :disabled="loadingPassword"
              >
                <template #suffix>
                  <button
                    type="button"
                    class="text-gray-500 hover:text-gray-700 focus:outline-none"
                    @click="showCurrentPassword = !showCurrentPassword"
                    tabindex="-1"
                  >
                    <Icon
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
                v-model="passwordForm.newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                placeholder="Ingresa nueva contraseña"
                required
                :disabled="loadingPassword"
              >
                <template #suffix>
                  <button
                    type="button"
                    class="text-gray-500 hover:text-gray-700 focus:outline-none"
                    @click="showNewPassword = !showNewPassword"
                    tabindex="-1"
                  >
                    <Icon
                      :name="showNewPassword ? 'material-symbols:visibility-off' : 'material-symbols:visibility'"
                      :size="20"
                    />
                  </button>
                </template>
              </Input>
              <p class="mt-1 text-xs text-gray-500">
                Mínimo 6 caracteres
              </p>
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Nueva Contraseña
              </label>
              <Input
                id="confirmPassword"
                v-model="passwordForm.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Confirma nueva contraseña"
                required
                :disabled="loadingPassword"
              >
                <template #suffix>
                  <button
                    type="button"
                    class="text-gray-500 hover:text-gray-700 focus:outline-none"
                    @click="showConfirmPassword = !showConfirmPassword"
                    tabindex="-1"
                  >
                    <Icon
                      :name="showConfirmPassword ? 'material-symbols:visibility-off' : 'material-symbols:visibility'"
                      :size="20"
                    />
                  </button>
                </template>
              </Input>
            </div>

            <Button
              type="submit"
              variant="secondary"
              :disabled="loadingPassword || !isPasswordFormValid"
            >
              <Icon
                v-if="loadingPassword"
                name="material-symbols:progress-activity"
                class="inline mr-2 animate-spin"
                :size="18"
              />
              {{ loadingPassword ? 'Cambiando...' : 'Cambiar Contraseña' }}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useProfile } from '@/composables/useProfile'
import { useAuth } from '@/composables/useAuth'
import { changePassword } from '@/services/auth/changePassword'
import { showSuccess, showError } from '@/modules/notifications'
import Card from '@/components/UI/Card.vue'
import Input from '@/components/UI/Input.vue'
import Button from '@/components/UI/Button.vue'
import Icon from '@/components/UI/Icon.vue'

const { profile, loading, update } = useProfile()
const { userEmail } = useAuth()

// Formulario de perfil
const form = ref({
  username: ''
})

// Formulario de contraseña
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const loadingPassword = ref(false)

// Cargar datos del perfil en el formulario
watch(profile, (newProfile) => {
  if (newProfile) {
    form.value.username = newProfile.username
  }
}, { immediate: true })

// Validación del formulario de perfil
const isFormValid = computed(() => {
  return (
    form.value.username.trim().length >= 2 &&
    !loading.value
  )
})

// Validación del formulario de contraseña
const isPasswordFormValid = computed(() => {
  const currentPwd = passwordForm.value.currentPassword.trim()
  const newPwd = passwordForm.value.newPassword.trim()
  const confirmPwd = passwordForm.value.confirmPassword.trim()
  
  return (
    currentPwd.length >= 6 &&
    newPwd.length >= 6 &&
    confirmPwd.length >= 6 &&
    newPwd === confirmPwd &&
    !loadingPassword.value
  )
})

const handleUpdateProfile = async () => {
  const result = await update(form.value)
  
  if (result?.success) {
    // El composable ya muestra el mensaje de éxito
  }
}

const handleChangePassword = async () => {
  // Trimear valores para evitar problemas con espacios
  const newPasswordTrimmed = passwordForm.value.newPassword.trim()
  const confirmPasswordTrimmed = passwordForm.value.confirmPassword.trim()

  // Validar longitud mínima después de trim
  if (newPasswordTrimmed.length < 6) {
    await showError('La nueva contraseña debe tener al menos 6 caracteres')
    return
  }

  // Validar que las contraseñas coincidan (usando trim)
  if (newPasswordTrimmed !== confirmPasswordTrimmed) {
    await showError('Las contraseñas no coinciden')
    return
  }

  loadingPassword.value = true
  try {
    await changePassword({
      currentPassword: passwordForm.value.currentPassword.trim(),
      newPassword: newPasswordTrimmed,
      confirmPassword: confirmPasswordTrimmed
    }, userEmail.value)  // Pasar userEmail como segundo parámetro

    await showSuccess('Contraseña actualizada correctamente')

    // Limpiar formulario
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    await showError(error.message)
  } finally {
    loadingPassword.value = false
  }
}
</script>
