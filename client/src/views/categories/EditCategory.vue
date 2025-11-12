<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="page-header">
      <div class="flex items-center gap-3 flex-1">
        <Button
          variant="ghost"
          icon="mdi:arrow-left"
          @click="goBack"
          class="flex-shrink-0"
        >
          Volver
        </Button>
        <div class="min-w-0 flex-1">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
            {{ pageTitle }}
          </h1>
          <p class="text-sm sm:text-base text-gray-600 mt-1">
            {{ pageDescription }}
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loadingCategory" class="flex justify-center items-center py-12">
      <Icon name="mdi:loading" class="animate-spin text-purple-600" :size="48" />
    </div>

    <template v-else-if="category">
      <!-- Edición del nombre de la categoría -->
      <Card class="mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Información de la categoría</h2>
        <form @submit.prevent="handleUpdateName" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                Tipo de categoría
              </label>
              <div class="flex items-center gap-3 h-10 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                <Icon 
                  :name="category.type === 'income' ? 'mdi:cash-plus' : 'mdi:cash-minus'" 
                  :size="20" 
                  :class="category.type === 'income' ? 'text-green-600' : 'text-red-600'"
                />
                <span class="font-medium text-gray-700">
                  {{ category.type === 'income' ? 'Ingreso' : 'Gasto' }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <Button
              type="submit"
              :disabled="!isFormValid"
              :loading="loadingUpdate"
            >
              Actualizar nombre
            </Button>
          </div>
        </form>
      </Card>

      <!-- Transacciones sin categoría -->
      <Card class="mb-6">
        <div class="mb-4">
          <h2 class="text-lg font-semibold text-gray-900">
            {{ category.type === 'income' ? 'Ingresos' : 'Gastos' }} disponibles
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Selecciona las transacciones que deseas agregar a esta categoría
          </p>
        </div>

        <!-- Filtro de búsqueda -->
        <div v-if="uncategorizedTransactions.length > 0" class="mb-4">
          <Input
            v-model="uncategorizedSearchTerm"
            type="text"
            placeholder="Buscar por nombre..."
          />
        </div>

        <!-- Loading transacciones -->
        <div v-if="loadingUncategorized" class="flex justify-center items-center py-8">
          <Icon name="mdi:loading" class="animate-spin text-purple-600" :size="32" />
        </div>

        <!-- Empty state - No hay transacciones disponibles -->
        <div v-else-if="uncategorizedTransactions.length === 0" class="empty-state py-8">
          <Icon 
            :name="category.type === 'income' ? 'mdi:cash-plus' : 'mdi:cash-minus'" 
            :size="48" 
            class="text-gray-400 mx-auto mb-3"
          />
          <h3 class="text-base font-semibold text-gray-700 mb-2">
            No hay {{ category.type === 'income' ? 'ingresos' : 'gastos' }} disponibles
          </h3>
          <p class="text-sm text-gray-500">
            Para empezar, crea un {{ category.type === 'income' ? 'ingreso' : 'gasto' }} nuevo y agrégalo a esta categoría.
          </p>
        </div>

        <!-- Lista de transacciones sin categoría -->
        <div v-else class="space-y-3">
          <Card
            v-for="transaction in paginatedUncategorizedTransactions"
            :key="transaction.id"
            hover
            class="hover-card"
          >
            <div class="flex flex-col min-[330px]:flex-row items-center justify-between gap-3">
              <!-- Contenido izquierdo: Ícono + Info -->
              <div class="flex flex-col min-[330px]:flex-row items-center gap-3 flex-1 w-full min-[330px]:w-auto">
                <!-- Ícono -->
                <div :class="[
                  'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                  category.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                ]">
                  <Icon 
                    :name="category.type === 'income' ? 'mdi:cash-plus' : 'mdi:cash-minus'" 
                    :size="24" 
                    :class="category.type === 'income' ? 'text-green-600' : 'text-red-600'"
                  />
                </div>
                
                <!-- Info (Nombre + Fecha) -->
                <div class="flex-1 min-w-0 text-center min-[330px]:text-left">
                  <h3 class="font-semibold text-gray-900 break-words">
                    {{ transaction.name || 'Sin nombre' }}
                  </h3>
                  <p class="text-sm text-gray-500 mt-1">
                    {{ formatDate(transaction.transactionDate) }}
                  </p>
                </div>
              </div>
              
              <!-- Contenido derecho: Monto + Botón Agregar -->
              <div class="flex flex-col min-[430px]:flex-row items-center gap-4 w-full min-[330px]:w-auto">
                <p :class="[
                  'text-lg font-bold min-[330px]:text-xl leading-none',
                  category.type === 'income' ? 'text-green-600' : 'text-red-600'
                ]">
                  {{ category.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
                </p>
                
                <Button
                  variant="primary"
                  icon="mdi:plus"
                  @click="addTransaction(transaction)"
                  :loading="loadingAssign && selectedTransactionId === transaction.id"
                  size="sm"
                  class="flex-shrink-0 w-full min-[430px]:w-auto"
                >
                  Agregar
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <!-- Paginación para transacciones sin categoría -->
        <div v-if="uncategorizedTransactions.length > 0 && totalUncategorizedPages > 1" class="mt-4 pt-4 border-t">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div class="text-sm text-gray-600">
              Mostrando {{ uncategorizedPaginationInfo.start }}-{{ uncategorizedPaginationInfo.end }} 
              de {{ uncategorizedPaginationInfo.total }} transacciones
            </div>

            <div class="flex items-center gap-2">
              <Button
                variant="ghost"
                icon="mdi:chevron-left"
                @click="prevUncategorizedPage"
                :disabled="currentUncategorizedPage === 1"
                size="sm"
              />
              <span class="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded">
                {{ currentUncategorizedPage }} / {{ totalUncategorizedPages }}
              </span>
              <Button
                variant="ghost"
                icon="mdi:chevron-right"
                @click="nextUncategorizedPage"
                :disabled="currentUncategorizedPage >= totalUncategorizedPages"
                size="sm"
              />
            </div>
          </div>
        </div>
      </Card>

      <!-- Transacciones en esta categoría -->
      <Card>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">
            Transacciones en esta categoría
          </h2>
        </div>

        <!-- Empty state - No hay transacciones en la categoría -->
        <div v-if="categoryTransactions.length === 0" class="empty-state py-8">
          <Icon name="mdi:folder-open" :size="48" class="text-gray-400 mx-auto mb-3" />
          <h3 class="text-base font-semibold text-gray-700 mb-2">
            No hay transacciones en esta categoría
          </h3>
          <p class="text-sm text-gray-500">
            Agrega transacciones desde la sección de arriba
          </p>
        </div>

        <!-- Lista de transacciones en la categoría -->
        <div v-else class="space-y-3">
          <Card
            v-for="transaction in paginatedCategoryTransactions"
            :key="transaction.id"
            hover
            class="hover-card"
          >
            <div class="flex flex-col min-[330px]:flex-row items-center justify-between gap-3">
              <!-- Contenido izquierdo: Ícono + Info -->
              <div class="flex flex-col min-[330px]:flex-row items-center gap-3 flex-1 w-full min-[330px]:w-auto">
                <!-- Ícono -->
                <div :class="[
                  'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                  category.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                ]">
                  <Icon 
                    :name="category.type === 'income' ? 'mdi:cash-plus' : 'mdi:cash-minus'" 
                    :size="24" 
                    :class="category.type === 'income' ? 'text-green-600' : 'text-red-600'"
                  />
                </div>
                
                <!-- Info (Nombre + Fecha) -->
                <div class="flex-1 min-w-0 text-center min-[330px]:text-left">
                  <h3 class="font-semibold text-gray-900 break-words">
                    {{ transaction.name || 'Sin nombre' }}
                  </h3>
                  <p class="text-sm text-gray-500 mt-1">
                    {{ formatDate(transaction.transactionDate) }}
                  </p>
                </div>
              </div>
              
              <!-- Contenido derecho: Monto + Botón Quitar -->
              <div class="flex flex-col min-[430px]:flex-row items-center gap-4 w-full min-[330px]:w-auto">
                <p :class="[
                  'text-lg font-bold min-[330px]:text-xl leading-none',
                  category.type === 'income' ? 'text-green-600' : 'text-red-600'
                ]">
                  {{ category.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
                </p>
                
                <Button
                  variant="danger"
                  icon="mdi:minus"
                  @click="removeTransaction(transaction)"
                  :loading="loadingRemove && selectedTransactionId === transaction.id"
                  size="sm"
                  class="flex-shrink-0 w-full min-[430px]:w-auto"
                >
                  Quitar
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <!-- Paginación para transacciones en categoría -->
        <div v-if="categoryTransactions.length > 0 && totalCategoryPages > 1" class="mt-4 pt-4 border-t">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div class="text-sm text-gray-600">
              Mostrando {{ categoryPaginationInfo.start }}-{{ categoryPaginationInfo.end }} 
              de {{ categoryPaginationInfo.total }} transacciones
            </div>

            <div class="flex items-center gap-2">
              <Button
                variant="ghost"
                icon="mdi:chevron-left"
                @click="prevCategoryPage"
                :disabled="currentCategoryPage === 1"
                size="sm"
              />
              <span class="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded">
                {{ currentCategoryPage }} / {{ totalCategoryPages }}
              </span>
              <Button
                variant="ghost"
                icon="mdi:chevron-right"
                @click="nextCategoryPage"
                :disabled="currentCategoryPage >= totalCategoryPages"
                size="sm"
              />
            </div>
          </div>
        </div>
      </Card>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCategories } from '@/composables/useCategories'
import { useTransactions } from '@/composables/useTransactions'
import { validateCategoryData } from '@/modules/categories'
import { showSuccess, showError } from '@/modules/notifications'
import { formatDate, formatCurrency } from '@/utils/formatters'
import Button from '@/components/UI/Button.vue'
import Card from '@/components/UI/Card.vue'
import Input from '@/components/UI/Input.vue'
import Icon from '@/components/UI/Icon.vue'

const route = useRoute()
const router = useRouter()

const { 
  categories,
  updateCategoryData,
  fetchUncategorizedTransactions,
  assignTransactionToCategory,
  removeTransactionFromCategory
} = useCategories()

const { transactions } = useTransactions()

// Estado de la categoría actual
const category = ref(null)
const loadingCategory = ref(true)

// Formulario de edición de nombre
const form = ref({
  name: '',
  type: null
})
const errors = ref({
  name: null
})
const loadingUpdate = ref(false)

// Transacciones sin categoría
const uncategorizedTransactions = ref([])
const loadingUncategorized = ref(false)
const uncategorizedSearchTerm = ref('')
const currentUncategorizedPage = ref(1)
const itemsPerUncategorizedPage = ref(10)

// Paginación para transacciones en categoría
const currentCategoryPage = ref(1)
const itemsPerCategoryPage = ref(10)

// Estados de loading para operaciones individuales
const loadingAssign = ref(false)
const loadingRemove = ref(false)
const selectedTransactionId = ref(null)

// Título y descripción dinámicos
const pageTitle = computed(() => {
  return category.value ? category.value.name : 'Cargando...'
})

const pageDescription = computed(() => {
  if (!category.value) return ''
  const type = category.value.type === 'income' ? 'ingresos' : 'gastos'
  return `Edita y gestiona tus ${type} en esta categoría`
})

// Validación del formulario
const isFormValid = computed(() => {
  return form.value.name.trim().length >= 2 && 
         form.value.name !== category.value?.name &&
         !loadingUpdate.value
})

// Transacciones filtradas sin categoría
const filteredUncategorizedTransactions = computed(() => {
  if (!uncategorizedSearchTerm.value.trim()) {
    return uncategorizedTransactions.value
  }
  
  const search = uncategorizedSearchTerm.value.toLowerCase()
  return uncategorizedTransactions.value.filter(transaction =>
    transaction.name?.toLowerCase().includes(search)
  )
})

// Paginación para transacciones sin categoría
const totalUncategorizedPages = computed(() =>
  Math.ceil(filteredUncategorizedTransactions.value.length / itemsPerUncategorizedPage.value)
)

const startUncategorizedIndex = computed(() =>
  (currentUncategorizedPage.value - 1) * itemsPerUncategorizedPage.value
)

const endUncategorizedIndex = computed(() =>
  startUncategorizedIndex.value + itemsPerUncategorizedPage.value
)

const paginatedUncategorizedTransactions = computed(() =>
  filteredUncategorizedTransactions.value.slice(
    startUncategorizedIndex.value,
    endUncategorizedIndex.value
  )
)

const uncategorizedPaginationInfo = computed(() => {
  const total = filteredUncategorizedTransactions.value.length
  const start = total === 0 ? 0 : startUncategorizedIndex.value + 1
  const end = Math.min(endUncategorizedIndex.value, total)
  return { start, end, total }
})

// Transacciones que pertenecen a esta categoría
const categoryTransactions = computed(() => {
  if (!category.value) return []
  return transactions.value.filter(t => t.categoryId === category.value.id)
})

// Paginación para transacciones en categoría
const totalCategoryPages = computed(() =>
  Math.ceil(categoryTransactions.value.length / itemsPerCategoryPage.value)
)

const startCategoryIndex = computed(() =>
  (currentCategoryPage.value - 1) * itemsPerCategoryPage.value
)

const endCategoryIndex = computed(() =>
  startCategoryIndex.value + itemsPerCategoryPage.value
)

const paginatedCategoryTransactions = computed(() =>
  categoryTransactions.value.slice(
    startCategoryIndex.value,
    endCategoryIndex.value
  )
)

const categoryPaginationInfo = computed(() => {
  const total = categoryTransactions.value.length
  const start = total === 0 ? 0 : startCategoryIndex.value + 1
  const end = Math.min(endCategoryIndex.value, total)
  return { start, end, total }
})

const nextCategoryPage = () => {
  if (currentCategoryPage.value < totalCategoryPages.value) {
    currentCategoryPage.value++
  }
}

const prevCategoryPage = () => {
  if (currentCategoryPage.value > 1) {
    currentCategoryPage.value--
  }
}

const nextUncategorizedPage = () => {
  if (currentUncategorizedPage.value < totalUncategorizedPages.value) {
    currentUncategorizedPage.value++
  }
}

const prevUncategorizedPage = () => {
  if (currentUncategorizedPage.value > 1) {
    currentUncategorizedPage.value--
  }
}

const validateOnBlur = () => {
  if (!form.value.name?.trim()) {
    errors.value.name = 'El nombre es obligatorio'
  } else if (form.value.name.trim().length < 2) {
    errors.value.name = 'El nombre debe tener al menos 2 caracteres'
  } else {
    errors.value.name = null
  }
}

/**
 * Actualiza el nombre de la categoría
 */
const handleUpdateName = async () => {
  const validation = validateCategoryData(form.value)
  if (!validation.isValid) {
    validation.errors.forEach(error => {
      if (error.includes('nombre')) {
        errors.value.name = error
      }
    })
    return
  }

  loadingUpdate.value = true

  try {
    const updated = await updateCategoryData(category.value.id, form.value)
    category.value = updated
  } catch (error) {
    console.error('Error al actualizar categoría:', error)
  } finally {
    loadingUpdate.value = false
  }
}

/**
 * Carga las transacciones sin categoría del tipo de la categoría actual
 */
const loadUncategorizedTransactions = async () => {
  if (!category.value) return

  loadingUncategorized.value = true

  try {
    uncategorizedTransactions.value = await fetchUncategorizedTransactions(category.value.type)
  } catch (error) {
    console.error('Error al cargar transacciones sin categoría:', error)
  } finally {
    loadingUncategorized.value = false
  }
}

/**
 * Agrega una transacción a esta categoría
 */
const addTransaction = async (transaction) => {
  selectedTransactionId.value = transaction.id
  loadingAssign.value = true

  try {
    await assignTransactionToCategory(transaction.id, category.value.id)
    
    // Remover de la lista de sin categoría
    uncategorizedTransactions.value = uncategorizedTransactions.value.filter(
      t => t.id !== transaction.id
    )
    
    // Resetear página de sin categoría si la actual queda vacía
    if (paginatedUncategorizedTransactions.value.length === 0 && currentUncategorizedPage.value > 1) {
      currentUncategorizedPage.value--
    }
    
    await showSuccess('Transacción agregada a la categoría')
  } catch (error) {
    console.error('Error al agregar transacción:', error)
  } finally {
    loadingAssign.value = false
    selectedTransactionId.value = null
  }
}

/**
 * Remueve una transacción de esta categoría
 */
const removeTransaction = async (transaction) => {
  selectedTransactionId.value = transaction.id
  loadingRemove.value = true

  try {
    await removeTransactionFromCategory(transaction.id)
    
    // Agregar a la lista de sin categoría
    uncategorizedTransactions.value.unshift(transaction)
    
    // Resetear página de categoría si la actual queda vacía
    if (paginatedCategoryTransactions.value.length === 1 && currentCategoryPage.value > 1) {
      currentCategoryPage.value--
    }
    
    await showSuccess('Transacción removida de la categoría')
  } catch (error) {
    console.error('Error al remover transacción:', error)
  } finally {
    loadingRemove.value = false
    selectedTransactionId.value = null
  }
}

/**
 * Vuelve a la lista de categorías
 */
const goBack = () => {
  router.push('/categories')
}

/**
 * Carga la categoría desde la ruta
 */
onMounted(async () => {
  const categoryId = route.params.id
  
  if (!categoryId) {
    await showError('ID de categoría no válido')
    goBack()
    return
  }

  // Buscar la categoría en el estado global
  const foundCategory = categories.value.find(c => c.id === categoryId)
  
  if (!foundCategory) {
    await showError('Categoría no encontrada')
    goBack()
    return
  }

  category.value = foundCategory
  form.value.name = foundCategory.name
  form.value.type = foundCategory.type
  
  loadingCategory.value = false

  // Cargar transacciones sin categoría
  await loadUncategorizedTransactions()
})
</script>
