<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-600 mt-1">Resumen de tus finanzas</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !stats" class="flex justify-center items-center py-12">
      <Icon name="mdi:loading" class="animate-spin text-purple-600" :size="48" />
    </div>

    <!-- Empty State -->
    <Card v-else-if="!hasData" class="empty-state">
      <Icon name="mdi:chart-box-outline" :size="64" class="text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-700 mb-2">No hay datos para mostrar</h3>
      <p class="text-gray-500">Registra tu primer gasto para ver tus estadísticas</p>
    </Card>

    <!-- Dashboard Content -->
    <div v-else class="space-y-6">
      <!-- Tarjetas de Resumen -->
      <div class="flex flex-col md:flex-row items-center gap-4">
        <!-- Balance Actual -->
        <Card class="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 flex-1 w-full">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <Icon name="mdi:wallet" :size="24" class="text-purple-600" />
                <p class="text-sm font-medium text-purple-700">Balance Actual</p>
              </div>
              <p class="text-3xl font-bold text-purple-900">
                {{ formatCurrency(currentBalance) }}
              </p>
            </div>
          </div>
        </Card>

        <!-- Símbolo igual -->
        <div class="hidden md:flex items-center justify-center flex-shrink-0 w-8 h-8">
          <span class="text-3xl font-bold text-gray-400">=</span>
        </div>

        <!-- Ingresos Registrados -->
        <Card class="bg-gradient-to-br from-green-50 to-green-100 border-green-200 flex-1 w-full">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <Icon name="mdi:cash-plus" :size="24" class="text-green-600" />
                <p class="text-sm font-medium text-green-700">Ingresos Registrados</p>
              </div>
              <p class="text-3xl font-bold text-green-900">
                {{ formatCurrency(totalIncome) }}
              </p>
            </div>
          </div>
        </Card>

        <!-- Símbolo menos -->
        <div class="hidden md:flex items-center justify-center flex-shrink-0 w-8 h-8">
          <span class="text-3xl font-bold text-gray-400">−</span>
        </div>

        <!-- Total Gastado -->
        <Card class="bg-gradient-to-br from-red-50 to-red-100 border-red-200 flex-1 w-full">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <Icon name="mdi:cash-minus" :size="24" class="text-red-600" />
                <p class="text-sm font-medium text-red-700">Total Gastado</p>
              </div>
              <p class="text-3xl font-bold text-red-900">
                {{ formatCurrency(totalExpenses) }}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <!-- Gráfico y Lista -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Gastos por Categoría -->
        <Card>
          <template #header>
            <h3 class="text-lg font-semibold text-gray-900">Gastos por Categoría</h3>
          </template>

          <div v-if="expensesByCategory.length > 0" class="space-y-4">
            <div 
              v-for="category in expensesByCategory.slice(0, 10)" 
              :key="category.id"
              class="space-y-2"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3 flex-1">
                  <div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="material-symbols:category" :size="20" class="text-purple-600" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 truncate">{{ category.name }}</p>
                    <p class="text-xs text-gray-500">{{ category.count }} {{ category.count === 1 ? 'gasto' : 'gastos' }}</p>
                  </div>
                </div>
                <div class="text-right flex-shrink-0 ml-4">
                  <p class="font-semibold text-gray-900">{{ formatCurrency(category.total) }}</p>
                  <p class="text-xs text-gray-500">{{ category.percentage.toFixed(1) }}%</p>
                </div>
              </div>
              
              <!-- Barra de progreso -->
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${category.percentage}%` }"
                ></div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-500">
            <Icon name="material-symbols:category-outline" :size="48" class="text-gray-400 mx-auto mb-2" />
            <p class="text-sm">No hay datos por categoría</p>
          </div>
        </Card>

        <!-- Gastos Recientes -->
        <Card>
          <template #header>
            <h3 class="text-lg font-semibold text-gray-900">Gastos Recientes</h3>
          </template>

          <div v-if="recentTransactions.length > 0" class="space-y-3">
            <div 
              v-for="transaction in recentTransactions.slice(0, 10)" 
              :key="transaction.id"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <div :class="[
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                ]">
                  <Icon 
                    :name="transaction.type === 'income' ? 'mdi:cash-plus' : 'mdi:cash-minus'" 
                    :size="20" 
                    :class="transaction.type === 'income' ? 'text-green-600' : 'text-red-600'" 
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-900 truncate">
                    {{ transaction.description || 'Sin descripción' }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ formatDate(transaction.transactionDate) }}
                  </p>
                </div>
              </div>
              <p :class="[
                'font-semibold flex-shrink-0 ml-4',
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              ]">
                {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
              </p>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-500">
            <Icon name="mdi:cash-remove" :size="48" class="text-gray-400 mx-auto mb-2" />
            <p class="text-sm">No hay gastos recientes</p>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDashboard } from '@/composables/useDashboard'
import { formatCurrency, formatDate } from '@/utils/formatters'
import Card from '@/components/UI/Card.vue'
import Icon from '@/components/UI/Icon.vue'

const {
  stats,
  loading,
  currentBalance,
  totalIncome,
  totalExpenses,
  expensesByCategory,
  recentTransactions,
  hasData
} = useDashboard()
</script>
