<script setup>
import { ref, watch } from 'vue';
import '@/assets/styles/forms.css';

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
  <div class="relative">
    <textarea
      :value="modelValue"
      @input="emit('update:modelValue', $event.target.value)"
      class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      rows="3"
      maxlength="1000"
    ></textarea>
    <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
      Anmerkung
    </label>
    <p v-if="anmerkungError" class="text-red-500 text-sm mt-1">{{ anmerkungError }}</p>
  </div>
</template>