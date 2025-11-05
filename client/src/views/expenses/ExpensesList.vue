<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Gastos</h1>
        <p class="text-gray-600 mt-1">Registra y gestiona tus gastos</p>
      </div>
      
      <Button
        icon="mdi:plus"
        @click="showCreateForm = true"
      >
        Nuevo Gasto
      </Button>
    </div>

    <!-- Resumen Total -->
    <Card v-if="hasExpenses" class="mb-6 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center">
            <Icon name="mdi:cash-multiple" :size="28" class="text-white" />
          </div>
          <div>
            <p class="text-sm text-purple-600 font-medium">Total Gastado</p>
            <p class="text-2xl font-bold text-purple-900">{{ formatCurrency(totalExpenses) }}</p>
          </div>
        </div>
      </div>
    </Card>

    <!-- Buscador -->
    <Card v-if="hasExpenses" class="mb-6">
      <Input
        v-model="searchTerm"
        type="text"
        placeholder="Buscar gastos por descripción o monto..."
      />
    </Card>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <Icon name="mdi:loading" class="animate-spin text-purple-600" :size="48" />
    </div>

    <!-- Empty State -->
    <Card v-else-if="!hasExpenses" class="empty-state">
      <Icon name="mdi:cash-remove" :size="64" class="text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-gray-700 mb-2">No tienes gastos registrados</h3>
      <p class="text-gray-500">Registra tu primer gasto para empezar a llevar control de tus finanzas</p>
    </Card>

    <!-- Lista de Gastos -->
    <div v-else class="space-y-3">
      <Card
        v-for="expense in filteredExpenses"
        :key="expense.id"
        hover
        class="hover-card"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4 flex-1">
            <div class="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <Icon name="mdi:cash-minus" :size="24" class="text-red-600" />
            </div>
            
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-semibold text-gray-900">
                  {{ expense.description || 'Sin descripción' }}
                </h3>
                <span v-if="expense.categoryId" class="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  Categoría
                </span>
              </div>
              <p class="text-sm text-gray-500">
                {{ formatDate(expense.expenseDate) }}
              </p>
            </div>
          </div>
          
          <div class="flex items-center gap-4">
            <div class="text-right">
              <p class="text-xl font-bold text-red-600">
                -{{ formatCurrency(expense.amount) }}
              </p>
            </div>
            
            <Button
              variant="ghost"
              icon="mdi:delete"
              :icon-size="20"
              @click="handleDelete(expense)"
            />
          </div>
        </div>
      </Card>
    </div>

    <!-- Modal Crear Gasto -->
    <CreateExpense
      v-if="showCreateForm"
      @close="showCreateForm = false"
      @created="handleCreated"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useExpenses } from '@/composables/useExpenses'
import { formatCurrency, formatDate } from '@/utils/formatters'
import Button from '@/components/UI/Button.vue'
import Card from '@/components/UI/Card.vue'
import Input from '@/components/UI/Input.vue'
import Icon from '@/components/UI/Icon.vue'
import CreateExpense from './CreateExpense.vue'

const { 
  filteredExpenses, 
  loading, 
  searchTerm, 
  hasExpenses,
  totalExpenses,
  removeExpense 
} = useExpenses()

const showCreateForm = ref(false)

const handleDelete = async (expense) => {
  await removeExpense(expense)
}

const handleCreated = () => {
  showCreateForm.value = false
}
</script>
