<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import CustomerSearch from './HundForm/CustomerSearch.vue';
import ImageUpload from './HundForm/ImageUpload.vue';
import DogInfoForm from './HundForm/DogInfoForm.vue';
import { fetchCustomers, fetchDogs } from '@/services/dataService'; // Import fetchDogs
import '@/assets/styles/forms.css';

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      name: '',
      rasse: '',
      passNr: '',
      chipNr: '',
      ownerId: null,
      geschlecht: '',
    }),
  },
  customers: Array,
  showOwnerField: {
    type: Boolean,
    default: true,
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
});

const dogData = ref({ ...props.initialData });
const customers = ref([]);
const dogs = ref([]); // Add dogs ref
const imageFile = ref(null);

const emits = defineEmits(['show-toast', 'addDog', 'updateDog', 'closeOverlay']);

const fetchInitialData = async () => {
  const fetchInterval = 2 * 60 * 1000; // 2 minutes in milliseconds

  const cachedCustomers = localStorage.getItem('customers');
  const lastFetchTimeCustomers = localStorage.getItem('customers_lastFetchTime');
  const now = Date.now();

  if (cachedCustomers && lastFetchTimeCustomers && (now - lastFetchTimeCustomers < fetchInterval)) {
    customers.value = JSON.parse(cachedCustomers);
  } else {
    const fetchedCustomers = await fetchCustomers();
    customers.value = fetchedCustomers;
    localStorage.setItem('customers', JSON.stringify(customers.value));
    localStorage.setItem('customers_lastFetchTime', now.toString());
  }

  // Fetch dogs data
  const cachedDogs = localStorage.getItem('dogs');
  const lastFetchTimeDogs = localStorage.getItem('dogs_lastFetchTime');
  if (cachedDogs && lastFetchTimeDogs && (now - lastFetchTimeDogs < fetchInterval)) {
    dogs.value = JSON.parse(cachedDogs);
  } else {
    const fetchedDogs = await fetchDogs();
    dogs.value = fetchedDogs;
    localStorage.setItem('dogs', JSON.stringify(dogs.value));
    localStorage.setItem('dogs_lastFetchTime', now.toString());
  }
};

onMounted(async () => {
  await fetchInitialData();
});

watch(
  () => props.initialData,
  (newData) => {
    dogData.value = { ...newData };
  },
  { immediate: true }
);

const handleSubmit = async () => {
  if (!dogData.value.name) {
    alert('Name is required');
    return;
  }

  // Optimistic UI update
  const originalDogData = { ...dogData.value };
  let optimisticDogData = { ...dogData.value, id: props.isEdit ? dogData.value.id : Date.now() }; // Temporary ID for new dog

  try {
    if (props.isEdit) {
      emits('updateDog', optimisticDogData); // Emit the optimistic dog data
      const response = await axios.post('/api/dog/UpdateDog', dogData.value);

      // Update the optimistic dog data with the actual ID from the server response
      optimisticDogData.id = response.data.dog.id;
      emits('updateDog', optimisticDogData);

      if (imageFile.value) {
        const formData = new FormData();
        formData.append('dogId', response.data.dog.id);
        formData.append('image', imageFile.value);

        await axios.post('/api/dog/uploadImage', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      // Update local storage with the server response
      const dogs = JSON.parse(localStorage.getItem('dogs')) || [];
      const index = dogs.findIndex(d => d.id === response.data.dog.id);
      if (index !== -1) {
        dogs[index] = { ...response.data.dog };
      }
      localStorage.setItem('dogs', JSON.stringify(dogs));
    } else {
      emits('addDog', optimisticDogData); // Emit the optimistic dog data
      const response = await axios.post('/api/dog/saveDog', dogData.value, {
        params: { ownerId: dogData.value.ownerId },
      });

      // Update the optimistic dog data with the actual ID from the server response
      optimisticDogData.id = response.data.dog.id;
      emits('updateDog', optimisticDogData);

      if (imageFile.value) {
        const formData = new FormData();
        formData.append('dogId', response.data.dog.id);
        formData.append('image', imageFile.value);

        await axios.post('/api/dog/uploadImage', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      // Update local storage with the server response
      const dogs = JSON.parse(localStorage.getItem('dogs')) || [];
      dogs.push(response.data.dog);
      localStorage.setItem('dogs', JSON.stringify(dogs));
    }

    // Emit success message and close the form
    emits('show-toast', 'Hund erfolgreich hinzugefügt!');
    emits('closeOverlay');

  } catch (error) {
    console.error('Error creating/updating dog or uploading image:', error);
    emits('show-toast', 'Fehler beim Erstellen/Aktualisieren des Hundes!');
    // Revert the optimistic update in case of an error
    if (props.isEdit) {
      emits('updateDog', originalDogData); // Revert to the original data
    } else {
      emits('addDog', null); // Remove the added dog
    }
  }
};

const handleImageChange = (file) => {
  imageFile.value = file;
};

const updateDogData = (key, value) => {
  dogData.value[key] = value;
};
</script>

<template>
  <div class="p-4 bg-white rounded shadow-md">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Dog Information -->
      <DogInfoForm
        :dogData="dogData"
        :customers="customers"
        :dogs="dogs" 
        :showOwnerField="showOwnerField"
        @update:dogData="updateDogData"
      />

      <!-- Image Upload -->
      <div>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Hund Bild</h3>
        <ImageUpload @imageChange="handleImageChange" />
      </div>

      <!-- Submit Button -->
      <button type="submit" class="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
        {{ isEdit ? 'Aktualisieren' : 'Speichern' }}
      </button>
    </form>
  </div>
</template>