<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="page-header flex-col sm:flex-row items-start sm:items-center">
      <div class="flex-1 min-w-0 w-full sm:w-auto">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Categorías</h1>
        <p class="text-sm sm:text-base text-gray-600 mt-1">Gestiona las categorías de tus ingresos y gastos</p>
      </div>
      
      <div class="flex gap-2 flex-shrink-0 w-full sm:w-auto mt-3 sm:mt-0">
        <!-- Botón Reordenar (solo visible cuando NO está en modo reorder) -->
        <Button
          v-if="!isReorderMode && hasCategories"
          icon="mdi:drag"
          variant="secondary"
          @click="handleEnableReorder"
          class="flex-1 sm:flex-initial"
        >
          Reordenar
        </Button>
        
        <!-- Botón Nueva Categoría -->
        <Button
          v-if="!isReorderMode"
          icon="mdi:plus"
          @click="openCreateForm"
          class="flex-1 sm:flex-initial"
        >
          Nueva Categoría
        </Button>
      </div>
    </div>

    <!-- Banner de Modo Reordenamiento -->
    <Card v-if="isReorderMode" class="mb-6 border-2 border-purple-500">
      <div class="flex flex-col sm:flex-row items-center gap-4">
        <div class="flex items-center gap-3 flex-1">
          <Icon name="mdi:information" :size="24" class="text-purple-600" />
          <div>
            <p class="font-semibold text-gray-900">Modo de reordenamiento activo</p>
            <p class="text-sm text-gray-600">Arrastra las categorías para cambiar su orden</p>
          </div>
        </div>
        
        <div class="flex gap-2 w-full sm:w-auto">
          <Button
            variant="secondary"
            icon="mdi:close"
            @click="handleCancelReorder"
            :disabled="isSavingOrder"
            class="flex-1 sm:flex-initial"
          >
            Cancelar
          </Button>
          
          <Button
            variant="success"
            icon="mdi:content-save"
            @click="handleSaveOrder"
            :loading="isSavingOrder"
            :disabled="!hasOrderChanges || isSavingOrder"
            class="flex-1 sm:flex-initial"
          >
            {{ hasOrderChanges ? 'Guardar Orden' : 'Sin Cambios' }}
          </Button>
        </div>
      </div>
    </Card>

    <!-- Buscador y Filtros -->
    <Card v-if="hasCategories && !isReorderMode" class="mb-6">
      <div class="flex flex-col gap-4">
        <!-- Primera fila: Buscador -->
        <div class="w-full">
          <Input
            v-model="searchTerm"
            type="text"
            :placeholder="searchPlaceholder"
            :disabled="!canFilter"
          />
        </div>
        
        <!-- Segunda fila: Filtros -->
        <div class="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 gap-3">
          <!-- Tipo de categoría -->
          <div class="min-[500px]:col-span-1 lg:col-span-1">
            <Select
              v-model="selectedType"
              :options="typeOptions"
              label="Tipo de categoría"
              placeholder="Tipo"
              value-key="value"
              label-key="label"
              :disabled="!canFilter"
            />
          </div>
          
          <!-- Ordenar por monto -->
          <div class="min-[500px]:col-span-1 lg:col-span-1">
            <Select
              v-model="sortOrder"
              :options="sortOptions"
              label="Ordenar por monto"
              placeholder="Ordenar"
              value-key="value"
              label-key="label"
              :disabled="!canFilter"
            />
          </div>
          
          <!-- Botón Limpiar Filtros -->
          <div class="min-[500px]:col-span-2 lg:col-span-3">
            <Button
              variant="secondary"
              icon="mdi:filter-remove"
              @click="clearFilters"
              :disabled="!canFilter"
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
    <Card v-else-if="!hasCategories" class="empty-state">
      <Icon name="material-symbols:category-outline" :size="64" class="text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-700 mb-2">No tienes categorías registradas</h3>
      <p class="text-gray-500">Crea tu primera categoría para empezar a organizar tus transacciones</p>
    </Card>

    <!-- Galería de Categorías -->
    <div 
      v-else 
      ref="categoriesGridRef"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      :class="{ 'reorder-mode': isReorderMode }"
    >
      <Card
        v-for="category in paginatedCategoriesWithAmount"
        :key="category.id"
        :hover="!isReorderMode"
        :class="[
          'category-card relative',
          { 'cursor-move': isReorderMode, 'cursor-pointer': !isReorderMode }
        ]"
      >
        <div class="flex flex-col items-center text-center p-2">
          <!-- Indicador de drag (solo en modo reorder) -->
          <div v-if="isReorderMode" class="drag-indicator">
            <Icon name="mdi:drag" :size="20" class="text-gray-400" />
          </div>
          
          <!-- Ícono grande centrado -->
          <div :class="[
            'w-16 h-16 rounded-xl flex items-center justify-center mb-4',
            category.type === 'income' ? 'bg-green-100' : 'bg-red-100'
          ]">
            <Icon 
              :name="category.type === 'income' ? 'mdi:cash-plus' : 'mdi:cash-minus'" 
              :size="32" 
              :class="category.type === 'income' ? 'text-green-600' : 'text-red-600'"
            />
          </div>
          
          <!-- Nombre de la categoría -->
          <h3 class="font-semibold text-gray-900 mb-2 break-words word-break w-full px-2">
            {{ category.name || 'Sin nombre' }}
          </h3>
          
          <!-- Monto total -->
          <div class="w-full mb-4">
            <p :class="[
              'text-2xl font-bold',
              category.type === 'income' ? 'text-green-600' : 'text-red-600'
            ]">
              {{ formatCurrency(category.totalAmount) }}
            </p>
          </div>
          
          <!-- Botones Edit/Delete (ocultos en modo reorder) -->
          <div v-if="!isReorderMode" class="flex flex-col gap-2 w-full">
            <!-- Botón Editar -->
            <button
              @click="handleEdit(category)"
              class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium transition-colors shadow-sm hover:shadow-md border border-purple-200"
            >
              <Icon name="mdi:pencil" :size="18" />
              <span>Editar</span>
            </button>
            
            <!-- Botón Eliminar -->
            <button
              @click="handleDelete(category)"
              class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-medium transition-colors shadow-sm hover:shadow-md border border-red-200"
            >
              <Icon name="mdi:delete" :size="18" />
              <span>Eliminar</span>
            </button>
          </div>
        </div>
      </Card>
    </div>

    <!-- Paginación -->
    <Card v-if="hasCategories && totalPages > 0 && !isReorderMode" class="mt-6">
      <div class="flex flex-col gap-4">
        <!-- Información de paginación -->
        <div class="text-sm text-gray-600 text-center sm:text-left">
          Mostrando {{ paginationInfo.start }}-{{ paginationInfo.end }} de {{ paginationInfo.total }} categorías
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

    <!-- Modal Crear Categoría -->
    <CreateCategory
      v-if="showCreateForm"
      @close="showCreateForm = false"
      @created="handleCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useCategories } from '@/composables/useCategories'
