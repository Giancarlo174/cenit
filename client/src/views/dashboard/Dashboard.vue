<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-600 mt-1">Resumen de tus finanzas</p>
      </div>
      
      <Button
        icon="mdi:refresh"
        variant="secondary"
        @click="refreshStats"
        :loading="loading"
      >
        Actualizar
      </Button>
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
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Balance Actual -->
        <Card class="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <Icon name="mdi:wallet" :size="24" class="text-purple-600" />
                <p class="text-sm font-medium text-purple-700">Balance Actual</p>
              </div>
              <p class="text-3xl font-bold text-purple-900">
                {{ formatCurrency(currentBalance) }}
              </p>
              <p class="text-xs text-purple-600 mt-1">
                de {{ formatCurrency(initialBalance) }} inicial
              </p>
            </div>
            <div :class="['px-2.5 py-1 rounded-full text-xs font-medium', 
              hasPositiveBalance ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
              {{ hasPositiveBalance ? 'Positivo' : 'Negativo' }}
            </div>
          </div>
          
          <!-- Barra de progreso -->
          <div class="mt-4">
            <div class="flex justify-between text-xs text-purple-600 mb-1">
              <span>Gastado</span>
              <span>{{ spentPercentage.toFixed(1) }}%</span>
            </div>
            <div class="w-full bg-purple-200 rounded-full h-2">
              <div 
                class="bg-purple-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${Math.min(spentPercentage, 100)}%` }"
              ></div>
            </div>
          </div>
        </Card>

        <!-- Total Gastado -->
        <Card class="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <Icon name="mdi:cash-minus" :size="24" class="text-red-600" />
                <p class="text-sm font-medium text-red-700">Total Gastado</p>
              </div>
              <p class="text-3xl font-bold text-red-900">
                {{ formatCurrency(totalExpenses) }}
              </p>
              <p class="text-xs text-red-600 mt-1">
                en {{ expenseCount }} {{ expenseCount === 1 ? 'gasto' : 'gastos' }}
              </p>
            </div>
          </div>
        </Card>

        <!-- Categoría Principal -->
        <Card class="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <Icon name="material-symbols:category" :size="24" class="text-amber-600" />
                <p class="text-sm font-medium text-amber-700">Mayor Gasto</p>
              </div>
              <p class="text-2xl font-bold text-amber-900 truncate">
                {{ topCategory?.name || 'N/A' }}
              </p>
              <p class="text-xs text-amber-600 mt-1" v-if="topCategory">
                {{ formatCurrency(topCategory.total) }} ({{ topCategory.percentage.toFixed(1) }}%)
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
              v-for="category in expensesByCategory" 
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
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">Gastos Recientes</h3>
              <router-link 
                to="/expenses" 
                class="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Ver todos
              </router-link>
            </div>
          </template>

          <div v-if="recentExpenses.length > 0" class="space-y-3">
            <div 
              v-for="expense in recentExpenses" 
              :key="expense.id"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Icon name="mdi:cash-minus" :size="20" class="text-red-600" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-900 truncate">
                    {{ expense.description || 'Sin descripción' }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ formatDate(expense.expenseDate) }}
                  </p>
                </div>
              </div>
              <p class="font-semibold text-red-600 flex-shrink-0 ml-4">
                -{{ formatCurrency(expense.amount) }}
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
import Button from '@/components/UI/Button.vue'
import Card from '@/components/UI/Card.vue'
import Icon from '@/components/UI/Icon.vue'

const {
  stats,
  loading,
  currentBalance,
  totalExpenses,
  initialBalance,
  expenseCount,
  expensesByCategory,
  recentExpenses,
  topCategory,
  hasData,
  hasPositiveBalance,
  spentPercentage,
  refreshStats
} = useDashboard()
</script>
