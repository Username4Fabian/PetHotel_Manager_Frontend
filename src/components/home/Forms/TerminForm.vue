<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import CustomerSearch from '../CustomerSearch.vue';

const terminData = ref({
  anmerkung: '',
  ankunft: '',
  abfahrt: '',
  bezahlt: false,
  kunde: {
    id: null
  },
  dogs: []
});

const allDogs = ref([]);
const selectedDogs = ref([]);
const customers = ref([]);

const handleSubmit = async () => {
  if (!terminData.value.anmerkung) {
    alert('Anmerkung is required');
    return;
  }

  terminData.value.dogs = selectedDogs.value.map(dog => ({ id: dog.id }));

  try {
    const response = await axios.post('/api/appointment/createNewAppointment', terminData.value);
    console.log('Termin created:', response.data);
  } catch (error) {
    console.error('Error creating Termin:', error);
  }
};

const fetchDogs = async (customerId) => {
  try {
    console.log(`Fetching dogs for customer ID: ${customerId}`);
    const response = await axios.get(`/api/dog/GetDogsByOwner`, {
      params: { ownerId: customerId }
    });
    allDogs.value = response.data;
    console.log('Dogs fetched:', allDogs.value);
  } catch (error) {
    console.error('Error fetching dogs:', error);
  }
};

const fetchCustomers = async () => {
  try {
    const response = await axios.get('/api/kunde/GetAllKunden');
    customers.value = response.data;
    console.log('Customers fetched:', customers.value);
  } catch (error) {
    console.error('Error fetching customers:', error);
  }
};

const handleCustomerSelect = (customer) => {
  console.log('Customer selected:', customer);
  terminData.value.kunde.id = customer.id;
  fetchDogs(customer.id);
};

const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formattedAnkunft = computed({
  get: () => formatDateTime(terminData.value.ankunft),
  set: (value) => { terminData.value.ankunft = value; }
});

const formattedAbfahrt = computed({
  get: () => formatDateTime(terminData.value.abfahrt),
  set: (value) => { terminData.value.abfahrt = value; }
});

onMounted(() => {
  fetchCustomers();
});
</script>

<template>
  <div class="p-4 bg-white rounded shadow-md">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input v-model="terminData.anmerkung" type="text" placeholder="Anmerkung" class="w-full px-4 py-2 border rounded" required />
        <input v-model="formattedAnkunft" type="datetime-local" placeholder="Ankunft" class="w-full px-4 py-2 border rounded" required />
        <input v-model="formattedAbfahrt" type="datetime-local" placeholder="Abfahrt" class="w-full px-4 py-2 border rounded" required />
        <CustomerSearch @selectCustomer="handleCustomerSelect" :customers="customers" />
      </div>
      <div v-if="allDogs.length" class="mt-4">
        <h3 class="text-lg font-semibold">Select Dogs</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="dog in allDogs" :key="dog.id" class="flex items-center">
            <input type="checkbox" :value="dog" v-model="selectedDogs" class="mr-2" />
            <label>{{ dog.name }}</label>
          </div>
        </div>
      </div>
      <button type="submit" class="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700">
        Speichern
      </button>
    </form>
  </div>
</template>