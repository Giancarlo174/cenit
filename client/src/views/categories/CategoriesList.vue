<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Categorías</h1>
        <p class="text-gray-600 mt-1">Gestiona las categorías de tus ingresos y gastos</p>
      </div>
      
      <Button
        icon="mdi:plus"
        @click="showCreateForm = true"
      >
        Nueva Categoría
      </Button>
    </div>

    <!-- Buscador y Filtros -->
    <Card v-if="hasCategories" class="mb-6">
      <div class="flex gap-4">
        <div class="flex-1">
          <Input
            v-model="searchTerm"
            type="text"
            placeholder="Buscar categorías..."
            icon="mdi:magnify"
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
    <Card v-else-if="!hasCategories" class="empty-state">
      <Icon name="material-symbols:category-outline" :size="64" class="text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-700 mb-2">No tienes categorías</h3>
      <p class="text-gray-500">Crea tu primera categoría para empezar a organizar tus transacciones</p>
    </Card>

    <!-- Lista de Categorías -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        v-for="category in filteredCategories"
        :key="category.id"
        hover
        class="hover-card"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3 flex-1">
            <div :class="[
              'w-12 h-12 rounded-lg flex items-center justify-center',
              category.type === 'income' ? 'bg-green-100' : 'bg-purple-100'
            ]">
              <Icon 
                :name="category.type === 'income' ? 'mdi:cash-plus' : 'material-symbols:category'" 
                :size="24" 
                :class="category.type === 'income' ? 'text-green-600' : 'text-purple-600'"
              />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-semibold text-gray-900 truncate">{{ category.name }}</h3>
                <span :class="[
                  'text-xs px-2 py-0.5 rounded-full flex-shrink-0',
                  category.type === 'income' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                ]">
                  {{ category.type === 'income' ? 'Ingreso' : 'Gasto' }}
                </span>
              </div>
              <p class="text-sm text-gray-500">
                {{ formatDate(category.createdAt) }}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            icon="mdi:delete"
            :icon-size="20"
            @click="handleDelete(category)"
          />
        </div>
      </Card>
    </div>

    <!-- Modal Crear Categoría -->
    <CreateCategory
      v-if="showCreateForm"
      @close="showCreateForm = false"
      @created="handleCreated"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCategories } from '@/composables/useCategories'
import { formatDate } from '@/utils/formatters'
import Button from '@/components/UI/Button.vue'
import Card from '@/components/UI/Card.vue'
import Input from '@/components/UI/Input.vue'
import Icon from '@/components/UI/Icon.vue'
import CreateCategory from './CreateCategory.vue'

const { 
  filteredCategories, 
  loading, 
  searchTerm,
  selectedType,
  hasCategories, 
  removeCategory,
  setTypeFilter
} = useCategories()

const showCreateForm = ref(false)

const handleDelete = async (category) => {
  await removeCategory(category)
}

const handleCreated = () => {
  showCreateForm.value = false
}
</script>
