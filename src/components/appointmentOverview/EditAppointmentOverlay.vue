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
  const originalAppointment = { ...localAppointment.value };
  localAppointment.value = { ...updatedAppointment };
  const allDogs = JSON.parse(localStorage.getItem('dogs')) || [];
  localAppointment.value.dogs = allDogs.filter(dog => updatedAppointment.dogIds.includes(dog.id));

  const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
  const index = appointments.findIndex(a => a.id === updatedAppointment.id);
  if (index !== -1) {
    appointments[index] = { ...localAppointment.value };
  }
  localStorage.setItem('appointments', JSON.stringify(appointments));
  emits('updateAppointment', localAppointment.value);
  closeOverlay();

  try {
    const response = await axios.post('/api/appointment/updateAppointment', updatedAppointment);

    localAppointment.value = { ...response.data };
    appointments[index] = { ...response.data };
    localStorage.setItem('appointments', JSON.stringify(appointments));

    emits('updateAppointment', response.data);
    emits('show-toast', 'Termin erfolgreich aktualisiert!');
  } catch (error) {
    console.error('Error updating appointment:', error);

    localAppointment.value = { ...originalAppointment };
    if (index !== -1) {
      appointments[index] = { ...originalAppointment };
    }
    localStorage.setItem('appointments', JSON.stringify(appointments));

    emits('updateAppointment', originalAppointment);
    emits('show-toast', 'Fehler beim Aktualisieren des Termins!');
  }
};
</script>

<template>
  <div
    v-if="showOverlay"
    class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50 p-4">
    <div
      class="relative w-full max-w-lg p-4 bg-white rounded shadow-lg max-h-full overflow-y-auto">
      <button
        @click="closeOverlay"
        class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-4xl hover:cursor-pointer hover:scale-102">
        &times;
      </button>
      <h2 class="text-lg md:text-xl font-bold mb-4 text-center">
        Termin bearbeiten
      </h2>
      <TerminForm
        :initialAppointment="localAppointment"
        @updateAppointment="updateAppointment"
        @show-toast="emits('show-toast', $event)"/>
    </div>
  </div>
</template>