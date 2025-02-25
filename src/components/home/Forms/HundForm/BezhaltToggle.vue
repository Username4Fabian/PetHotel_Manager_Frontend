<script setup>
const props = defineProps({
  modelValue: Boolean,
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <button
    type="button"
    @click="emit('update:modelValue', !modelValue)"
    :class="{
      'bg-blue-500 text-white': modelValue,
      'bg-gray-100 hover:bg-gray-200': !modelValue
    }"
    class="w-full px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    {{ modelValue ? 'Bezahlt' : 'Nicht Bezahlt' }}
  </button>
</template>