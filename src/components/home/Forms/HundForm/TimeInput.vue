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

const timeInput = ref(null);

onMounted(() => {
  flatpickr(timeInput.value, {
    enableTime: true,
    noCalendar: true,
    dateFormat: 'H:i', // Hours:Minutes format
    defaultDate: props.modelValue || '09:00',
    locale: German, // Set German localization
    time_24hr: true, // Use 24-hour format
    onChange: (selectedDates, timeStr) => {
      emit('update:modelValue', timeStr + ':00'); // Append ":00" for backend
    },
  });
});
</script>

<template>
  <input
    ref="timeInput"
    :value="modelValue.replace(':00', '')"
    type="text"
    :placeholder="placeholder"
    :required="required"
    class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</template>