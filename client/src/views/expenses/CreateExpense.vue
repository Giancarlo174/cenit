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
      <Select
        v-model="form.category_id"
        :options="categories"
        label="Categoría"
        placeholder="Sin categoría"
        value-key="id"
        label-key="name"
      />

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
import { useExpenses } from '@/composables/useExpenses'
import { useCategories } from '@/composables/useCategories'
import { validateExpenseData } from '@/modules/expenses'
import { formatCurrency, getCurrentDate } from '@/utils/formatters'
import Button from '@/components/UI/Button.vue'
import Modal from '@/components/UI/Modal.vue'
import Input from '@/components/UI/Input.vue'
import Select from '@/components/UI/Select.vue'
import Textarea from '@/components/UI/Textarea.vue'

const emit = defineEmits(['close', 'created'])

const { createExpense } = useExpenses()
const { categories, fetchCategories } = useCategories()

const form = ref({
  amount: null,
  category_id: null,
  description: '',
  expense_date: getCurrentDate()
})

const loading = ref(false)
const errors = ref({
  amount: null,
  description: null
})

// Validación visual para deshabilitar botón
const isFormValid = computed(() => {
  return form.value.amount > 0 && !loading.value
})

// Carga las categorías al montar
onMounted(async () => {
  await fetchCategories()
})

const validateForm = () => {
  errors.value = {
    amount: null,
    description: null
  }
  
  const validation = validateExpenseData(form.value)
  
  if (!validation.isValid) {
    validation.errors.forEach(error => {
      if (error.includes('monto')) {
        errors.value.amount = error
      } else if (error.includes('descripción')) {
        errors.value.description = error
      }
    })
    return false
  }
  
  return true
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
