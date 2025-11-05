<template>
  <Modal 
    title="Nuevo Gasto" 
    size="md"
    :loading="loading"
    @close="handleClose"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Monto -->
      <Input
        v-model.number="form.amount"
        type="number"
        step="0.01"
        min="0.01"
        label="Monto"
        placeholder="0.00"
        required
        :error="errors.amount"
      />

      <!-- Categoría -->
      <div>
        <Select
          v-model="form.category_id"
          :options="categories"
          label="Categoría"
          placeholder="Selecciona una categoría"
          value-key="id"
          label-key="name"
          required
          :error="errors.category"
        />
        
        <!-- Mensaje cuando no hay categorías -->
        <div v-if="!hasCategories" class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div class="flex items-start gap-2">
            <Icon name="mdi:alert-circle" :size="20" class="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div class="flex-1">
              <p class="text-sm text-yellow-800 font-medium mb-1">
                No tienes categorías creadas
              </p>
              <p class="text-xs text-yellow-700 mb-2">
                Para registrar un gasto necesitas primero crear al menos una categoría.
              </p>
              <Button
                variant="secondary"
                icon="mdi:plus"
                type="button"
                @click="goToCategories"
                class="text-sm px-3 py-1.5"
              >
                Crear Categoría
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Descripción -->
      <Textarea
        v-model="form.description"
        label="Descripción"
        placeholder="¿En qué gastaste?"
        :rows="3"
        :max-length="500"
        :error="errors.description"
      />

      <!-- Fecha -->
      <Input
        v-model="form.expense_date"
        type="date"
        label="Fecha del gasto"
        hint="Si no se especifica, se usará la fecha actual"
      />

      <!-- Resumen previo -->
      <div v-if="form.amount > 0" class="p-4 bg-purple-50 rounded-lg border border-purple-200">
        <div class="flex items-center justify-between text-sm">
          <span class="text-purple-700 font-medium">Monto a registrar:</span>
          <span class="text-xl font-bold text-red-600">-{{ formatCurrency(form.amount) }}</span>
        </div>
      </div>

      <!-- Botones -->
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
          Registrar Gasto
        </Button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useExpenses } from '@/composables/useExpenses'
import { useCategories } from '@/composables/useCategories'
import { validateExpenseData } from '@/modules/expenses'
import { formatCurrency, getCurrentDate } from '@/utils/formatters'
import Button from '@/components/UI/Button.vue'
import Modal from '@/components/UI/Modal.vue'
import Input from '@/components/UI/Input.vue'
import Select from '@/components/UI/Select.vue'
import Textarea from '@/components/UI/Textarea.vue'
import Icon from '@/components/UI/Icon.vue'

const emit = defineEmits(['close', 'created'])
const router = useRouter()

const { createExpense } = useExpenses()
const { categories, hasCategories, fetchCategories } = useCategories()

const form = ref({
  amount: null,
  category_id: null,
  description: '',
  expense_date: getCurrentDate()
})

const loading = ref(false)
const errors = ref({
  amount: null,
  category: null,
  description: null
})

// Validación visual para deshabilitar botón
const isFormValid = computed(() => {
  return form.value.amount > 0 && 
         form.value.category_id && 
         hasCategories.value && 
         !loading.value
})

// Carga las categorías al montar
onMounted(async () => {
  await fetchCategories()
})

const validateForm = () => {
  errors.value = {
    amount: null,
    category: null,
    description: null
  }
  
  const validation = validateExpenseData(form.value)
  
  if (!validation.isValid) {
    validation.errors.forEach(error => {
      if (error.includes('monto')) {
        errors.value.amount = error
      } else if (error.includes('categoría')) {
        errors.value.category = error
      } else if (error.includes('descripción')) {
        errors.value.description = error
      }
    })
    return false
  }
  
  return true
}

const goToCategories = () => {
  emit('close')
  router.push('/categories')
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    await createExpense(form.value)
    emit('created')
    emit('close')
  } catch (error) {
    // El error ya se muestra en el composable
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  emit('close')
}
</script>
