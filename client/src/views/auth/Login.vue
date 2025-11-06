<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50 px-4">
    <Card class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900">Iniciar Sesión</h1>
          <p class="mt-2 text-sm text-gray-600">Bienvenido de nuevo, tus finanzas te esperan</p>
        </div>
      </template>

      <form @submit.prevent="handleLogin" class="space-y-4">
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
            placeholder="Tu contraseña"
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
          <div class="mt-2 text-right">
            <router-link 
              to="/forgot-password" 
              class="text-sm font-medium text-[#9333ea] hover:text-[#7e22ce]"
            >
              ¿Olvidaste tu contraseña?
            </router-link>
          </div>
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
          {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </Button>
      </form>

      <template #footer>
        <div class="text-center space-y-2">
          <p class="text-sm text-gray-600">
            ¿No tienes cuenta?
            <router-link 
              to="/register" 
              class="font-medium text-[#9333ea] hover:text-[#7e22ce]"
            >
              Crear una
            </router-link>
          </p>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import Card from '@/components/UI/Card.vue'
import Input from '@/components/UI/Input.vue'
import Button from '@/components/UI/Button.vue'
import AppIcon from '@/components/UI/Icon.vue'

const { login, loading } = useAuth()

// Estado del formulario
const form = ref({
  email: '',
  password: ''
})

const showPassword = ref(false)

// Validación del formulario
const isFormValid = computed(() => {
  return (
    form.value.email.trim().length > 0 &&
    form.value.password.length >= 6
  )
})

const handleLogin = async () => {
  try {
    await login({
      email: form.value.email,
      password: form.value.password
    })
    // El composable maneja la redirección al dashboard
  } catch (error) {
    console.error('Error en login:', error)
    // El error ya fue mostrado por el composable
  }
}
</script>
