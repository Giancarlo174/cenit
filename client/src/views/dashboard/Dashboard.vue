<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-sm sm:text-base text-gray-600 mt-1">Resumen de tus finanzas</p>
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
    <div v-else class="space-y-4 sm:space-y-6">
      <!-- Tarjetas de Resumen con Operación Matemática -->
      <div class="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 sm:gap-4">
        <!-- Balance Actual -->
        <Card class="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 flex-1 w-full">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <Icon name="mdi:wallet" :size="20" class="text-purple-600 sm:w-6 sm:h-6" />
                <p class="text-xs sm:text-sm font-medium text-purple-700">Balance Actual</p>
              </div>
              <p class="text-2xl sm:text-3xl font-bold text-purple-900">
                {{ formatCurrency(currentBalance) }}
              </p>
            </div>
          </div>
        </Card>

        <!-- Símbolo igual -->
        <div class="hidden lg:flex items-center justify-center flex-shrink-0 w-8 h-8">
          <span class="text-2xl sm:text-3xl font-bold text-gray-400">=</span>
        </div>

        <!-- Ingresos Registrados -->
        <Card class="bg-gradient-to-br from-green-50 to-green-100 border-green-200 flex-1 w-full">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <Icon name="mdi:cash-plus" :size="20" class="text-green-600 sm:w-6 sm:h-6" />
                <p class="text-xs sm:text-sm font-medium text-green-700">Ingresos Registrados</p>
              </div>
              <p class="text-2xl sm:text-3xl font-bold text-green-900">
                {{ formatCurrency(totalIncome) }}
              </p>
            </div>
          </div>
        </Card>

        <!-- Símbolo menos -->
        <div class="hidden lg:flex items-center justify-center flex-shrink-0 w-8 h-8">
          <span class="text-2xl sm:text-3xl font-bold text-gray-400">−</span>
        </div>

        <!-- Total Gastado -->
        <Card class="bg-gradient-to-br from-red-50 to-red-100 border-red-200 flex-1 w-full">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <Icon name="mdi:cash-minus" :size="20" class="text-red-600 sm:w-6 sm:h-6" />
                <p class="text-xs sm:text-sm font-medium text-red-700">Total Gastado</p>
              </div>
              <p class="text-2xl sm:text-3xl font-bold text-red-900">
                {{ formatCurrency(totalExpenses) }}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <!-- Gráfico y Listas por Categoría -->
      <!-- Categorías (2 columnas en desktop, 1 en mobile) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <!-- Gastos por Categoría -->
        <Card>
          <template #header>
            <h3 class="text-base sm:text-lg font-semibold text-gray-900">Gastos por Categoría</h3>
          </template>

          <div v-if="expensesByCategory.length > 0" class="space-y-3 sm:space-y-4 overflow-x-auto">
            <div 
              v-for="category in expensesByCategory.slice(0, 5)" 
              :key="category.id"
              class="space-y-2 min-w-max sm:min-w-0"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="material-symbols:category" :size="18" class="text-red-600 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <p class="text-sm sm:text-base font-medium text-gray-900 whitespace-nowrap">{{ category.name }}</p>
                    <p class="text-xs text-gray-500 whitespace-nowrap">{{ category.count }} {{ category.count === 1 ? 'gasto' : 'gastos' }}</p>
                  </div>
                </div>
                <div class="text-right flex-shrink-0">
                  <p class="text-sm sm:text-base font-semibold text-gray-900 whitespace-nowrap">{{ formatCurrency(category.total) }}</p>
                  <p class="text-xs text-gray-500 whitespace-nowrap">{{ category.percentage.toFixed(1) }}%</p>
                </div>
              </div>
              
              <!-- Barra de progreso -->
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-red-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${category.percentage}%` }"
                ></div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-500">
            <Icon name="material-symbols:category-outline" :size="48" class="text-gray-400 mx-auto mb-2" />
            <p class="text-sm">No hay gastos por categoría</p>
          </div>
        </Card>

        <!-- Ingresos por Categoría -->
        <Card>
          <template #header>
            <h3 class="text-base sm:text-lg font-semibold text-gray-900">Ingresos por Categoría</h3>
          </template>

          <div v-if="incomeByCategory.length > 0" class="space-y-3 sm:space-y-4 overflow-x-auto">
            <div 
              v-for="category in incomeByCategory.slice(0, 5)" 
              :key="category.id"
              class="space-y-2 min-w-max sm:min-w-0"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Icon name="material-symbols:category" :size="18" class="text-green-600 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <p class="text-sm sm:text-base font-medium text-gray-900 whitespace-nowrap">{{ category.name }}</p>
                    <p class="text-xs text-gray-500 whitespace-nowrap">{{ category.count }} {{ category.count === 1 ? 'ingreso' : 'ingresos' }}</p>
                  </div>
                </div>
                <div class="text-right flex-shrink-0">
                  <p class="text-sm sm:text-base font-semibold text-gray-900 whitespace-nowrap">{{ formatCurrency(category.total) }}</p>
                  <p class="text-xs text-gray-500 whitespace-nowrap">{{ category.percentage.toFixed(1) }}%</p>
                </div>
              </div>
              
              <!-- Barra de progreso -->
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-green-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${category.percentage}%` }"
                ></div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-500">
            <Icon name="material-symbols:category-outline" :size="48" class="text-gray-400 mx-auto mb-2" />
            <p class="text-sm">No hay ingresos por categoría</p>
          </div>
        </Card>
      </div>

      <!-- Gráfico de Ingresos vs Gastos (ancho completo) -->
      <Card>
        <template #header>
          <div class="flex flex-col gap-4">
            <!-- Título y selector de periodo -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 class="text-base sm:text-lg font-semibold text-gray-900">Ingresos vs Gastos</h3>
              
              <!-- Selector de periodo -->
              <div class="flex gap-1">
                <button
                  v-for="periodOption in periodOptions"
                  :key="periodOption.value"
                  @click="setPeriod(periodOption.value)"
                  :class="[
                    'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                    period === periodOption.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  {{ periodOption.label }}
                </button>
              </div>
            </div>

            <!-- Selectores jerárquicos según el modo -->
            <div class="flex flex-wrap items-center gap-2">
              <!-- Selector de Año (visible en todos los modos) -->
              <div class="flex items-center gap-2">
                <label class="text-sm font-medium text-gray-700">Año:</label>
                <select
                  v-model.number="selectedYear"
                  @change="setYear(selectedYear)"
                  class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option v-for="year in availableYears" :key="year" :value="year">
                    {{ year }}
                  </option>
                </select>
              </div>

              <!-- Selector de Mes (visible en modo "Días" y "Semanas") -->
              <div v-if="period === 'day' || period === 'week'" class="flex items-center gap-2">
                <label class="text-sm font-medium text-gray-700">Mes:</label>
                <select
                  v-model.number="selectedMonth"
                  @change="setMonth(selectedMonth)"
                  class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option v-for="month in 12" :key="month" :value="month">
                    {{ getMonthName(month) }}
                  </option>
                </select>
              </div>

              <!-- Selector de Semana (visible solo en modo "Días") -->
              <div v-if="period === 'day'" class="flex items-center gap-2">
                <label class="text-sm font-medium text-gray-700">Semana:</label>
                <select
                  v-model.number="selectedWeek"
                  @change="setWeek(selectedWeek)"
                  class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option v-for="week in availableWeeks" :key="week" :value="week">
                    {{ getWeekLabel(week) }}
                  </option>
                </select>
              </div>

              <!-- Botón HOY -->
              <Button
                variant="secondary"
                @click="goToToday"
                class="px-3 py-1.5 text-sm font-medium ml-auto"
              >
                HOY
              </Button>
            </div>

            <!-- Label descriptivo del periodo -->
            <p class="text-sm font-medium text-gray-600 border-t pt-3">
              {{ periodLabel }}
            </p>
          </div>
        </template>

        <!-- Gráfico -->
        <BarChart :data="chartData" :period="period" />
      </Card>
    </div>
  </div>
