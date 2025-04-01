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
  label: String,
  minDate: String,
  maxDate: String,
});

const emit = defineEmits(['update:modelValue']);

const dateInput = ref(null);
let fpInstance = null;

onMounted(() => {
  fpInstance = flatpickr(dateInput.value, {
    dateFormat: 'd-m-Y',
    defaultDate: props.modelValue || new Date(),
    locale: German,
    minDate: props.minDate,
    maxDate: props.maxDate,
    onChange: (selectedDates, dateStr) => {
      emit('update:modelValue', dateStr);
    },
  });
});

watch(() => props.minDate, (newVal) => {
  if (fpInstance) {
    fpInstance.set('minDate', newVal);
  }
});

watch(() => props.maxDate, (newVal) => {
  if (fpInstance) {
    fpInstance.set('maxDate', newVal);
  }
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
      class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 peer"
      :class="$attrs.class" 
    />
    <label
      id="label-abfahrt"
      class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500"
    >
      {{ label }}
    </label>
  </div>
</template>