<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import CustomerSearch from '../CustomerSearch.vue';
import ImageUpload from '../ImageUpload.vue';
import { fetchCustomers, fetchDogs } from '@/services/dataService';

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
</script>

<template>
  <div class="p-4 bg-white rounded shadow-md">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Dog Information -->
      <div>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Hund Informationen</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="relative">
            <input v-model="dogData.name" type="text" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
              Name
            </label>
          </div>
          <div class="relative">
            <input v-model="dogData.rasse" type="text" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
              Rasse
            </label>
          </div>
          <div class="relative">
            <input v-model="dogData.passNr" type="text" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
              Impfpass Nummer
            </label>
          </div>
          <div class="relative">
            <input v-model="dogData.chipNr" type="text" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
              Chip Nummer
            </label>
          </div>
          <div class="relative">
            <select v-model="dogData.geschlecht" class="w-full px-3 py-2 border rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="" disabled></option>
              <option value="männlich">Männlich</option>
              <option value="weiblich">Weiblich</option>
            </select>
            <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
              Geschlecht
            </label>
          </div>
          <div class="relative">
            <CustomerSearch :customers="customers" @selectCustomer="(customer) => dogData.ownerId = customer.id" />
          </div>
        </div>
      </div>

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

<style>
/* Floating Label Animation */
.relative input:focus + label,
.relative input:not(:placeholder-shown) + label,
.relative select:focus + label,
.relative select:not(:placeholder-shown) + label {
  top: -0.5rem;
  left: 0.75rem;
  font-size: 0.75rem;
  color: #3b82f6; /* Blue-500 */
  background-color: white;
  padding: 0 0.25rem;
}

/* Select Dropdown Styling */
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  padding-right: 1.5rem;
  background-position: right 0.5rem center; 
  background-repeat: no-repeat;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3E%3Cpath fill='%23999' d='M2 0L0 2h4zm0 5L0 3h4z'/%3E%3C/svg%3E"); 
  background-size: 0.75rem;
}
</style>