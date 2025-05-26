<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import TerminForm from '@/components/home/Forms/TerminForm.vue';
import AssignRoomsOverlay from '@/components/rooms/AssignRoomsOverlay.vue';
import Toast from '@/components/Toast.vue';

const router = useRouter();

const props = defineProps({
  customers: {
    type: Array,
    required: true,
    default: () => []
  },
  dogs: {
    type: Array,
    required: true,
    default: () => []
  }
});

const handleRoomsAssigned = (message) => {
  showAssignRoomsOverlay.value = false;
  emit('show-toast', message); // Emit the toast message to the parent
};

const emit = defineEmits(['closeOverlay', 'addAppointment', 'closeAssignRooms']);

// Toast state
const toastMessage = ref('');
const toastType = ref('success');
const showToast = ref(false);

// State
const showOverlay = ref(true);
const showAssignRoomsOverlay = ref(false);
const newAppointment = ref(null);
const isLoading = ref(false);

// Methods
const closeOverlay = () => {
  showOverlay.value = false;
  emit('closeOverlay');
};

const handleAppointmentCreated = async (appointment) => {
  try {
    newAppointment.value = appointment;
    emit('addAppointment', appointment);

    toastMessage.value = 'Termin erfolgreich erstellt!';
    toastType.value = 'success';
    showToast.value = true;

    showOverlay.value = false;
    showAssignRoomsOverlay.value = true;
  } catch (error) {
    console.error('Error handling appointment creation:', error);
    toastMessage.value = 'Fehler beim Erstellen des Termins';
    toastType.value = 'error';
    showToast.value = true;
  }
};

const closeAssignRoomsOverlay = async (shouldRefresh = false) => {
  showAssignRoomsOverlay.value = false;
  emit('closeOverlay');
  if (shouldRefresh) {
    router.push({ name: 'appointment-over', query: { success: 'Termin erfolgreich erstellt!' } });
  }
};

const deleteAppointment = async (appointmentId) => {
  isLoading.value = true;
  try {
    const response = await axios.delete(`/api/appointment/DeleteAppointment/${appointmentId}`);
    if (response.status === 200) {
      toastMessage.value = 'Termin wurde gelöscht.';
      toastType.value = 'success';
      showToast.value = true;
    }
  } catch (error) {
    console.error('Error deleting appointment:', error);
    toastMessage.value = 'Fehler beim Löschen des Termins';
    toastType.value = 'error';
    showToast.value = true;
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <!-- Add Appointment Overlay -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showOverlay"
        class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50 p-4"
      >
        <div class="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <button
            @click="closeOverlay"
            class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Overlay schließen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <h2 class="text-xl font-bold mb-6 text-center text-gray-800">
            Neuen Termin anlegen
          </h2>
          
          <TerminForm
            :customers="customers"
            :dogs="dogs"
            @addAppointment="handleAppointmentCreated"
          />
        </div>
      </div>
    </transition>

    <!-- Assign Rooms Overlay -->
    <AssignRoomsOverlay
      v-if="showAssignRoomsOverlay"
      :appointment="newAppointment"
      @closeOverlay="closeAssignRoomsOverlay"
      @roomsAssigned="closeAssignRoomsOverlay"
    />

    <Toast
      v-if="showToast"
      :message="toastMessage"
      :type="toastType"
      @close="showToast = false"
    />
  </div>
</template>