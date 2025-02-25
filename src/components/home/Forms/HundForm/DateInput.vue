<script setup>
import { ref, onMounted } from 'vue';
import flatpickr from 'flatpickr';
import { German } from 'flatpickr/dist/l10n/de';
import 'flatpickr/dist/flatpickr.min.css';

const props = defineProps({
  modelValue: String,
  placeholder: String,
  required: Boolean,
});

const emit = defineEmits(['update:modelValue']);

const dateInput = ref(null);

onMounted(() => {
  flatpickr(dateInput.value, {
    dateFormat: 'd-m-Y', // Day-Month-Year format
    defaultDate: props.modelValue || 'today',
    locale: German, // Set German localization
    onChange: (selectedDates, dateStr) => {
      emit('update:modelValue', dateStr);
    },
  });
});
</script>

<template>
  <div class="relative">
    <input
      ref="dateInput"
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      :required="required"
      class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
      Datum
    </label>
  </div>
</template>

<style scoped>
/* Floating Label Animation */
.relative input:focus + label,
.relative input:not(:placeholder-shown) + label {
  top: -0.5rem;
  left: 0.75rem;
  font-size: 0.75rem;
  color: #3b82f6; /* Blue-500 */
  background-color: white;
  padding: 0 0.25rem;
}
</style>