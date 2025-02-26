<script setup>
import { ref, onMounted } from 'vue';
import flatpickr from 'flatpickr';
import { German } from 'flatpickr/dist/l10n/de';
import 'flatpickr/dist/flatpickr.min.css';
import '@/assets/styles/forms.css';

const props = defineProps({
  modelValue: String,
  placeholder: String,
  required: Boolean,
  label: String, // Add label prop
});

const emit = defineEmits(['update:modelValue']);

const dateInput = ref(null);

onMounted(() => {
  flatpickr(dateInput.value, {
    dateFormat: 'd-m-Y', // Day-Month-Year format
    defaultDate: props.modelValue || new Date(), // Default to current date if not provided
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
      {{ label }}
    </label>
  </div>
</template>