<template>
  <Modal 
    title="Nueva Categoría" 
    size="md"
    :loading="loading"
    @close="handleClose"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <Input
        v-model="form.name"
        label="Nombre de la categoría"
        placeholder="Ej: Salario, Comida, Transporte..."
        :maxlength="30"
        required
        :error="errors.name"
        @blur="validateOnBlur"
      />

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Tipo de categoría <span class="text-red-500">*</span>
        </label>
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            @click="form.type = 'income'"
            :class="[
              'p-4 rounded-lg border-2 transition-all',
              form.type === 'income'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300 bg-white'
            ]"
          >
            <div class="flex flex-col items-center gap-2">
              <Icon 
                name="mdi:cash-plus" 
                :size="32" 
                :class="form.type === 'income' ? 'text-green-600' : 'text-gray-400'"
              />
              <span :class="[
                'font-medium text-sm',
                form.type === 'income' ? 'text-green-700' : 'text-gray-600'
              ]">
                Ingreso
              </span>
            </div>
          </button>

          <button
            type="button"
            @click="form.type = 'expense'"
            :class="[
              'p-4 rounded-lg border-2 transition-all',
              form.type === 'expense'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-red-300 bg-white'
            ]"
          >
            <div class="flex flex-col items-center gap-2">
              <Icon 
                name="mdi:cash-minus" 
                :size="32" 
                :class="form.type === 'expense' ? 'text-red-600' : 'text-gray-400'"
              />
              <span :class="[
                'font-medium text-sm',
                form.type === 'expense' ? 'text-red-700' : 'text-gray-600'
              ]">
                Gasto
              </span>
            </div>
          </button>
        </div>
        <p v-if="errors.type" class="mt-1 text-sm text-red-600">
          {{ errors.type }}
        </p>
      </div>

      <div class="flex gap-3 justify-end pt-2">
        <Button
          variant="secondary"
          type="button"
          @click="handleClose"
        >
          Cancelar
        </Button>
        
        <Button
          type="submit"
          :disabled="!isFormValid"
          :loading="loading"
        >
          Crear Categoría
        </Button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCategories } from '@/composables/useCategories'
import { validateCategoryData } from '@/modules/categories'
import Button from '@/components/UI/Button.vue'
import Modal from '@/components/UI/Modal.vue'
import Input from '@/components/UI/Input.vue'
import Icon from '@/components/UI/Icon.vue'

const emit = defineEmits(['close', 'created'])

const { createCategory } = useCategories()

const form = ref({
  name: '',
  type: null
})

const loading = ref(false)
const errors = ref({
  name: null,
  type: null
})
const hasAttemptedSubmit = ref(false)

// Validación visual para deshabilitar botón
const isFormValid = computed(() => {
  return form.value.name.trim().length >= 2 && 
         form.value.type !== null && 
         !loading.value
})

const validateOnBlur = () => {
  // Solo validar el nombre en blur, no el tipo
  if (!form.value.name?.trim()) {
    errors.value.name = 'El nombre es obligatorio'
  } else if (form.value.name.trim().length < 2) {
    errors.value.name = 'El nombre debe tener al menos 2 caracteres'
  } else {
    errors.value.name = null
  }
}

const handleSubmit = async () => {
  hasAttemptedSubmit.value = true
  
  // Validación final completa (incluyendo tipo)
  const validation = validateCategoryData(form.value)
  if (!validation.isValid) {
    validation.errors.forEach(error => {
      if (error.includes('nombre')) {
        errors.value.name = error
      } else if (error.includes('tipo')) {
        errors.value.type = error
      }
    })
    return
  }

  loading.value = true
  errors.value = { name: null, type: null }

  try {
    await createCategory(form.value)
    emit('created')
    emit('close')
  } catch (error) {
    // El error ya se muestra en el composable
    errors.value.name = error.message
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  emit('close')
}
</script>
