<template>
  <Icon :icon="name" :width="size" :height="size" />
</template>

<script setup>
import { Icon } from '@iconify/vue'

defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 24
  }
})
</script>