import { formatCurrency } from '@/utils/formatters'
import Button from '@/components/UI/Button.vue'
import Card from '@/components/UI/Card.vue'
import Input from '@/components/UI/Input.vue'
import Select from '@/components/UI/Select.vue'
import Icon from '@/components/UI/Icon.vue'
import CreateCategory from './CreateCategory.vue'
import Sortable from 'sortablejs'

const router = useRouter()

const { 
  paginatedCategoriesWithAmount,
  loading, 
  searchTerm,
  selectedType,
  sortOrder,
  currentPage,
  itemsPerPage,
  hasCategories, 
  totalPages,
  paginationInfo,
  removeCategory,
  clearFilters,
  nextPage,
  prevPage,
  firstPage,
  lastPage,
  setItemsPerPage,
  // Drag-and-drop
  isReorderMode,
  isSavingOrder,
  hasOrderChanges,
  canFilter,
  enableReorderMode,
  cancelReorderMode,
  updateLocalOrder,
  saveOrder
} = useCategories()

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
const windowWidth = ref(window.innerWidth)
const categoriesGridRef = ref(null)
let sortableInstance = null

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
  if (windowWidth.value < 410) return 'Buscar categoría...'
  // Desktop: completo
  return 'Buscar categoría por nombre...'
})

/**
 * Inicializa Sortable.js cuando entra en modo reordenamiento
 */
const initSortable = () => {
  if (!categoriesGridRef.value || sortableInstance) return

  sortableInstance = new Sortable(categoriesGridRef.value, {
    animation: 200,
    handle: '.category-card',
    ghostClass: 'category-ghost',
    dragClass: 'category-drag',
    onEnd: (event) => {
      updateLocalOrder(event.oldIndex, event.newIndex)
    }
  })
}

/**
 * Destruye la instancia de Sortable.js
 */
const destroySortable = () => {
  if (sortableInstance) {
    sortableInstance.destroy()
    sortableInstance = null
  }
}

/**
 * Activa el modo de reordenamiento
 */
const handleEnableReorder = () => {
  enableReorderMode()
  nextTick(() => {
    initSortable()
  })
}

/**
 * Cancela el modo de reordenamiento
 */
const handleCancelReorder = () => {
  destroySortable()
  cancelReorderMode()
}

/**
 * Guarda el orden
 */
const handleSaveOrder = async () => {
  await saveOrder()
  destroySortable()
}

// Watch para destruir Sortable cuando sale del modo reordenamiento
watch(isReorderMode, (newValue) => {
  if (!newValue) {
    destroySortable()
  }
})

// Escuchar cambios en el tamaño de ventana
onMounted(() => {
  window.addEventListener('resize', updateWindowWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth)
  destroySortable()
})

const openCreateForm = () => {
  showCreateForm.value = true
}

const handleEdit = (category) => {
  router.push(`/categories/${category.id}`)
}

const handleDelete = async (category) => {
  await removeCategory(category)
}

const handleCreated = () => {
  showCreateForm.value = false
}
</script>
