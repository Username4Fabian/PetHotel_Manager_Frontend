<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import DogSearchBar from '@/components/dogOverview/DogSearchBar.vue';
import DogItem from '@/components/dogOverview/DogItem.vue';
import Pagination from '@/components/customerOverview/Pagination.vue';
import AddDogOverlay from '@/components/dogOverview/AddDogOverlay.vue';
import EditDogOverlay from '@/components/dogOverview/EditDogOverlay.vue';
import Toast from '@/components/Toast.vue';
import { fetchDogs, fetchCustomers } from '@/services/dataService';
import axios from 'axios';

const dogs = ref([]);
const customers = ref([]);
const searchQuery = ref('');
const searchProperty = ref('name'); // Default to 'name'
const currentPage = ref(1);
const dogsPerPage = 10;
const showOverlay = ref(false);
const showEditOverlay = ref(false);
const showToast = ref(false);
const toastMessage = ref('');
const fetchInterval = 3 * 60 * 1000; // 3 minutes in milliseconds

const fetchDogsData = async () => {
  const cachedDogs = localStorage.getItem('dogs');
  const lastFetchTimeDogs = localStorage.getItem('dogs_lastFetchTime');
  const now = Date.now();

  if (cachedDogs && lastFetchTimeDogs && (now - lastFetchTimeDogs < fetchInterval)) {
    dogs.value = JSON.parse(cachedDogs);
  } else {
    try {
      const fetchedDogs = await fetchDogs();
      dogs.value = fetchedDogs;
      localStorage.setItem('dogs', JSON.stringify(dogs.value));
      localStorage.setItem('dogs_lastFetchTime', now.toString());
    } catch (error) {
      console.error('Fehler beim Abrufen der Hunde:', error);
    }
  }

  const cachedCustomers = localStorage.getItem('customers');
  const lastFetchTimeCustomers = localStorage.getItem('customers_lastFetchTime');

  if (cachedCustomers && lastFetchTimeCustomers && (now - lastFetchTimeCustomers < fetchInterval)) {
    customers.value = JSON.parse(cachedCustomers);
  } else {
    try {
      const fetchedCustomers = await fetchCustomers();
      customers.value = fetchedCustomers;
      localStorage.setItem('customers', JSON.stringify(customers.value));
      localStorage.setItem('customers_lastFetchTime', now.toString());
    } catch (error) {
      console.error('Fehler beim Abrufen der Kunden:', error);
    }
  }
};

const addDog = (newDog) => {
  dogs.value.push(newDog);
  localStorage.setItem('dogs', JSON.stringify(dogs.value));
  toastMessage.value = 'Hund erfolgreich hinzugefügt!';
  showToast.value = true;
};

const handleDogDeleted = async (deletedDog) => {
  const originalDogs = [...dogs.value];
  dogs.value = dogs.value.filter(d => d.id !== deletedDog.id);
  localStorage.setItem('dogs', JSON.stringify(dogs.value));
  toastMessage.value = 'Hund erfolgreich gelöscht!';
  showToast.value = true;

  const totalPages = Math.ceil(dogs.value.length / dogsPerPage);
  if (currentPage.value > totalPages) {
    currentPage.value = totalPages;
  }

  try {
    await axios.delete(`/api/dog/DeleteDog/${deletedDog.id}`);
  } catch (error) {
    console.error('Fehler beim Löschen des Hundes:', error);
    dogs.value = originalDogs;
    localStorage.setItem('dogs', JSON.stringify(dogs.value));
    toastMessage.value = 'Fehler beim Löschen des Hundes!';
    showToast.value = true;
  }
};

const handleUpdateDog = async (updatedDog) => {
  const originalDogs = [...dogs.value];
  const index = dogs.value.findIndex(d => d.id === updatedDog.id);
  if (index !== -1) {
    dogs.value[index] = updatedDog;
    localStorage.setItem('dogs', JSON.stringify(dogs.value));
    toastMessage.value = 'Hund erfolgreich aktualisiert!';
    showToast.value = true;
  }

  try {
    await axios.post('/api/dog/UpdateDog', updatedDog);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Hundes:', error);
    dogs.value = originalDogs;
    localStorage.setItem('dogs', JSON.stringify(dogs.value));
    toastMessage.value = 'Fehler beim Aktualisieren des Hundes!';
    showToast.value = true;
  }
};

const closeToast = () => {
  showToast.value = false;
};

onMounted(() => {
  fetchDogsData();
});

watch([searchQuery, searchProperty], () => {
  currentPage.value = 1;
});

const filteredDogs = computed(() => {
  if (!searchQuery.value) {
    return dogs.value;
  }
  return dogs.value.filter(dog => {
    if (searchProperty.value === 'all') {
      return (
        dog.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        dog.rasse.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    } else {
      return String(dog[searchProperty.value]).toLowerCase().includes(searchQuery.value.toLowerCase());
    }
  });
});

const paginatedDogs = computed(() => {
  const start = (currentPage.value - 1) * dogsPerPage;
  const end = start + dogsPerPage;
  return filteredDogs.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredDogs.value.length / dogsPerPage);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const firstPage = () => {
  currentPage.value = 1;
};

const lastPage = () => {
  currentPage.value = totalPages.value;
};
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl md:text-4xl font-bold mb-4">Hundeübersicht</h1>
    <DogSearchBar
      v-model:searchQuery="searchQuery"
      v-model:searchProperty="searchProperty"
      :showAddButton="true"
      @showOverlay="showOverlay = true"
    />
    <ul class="space-y-2">
      <li v-for="dog in paginatedDogs" :key="dog.id" class="mb-2">
        <DogItem :dog="dog" actionType="delete" @dogDeleted="handleDogDeleted" @dogUpdated="handleUpdateDog" />
      </li>
    </ul>
    <Pagination
      :currentPage="currentPage"
      :totalPages="totalPages"
      @prevPage="prevPage"
      @nextPage="nextPage"
      @firstPage="firstPage"
      @lastPage="lastPage"
    />
    <AddDogOverlay v-if="showOverlay" @closeOverlay="showOverlay = false" @addDog="addDog" @show-toast="handleUploadSuccess" />
    <EditDogOverlay v-if="showEditOverlay" :dog="selectedDog" @closeOverlay="showEditOverlay = false" @updateDog="handleUpdateDog" @show-toast="handleUploadSuccess" />
    <Toast v-if="showToast" :message="toastMessage" @close="closeToast" />
  </div>
</template>

<style scoped>
.container {
  max-width: 100%;
}
</style>