<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <Sidebar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Sidebar from '@/components/layout/Sidebar.vue'
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
