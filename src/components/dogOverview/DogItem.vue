<script setup>
import { ref } from 'vue';
import { defineEmits } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  dog: {
    type: Object,
    required: true,
    default: () => ({
      name: '',
      rasse: '',
      passNr: '',
      chipNr: '',
      ownerId: null,
      geschlecht: '',
      imageURL: '',
      downer: {
        firstName: '',
        lastName: '',
      },
    }),
  },
  actionType: {
    type: String,
    default: 'delete',
  },
});

const emits = defineEmits(['dogDeleted', 'dogUpdated', 'editDog']);

const showDetails = ref(false);
const showImageModal = ref(false);

const router = useRouter();

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
};

const toggleImageModal = () => {
  showImageModal.value = !showImageModal.value;
};

const navigateToOwner = () => {
  router.push({ name: 'customer-overview', query: { ownerId: props.dog.downer.id } });
};
</script>

<template>
  <div
    class="p-4 bg-white shadow-md rounded-lg transition-all duration-300 hover:shadow-lg cursor-pointer"
    @click="toggleDetails"
  >
    <!-- Main Info Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div class="flex items-center mb-4 md:mb-0">
        <img
          v-if="dog.imageURL"
          :src="dog.imageURL"
          alt="Dog Image"
          class="w-16 h-16 object-cover rounded mr-4"
          @click.stop="toggleImageModal"
        />
        <div>
          <h2 class="text-lg md:text-xl font-semibold text-gray-800">{{ dog.name }}</h2>
          <p class="text-sm text-gray-600">
            <strong>Besitzer: </strong>
            <span
              @click.stop="navigateToOwner"
              class="text-blue-900 hover:underline cursor-help">
              {{ dog.downer?.firstName }} {{ dog.downer?.lastName }}
            </span>
          </p>
          <p class="text-sm text-gray-600">
            <strong>Hundenummer: </strong> {{ dog.id }}
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-4 mt-4 md:mt-0 justify-end w-full md:w-auto">
        <button
          @click.stop="emits('editDog', dog)"
          class="text-gray-500 hover:text-blue-600 transition-colors duration-200 text-3xl md:text-3xl hover:cursor-pointer p-2 rounded-full"
        >
          <i class="fas fa-edit"></i>
        </button>
        <button
          v-if="actionType === 'delete'"
          @click.stop="confirmDeleteDog"
          class="text-gray-500 hover:text-red-600 transition-colors duration-200 text-3xl md:text-3xl hover:cursor-pointer p-2 rounded-full"
        >
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    </div>

    <!-- Arrow indicator for expand/collapse -->
    <div class="flex justify-center mt-2">
      <i
        class="fas text-gray-500 transition-transform duration-300"
        :class="showDetails ? 'fa-chevron-up' : 'fa-chevron-down'"
      ></i>
    </div>

    <!-- Details Section -->
    <div v-if="showDetails" class="text-gray-700 mt-4 space-y-2">
      <h3 class="text-lg font-semibold text-gray-800">Weitere Informationen</h3>
      <p class="text-sm text-gray-600"><strong>Rasse: </strong> {{ dog.rasse || '---' }}</p>
      <p class="text-sm text-gray-600"><strong>Geschlecht: </strong> {{ dog.geschlecht || '---' }}</p>
      <p class="text-sm text-gray-600"><strong>Impfpass Nummer: </strong> {{ dog.passNr || '---' }}</p>
      <p class="text-sm text-gray-600"><strong>Chip Nummer: </strong> {{ dog.chipNr || '---' }}</p>
      <p class="text-sm text-gray-600"><strong>Tierart:</strong> {{ dog.tierart || '---' }}</p>
      <p class="text-sm text-gray-600"><strong>Medikamente:</strong> {{ dog.medikamente || '---' }}</p>
    </div>

    <!-- Image Modal -->
    <div v-if="showImageModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div class="relative">
        <img
          @click="toggleImageModal"
          :src="dog.imageURL"
          alt="Dog Image"
          class="max-w-full max-h-full object-cover rounded"
        />
        <button
          @click="toggleImageModal"
          class="absolute top-2 right-4 text-white text-4xl cursor-pointer hover:text-gray-400 scale-102"
        >
          &times;
        </button>
      </div>
    </div>
  </div>
</template>