</template>

<script setup>
import { useDashboard } from '@/composables/useDashboard'
import { formatCurrency } from '@/utils/formatters'
import Card from '@/components/UI/Card.vue'
import Button from '@/components/UI/Button.vue'
import Icon from '@/components/UI/Icon.vue'
import BarChart from '@/components/UI/BarChart.vue'

const {
  stats,
  loading,
  currentBalance,
  totalIncome,
  totalExpenses,
  expensesByCategory,
  incomeByCategory,
  hasData,
  period,
  selectedYear,
  selectedMonth,
  selectedWeek,
  availableYears,
  availableWeeks,
  chartData,
  periodLabel,
  setPeriod,
  setYear,
  setMonth,
  setWeek,
  goToToday
} = useDashboard()

// Opciones de periodo
const periodOptions = [
  { value: 'day', label: 'Días' },
  { value: 'week', label: 'Semanas' },
  { value: 'month', label: 'Meses' }
]

/**
 * Obtiene el nombre del mes en español
 * @param {number} month - Número del mes (1-12)
 */
const getMonthName = (month) => {
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  return monthNames[month - 1]
}

/**
 * Obtiene el label de la semana con rango de días
 * @param {number} weekNumber - Número de semana (1-5)
 * @returns {string} Label con rango de días (ej: "Semana 1-7")
 */
const getWeekLabel = (weekNumber) => {
  const startDay = (weekNumber - 1) * 7 + 1
  
  // Calcular el último día del mes seleccionado
  const lastDayOfMonth = new Date(selectedYear.value, selectedMonth.value, 0).getDate()
  const endDay = Math.min(weekNumber * 7, lastDayOfMonth)
  
  return `Semana ${startDay}-${endDay}`
}
</script>

