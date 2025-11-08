<template>
  <Modal 
    :title="`Nuevo ${props.type === 'income' ? 'Ingreso' : 'Gasto'}`" 
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

      <!-- Categoría -->
      <div>
        <Select
          v-model="form.category_id"
          :options="filteredCategories"
          label="Categoría"
          placeholder="Selecciona una categoría"
          value-key="id"
          label-key="name"
          required
          :error="errors.category"
        />
        
        <!-- Mensaje cuando no hay categorías -->
        <div v-if="!hasCategoriesOfType" class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div class="flex items-start gap-2">
            <Icon name="mdi:alert-circle" :size="20" class="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div class="flex-1">
              <p class="text-sm text-yellow-800 font-medium mb-1">
                No tienes categorías de {{ props.type === 'income' ? 'ingresos' : 'gastos' }}
              </p>
              <p class="text-xs text-yellow-700 mb-2">
                Para registrar un {{ props.type === 'income' ? 'ingreso' : 'gasto' }} necesitas primero crear al menos una categoría de ese tipo.
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

      <!-- Nombre -->
      <Input
        v-model="form.name"
        type="text"
        label="Nombre"
        :placeholder="`¿${props.type === 'income' ? 'De dónde proviene' : 'En qué gastaste'}?`"
        :maxlength="40"
        required
        :error="errors.name"
      />

      <!-- Fecha -->
      <Input
        v-model="form.transaction_date"
        type="date"
        :label="`Fecha del ${props.type === 'income' ? 'ingreso' : 'gasto'}`"
        hint="Si no se especifica, se usará la fecha actual"
      />

      <!-- Resumen previo -->
      <div v-if="form.amount > 0" :class="[
        'p-4 rounded-lg border',
        props.type === 'income' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      ]">
        <div class="flex items-center justify-between text-sm">
          <span :class="[
            'font-medium',
            props.type === 'income' ? 'text-green-700' : 'text-red-700'
          ]">
            Monto a registrar:
          </span>
          <span :class="[
            'text-xl font-bold',
            props.type === 'income' ? 'text-green-600' : 'text-red-600'
          ]">
            {{ props.type === 'income' ? '+' : '-' }}{{ formatCurrency(form.amount) }}
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
          Registrar {{ props.type === 'income' ? 'Ingreso' : 'Gasto' }}
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
import Textarea from '@/components/UI/Textarea.vue'
import Icon from '@/components/UI/Icon.vue'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['income', 'expense'].includes(value)
  }
})

const emit = defineEmits(['close', 'created'])
const router = useRouter()

const { createTransaction } = useTransactions()
const { incomeCategories, expenseCategories, fetchCategories } = useCategories()

// Categorías filtradas según el tipo
const filteredCategories = computed(() => {
  return props.type === 'income' ? incomeCategories.value : expenseCategories.value
})

const hasCategoriesOfType = computed(() => {
  return filteredCategories.value.length > 0
})

const form = ref({
  type: props.type,
  amount: null,
  category_id: null,
  name: '',
  transaction_date: getCurrentDate()
})

const loading = ref(false)
const errors = ref({
  amount: null,
  category: null,
  name: null
})

// Validación visual para deshabilitar botón
const isFormValid = computed(() => {
  return form.value.amount > 0 && 
         form.value.category_id !== null && 
         form.value.category_id !== '' && 
         form.value.name?.trim().length >= 3 &&
         hasCategoriesOfType.value && 
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
    name: null
  }
  
  const validation = validateTransactionData(form.value)
  
  if (!validation.isValid) {
    validation.errors.forEach(error => {
      if (error.includes('monto')) {
        errors.value.amount = error
      } else if (error.includes('categoría')) {
        errors.value.category = error
      } else if (error.includes('nombre')) {
        errors.value.name = error
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
