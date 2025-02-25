<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import axios from 'axios';
import CustomerSearch from '../CustomerSearch.vue';
import DateInput from './HundForm/DateInput.vue';
import TimeInput from './HundForm/TimeInput.vue';
import DogSelection from './HundForm/DogSelection.vue';
import AnmerkungInput from './HundForm/AnmerkungInput.vue';
import BezahltToggle from './HundForm/BezahltToggle.vue';
import { fetchCustomers, fetchDogs } from '@/services/dataService';

const appointmentData = ref({
  anmerkung: '',
  date_ankunft: '',
  time_ankunft: '',
  date_abfahrt: '',
  time_abfahrt: '',
  bezahlt: false,
  kundeId: null,
  dogIds: [],
});

const customers = ref([]);
const dogs = ref([]);
const selectedCustomerDogs = ref([]);

const emits = defineEmits(['show-toast']);

// Fetch initial data (customers and dogs)
const fetchInitialData = async () => {
  const fetchInterval = 2 * 60 * 1000; // 2 minutes in milliseconds

  const cachedCustomers = localStorage.getItem('customers');
  const lastFetchTimeCustomers = localStorage.getItem('customers_lastFetchTime');
  const cachedDogs = localStorage.getItem('dogs');
  const lastFetchTimeDogs = localStorage.getItem('dogs_lastFetchTime');
  const now = Date.now();

  if (cachedCustomers && lastFetchTimeCustomers && (now - lastFetchTimeCustomers < fetchInterval)) {
    customers.value = JSON.parse(cachedCustomers);
  } else {
    const fetchedCustomers = await fetchCustomers();
    customers.value = fetchedCustomers;
    localStorage.setItem('customers', JSON.stringify(customers.value));
    localStorage.setItem('customers_lastFetchTime', now.toString());
  }

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

  // Set default date to today in DD-MM-YYYY format
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = today.getFullYear();
  appointmentData.value.date_ankunft = `${day}-${month}-${year}`;
  appointmentData.value.date_abfahrt = `${day}-${month}-${year}`;

  // Set default time to 09:00 and 17:00
  appointmentData.value.time_ankunft = '09:00:00';
  appointmentData.value.time_abfahrt = '17:00:00';
});

// Watch for customer selection to filter dogs
watch(() => appointmentData.value.kundeId, (newCustomerId) => {
  if (newCustomerId) {
    selectedCustomerDogs.value = dogs.value.filter(dog => dog.downer.id === newCustomerId);
    // By default, select all dogs of the chosen customer
    appointmentData.value.dogIds = selectedCustomerDogs.value.map(dog => dog.id);
  } else {
    selectedCustomerDogs.value = [];
    appointmentData.value.dogIds = [];
  }
});

// Handle form submission
const handleSubmit = async () => {
  // Convert DD-MM-YYYY to YYYY-MM-DD for the backend
  const [ankunftDay, ankunftMonth, ankunftYear] = appointmentData.value.date_ankunft.split('-');
  const [abfahrtDay, abfahrtMonth, abfahrtYear] = appointmentData.value.date_abfahrt.split('-');

  const formattedAppointmentData = {
    ...appointmentData.value,
    date_ankunft: `${ankunftYear}-${ankunftMonth}-${ankunftDay}`,
    date_abfahrt: `${abfahrtYear}-${abfahrtMonth}-${abfahrtDay}`,
  };

  // Emit toast notification immediately
  emits('show-toast', 'Termin erfolgreich erstellt!');

  // Close the form overlay immediately
  const closeFormEvent = new CustomEvent('close-form');
  window.dispatchEvent(closeFormEvent);

  try {
    const response = await axios.post('/api/appointment/createNewAppointment', formattedAppointmentData);
    console.log('Appointment created:', response.data);
  } catch (error) {
    console.error('Error creating appointment:', error);

    // Emit an error toast notification
    emits('show-toast', 'Fehler beim Erstellen des Termins!');
  }
};

// Handle customer selection
const handleCustomerSelect = (customer) => {
  appointmentData.value.kundeId = customer.id;
};
</script>

<template>
  <div class="p-4 bg-white rounded shadow-md">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Ankunft Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DateInput v-model="appointmentData.date_ankunft" placeholder="TT-MM-JJJJ" label="Ankunfts-Datum" required />
          <TimeInput v-model="appointmentData.time_ankunft" placeholder="HH:mm" required />
        </div>

      <!-- Abfahrt Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DateInput v-model="appointmentData.date_abfahrt" placeholder="TT-MM-JJJJ" label="Abfahrts-Datum"/>
          <TimeInput v-model="appointmentData.time_abfahrt" placeholder="HH:mm" />
        </div>


      <!-- Customer Search -->
      <div>
        <CustomerSearch :customers="customers" @selectCustomer="handleCustomerSelect" />
      </div>

      <!-- Dog Selection -->
      <div v-if="appointmentData.kundeId">
        <DogSelection :dogs="selectedCustomerDogs" :selectedDogIds="appointmentData.dogIds" @update:selectedDogIds="appointmentData.dogIds = $event" />
      </div>

      <!-- Anmerkung Section -->
      <div>
        <AnmerkungInput v-model="appointmentData.anmerkung" />
      </div>

      <!-- Bezahlt Toggle -->
      <div>
        <BezahltToggle v-model="appointmentData.bezahlt" />
      </div>

      <!-- Submit Button -->
      <button type="submit" class="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
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
</style>