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
          <p class="text-sm font-medium text-purple-600">
            {{ formatCurrency(currentBalance) }}
          </p>
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
        to="/transactions"
        class="nav-item"
        :class="{ 'nav-item-active': isActive('/transactions') }"
      >
        <div class="nav-item-icon">
          <Icon name="mdi:cash-multiple" :size="22" />
        </div>
        <div class="nav-item-content">
          <span class="nav-item-title">Transacciones</span>
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
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useProfile } from '@/composables/useProfile'
import { useDashboard } from '@/composables/useDashboard'
import { confirmAction } from '@/modules/notifications'
import { formatCurrency } from '@/utils/formatters'
import Icon from '@/components/UI/Icon.vue'

const route = useRoute()
const { logout, loading } = useAuth()
const { username } = useProfile()
const { currentBalance } = useDashboard()

const isActive = (path) => {
  return route.path === path
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
