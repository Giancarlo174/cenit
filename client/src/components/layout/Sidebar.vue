<template>
  <aside class="sidebar">
    <!-- Header / Brand -->
    <div class="sidebar-header">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg">
          <Icon name="mdi:wallet" :size="24" class="text-white" />
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-900">Cenit</h1>
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
import Icon from '@/components/UI/Icon.vue'

const route = useRoute()

const isActive = (path) => {
  return route.path === path
}
</script>
