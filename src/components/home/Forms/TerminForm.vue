<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import axios from 'axios';
import CustomerSearch from './HundForm/CustomerSearch.vue';
import DateInput from './TerminForm/DateInput.vue';
import TimeInput from './TerminForm/TimeInput.vue';
import DogSelection from './TerminForm/DogSelection.vue';
import AnmerkungInput from './TerminForm/AnmerkungInput.vue';
import BezahltToggle from './TerminForm/BezahltToggle.vue';
import { fetchCustomers, fetchDogs } from '@/services/dataService';
import '@/assets/styles/forms.css';

const props = defineProps({
  initialAppointment: Object,
});

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

const emits = defineEmits(['show-toast', 'updateAppointment', 'addAppointment']);

const validationErrors = ref({
  dateError: '',
  timeError: ''
});

const initialLoad = ref(true);

const isSameDay = computed(() => {
  if (!appointmentData.value.date_ankunft || !appointmentData.value.date_abfahrt) return false;
  return appointmentData.value.date_ankunft === appointmentData.value.date_abfahrt;
});

const validateDates = () => {
  if (initialLoad.value) return true; 

  validationErrors.value.dateError = '';
  validationErrors.value.timeError = '';

  if (!appointmentData.value.date_ankunft || !appointmentData.value.date_abfahrt) return;

  const [ankunftDay, ankunftMonth, ankunftYear] = appointmentData.value.date_ankunft.split('-');
  const ankunftDate = new Date(`${ankunftYear}-${ankunftMonth}-${ankunftDay}`);
  const [abfahrtDay, abfahrtMonth, abfahrtYear] = appointmentData.value.date_abfahrt.split('-');
  const abfahrtDate = new Date(`${abfahrtYear}-${abfahrtMonth}-${abfahrtDay}`);

  if (abfahrtDate < ankunftDate) {
    validationErrors.value.dateError = 'Abfahrts-Datum darf nicht vor Ankunfts-Datum liegen';
    return false;
  }

  if (isSameDay.value && appointmentData.value.time_ankunft && appointmentData.value.time_abfahrt) {
    const ankunftTime = appointmentData.value.time_ankunft.replace(':00', '');
    const abfahrtTime = appointmentData.value.time_abfahrt.replace(':00', '');

    if (abfahrtTime <= ankunftTime) {
      validationErrors.value.timeError = 'Abfahrts-Zeit muss nach Ankunfts-Zeit liegen';
      return false;
    }
  }

  return true;
};

const fetchInitialData = async () => {
  const fetchInterval = 2 * 60 * 1000;

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

  if (props.initialAppointment) {
    appointmentData.value = {
      ...props.initialAppointment,
      date_ankunft: props.initialAppointment.date_ankunft.split('T')[0].split('-').reverse().join('-'),
      date_abfahrt: props.initialAppointment.date_abfahrt.split('T')[0].split('-').reverse().join('-'),
      time_ankunft: props.initialAppointment.time_ankunft,
      time_abfahrt: props.initialAppointment.time_abfahrt || '17:00:00',
      kunde: props.initialAppointment.kunde,
      kundeId: props.initialAppointment.kundeId,
      dogIds: props.initialAppointment.dogs.map(dog => dog.id) || [],
    };
  } else {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); 
    const year = today.getFullYear();
    appointmentData.value.date_ankunft = `${day}-${month}-${year}`;
    appointmentData.value.date_abfahrt = '';
    appointmentData.value.time_ankunft = '09:00:00';
    appointmentData.value.time_abfahrt = '17:00:00'; 
  }

  if (appointmentData.value.kundeId) {
    selectedCustomerDogs.value = dogs.value.filter(dog => dog.downer.id === appointmentData.value.kundeId);
  }
  initialLoad.value = false;
});

watch(() => appointmentData.value.kundeId, (newCustomerId) => {
  if (newCustomerId) {
    selectedCustomerDogs.value = dogs.value.filter(dog => dog.downer.id === newCustomerId);
    appointmentData.value.dogIds = selectedCustomerDogs.value.map(dog => dog.id);
  } else {
    selectedCustomerDogs.value = [];
    appointmentData.value.dogIds = [];
  }
});

