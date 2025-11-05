<template>
  <div :class="cardClasses">
    <div v-if="$slots.header" class="px-6 py-4 border-b border-gray-200">
      <slot name="header" />
    </div>
    
    <div class="px-6 py-4">
      <slot />
    </div>
    
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  hover: {
    type: Boolean,
    default: false
  },
  noPadding: {
    type: Boolean,
    default: false
  }
})

const cardClasses = computed(() => {
  const base = 'bg-white rounded-lg shadow-sm border border-gray-200'
  const hover = props.hover ? 'hover:shadow-md transition-shadow duration-200' : ''
  const padding = props.noPadding ? 'p-0' : ''
  
  return `${base} ${hover} ${padding}`
})
</script>
