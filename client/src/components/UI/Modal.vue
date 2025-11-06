<template>
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    @click.self="closeOnClickOutside ? handleClose : null"
  >
    <Card :class="['w-full', modalSizeClass, 'max-h-[90vh] overflow-y-auto']">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900">{{ title }}</h2>
          <button
            v-if="showCloseButton"
            @click="handleClose"
            class="text-gray-400 hover:text-gray-600 transition-colors"
            :disabled="loading"
          >
            <Icon name="mdi:close" :size="24" />
          </button>
        </div>
      </template>

      <slot />
    </Card>
  </div>
</template>

<script setup>
import Card from './Card.vue'
import Icon from './Icon.vue'
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  },
  showCloseButton: {
    type: Boolean,
    default: true
  },
  closeOnClickOutside: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close'])

const modalSizeClass = computed(() => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  }
  return sizes[props.size]
})

const handleClose = () => {
  if (!props.loading) {
    emit('close')
  }
}
</script>
