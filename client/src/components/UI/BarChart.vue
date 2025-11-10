<template>
  <div class="bar-chart-container">
    <!-- Empty State -->
    <div v-if="!hasData" class="text-center py-12 text-gray-500">
      <Icon name="mdi:chart-bar" :size="48" class="text-gray-400 mx-auto mb-2" />
      <p class="text-sm">No hay datos para este periodo</p>
    </div>

    <!-- Chart -->
    <div v-else class="relative">
      <!-- SVG Chart -->
      <svg :width="chartWidth" :height="chartHeight" class="overflow-visible">
        <!-- Bars -->
        <g v-for="(item, index) in data" :key="`bar-${index}`">
          <!-- Income bar (green) -->
          <rect
            v-if="item.income > 0"
            :x="getBarX(index, 0)"
            :y="getBarY(item.income)"
            :width="barWidth"
            :height="getBarHeight(item.income)"
            fill="#10b981"
            class="transition-all duration-300 hover:opacity-80"
          />
          
          <!-- Income amount above bar -->
          <text
            v-if="item.income > 0"
            :x="getBarX(index, 0) + (barWidth / 2)"
            :y="getBarY(item.income) - 8"
            text-anchor="middle"
            class="text-xs font-semibold fill-green-700"
          >
            ${{ item.income }}
          </text>

          <!-- Expense bar (red) -->
          <rect
            v-if="item.expense > 0"
            :x="getBarX(index, 1)"
            :y="getBarY(item.expense)"
            :width="barWidth"
            :height="getBarHeight(item.expense)"
            fill="#ef4444"
            class="transition-all duration-300 hover:opacity-80"
          />
          
          <!-- Expense amount above bar -->
          <text
            v-if="item.expense > 0"
            :x="getBarX(index, 1) + (barWidth / 2)"
            :y="getBarY(item.expense) - 8"
            text-anchor="middle"
            class="text-xs font-semibold fill-red-700"
          >
            ${{ item.expense }}
          </text>
        </g>

        <!-- X-axis labels -->
        <g v-for="(item, index) in data" :key="`label-${index}`">
          <text
            :x="getBarGroupCenter(index)"
            :y="chartHeight - padding + 20"
            text-anchor="middle"
            class="text-xs fill-gray-600"
          >
            {{ formatLabel(item, index) }}
          </text>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  },
  period: {
    type: String,
    required: true,
    validator: (value) => ['day', 'week', 'month'].includes(value)
  }
})

// Configuración del gráfico
const chartWidth = ref(800)
const chartHeight = ref(300)
const padding = 40  // Reducido ya que no hay eje Y
const barGap = 4
const groupGap = 12

// Computed: ¿Hay datos para mostrar?
const hasData = computed(() => {
  return props.data.length > 0 && props.data.some(item => item.income > 0 || item.expense > 0)
})

// Computed: Valor máximo para escala
const maxValue = computed(() => {
  if (!hasData.value) return 100
  
  const max = Math.max(
    ...props.data.map(item => Math.max(item.income, item.expense))
  )
  
  // Redondear hacia arriba al múltiplo de 100 más cercano
  return Math.ceil(max / 100) * 100 || 100
})

// Computed: Ancho de cada barra
const barWidth = computed(() => {
  const availableWidth = chartWidth.value - (padding * 2)
  const totalGroups = props.data.length
  const totalGaps = (totalGroups - 1) * groupGap + (totalGroups * 2 * barGap)
  const barSpace = (availableWidth - totalGaps) / (totalGroups * 2)
  return Math.max(barSpace, 8) // Mínimo 8px
})

/**
 * Calcula la posición X de una barra
 * @param {number} groupIndex - Índice del grupo (fecha)
 * @param {number} barIndex - 0 para income, 1 para expense
 */
const getBarX = (groupIndex, barIndex) => {
  const groupWidth = (barWidth.value * 2) + (barGap * 2)
  const groupStart = padding + (groupIndex * (groupWidth + groupGap))
  return groupStart + (barIndex * (barWidth.value + barGap))
}

/**
 * Calcula el centro de un grupo de barras (para labels)
 */
const getBarGroupCenter = (groupIndex) => {
  const groupWidth = (barWidth.value * 2) + (barGap * 2)
  return padding + (groupIndex * (groupWidth + groupGap)) + (groupWidth / 2)
}

/**
 * Calcula la posición Y de una barra
 */
const getBarY = (value) => {
  const availableHeight = chartHeight.value - (padding * 2)
  const ratio = value / maxValue.value
  return chartHeight.value - padding - (availableHeight * ratio)
}

/**
 * Calcula la altura de una barra
 */
const getBarHeight = (value) => {
  const availableHeight = chartHeight.value - (padding * 2)
  return (availableHeight * value) / maxValue.value
}

/**
 * Formatea el label del eje X según el periodo
 */
const formatLabel = (item, index) => {
  switch (props.period) {
    case 'day': {
      // Modo días: Obtener día de la semana desde dateObj (que ya es Date correcto del module)
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
      // dateObj viene del module y ya está en hora local
      return days[item.dateObj.getDay()]
    }
    
    case 'week': {
      // Modo semanas: Mostrar "Semana 1-7", "Semana 8-14", etc.
      return item.date // Ya viene formateado como "Semana X-Y" del module
    }
    
    case 'month': {
      // Modo meses: Mostrar nombre del mes abreviado (Ene, Feb, etc.)
      return item.date // Ya viene formateado como "Ene", "Feb", etc. del module
    }
    
    default:
      return ''
  }
}
</script>

<style scoped>
.bar-chart-container {
  position: relative;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  /* Scroll suave y visible */
  scrollbar-width: thin;
  scrollbar-color: #9333ea #f3f4f6;
}

/* Estilos para scrollbar en WebKit (Chrome, Safari, Edge) */
.bar-chart-container::-webkit-scrollbar {
  height: 8px;
}

.bar-chart-container::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 4px;
}

.bar-chart-container::-webkit-scrollbar-thumb {
  background: #9333ea;
  border-radius: 4px;
}

.bar-chart-container::-webkit-scrollbar-thumb:hover {
  background: #7e22ce;
}
</style>
