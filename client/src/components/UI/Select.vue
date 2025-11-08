<template>
  <div class="space-y-2">
    <label v-if="label" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="!required && label" class="text-gray-400 text-xs">(Opcional)</span>
    </label>
    
    <select
      :value="modelValue"
      @change="handleChange"
      :required="required"
      :disabled="disabled"
      :class="selectClasses"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option[valueKey]"
        :value="option[valueKey]"
      >
        {{ option[labelKey] }}
      </option>
    </select>

    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    <p v-else-if="hint" class="text-sm text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, null],
    default: null
  },
  options: {
    type: Array,
    required: true,
    default: () => []
  },
  label: {
    type: String,
    default: null
  },
  placeholder: {
    type: String,
    default: null
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  },
  hint: {
    type: String,
    default: null
  },
  valueKey: {
    type: String,
    default: 'id'
  },
  labelKey: {
    type: String,
    default: 'name'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const selectClasses = computed(() => {
  const base = 'block w-full px-4 py-2 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2'
  const error = props.error 
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
    : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
  const disabled = props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
  
  return `${base} ${error} ${disabled}`
})

const handleChange = (event) => {
  const value = event.target.value === '' ? null : event.target.value
  emit('update:modelValue', value)
  emit('change', value)
}
</script>
