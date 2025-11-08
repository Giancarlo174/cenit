<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Transacciones</h1>
        <p class="text-gray-600 mt-1">Registra y gestiona tus ingresos y gastos</p>
      </div>
      
      <div class="flex gap-3">
        <Button
          icon="mdi:cash-plus"
          variant="secondary"
          @click="openCreateForm('income')"
        >
          Nuevo Ingreso
        </Button>
        <Button
          icon="mdi:cash-minus"
          @click="openCreateForm('expense')"
        >
          Nuevo Gasto
        </Button>
      </div>
    </div>

    <!-- Resumen -->
    <div v-if="hasTransactions" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <!-- Balance -->
      <Card class="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center">
            <Icon name="mdi:wallet" :size="28" class="text-white" />
          </div>
          <div>
            <p class="text-sm text-purple-600 font-medium">Balance</p>
            <p class="text-2xl font-bold text-purple-900">{{ formatCurrency(currentBalance) }}</p>
          </div>
        </div>
      </Card>

      <!-- Ingresos -->
      <Card class="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center">
            <Icon name="mdi:cash-plus" :size="28" class="text-white" />
          </div>
          <div>
            <p class="text-sm text-green-600 font-medium">Ingresos</p>
            <p class="text-2xl font-bold text-green-900">{{ formatCurrency(totalIncome) }}</p>
          </div>
        </div>
      </Card>

      <!-- Gastos -->
      <Card class="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-red-600 flex items-center justify-center">
            <Icon name="mdi:cash-minus" :size="28" class="text-white" />
          </div>
          <div>
            <p class="text-sm text-red-600 font-medium">Gastos</p>
            <p class="text-2xl font-bold text-red-900">{{ formatCurrency(totalExpenses) }}</p>
          </div>
        </div>
      </Card>
    </div>

    <!-- Buscador y Filtros -->
    <Card v-if="hasTransactions" class="mb-6">
      <div class="flex gap-4">
        <div class="flex-1">
          <Input
            v-model="searchTerm"
            type="text"
            placeholder="Buscar transacciones por descripción o monto..."
          />
        </div>
        <div class="flex gap-2">
          <Button
            :variant="selectedType === null ? 'primary' : 'ghost'"
            size="sm"
            @click="setTypeFilter(null)"
          >
            Todas
          </Button>
          <Button
            :variant="selectedType === 'income' ? 'secondary' : 'ghost'"
            size="sm"
            icon="mdi:cash-plus"
            @click="setTypeFilter('income')"
          >
            Ingresos
          </Button>
          <Button
            :variant="selectedType === 'expense' ? 'primary' : 'ghost'"
            size="sm"
            icon="mdi:cash-minus"
            @click="setTypeFilter('expense')"
          >
            Gastos
          </Button>
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
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4 flex-1">
            <div :class="[
              'w-12 h-12 rounded-lg flex items-center justify-center',
              transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
            ]">
              <Icon 
                :name="transaction.type === 'income' ? 'mdi:cash-plus' : 'mdi:cash-minus'" 
                :size="24" 
                :class="transaction.type === 'income' ? 'text-green-600' : 'text-red-600'"
              />
            </div>
            
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-semibold text-gray-900">
                  {{ transaction.description || 'Sin descripción' }}
                </h3>
                <span :class="[
                  'text-xs px-2 py-0.5 rounded-full',
                  transaction.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                ]">
                  {{ transaction.type === 'income' ? 'Ingreso' : 'Gasto' }}
                </span>
              </div>
              <p class="text-sm text-gray-500">
                {{ formatDate(transaction.transactionDate) }}
              </p>
            </div>
          </div>
          
          <div class="flex items-center gap-4">
            <div class="text-right">
              <p :class="[
                'text-xl font-bold',
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              ]">
                {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
              </p>
            </div>
            
            <Button
              variant="ghost"
              icon="mdi:delete"
              :icon-size="20"
              @click="handleDelete(transaction)"
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
import { ref } from 'vue'
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
