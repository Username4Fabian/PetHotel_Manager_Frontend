<script setup>
import { ref, onMounted, watch } from 'vue';
import flatpickr from 'flatpickr';
import { German } from 'flatpickr/dist/l10n/de';
import 'flatpickr/dist/flatpickr.min.css';
import '@/assets/styles/forms.css';

const props = defineProps({
  modelValue: String,
  placeholder: String,
  required: Boolean,
  minTime: String,
  maxTime: String,
});

const emit = defineEmits(['update:modelValue']);

const timeInput = ref(null);
let fpInstance = null;

onMounted(() => {
  fpInstance = flatpickr(timeInput.value, {
    enableTime: true,
    noCalendar: true,
    dateFormat: 'H:i',
    defaultDate: props.modelValue || '09:00',
    locale: German,
    time_24hr: true,
    minTime: props.minTime,
    maxTime: props.maxTime,
    onChange: (selectedDates, timeStr) => {
      emit('update:modelValue', timeStr + ':00');
    },
  });
});

watch(() => props.minTime, (newVal) => {
  if (fpInstance) {
    fpInstance.set('minTime', newVal);
  }
});

watch(() => props.maxTime, (newVal) => {
  if (fpInstance) {
    fpInstance.set('maxTime', newVal);
  }
});
</script>

<template>
  <div class="relative">
    <input
      ref="timeInput"
      :value="modelValue.replace(':00', '')"
      type="text"
      :placeholder="placeholder"
      :required="required"
      class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      :class="$attrs.class" 
    />
    <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
      Uhrzeit
    </label>
  </div>
</template>