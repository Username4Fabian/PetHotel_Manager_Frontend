<script setup>
import { ref } from 'vue';
import TerminForm from '@/components/home/Forms/TerminForm.vue';
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  customers: {
    type: Array,
    required: true,
  },
  dogs: {
    type: Array,
    required: true,
  },
});

const emits = defineEmits(['closeOverlay', 'addAppointment', 'show-toast']);
const showOverlay = ref(true);

const closeOverlay = () => {
  showOverlay.value = false;
  emits('closeOverlay');
};

const addAppointment = (newAppointment) => {
  emits('addAppointment', newAppointment);
  closeOverlay();
};

const handleUploadSuccess = () => {
  emits('show-toast', 'Termin erfolgreich erstellt!');
  closeOverlay();
};
</script>

<template>
  <div v-if="showOverlay" class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
    <div class="relative w-full max-w-lg p-4 bg-white rounded shadow-lg max-h-full overflow-y-auto">
      <button @click="closeOverlay" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-4xl hover:cursor-pointer hover:scale-102">
        &times;
      </button>
      <h2 class="text-xl font-bold mb-4">Neuen Termin anlegen</h2>
      <TerminForm :customers="customers" :dogs="dogs" @addAppointment="addAppointment" @show-toast="handleUploadSuccess" />
    </div>
  </div>
</template>