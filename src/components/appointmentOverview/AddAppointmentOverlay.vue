<script setup>
import { ref } from 'vue';
import TerminForm from '@/components/home/Forms/TerminForm.vue';
import AssignRoomsOverlay from '@/components/rooms/AssignRoomsOverlay.vue';
import axios from 'axios';

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

const emits = defineEmits(['closeOverlay', 'addAppointment', 'show-toast', 'closeAssignRooms']);

const showOverlay = ref(true);
const showAssignRoomsOverlay = ref(false);
const newAppointment = ref(null);

const closeOverlay = () => {
  showOverlay.value = false;
  emits('closeOverlay');
};

const handleAppointmentCreated = (appointment) => {
  console.log('New appointment created:', appointment);
  newAppointment.value = appointment;
  emits('addAppointment', appointment);
  emits('show-toast', 'Termin erfolgreich erstellt!');
  showOverlay.value = false;
  showAssignRoomsOverlay.value = true;
};

const closeAssignRoomsOverlay = async (shouldRefresh = false) => {
  showAssignRoomsOverlay.value = false;
  emits('closeOverlay');
  if (shouldRefresh) {
    emits('closeAssignRooms', true);
  }
};

const deleteAppointment = async (appointmentId) => {
  try {
    const response = await axios.delete(`/api/appointment/DeleteAppointment/${appointmentId}`);
    if (response.status === 200) {
      console.log('Appointment deleted successfully:', response.data);
      emits('show-toast', 'Termin wurde gelöscht.');
    } else {
      console.error('Failed to delete the appointment');
    }
  } catch (error) {
    console.error('Error deleting the appointment:', error);
  }
};
</script>

<template>
  <div>
    <!-- Add Appointment Overlay -->
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
          Neuen Termin anlegen
        </h2>
        <TerminForm
          :customers="customers"
          :dogs="dogs"
          @addAppointment="handleAppointmentCreated" />
      </div>
    </div>

    <!-- Assign Rooms Overlay -->
    <AssignRoomsOverlay
      v-if="showAssignRoomsOverlay"
      :appointment="newAppointment"
      @closeOverlay="closeAssignRoomsOverlay"
      @roomsAssigned="closeAssignRoomsOverlay"
    />
  </div>
</template>