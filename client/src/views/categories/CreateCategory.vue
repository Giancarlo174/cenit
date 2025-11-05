<template>
  <Modal 
    title="Nueva Categoría" 
    size="md"
    :loading="loading"
    @close="handleClose"
  >
    <form @submit.prevent="handleSubmit">
      <Input
        v-model="form.name"
        label="Nombre de la categoría"
        placeholder="Ej: Comida, Transporte, Ocio..."
        required
        :error="formError"
        @blur="validateOnBlur"
      />

      <div class="mt-6 flex gap-3 justify-end">
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

const emit = defineEmits(['close', 'created'])

const { createCategory } = useCategories()

const form = ref({
  name: ''
})

const loading = ref(false)
const formError = ref(null)

// Validación visual para deshabilitar botón
const isFormValid = computed(() => {
  return form.value.name.trim().length >= 2 && !loading.value
})

const validateOnBlur = () => {
  const validation = validateCategoryData(form.value)
  formError.value = validation.isValid ? null : validation.errors[0]
}

const handleSubmit = async () => {
  // Validación final
  const validation = validateCategoryData(form.value)
  if (!validation.isValid) {
    formError.value = validation.errors[0]
    return
  }

  loading.value = true
  formError.value = null

  try {
    await createCategory(form.value)
    emit('created')
    emit('close')
  } catch (error) {
    // El error ya se muestra en el composable
    formError.value = error.message
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  emit('close')
}
</script>
