<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="page-header flex-col sm:flex-row items-start sm:items-center">
      <div class="flex-1 min-w-0 w-full sm:w-auto">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Transacciones</h1>
        <p class="text-sm sm:text-base text-gray-600 mt-1">Registra y gestiona tus ingresos y gastos</p>
      </div>
      
      <Button
        icon="mdi:plus"
        @click="openCreateForm"
        class="flex-shrink-0 w-full sm:w-auto mt-3 sm:mt-0"
      >
        Nueva Transacción
      </Button>
    </div>

    <!-- Resumen -->
    <div v-if="hasTransactions" class="flex flex-col xl:flex-row items-stretch xl:items-center gap-3 sm:gap-4 mb-6">
      <!-- Balance -->
      <Card class="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 flex-1 w-full">
        <div class="flex items-center gap-3 sm:gap-4">
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
            <Icon name="mdi:wallet" :size="24" class="text-white sm:w-7 sm:h-7" />
          </div>
          <div>
            <p class="text-xs sm:text-sm text-purple-600 font-medium">Balance</p>
            <p class="text-xl sm:text-2xl font-bold text-purple-900">{{ formatCurrency(currentBalance) }}</p>
          </div>
        </div>
      </Card>

      <!-- Símbolo igual -->
      <div class="hidden xl:flex items-center justify-center flex-shrink-0 w-8 h-8">
        <span class="text-2xl sm:text-3xl font-bold text-gray-400">=</span>
      </div>

      <!-- Ingresos -->
      <Card class="bg-gradient-to-br from-green-50 to-green-100 border-green-200 flex-1 w-full">
        <div class="flex items-center gap-3 sm:gap-4">
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
            <Icon name="mdi:cash-plus" :size="24" class="text-white sm:w-7 sm:h-7" />
          </div>
          <div>
            <p class="text-xs sm:text-sm text-green-600 font-medium">Ingresos</p>
            <p class="text-xl sm:text-2xl font-bold text-green-900">{{ formatCurrency(totalIncome) }}</p>
          </div>
        </div>
      </Card>

      <!-- Símbolo menos -->
      <div class="hidden xl:flex items-center justify-center flex-shrink-0 w-8 h-8">
        <span class="text-2xl sm:text-3xl font-bold text-gray-400">−</span>
      </div>

      <!-- Gastos -->
      <Card class="bg-gradient-to-br from-red-50 to-red-100 border-red-200 flex-1 w-full">
        <div class="flex items-center gap-3 sm:gap-4">
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
            <Icon name="mdi:cash-minus" :size="24" class="text-white sm:w-7 sm:h-7" />
          </div>
          <div>
            <p class="text-xs sm:text-sm text-red-600 font-medium">Gastos</p>
            <p class="text-xl sm:text-2xl font-bold text-red-900">{{ formatCurrency(totalExpenses) }}</p>
          </div>
        </div>
      </Card>
    </div>

    <!-- Buscador y Filtros -->
    <Card v-if="hasTransactions" class="mb-6">
      <div class="flex flex-col gap-4">
        <!-- Primera fila: Buscador -->
        <div class="w-full">
          <Input
            v-model="searchTerm"
            type="text"
            :placeholder="searchPlaceholder"
          />
        </div>
        
        <!-- Segunda fila: Filtros -->
        <div class="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          <!-- Tipo de transacción -->
          <div class="min-[500px]:col-span-1 lg:col-span-1 xl:col-span-1">
            <Select
              v-model="selectedType"
              :options="typeOptions"
              label="Tipo de transacción"
              placeholder="Tipo"
              value-key="value"
              label-key="label"
            />
          </div>
          
          <!-- Ordenar por monto -->
          <div class="min-[500px]:col-span-1 lg:col-span-1 xl:col-span-1">
            <Select
              v-model="sortOrder"
              :options="sortOptions"
              label="Ordenar por monto"
              placeholder="Ordenar"
              value-key="value"
              label-key="label"
            />
          </div>
          
          <!-- Fecha desde -->
          <div class="min-[500px]:col-span-1 lg:col-span-1 xl:col-span-2">
            <Input
              v-model="dateFrom"
              type="date"
              label="Desde"
              :error="dateError"
            />
          </div>
          
          <!-- Fecha hasta -->
          <div class="min-[500px]:col-span-1 lg:col-span-1 xl:col-span-2">
            <Input
              v-model="dateTo"
              type="date"
              label="Hasta"
              :error="dateError"
            />
          </div>
          
          <!-- Botón Limpiar Filtros -->
          <div class="min-[500px]:col-span-2 lg:col-span-4 xl:col-span-6">
            <Button
              variant="secondary"
              icon="mdi:filter-remove"
              @click="clearFilters"
              class="w-full sm:w-auto"
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <Icon name="mdi:loading" class="animate-spin text-purple-600" :size="48" />
    </div>

    <!-- Empty State -->
    <Card v-else-if="!hasTransactions" class="empty-state">
      <Icon name="mdi:cash-multiple" :size="64" class="text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-700 mb-2">No tienes transacciones registradas</h3>
      <p class="text-gray-500">Registra tu primer ingreso o gasto para empezar a llevar control de tus finanzas</p>
    </Card>

    <!-- Lista de Transacciones -->
    <div v-else class="space-y-3">
      <Card
        v-for="transaction in paginatedTransactions"
        :key="transaction.id"
        hover
        class="hover-card"
      >
        <div class="flex flex-col min-[330px]:flex-row items-start min-[330px]:items-center justify-between gap-3">
          <!-- Contenido izquierdo: Ícono + Info -->
          <div class="flex flex-col min-[330px]:flex-row items-start min-[330px]:items-center gap-3 flex-1 w-full min-[330px]:w-auto">
            <!-- Ícono -->
            <div :class="[
              'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
              transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
            ]">
              <Icon 
                :name="transaction.type === 'income' ? 'mdi:cash-plus' : 'mdi:cash-minus'" 
                :size="24" 
                :class="transaction.type === 'income' ? 'text-green-600' : 'text-red-600'"
              />
            </div>
            
            <!-- Info (Nombre + Fecha) -->
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-900 break-words">
                {{ transaction.name || 'Sin nombre' }}
              </h3>
              <p class="text-sm text-gray-500 mt-1">
                {{ formatDate(transaction.transactionDate) }}
              </p>
            </div>
          </div>
          
          <!-- Contenido derecho: Monto + Botones Edit/Delete -->
          <div class="flex flex-col min-[400px]:flex-row items-start min-[400px]:items-center gap-1 w-full min-[330px]:w-auto">
            <p :class="[
              'text-lg font-bold min-[330px]:text-xl',
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            ]">
              {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
            </p>
            
            <div class="flex gap-0">
              <Button
                variant="ghost"
                icon="mdi:pencil"
                :icon-size="18"
                @click="handleEdit(transaction)"
                class="flex-shrink-0 text-purple-600 hover:bg-purple-50 p-1"
              />
              <Button
                variant="ghost"
                icon="mdi:delete"
                :icon-size="18"
                @click="handleDelete(transaction)"
                class="flex-shrink-0 text-red-600 hover:bg-red-50 p-1"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Paginación -->
    <Card v-if="hasTransactions && totalPages > 0" class="mt-6">
      <div class="flex flex-col gap-4">
        <!-- Información de paginación -->
        <div class="text-sm text-gray-600 text-center sm:text-left">
          Mostrando {{ paginationInfo.start }}-{{ paginationInfo.end }} de {{ paginationInfo.total }} transacciones
        </div>

        <!-- Controles de paginación -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <!-- Select items por página -->
          <Select
            :model-value="itemsPerPage"
            @update:model-value="setItemsPerPage"
            :options="itemsPerPageOptions"
            value-key="value"
            label-key="label"
            class="w-full sm:w-40"
          />

          <!-- Navegación de páginas -->
          <div class="flex flex-col sm:flex-row items-center gap-2">
            <!-- Indicador de página - Arriba en móvil, inline en desktop -->
            <span class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg text-center">
              {{ currentPage }} / {{ totalPages }}
            </span>

            <!-- Botones de navegación -->
            <div class="flex items-center justify-center gap-1">
              <!-- Primera página - Solo desktop -->
              <Button
                variant="ghost"
                icon="mdi:page-first"
                :icon-size="18"
                @click="firstPage"
                :disabled="currentPage === 1"
                class="p-2 flex-shrink-0 hidden sm:inline-flex"
                title="Primera página"
              />

              <!-- Página anterior -->
              <Button
                variant="ghost"
                icon="mdi:chevron-left"
                :icon-size="20"
                @click="prevPage"
                :disabled="currentPage === 1"
                class="p-2 flex-shrink-0"
                title="Página anterior"
              />

              <!-- Página siguiente -->
              <Button
                variant="ghost"
                icon="mdi:chevron-right"
                :icon-size="20"
                @click="nextPage"
                :disabled="currentPage >= totalPages"
                class="p-2 flex-shrink-0"
                title="Página siguiente"
              />

              <!-- Última página - Solo desktop -->
              <Button
                variant="ghost"
                icon="mdi:page-last"
                :icon-size="18"
                @click="lastPage"
                :disabled="currentPage >= totalPages"
                class="p-2 flex-shrink-0 hidden sm:inline-flex"
                title="Última página"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- Modal Crear Transacción -->
    <CreateTransaction
      v-if="showCreateForm"
      @close="showCreateForm = false"
      @created="handleCreated"
    />

    <!-- Modal Editar Transacción -->
    <EditTransaction
      v-if="showEditForm && selectedTransaction"
      :transaction="selectedTransaction"
      @close="showEditForm = false"
      @updated="handleUpdated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTransactions } from '@/composables/useTransactions'
import { formatCurrency, formatDate } from '@/utils/formatters'
import Button from '@/components/UI/Button.vue'
import Card from '@/components/UI/Card.vue'
import Input from '@/components/UI/Input.vue'
import Select from '@/components/UI/Select.vue'
import Icon from '@/components/UI/Icon.vue'
import CreateTransaction from './CreateTransaction.vue'
import EditTransaction from './EditTransaction.vue'

const { 
  paginatedTransactions,
  loading, 
  searchTerm, 
  selectedType,
  sortOrder,
  dateFrom,
  dateTo,
  currentPage,
  itemsPerPage,
  hasTransactions,
  totalIncome,
  totalExpenses,
  currentBalance,
  totalItems,
  totalPages,
  paginationInfo,
  removeTransaction,
  setTypeFilter,
  clearFilters,
  setPage,
  nextPage,
  prevPage,
  firstPage,
  lastPage,
  setItemsPerPage
} = useTransactions()

// Opciones para el select de tipo
const typeOptions = [
  { value: 'income', label: 'Ingresos' },
  { value: 'expense', label: 'Gastos' }
]

// Opciones para el select de ordenamiento
const sortOptions = [
  { value: 'desc', label: 'Mayor monto' },
  { value: 'asc', label: 'Menor monto' }
]

// Opciones para items por página
const itemsPerPageOptions = [
  { value: 15, label: '15 por página' },
  { value: 50, label: '50 por página' },
  { value: 100, label: '100 por página' }
]

const showCreateForm = ref(false)
const showEditForm = ref(false)
const selectedTransaction = ref(null)
const windowWidth = ref(window.innerWidth)

/**
 * Actualiza el ancho de la ventana cuando se redimensiona
 */
const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
}

