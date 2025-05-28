<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import TerminForm from '@/components/home/Forms/TerminForm.vue';

const props = defineProps({
  appointment: { type: Object, required: true },
  customers: { type: Array, required: true },
  dogs: { type: Array, required: true }
});

const emits = defineEmits(['closeOverlay', 'updateAppointment']);

const showOverlay = ref(true);
const isLoading = ref(false);

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

const handleUpdate = async (updatedAppointment) => {
  isLoading.value = true;
  try {
    const payload = {
      ...updatedAppointment,
      kundeId: updatedAppointment.kundeId || updatedAppointment.kunde?.id,
      dogIds: updatedAppointment.dogIds || (updatedAppointment.dogs ? updatedAppointment.dogs.map(d => d.id) : [])
    };

    const response = await axios.post('/api/appointment/updateAppointment', payload);

    localAppointment.value = { ...response.data };
    emits('updateAppointment', response.data);
    closeOverlay();
  } catch (error) {
    console.error('Error updating appointment:', error);
    emits('updateAppointment', null);
    closeOverlay();
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div
    v-if="showOverlay"
    class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50 p-4"
  >
    <div class="relative w-full max-w-lg p-4 bg-white rounded shadow-lg max-h-full overflow-y-auto">
      <button
        @click="closeOverlay"
        class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-4xl hover:cursor-pointer hover:scale-102"
        aria-label="Overlay schließen"
      >
        &times;
      </button>
      <h2 class="text-lg md:text-xl font-bold mb-4 text-center">
        Termin bearbeiten
      </h2>
      <TerminForm
        :initialAppointment="localAppointment"
        :customers="customers"
        :dogs="dogs"
        :isLoading="isLoading"
        @updateAppointment="handleUpdate"
      />
    </div>
  </div>
</template>