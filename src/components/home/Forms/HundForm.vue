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
  customers.value = await fetchCustomers();
  dogs.value = await fetchDogs();
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
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input v-model="dogData.name" type="text" placeholder="Name" class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        <input v-model="dogData.rasse" type="text" placeholder="Rasse" class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input v-model="dogData.passNr" type="text" placeholder="Impfpass Nummer" class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input v-model="dogData.chipNr" type="text" placeholder="Chip Nummer" class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select v-model="dogData.geschlecht" class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="" disabled>Geschlecht</option>
          <option value="männlich">Männlich</option>
          <option value="weiblich">Weiblich</option>
        </select>
        <CustomerSearch :customers="customers" @selectCustomer="(customer) => dogData.ownerId = customer.id"/>
      </div>
      <ImageUpload @imageChange="handleImageChange" />
      <button type="submit" class="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
        Speichern
      </button>
    </form>
  </div>
</template>