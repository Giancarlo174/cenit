<template>
  <Modal 
    title="Nueva Transacción" 
    size="md"
    :loading="loading"
    :show-close-button="false"
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

      <!-- Tipo de Transacción -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Transacción <span class="text-red-500">*</span>
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
            <Icon name="mdi:cash-plus" :class="[
              'mx-auto',
              form.type === 'income' ? 'text-green-600' : 'text-gray-400'
            ]" :size="32" />
            <p :class="[
              'font-medium mt-2 text-sm',
              form.type === 'income' ? 'text-green-700' : 'text-gray-600'
            ]">
              Ingreso
            </p>
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
            <Icon name="mdi:cash-minus" :class="[
              'mx-auto',
              form.type === 'expense' ? 'text-red-600' : 'text-gray-400'
            ]" :size="32" />
            <p :class="[
              'font-medium mt-2 text-sm',
              form.type === 'expense' ? 'text-red-700' : 'text-gray-600'
            ]">
              Gasto
            </p>
          </button>
        </div>
        <p v-if="errors.type" class="text-sm text-red-600 mt-1">{{ errors.type }}</p>
      </div>

      <!-- Categoría (solo si hay categorías del tipo seleccionado) -->
      <div v-if="form.type && hasCategoriesOfType">
        <Select
          v-model="form.category_id"
          :options="filteredCategories"
          :label="`Categoría de ${form.type === 'income' ? 'ingreso' : 'gasto'}`"
          placeholder="Sin categoría (opcional)"
          value-key="id"
          label-key="name"
          :error="errors.category"
        />
        <p class="text-xs text-gray-500 mt-1">
          Puedes dejar sin categoría y organizarla después
        </p>
      </div>

      <!-- Nombre -->
      <Input
        v-model="form.name"
        type="text"
        label="Nombre"
        :placeholder="namePlaceholder"
        :maxlength="40"
        required
        :error="errors.name"
      />

      <!-- Fecha -->
      <Input
        v-model="form.transaction_date"
        type="date"
        label="Fecha de la transacción"
        hint="Si no se especifica, se usará la fecha actual"
      />

      <!-- Resumen previo -->
      <div v-if="form.amount > 0 && form.type" :class="[
        'p-4 rounded-lg border',
        form.type === 'income' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      ]">
        <div class="flex items-center justify-between text-sm">
          <span :class="[
            'font-medium',
            form.type === 'income' ? 'text-green-700' : 'text-red-700'
          ]">
            Monto a registrar:
          </span>
          <span :class="[
            'text-xl font-bold',
            form.type === 'income' ? 'text-green-600' : 'text-red-600'
          ]">
            {{ form.type === 'income' ? '+' : '-' }}{{ formatCurrency(form.amount) }}
          </span>
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
          Registrar Transacción
        </Button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTransactions } from '@/composables/useTransactions'
import { useCategories } from '@/composables/useCategories'
import { validateTransactionData } from '@/modules/transactions'
import { formatCurrency, getCurrentDate } from '@/utils/formatters'
import Button from '@/components/UI/Button.vue'
import Modal from '@/components/UI/Modal.vue'
import Input from '@/components/UI/Input.vue'
import Select from '@/components/UI/Select.vue'
import Icon from '@/components/UI/Icon.vue'

const emit = defineEmits(['close', 'created'])
const router = useRouter()

const { createTransaction } = useTransactions()
const { incomeCategories, expenseCategories, fetchCategories } = useCategories()

// Categorías filtradas según el tipo
const filteredCategories = computed(() => {
  if (!form.value.type) return []
  return form.value.type === 'income' ? incomeCategories.value : expenseCategories.value
})

const hasCategoriesOfType = computed(() => {
  return filteredCategories.value.length > 0
})

// Placeholder dinámico según tipo de transacción
const namePlaceholder = computed(() => {
  if (!form.value.type) {
    return '¿De dónde proviene esta transacción?'
  }
  return form.value.type === 'income' 
    ? '¿De dónde proviene este ingreso?' 
    : '¿En qué gastaste?'
})

const form = ref({
  type: null,
  amount: null,
  category_id: null,
  name: '',
  transaction_date: getCurrentDate()
})

const loading = ref(false)
const errors = ref({
  amount: null,
  type: null,
  category: null,
  name: null
})

// Validación visual para deshabilitar botón
const isFormValid = computed(() => {
  return form.value.amount > 0 && 
         form.value.type !== null &&
         form.value.name?.trim().length >= 3 &&
         !loading.value
})

// Carga las categorías al montar
onMounted(async () => {
  await fetchCategories()
})

const validateForm = () => {
  errors.value = {
    amount: null,
    type: null,
    category: null,
    name: null
  }
  
  if (!form.value.type) {
    errors.value.type = 'Debe seleccionar un tipo de transacción'
    return false
  }
  
  const validation = validateTransactionData(form.value)
  
  if (!validation.isValid) {
    validation.errors.forEach(error => {
      if (error.includes('monto')) {
        errors.value.amount = error
      } else if (error.includes('tipo')) {
        errors.value.type = error
      } else if (error.includes('nombre')) {
        errors.value.name = error
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
    await createTransaction(form.value)
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
