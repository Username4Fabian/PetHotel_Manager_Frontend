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
  <input
    ref="dateInput"
    :value="modelValue"
    type="text"
    :placeholder="placeholder"
    :required="required"
    class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</template>