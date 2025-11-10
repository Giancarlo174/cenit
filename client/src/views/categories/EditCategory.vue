<template>
  <Modal 
    title="Editar Categoría" 
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
          Actualizar
        </Button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCategories } from '@/composables/useCategories'
import { validateCategoryData } from '@/modules/categories'
import Button from '@/components/UI/Button.vue'
import Modal from '@/components/UI/Modal.vue'
import Input from '@/components/UI/Input.vue'

const props = defineProps({
  category: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'updated'])

const { updateCategoryData } = useCategories()

const form = ref({
  name: '',
  type: null
})

const loading = ref(false)
const errors = ref({
  name: null
})

// Cargar datos de la categoría al montar
onMounted(() => {
  form.value.name = props.category.name
  form.value.type = props.category.type // Mantener el tipo original (no editable)
})

// Validación visual para deshabilitar botón
const isFormValid = computed(() => {
  return form.value.name.trim().length >= 2 && !loading.value
})

const validateOnBlur = () => {
  if (!form.value.name?.trim()) {
    errors.value.name = 'El nombre es obligatorio'
  } else if (form.value.name.trim().length < 2) {
    errors.value.name = 'El nombre debe tener al menos 2 caracteres'
  } else {
    errors.value.name = null
  }
}

const handleSubmit = async () => {
  // Validación final
  const validation = validateCategoryData(form.value)
  if (!validation.isValid) {
    validation.errors.forEach(error => {
      if (error.includes('nombre')) {
        errors.value.name = error
      }
    })
    return
  }

  loading.value = true

  try {
    await updateCategoryData(props.category.id, form.value)
    emit('updated')
  } catch (error) {
    console.error('Error al actualizar categoría:', error)
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  emit('close')
}
</script>
