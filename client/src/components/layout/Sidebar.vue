<template>
  <aside class="sidebar">
    <!-- Header / Perfil de Usuario -->
    <div class="sidebar-header">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg">
          <Icon name="mdi:account" :size="24" class="text-white" />
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-base font-semibold text-gray-900 truncate">
            {{ username || 'Usuario' }}
          </h2>
          <div class="flex items-center gap-2">
            <p class="text-sm font-medium text-purple-600">
              {{ formatCurrency(initialBalance) }}
            </p>
            <button
              @click="showEditBalanceModal = true"
              class="text-gray-400 hover:text-purple-600 transition-colors"
              title="Editar balance"
            >
              <Icon name="mdi:pencil" :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Navegación Principal -->
    <nav class="sidebar-nav">
      
      <router-link
        to="/dashboard"
        class="nav-item"
        :class="{ 'nav-item-active': isActive('/dashboard') }"
      >
        <div class="nav-item-icon">
          <Icon name="mdi:view-dashboard" :size="22" />
        </div>
        <div class="nav-item-content">
          <span class="nav-item-title">Dashboard</span>
        </div>
      </router-link>
      
      <router-link
        to="/expenses"
        class="nav-item"
        :class="{ 'nav-item-active': isActive('/expenses') }"
      >
        <div class="nav-item-icon">
          <Icon name="mdi:cash-minus" :size="22" />
        </div>
        <div class="nav-item-content">
          <span class="nav-item-title">Gastos</span>
        </div>
      </router-link>
      
      <router-link
        to="/categories"
        class="nav-item"
        :class="{ 'nav-item-active': isActive('/categories') }"
      >
        <div class="nav-item-icon">
          <Icon name="material-symbols:category-rounded" :size="22" />
        </div>
        <div class="nav-item-content">
          <span class="nav-item-title">Categorías</span>
        </div>
      </router-link>

      <!-- Separador -->
      <div class="my-4 border-t border-gray-200"></div>

      <!-- Mi Perfil -->
      <router-link
        to="/profile"
        class="nav-item"
        :class="{ 'nav-item-active': isActive('/profile') }"
      >
        <div class="nav-item-icon">
          <Icon name="mdi:account-cog" :size="22" />
        </div>
        <div class="nav-item-content">
          <span class="nav-item-title">Mi Perfil</span>
        </div>
      </router-link>

      <!-- Botón de Logout -->
      <button
        @click="handleLogout"
        class="nav-item text-left w-full hover:bg-red-50"
        :disabled="loading"
      >
        <div class="nav-item-icon text-red-600">
          <Icon 
            :name="loading ? 'material-symbols:progress-activity' : 'material-symbols:logout'" 
            :size="22" 
            :class="{ 'animate-spin': loading }"
          />
        </div>
        <div class="nav-item-content">
          <span class="nav-item-title text-red-600">
            {{ loading ? 'Cerrando...' : 'Cerrar Sesión' }}
          </span>
        </div>
      </button>
    </nav>

    <!-- Footer Info -->
    <div class="sidebar-footer">
      <div class="flex items-center gap-2 text-xs text-gray-500">
        <Icon name="mdi:shield-check" :size="16" class="text-green-600" />
        <span>Datos seguros</span>
      </div>
    </div>
  </aside>

  <!-- Modal de Editar Balance (fuera del sidebar con Teleport) -->
  <Teleport to="body">
    <Modal
      v-if="showEditBalanceModal"
      title="Editar Presupuesto"
      size="sm"
      :show-close-button="false"
      :close-on-click-outside="false"
      @close="closeEditBalanceModal"
    >
      <form @submit.prevent="handleUpdateBalance" class="space-y-4">
        <div>
          <label for="newBalance" class="block text-sm font-medium text-gray-700 mb-1">
            Nuevo Presupuesto
          </label>
          <Input
            id="newBalance"
            v-model.number="newBalance"
            type="number"
            step="0.01"
            placeholder="0.00"
            required
            :disabled="loadingUpdate"
          />
        </div>

        <div class="flex gap-3 justify-end">
          <Button
            type="button"
            variant="secondary"
            @click="closeEditBalanceModal"
            :disabled="loadingUpdate"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            :disabled="loadingUpdate || newBalance < 0"
          >
            <Icon
              v-if="loadingUpdate"
              name="material-symbols:progress-activity"
              class="inline mr-2 animate-spin"
              :size="18"
            />
            {{ loadingUpdate ? 'Guardando...' : 'Guardar' }}
          </Button>
        </div>
      </form>
    </Modal>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useProfile } from '@/composables/useProfile'
import { confirmAction } from '@/modules/notifications'
import { formatCurrency } from '@/utils/formatters'
import Icon from '@/components/UI/Icon.vue'
import Modal from '@/components/UI/Modal.vue'
import Input from '@/components/UI/Input.vue'
import Button from '@/components/UI/Button.vue'

const route = useRoute()
const { logout, loading } = useAuth()
const { username, initialBalance, update, profile } = useProfile()

// Estado del modal de editar balance
const showEditBalanceModal = ref(false)
const newBalance = ref(0)
const loadingUpdate = ref(false)

// Cargar balance actual en el modal cuando se abre
watch(showEditBalanceModal, (show) => {
  if (show && profile.value) {
    newBalance.value = profile.value.initialBalance
  }
})

const isActive = (path) => {
  return route.path === path
}

const closeEditBalanceModal = () => {
  showEditBalanceModal.value = false
  newBalance.value = 0
}

const handleUpdateBalance = async () => {
  if (!profile.value) return

  loadingUpdate.value = true
  try {
    await update({
      username: profile.value.username,
      initialBalance: newBalance.value
    })
    closeEditBalanceModal()
  } catch (error) {
    console.error('Error al actualizar balance:', error)
  } finally {
    loadingUpdate.value = false
  }
}

const handleLogout = async () => {
  // Confirmar antes de cerrar sesión
  const confirmed = await confirmAction(
    'Confirmar cierre de sesión',
    '¿Estás seguro de que deseas cerrar sesión?',
    'Sí, cerrar sesión'
  )

  if (!confirmed) return

  try {
    await logout()
    // El composable maneja la redirección al login
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}
</script>
