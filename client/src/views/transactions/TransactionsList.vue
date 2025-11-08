<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="page-header flex-col sm:flex-row gap-3">
      <div class="w-full sm:w-auto">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Transacciones</h1>
        <p class="text-sm sm:text-base text-gray-600 mt-1">Registra y gestiona tus ingresos y gastos</p>
      </div>
      
      <div class="flex gap-2 sm:gap-3 w-full sm:w-auto">
        <Button
          icon="mdi:cash-plus"
          variant="success"
          @click="openCreateForm('income')"
          class="flex-1 sm:flex-initial"
          size="sm"
        >
          <span class="hidden min-[400px]:inline">Nuevo Ingreso</span>
          <span class="min-[400px]:hidden">Ingreso</span>
        </Button>
        <Button
          icon="mdi:cash-minus"
          variant="danger"
          @click="openCreateForm('expense')"
          class="flex-1 sm:flex-initial"
          size="sm"
        >
          <span class="hidden min-[400px]:inline">Nuevo Gasto</span>
          <span class="min-[400px]:hidden">Gasto</span>
        </Button>
      </div>
    </div>

    <!-- Resumen -->
    <div v-if="hasTransactions" class="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 sm:gap-4 mb-6">
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
      <div class="hidden lg:flex items-center justify-center flex-shrink-0 w-8 h-8">
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
      <div class="hidden lg:flex items-center justify-center flex-shrink-0 w-8 h-8">
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
      <div class="flex flex-col gap-3 sm:gap-4">
        <div class="w-full">
          <Input
            v-model="searchTerm"
            type="text"
            :placeholder="searchPlaceholder"
          />
        </div>
        <div class="flex gap-2 flex-wrap justify-start">
          <button
            :class="[
              'inline-flex items-center justify-center px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              selectedType === null 
                ? 'bg-purple-100 text-purple-700 border-2 border-purple-300' 
                : 'bg-transparent text-gray-600 border-2 border-transparent hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200'
            ]"
            @click="setTypeFilter(null)"
          >
            Todas
          </button>
          <button
            :class="[
              'inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              selectedType === 'income' 
                ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                : 'bg-transparent text-gray-600 border-2 border-transparent hover:bg-green-50 hover:text-green-700 hover:border-green-200'
            ]"
            @click="setTypeFilter('income')"
          >
            <Icon name="mdi:cash-plus" :size="18" class="mr-2" />
            Ingresos
          </button>
          <button
            :class="[
              'inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              selectedType === 'expense' 
                ? 'bg-red-100 text-red-700 border-2 border-red-300' 
                : 'bg-transparent text-gray-600 border-2 border-transparent hover:bg-red-50 hover:text-red-700 hover:border-red-200'
            ]"
            @click="setTypeFilter('expense')"
          >
            <Icon name="mdi:cash-minus" :size="18" class="mr-2" />
            Gastos
          </button>
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
        v-for="transaction in filteredTransactions"
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
          
          <!-- Contenido derecho: Monto + Botón Delete -->
          <div class="flex items-center justify-between min-[330px]:justify-end gap-3 w-full min-[330px]:w-auto">
            <p :class="[
              'text-lg font-bold min-[330px]:text-xl',
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            ]">
              {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
            </p>
            
            <Button
              variant="ghost"
              icon="mdi:delete"
              :icon-size="20"
              @click="handleDelete(transaction)"
              class="flex-shrink-0"
            />
          </div>
        </div>
      </Card>
    </div>

    <!-- Modal Crear Transacción -->
    <CreateTransaction
      v-if="showCreateForm"
      :type="transactionType"
      @close="showCreateForm = false"
      @created="handleCreated"
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
import Icon from '@/components/UI/Icon.vue'
import CreateTransaction from './CreateTransaction.vue'

const { 
  filteredTransactions, 
  loading, 
  searchTerm, 
  selectedType,
  hasTransactions,
  totalIncome,
  totalExpenses,
  currentBalance,
  removeTransaction,
  setTypeFilter
} = useTransactions()

const showCreateForm = ref(false)
const transactionType = ref('expense')
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

// Escuchar cambios en el tamaño de ventana
onMounted(() => {
  window.addEventListener('resize', updateWindowWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth)
})

const openCreateForm = (type) => {
  transactionType.value = type
  showCreateForm.value = true
}

const handleDelete = async (transaction) => {
  await removeTransaction(transaction)
}

const handleCreated = () => {
  showCreateForm.value = false
}
</script>
