<script setup>
import { ref } from 'vue';
import { defineProps, defineEmits } from 'vue';
import EditDogOverlay from './EditDogOverlay.vue';

const props = defineProps({
  dog: Object,
  actionType: {
    type: String,
    default: 'delete' // 'delete' or 'return'
  }
});

const emits = defineEmits(['dogDeleted', 'dogUpdated']);

const showDetails = ref(false);
const showEditOverlay = ref(false);

const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};

const confirmDeleteDog = () => {
  const confirmationMessage = `Sind Sie sicher, dass Sie den Hund: ${props.dog.name} löschen möchten?\n\nTermin, welche den Hund beinhalten werden ebenfalls gelöscht!\n\nDiese Aktion kann nicht rückgängig gemacht werden.`;
  if (window.confirm(confirmationMessage)) {
    emits('dogDeleted', props.dog);
  }
};

const handleUpdateDog = (updatedDog) => {
  emits('dogUpdated', updatedDog);
  showEditOverlay.value = false;
};
</script>

<template>
  <div class="p-4 bg-white shadow-md rounded-lg transition-all duration-300 hover:shadow-lg cursor-pointer" @click="toggleDetails">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-xl font-semibold text-gray-800">{{ dog.name }}</h2>
        <p class="text-sm text-gray-600"><strong>Besitzer: </strong> {{ dog.downer.firstName }} {{ dog.downer.lastName }}</p>
      </div>
      <div class="flex space-x-2">
        <button
          @click.stop="showEditOverlay = true"
          class="text-gray-500 hover:text-blue-600 transition-colors duration-200 text-3xl hover:cursor-pointer mr-10">
          <i class="fas fa-edit"></i>
        </button>
        <button
          v-if="actionType === 'delete'"
          @click.stop="confirmDeleteDog"
          class="text-gray-500 hover:text-red-600 transition-colors duration-200 text-3xl hover:cursor-pointer mr-5">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    </div>

    <!-- Arrow indicator for expand/collapse -->
    <div class="flex justify-center mt-2">
      <i
        class="fas text-gray-500 transition-transform duration-300"
        :class="showDetails ? 'fa-chevron-up' : 'fa-chevron-down'">
    </i>
    </div>

    <!-- Details section -->
    <div v-if="showDetails" class="text-gray-700 mt-4 space-y-2">
      <h3 class="text-lg font-semibold text-gray-800">Weitere Informationen</h3>
      <p class="text-sm text-gray-600"><strong>Rasse: </strong> {{ dog.rasse || '---' }}</p>
      <p class="text-sm text-gray-600"><strong>Geschlecht: </strong> {{ dog.geschlecht || '---' }}</p>
      <p class="text-sm text-gray-600"><strong>Impfpass Nummer: </strong> {{ dog.passNr || '---' }}</p>
      <p class="text-sm text-gray-600"><strong>Chip Nummer: </strong> {{ dog.chipNr || '---' }}</p>
    </div>
    <EditDogOverlay v-if="showEditOverlay" :dog="dog" @closeOverlay="showEditOverlay = false" @updateDog="handleUpdateDog" />
  </div>
</template>