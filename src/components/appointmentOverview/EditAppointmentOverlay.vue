<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import TerminForm from '@/components/home/Forms/TerminForm.vue';

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
  emits('closeOverlay');
};

const updateAppointment = async (updatedAppointment) => {
  // Optimistic UI update
  const originalAppointment = { ...localAppointment.value };
  localAppointment.value = { ...updatedAppointment };

  // Update the `dogs` array based on `dogIds`
  const allDogs = JSON.parse(localStorage.getItem('dogs')) || [];
  localAppointment.value.dogs = allDogs.filter(dog => updatedAppointment.dogIds.includes(dog.id));

  // Update local storage immediately
  const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
  const index = appointments.findIndex(a => a.id === updatedAppointment.id);
  if (index !== -1) {
    appointments[index] = { ...localAppointment.value };
  } else {
    appointments.push(localAppointment.value);
  }
  localStorage.setItem('appointments', JSON.stringify(appointments));

  // Emit the updateAppointment event immediately
  emits('updateAppointment', localAppointment.value);

  // Close the overlay immediately
  closeOverlay();

  try {
    const response = await axios.post('/api/appointment/updateAppointment', updatedAppointment);
    localAppointment.value = { ...response.data }; // Update localAppointment with the response data
    emits('updateAppointment', response.data);
    emits('show-toast', 'Termin erfolgreich aktualisiert!');
  } catch (error) {
    console.error('Error updating appointment:', error);
    emits('show-toast', 'Fehler beim Aktualisieren des Termins!');
    // Revert optimistic update in case of error
    localAppointment.value = { ...originalAppointment };
    // Revert local storage update
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const index = appointments.findIndex(a => a.id === originalAppointment.id);
    if (index !== -1) {
      appointments[index] = { ...originalAppointment };
    }
    localStorage.setItem('appointments', JSON.stringify(appointments));
    emits('updateAppointment', originalAppointment);
  }
};
</script>

<template>
  <div v-if="showOverlay" class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
    <div class="relative w-full max-w-lg p-4 bg-white rounded shadow-lg max-h-full overflow-y-auto">
      <button @click="closeOverlay" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-4xl hover:cursor-pointer hover:scale-102">
        &times;
      </button>
      <h2 class="text-xl font-bold mb-4">Termin bearbeiten</h2>
      <TerminForm
        :initialAppointment="localAppointment"
        @updateAppointment="updateAppointment"
        @show-toast="emits('show-toast', $event)"
      />
    </div>
  </div>
</template>