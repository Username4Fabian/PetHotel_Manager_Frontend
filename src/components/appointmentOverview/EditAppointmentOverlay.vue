<script setup>
import { ref, watch } from 'vue';
import TerminForm from '@/components/home/Forms/TerminForm.vue';
import { defineEmits } from 'vue';

const props = defineProps({
  appointment: Object,
});

const emits = defineEmits(['closeOverlay', 'updateAppointment', 'show-toast']);
const showOverlay = ref(true);
const localAppointment = ref({ ...props.appointment });

watch(
  () => props.appointment,
  (newAppointment) => {
    localAppointment.value = { ...newAppointment };
  },
  { immediate: true, deep: true }
);

const closeOverlay = () => {
  showOverlay.value = false;
  emits('closeOverlay'); // Emit the closeOverlay event
};

const updateAppointment = (updatedAppointment) => {
  localAppointment.value = { ...updatedAppointment }; // Update localAppointment immediately
  emits('updateAppointment', updatedAppointment);
  closeOverlay(); // Close the overlay after updating
};

const handleUploadSuccess = () => {
  emits('show-toast', 'Termin erfolgreich hochgeladen!');
  closeOverlay();
};
</script>

<template>
  <div v-if="showOverlay" class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
    <div class="relative w-full max-w-lg p-4 bg-white rounded shadow-lg max-h-full overflow-y-auto">
      <button @click="closeOverlay" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-4xl hover:cursor-pointer hover:scale-102">
        &times;
      </button>
      <h2 class="text-xl font-bold mb-4">Termin bearbeiten</h2>
      <TerminForm :initialAppointment="localAppointment" @updateAppointment="updateAppointment" @show-toast="handleUploadSuccess" />
    </div>
  </div>
</template>