<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <template v-if="showLayout">
      <!-- Mobile Header con botón hamburguesa -->
      <header class="mobile-header">
        <button 
          @click="toggleMobileMenu"
          class="mobile-menu-button"
          aria-label="Abrir menú"
        >
          <Icon :name="isMobileMenuOpen ? 'mdi:close' : 'mdi:menu'" :size="24" />
        </button>
        <h1 class="mobile-header-title">Cenit</h1>
        <div class="w-10"></div> <!-- Spacer para centrar el título -->
      </header>

      <!-- Overlay para cerrar el menú móvil -->
      <div 
        v-if="isMobileMenuOpen"
        class="mobile-overlay"
        @click="closeMobileMenu"
      ></div>

      <!-- Sidebar con control de móvil -->
      <Sidebar 
        :isMobileMenuOpen="isMobileMenuOpen"
        @close="closeMobileMenu"
      />
      
      <main class="main-content">
        <router-view />
      </main>
    </template>
    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/components/layout/Sidebar.vue'
import Icon from '@/components/UI/Icon.vue'

const route = useRoute()
const isMobileMenuOpen = ref(false)

// Mostrar layout solo en rutas que requieren autenticación
const showLayout = computed(() => {
  return route.meta.requiresAuth === true
})

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

// Cerrar menú móvil cuando cambia la ruta
watch(route, () => {
  closeMobileMenu()
})
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

* {
  box-sizing: border-box;
}

/* Mobile Header - Solo visible en móvil */
.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3.5rem;
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  z-index: 40;
}

.mobile-menu-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  color: #374151;
  transition: all 0.2s;
  background: transparent;
  border: none;
  cursor: pointer;
}

.mobile-menu-button:hover {
  background-color: #f3f4f6;
}

.mobile-header-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #9333ea;
}

/* Mobile Overlay */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 45;
  display: none;
}

/* Main Content con padding-top en móvil */
.main-content {
  min-height: 100vh;
  padding-top: 3.5rem; /* Altura del header móvil */
  transition: margin-left 0.3s ease;
}

/* Desktop: Sidebar visible, header oculto */
@media (min-width: 768px) {
  .mobile-header {
    display: none;
  }

  .mobile-overlay {
    display: none !important;
  }

  .main-content {
    margin-left: 16rem;
    padding-top: 0;
  }
}

/* Mobile: Mostrar overlay cuando menú está abierto */
@media (max-width: 767px) {
  .mobile-overlay {
    display: block;
  }
}
</style>

