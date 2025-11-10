<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50 px-4">
    <Card class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900">Crear Cuenta</h1>
          <p class="mt-2 text-sm text-gray-600">Mantén tus finanzas bajo control con Cenit</p>
        </div>
      </template>

      <!-- Mensaje de éxito post-registro -->
      <div v-if="registrationComplete" class="p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 class="text-md font-semibold text-blue-700 mb-2">
          <AppIcon name="material-symbols:mail-outline" class="inline mr-2" :size="20" />
          Verificación pendiente
        </h3>
        <p class="text-sm text-blue-600 mb-2">
          Se ha enviado un correo electrónico a <strong>{{ form.email }}</strong> con un enlace de verificación.
        </p>
        <p class="text-sm text-blue-600 mb-4">
          Por favor revisa tu bandeja de entrada (o la carpeta de spam) para completar la verificación.
          No podrás acceder al sistema hasta verificar tu correo electrónico.
        </p>
        <Button 
          variant="primary" 
          class="w-full"
          @click="goToLogin"
        >
          Ir a Iniciar Sesión
        </Button>
      </div>

      <!-- Formulario de registro -->
      <form v-else @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
            Primer Nombre
          </label>
          <Input
            id="username"
            v-model="form.username"
            type="text"
            placeholder="Ingresa tu primer nombre"
            :maxlength="30"
            required
            :disabled="loading"
          />
        </div>

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
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <Input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Mínimo 6 caracteres"
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
          <p class="mt-1 text-xs text-gray-500">
            La contraseña debe tener al menos 6 caracteres
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
          {{ loading ? 'Creando cuenta...' : 'Crear Cuenta' }}
        </Button>
      </form>

      <template #footer>
        <div class="text-center">
          <p class="text-sm text-gray-600">
            ¿Ya tienes cuenta?
            <router-link 
              to="/login" 
              class="font-medium text-[#9333ea] hover:text-[#7e22ce]"
            >
              Iniciar Sesión
            </router-link>
          </p>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import Card from '@/components/UI/Card.vue'
import Input from '@/components/UI/Input.vue'
import Button from '@/components/UI/Button.vue'
import AppIcon from '@/components/UI/Icon.vue'

const router = useRouter()
const { register, loading } = useAuth()

// Estado del formulario
const form = ref({
  username: '',
  email: '',
  password: ''
})

const showPassword = ref(false)
const registrationComplete = ref(false)

// Validación del formulario
const isFormValid = computed(() => {
  return (
    form.value.username.trim().length >= 2 &&
    form.value.email.trim().length > 0 &&
    form.value.password.length >= 6
  )
})

const handleRegister = async () => {
  try {
    const result = await register({
      username: form.value.username,
      email: form.value.email,
      password: form.value.password
    })

    if (result.success && result.requiresEmailConfirmation) {
      registrationComplete.value = true
    } else if (result.alreadyExists) {
      // Si el usuario ya existe, redirigir a login
      setTimeout(() => router.push('/login'), 2000)
    }
  } catch (error) {
    console.error('Error en registro:', error)
    // El error ya fue mostrado por el composable
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>
