<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: String,
});

const emit = defineEmits(['update:modelValue']);

const anmerkungError = ref('');

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue.length > 1000) {
      anmerkungError.value = 'Anmerkung darf nicht länger als 1000 Zeichen sein.';
    } else {
      anmerkungError.value = '';
    }
  }
);
</script>

<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">Anmerkung</label>
    <textarea
      :value="modelValue"
      @input="emit('update:modelValue', $event.target.value)"
      placeholder="Anmerkung"
      class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      rows="3"
      maxlength="1000"
    ></textarea>
    <p v-if="anmerkungError" class="text-red-500 text-sm">{{ anmerkungError }}</p>
  </div>
</template>