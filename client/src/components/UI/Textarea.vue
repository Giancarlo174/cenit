<template>
  <div class="space-y-2">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="!required && label" class="text-gray-400 text-xs">(Opcional)</span>
    </label>
    
    <textarea
      :id="inputId"
      :value="modelValue"
      @input="handleInput"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :rows="rows"
      :maxlength="maxLength"
      :class="textareaClasses"
    />

    <div v-if="maxLength" class="flex justify-between items-center">
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <p v-else-if="hint" class="text-sm text-gray-500">{{ hint }}</p>
      <span v-else class="flex-1"></span>
      <span class="text-xs text-gray-400">
        {{ characterCount }} / {{ maxLength }}
      </span>
    </div>
    <div v-else>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <p v-else-if="hint" class="text-sm text-gray-500">{{ hint }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: null
  },
  placeholder: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  rows: {
    type: Number,
    default: 3
  },
  error: {
    type: String,
    default: null
  },
  hint: {
    type: String,
    default: null
  },
  maxLength: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'input', 'blur'])

// Genera un ID único para el input
const inputId = computed(() => {
  return `textarea-${Math.random().toString(36).substr(2, 9)}`
})

const characterCount = computed(() => {
  return props.modelValue?.length || 0
})

const textareaClasses = computed(() => {
  const base = 'block w-full px-4 py-2 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 resize-none'
  const error = props.error 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
    : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
  const disabled = props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
  
  return `${base} ${error} ${disabled}`
})

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
  emit('input', event)
}
</script>