/**
 * Placeholder dinámico que se adapta al tamaño de pantalla
 */
const searchPlaceholder = computed(() => {
  // Mobile pequeño (< 270px): muy corto
  if (windowWidth.value < 270) return 'Buscar...'
  // Mobile/Tablet (< 410px): corto
  if (windowWidth.value < 410) return 'Buscar transacción...'
  // Desktop: completo
  return 'Buscar transacción por nombre o monto...'
})

/**
 * Validación de coherencia de fechas
 */
const dateError = computed(() => {
  if (!dateFrom.value || !dateTo.value) return null
  
  // Comparar strings YYYY-MM-DD directamente (evita problemas de timezone)
  if (dateFrom.value > dateTo.value) {
    return 'La fecha "Desde" no puede ser posterior a la fecha "Hasta"'
  }
  
  return null
})

// Escuchar cambios en el tamaño de ventana
onMounted(() => {
  window.addEventListener('resize', updateWindowWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth)
})

const openCreateForm = () => {
  showCreateForm.value = true
}

const handleEdit = (transaction) => {
  selectedTransaction.value = transaction
  showEditForm.value = true
}

const handleDelete = async (transaction) => {
  await removeTransaction(transaction)
}

const handleCreated = () => {
  showCreateForm.value = false
}

const handleUpdated = () => {
  showEditForm.value = false
}
</script>
