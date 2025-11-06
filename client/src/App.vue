<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <template v-if="showLayout">
      <Sidebar />
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
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/components/layout/Sidebar.vue'

const route = useRoute()

// Mostrar layout solo en rutas que requieren autenticación
const showLayout = computed(() => {
  return route.meta.requiresAuth === true
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

.main-content {
  margin-left: 16rem;
  min-height: 100vh;
}
</style>
