<script setup>
const props = defineProps({
  modelValue: Boolean,
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div>
    <label class="block text-sm font-medium text-gray-500 mb-2">Bezahlstatus</label>
    <button
      type="button"
      @click="emit('update:modelValue', !modelValue)"
      :class="{
        'bg-green-400 hover:bg-green-500 text-white': modelValue,
        'bg-red-200 hover:bg-red-300': !modelValue
      }"
      class="w-full px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all duration-200">
      {{ modelValue ? 'Bezahlt' : 'Nicht Bezahlt' }}
    </button>
  </div>
</template>

