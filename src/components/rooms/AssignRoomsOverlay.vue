<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router'; // Ensure this is imported
import axios from 'axios';
import AddRoomOverlay from './AddRoomOverlay.vue';
import Toast from '@/components/Toast.vue';

const props = defineProps({
  appointment: {
    type: Object,
    required: true,
    validator: (appt) => appt.id && appt.dogs
  }
});

const emit = defineEmits(['closeOverlay', 'roomsAssigned', 'closeAssignRooms']);

// Toast state
const toastMessage = ref('');
const toastType = ref('success');
const showToast = ref(false);

// State
const showAddRoomOverlay = ref(false);
const availableRooms = ref([]);
const roomAssignments = ref({});
const isLoading = ref(false);
const fetchInterval = 3 * 60 * 1000; // 3 minutes

const router = useRouter(); // Initialize the router

// Computed
const groupedDogs = computed(() => {
  if (!props.appointment?.dogs) return {};
  
  const order = ['Hund', 'Katze', 'Käfigtier', 'Andere'];
  const groups = {};

  // Group dogs by tierart
  props.appointment.dogs.forEach(dog => {
    const tierart = dog.tierart || 'Andere';
    if (!groups[tierart]) {
      groups[tierart] = [];
    }
    groups[tierart].push(dog);
  });

  // Sort according to predefined order
  const sortedGroups = {};
  order.forEach(key => {
    if (groups[key]) {
      sortedGroups[key] = groups[key];
    }
  });

  // Add remaining groups
  Object.keys(groups).forEach(key => {
    if (!sortedGroups[key]) {
      sortedGroups[key] = groups[key];
    }
  });

  return sortedGroups;
});

// Methods
const openAddRoomOverlay = () => {
  showAddRoomOverlay.value = true;
};

const handleRoomCreated = (message) => {
  showAddRoomOverlay.value = false;
  fetchRooms();
  showToast.value = true;
  toastMessage.value = typeof message === 'object' ? message.message : message;
  toastType.value = 'success';
};

const fetchRooms = async () => {
  try {
    const now = Date.now();
    const cachedRooms = localStorage.getItem('rooms');
    const lastFetchTime = localStorage.getItem('rooms_lastFetchTime');

    if (cachedRooms && lastFetchTime && now - lastFetchTime < fetchInterval) {
      availableRooms.value = JSON.parse(cachedRooms);
      return;
    }

    const response = await axios.get('/api/appointment/getAllRooms');
    if (response.status === 200) {
      availableRooms.value = response.data;
      localStorage.setItem('rooms', JSON.stringify(response.data));
      localStorage.setItem('rooms_lastFetchTime', now.toString());
    }
  } catch (error) {
    console.error('Error fetching rooms:', error);
    showToast.value = true;
    toastMessage.value = 'Fehler beim Laden der Zimmer';
    toastType.value = 'error';
  }
};

const getFilteredRooms = (tierart) => {
  if (!tierart) return availableRooms.value;
  return availableRooms.value.filter(room => room.tierart === tierart);
};

const closeOverlay = async (deleteAppointment = false) => {
  if (deleteAppointment && props.appointment.appointment_nr) {
    try {
      await axios.delete(`/api/appointment/DeleteAppointment/${props.appointment.appointment_nr}`);
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  }

  // Emit a success message to the parent component
  emit('closeOverlay', 'Zimmer erfolgreich zugewiesen!');
};

const assignRooms = async () => {
  if (Object.keys(roomAssignments.value).length === 0) return;

  isLoading.value = true;

  try {
    const assignments = Object.entries(roomAssignments.value).map(([dogId, roomId]) => ({
      zimmer: { zimmerId: parseInt(roomId) },
      appointment: { id: props.appointment.id },
      dog: { id: parseInt(dogId) }
    }));

    const response = await axios.post('/api/appointment/assignRooms', assignments);
    
    if (response.status === 200) {
      emit('roomsAssigned', 'Zimmer erfolgreich zugewiesen!'); // Emit the success message
      closeOverlay();
    }
  } catch (error) {
    console.error('Error assigning rooms:', error);
    showToast.value = true;
    toastMessage.value = 'Fehler beim Zuweisen der Zimmer';
    toastType.value = 'error';
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle
onMounted(fetchRooms);
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50 p-4">
    <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-800">Zimmer zuweisen</h2>
        <button 
          @click="closeOverlay(true)" 
          class="text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Overlay schließen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Dog Groups -->
      <div class="space-y-6 mb-6">
        <div v-for="(dogs, tierart) in groupedDogs" :key="tierart" class="bg-gray-50 p-4 rounded-lg">
          <h3 class="text-md font-semibold mb-3 text-gray-700 border-b pb-2">{{ tierart }}</h3>
          <ul class="space-y-3">
            <li v-for="dog in dogs" :key="dog.id">
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div class="w-full sm:w-1/3">
                  <span class="font-medium text-gray-700">{{ dog.name }}</span>
                </div>
                <select
                  v-model="roomAssignments[dog.id]"
                  class="border rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled selected>Zimmer auswählen</option>
                  <option
                    v-for="room in getFilteredRooms(dog.tierart)"
                    :key="room.zimmerId"
                    :value="room.zimmerId"
                  >
                    Zimmer {{ room.zimmerId }} ({{ room.tierart }})
                  </option>
                </select>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-3 mb-4">
        <button
          @click="openAddRoomOverlay"
          class="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Neues Zimmer
        </button>
        <button
          @click="assignRooms"
          class="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex-1"
          :disabled="Object.keys(roomAssignments).length === 0 || isLoading"
          :class="{
            'opacity-50 cursor-not-allowed': Object.keys(roomAssignments).length === 0 || isLoading,
            'hover:bg-green-600': Object.keys(roomAssignments).length > 0 && !isLoading
          }"
        >
          <span v-if="isLoading">Wird zugewiesen...</span>
          <template v-else>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            Zimmer zuweisen
          </template>
        </button>
      </div>

      <!-- Child Components -->
      <AddRoomOverlay
        v-if="showAddRoomOverlay"
        @closeOverlay="showAddRoomOverlay = false"
        @roomCreated="handleRoomCreated"
      />

      <Toast
        v-if="showToast"
        :message="toastMessage"
        :type="toastType"
        @close="showToast = false"
      />
    </div>
  </div>
</template>