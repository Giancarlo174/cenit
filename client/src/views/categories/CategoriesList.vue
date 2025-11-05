<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Categorías</h1>
        <p class="text-gray-600 mt-1">Gestiona las categorías de tus gastos</p>
      </div>
      
      <Button
        icon="mdi:plus"
        @click="showCreateForm = true"
      >
        Nueva Categoría
      </Button>
    </div>

    <!-- Buscador -->
    <Card v-if="hasCategories" class="mb-6">
      <Input
        v-model="searchTerm"
        type="text"
        placeholder="Buscar categorías..."
        icon="mdi:magnify"
      />
    </Card>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <Icon name="mdi:loading" class="animate-spin text-purple-600" :size="48" />
    </div>

    <!-- Empty State -->
    <Card v-else-if="!hasCategories" class="empty-state">
      <Icon name="material-symbols:category-outline" :size="64" class="text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-700 mb-2">No tienes categorías</h3>
      <p class="text-gray-500">Crea tu primera categoría para empezar a organizar tus gastos</p>
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
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Icon name="material-symbols:category" :size="24" class="text-purple-600" />
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">{{ category.name }}</h3>
              <p class="text-sm text-gray-500">
                Creada: {{ formatDate(category.createdAt) }}
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
  hasCategories, 
  removeCategory 
} = useCategories()

const showCreateForm = ref(false)

const handleDelete = async (category) => {
  await removeCategory(category)
}

const handleCreated = () => {
  showCreateForm.value = false
}
</script>
