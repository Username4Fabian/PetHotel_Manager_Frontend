<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const emits = defineEmits(['closeOverlay', 'roomCreated']);

const tierart = ref('');
const zimmerId = ref('');
const availableRooms = ref([]);
const roomIdError = ref(false);

const loadRoomsFromLocalStorage = () => {
  const storedRooms = JSON.parse(localStorage.getItem('rooms')) || [];
  availableRooms.value = storedRooms;

  if (availableRooms.value.length > 0) {
    const lastRoom = availableRooms.value[availableRooms.value.length - 1];
    zimmerId.value = lastRoom.zimmerId + 1;
    tierart.value = lastRoom.tierart;
  } else {
    zimmerId.value = 1;
    tierart.value = 'Hund';
  }
};

const checkRoomIdExists = () => {
  roomIdError.value = availableRooms.value.some(
    (room) => room.zimmerId === parseInt(zimmerId.value)
  );
};

const createRoom = async () => {
  if (roomIdError.value) return;

  try {
    const newRoom = {
      zimmerId: parseInt(zimmerId.value),
      tierart: tierart.value,
    };

    // Send the new room to the backend
    const response = await axios.post('api/appointment/createNewZimmer', newRoom);

    if (response.status === 200) {
      // Save the room locally if the backend request is successful
      const storedRooms = JSON.parse(localStorage.getItem('rooms')) || [];
      storedRooms.push(newRoom);
      localStorage.setItem('rooms', JSON.stringify(storedRooms));

      emits('roomCreated', 'Zimmer erfolgreich hinzugefügt!');
      emits('closeOverlay');
    } else {
      throw new Error('Failed to create room on the server');
    }
  } catch (error) {
    console.error('Error creating room:', error);
    emits('roomCreated', 'Fehler beim Hinzufügen des Zimmers.');
    emits('closeOverlay');
  }
};

onMounted(() => {
  loadRoomsFromLocalStorage();
});
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50 p-4">
    <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-800">Neues Zimmer hinzufügen</h2>
        <button 
          @click="$emit('closeOverlay')" 
          class="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="createRoom" class="space-y-4">
        <div class="relative">
          <input
            id="zimmerId"
            v-model="zimmerId"
            @input="checkRoomIdExists"
            type="number"
            min="1"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 peer"
            placeholder=" "
            required
          />
          <label
            for="zimmerId"
            class="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-500 transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-500"
          >
            Zimmer Nummer
          </label>
          <p v-if="roomIdError" class="text-red-500 text-sm mt-1 px-1">
            Diese Zimmer Nummer existiert bereits.
          </p>
        </div>

        <div class="relative">
          <select
            id="tierart"
            v-model="tierart"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none peer"
            required
          >
            <option value="" disabled selected hidden>Bitte wählen</option>
            <option value="Hund">Hund</option>
            <option value="Katze">Katze</option>
            <option value="Kleintier">Kleintier</option>
          </select>
          <label
            for="tierart"
            class="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-500 transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-500"
          >
            Tierart
          </label>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          </div>
        </div>

        <div class="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            @click="$emit('closeOverlay')"
            class="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Abbrechen
          </button>
          <button
            type="submit"
            :disabled="roomIdError"
            class="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            Speichern
          </button>
        </div>
      </form>
    </div>
  </div>
</template>