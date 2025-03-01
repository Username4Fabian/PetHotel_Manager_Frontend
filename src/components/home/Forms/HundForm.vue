<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import CustomerSearch from './HundForm/CustomerSearch.vue';
import ImageUpload from './HundForm/ImageUpload.vue';
import DogInfoForm from './HundForm/DogInfoForm.vue';
import { fetchCustomers } from '@/services/dataService';
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
  isEdit: {
    type: Boolean,
    default: false,
  },
});

const dogData = ref({ ...props.initialData });

const customers = ref([]);
const imageFile = ref(null);

const emits = defineEmits(['show-toast', 'addDog', 'updateDog']);

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

    if (props.isEdit) {
      emits('updateDog', response.data);
    } else {
      emits('addDog', response.data);
    }
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
      <button type="submit" class="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
        {{ isEdit ? 'Aktualisieren' : 'Speichern' }}
      </button>
    </form>
  </div>
</template>