watch(() => [
  appointmentData.value.date_ankunft,
  appointmentData.value.date_abfahrt,
  appointmentData.value.time_ankunft,
  appointmentData.value.time_abfahrt
], () => {
  validateDates();
}, { deep: true });

watch(() => appointmentData.value.date_abfahrt, (newDateAbfahrt) => {
  if (!newDateAbfahrt) {
    appointmentData.value.time_abfahrt = '';
  } else if (!appointmentData.value.time_abfahrt) {
    appointmentData.value.time_abfahrt = '17:00:00';
  }
});

const handleSubmit = async () => {
  if (!validateDates()) {
    return; 
  }

  const [ankunftDay, ankunftMonth, ankunftYear] = appointmentData.value.date_ankunft.split('-');
  const [abfahrtDay, abfahrtMonth, abfahrtYear] = appointmentData.value.date_abfahrt.split('-');

  const formattedAppointmentData = {
    ...appointmentData.value,
    date_ankunft: new Date(`${ankunftYear}-${ankunftMonth}-${ankunftDay}`).toISOString(), // Convert to ISO 8601
    date_abfahrt: new Date(`${abfahrtYear}-${abfahrtMonth}-${abfahrtDay}`).toISOString(), // Convert to ISO 8601
    dogIds: [...appointmentData.value.dogIds],
  };

  if (props.initialAppointment) {
    emits('updateAppointment', formattedAppointmentData);
  } else {
    emits('addAppointment', formattedAppointmentData);
  }

  try {
    const response = await axios.post(
      props.initialAppointment
        ? '/api/appointment/updateAppointment'
        : '/api/appointment/createNewAppointment',
      formattedAppointmentData
    );
    console.log('Appointment saved:', response.data);

    emits('updateAppointment', response.data);
  } catch (error) {
    console.error('Error saving appointment:', error);
    emits('show-toast', 'Fehler beim Speichern des Termins!');
  }
};

const handleCustomerSelect = (customer) => {
  appointmentData.value.kundeId = customer.id; 
  appointmentData.value.kunde = customer;
};
</script>

<template>
  <div class="p-4 bg-white rounded shadow-md">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Ankunft Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <DateInput 
            v-model="appointmentData.date_ankunft" 
            placeholder="TT-MM-JJJJ" 
            label="Ankunfts-Datum" 
            required 
            :max-date="!initialLoad ? appointmentData.date_abfahrt : null"
            :class="{ 'border-red-500': validationErrors.dateError }"
          />
        </div>
        <div>
          <TimeInput 
            v-model="appointmentData.time_ankunft" 
            placeholder="HH:mm" 
            required 
            :max-time="!initialLoad && isSameDay ? appointmentData.time_abfahrt : null"
            :class="{ 'border-red-500': validationErrors.timeError }"
          />
        </div>
      </div>

      <!-- Abfahrt Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <DateInput 
            v-model="appointmentData.date_abfahrt" 
            placeholder="TT-MM-JJJJ" 
            label="Abfahrts-Datum"
            :min-date="!initialLoad ? appointmentData.date_ankunft : null"
            :class="{ 'border-red-500': validationErrors.dateError }"
          />
          <p v-if="validationErrors.dateError" class="text-red-500 text-sm mt-1">
            {{ validationErrors.dateError }}
          </p>
        </div>
        <div>
          <TimeInput 
            v-model="appointmentData.time_abfahrt" 
            placeholder="HH:mm" 
            :min-time="!initialLoad && isSameDay ? appointmentData.time_ankunft : null"
            :class="{ 'border-red-500': validationErrors.timeError }"
          />
          <p v-if="validationErrors.timeError" class="text-red-500 text-sm mt-1">
            {{ validationErrors.timeError }}
          </p>
        </div>
      </div>

      <!-- Customer Search -->
      <div>
        <CustomerSearch 
          :customers="customers" 
          :initialCustomer="appointmentData.kunde" 
          @selectCustomer="handleCustomerSelect" 
          :disabled="!!props.initialAppointment"
        />
      </div>

      <!-- Dog Selection -->
      <div v-if="appointmentData.kundeId">
        <DogSelection 
          :dogs="selectedCustomerDogs" 
          :selectedDogIds="appointmentData.dogIds" 
          @update:selectedDogIds="appointmentData.dogIds = $event" 
        />      
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
      <button type="submit" class="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
        Speichern
      </button>
    </form>
  </div>
</template>