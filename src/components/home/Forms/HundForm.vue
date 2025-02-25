<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import CustomerSearch from './HundForm/CustomerSearch.vue';
import ImageUpload from './HundForm/ImageUpload.vue';
import DogInfoForm from './HundForm/DogInfoForm.vue';
import { fetchCustomers, fetchDogs } from '@/services/dataService';
import '@/assets/styles/forms.css';

const dogData = ref({
  name: '',
  rasse: '',
  passNr: '',
  chipNr: '',
  ownerId: null,
  geschlecht: '',
});

const customers = ref([]);
const dogs = ref([]);
const imageFile = ref(null);

const emits = defineEmits(['show-toast']);

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

const handleSubmit = async () => {
  if (!dogData.value.name) {
    alert('Name is required');
    return;
  }

  // Emit toast notification immediately
  emits('show-toast', 'Hund erfolgreich erstellt!');

  // Close the form overlay immediately
  const closeFormEvent = new CustomEvent('close-form');
  window.dispatchEvent(closeFormEvent);

  try {
    const response = await axios.post('/api/dog/saveDog', dogData.value, {
      params: { ownerId: dogData.value.ownerId },
    });
    console.log('Dog created:', response.data);

    if (imageFile.value) {
      const formData = new FormData();
      formData.append('dogId', response.data.id); // Use response.data.id instead of response.data.dogId
      formData.append('image', imageFile.value);

      await axios.post('/api/dog/uploadImage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Image uploaded successfully');
    }

    // Add the new dog to the dogs array
    dogs.value.push(response.data);

    // Update local storage with the updated dogs array
    const existingDogs = JSON.parse(localStorage.getItem('dogs')) || [];
    const updatedLocalStorage = [...existingDogs, response.data]; // Append the new dog
    localStorage.setItem('dogs', JSON.stringify(updatedLocalStorage));
  } catch (error) {
    console.error('Error creating dog or uploading image:', error);

    // Emit an error toast notification
    emits('show-toast', 'Fehler beim Erstellen des Hundes!');
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
        @update:dogData="updateDogData"
      />

      <!-- Image Upload -->
      <div>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Hund Bild</h3>
        <ImageUpload @imageChange="handleImageChange" />
      </div>

      <!-- Submit Button -->
      <button type="submit" class="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
        Speichern
      </button>
    </form>
  </div>
</template>