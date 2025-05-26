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
import Toast from '@/components/Toast.vue';

const props = defineProps({
  initialAppointment: Object
});

const emit = defineEmits(['updateAppointment', 'addAppointment']);

// Toast state
const toastMessage = ref('');
const toastType = ref('success');
const showToast = ref(false);

// Reactive state
const appointmentData = ref({
  anmerkung: '',
  date_ankunft: '',
  time_ankunft: '09:00:00',
  date_abfahrt: '',
  time_abfahrt: '17:00:00',
  bezahlt: false,
  kundeId: null,
  dogIds: []
});

const customers = ref([]);
const dogs = ref([]);
const selectedCustomerDogs = ref([]);
const validationErrors = ref({ dateError: '', timeError: '' });
const initialLoad = ref(true);
const isLoading = ref(false);

// Computed properties
const isSameDay = computed(() => {
  if (!appointmentData.value.date_ankunft || !appointmentData.value.date_abfahrt) return false;
  return appointmentData.value.date_ankunft === appointmentData.value.date_abfahrt;
});

// Methods
const validateDates = () => {
  if (initialLoad.value) return true;

  validationErrors.value = { dateError: '', timeError: '' };

  if (!appointmentData.value.date_ankunft || !appointmentData.value.date_abfahrt) return true;

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
  try {
    const [fetchedCustomers, fetchedDogs] = await Promise.all([
      fetchCustomers(),
      fetchDogs()
    ]);

    customers.value = fetchedCustomers;
    dogs.value = fetchedDogs;
  } catch (error) {
    console.error('Error fetching data:', error);
    showToast.value = true;
    toastMessage.value = 'Fehler beim Laden der Daten';
    toastType.value = 'error';
  }
};

const handleSubmit = async () => {
  if (!validateDates()) return;

  isLoading.value = true;

  try {
    const [ankunftDay, ankunftMonth, ankunftYear] = appointmentData.value.date_ankunft.split('-');
    const [abfahrtDay, abfahrtMonth, abfahrtYear] = appointmentData.value.date_abfahrt.split('-');

    const formattedAppointmentData = {
      ...appointmentData.value,
      date_ankunft: new Date(`${ankunftYear}-${ankunftMonth}-${ankunftDay}`).toISOString(),
      date_abfahrt: new Date(`${abfahrtYear}-${abfahrtMonth}-${abfahrtDay}`).toISOString(),
      dogIds: [...appointmentData.value.dogIds]
    };

    const response = await axios.post(
      props.initialAppointment
        ? '/api/appointment/updateAppointment'
        : '/api/appointment/createNewAppointment',
      formattedAppointmentData
    );

    emit(props.initialAppointment ? 'updateAppointment' : 'addAppointment', response.data);
    showToast.value = true;
    toastMessage.value = props.initialAppointment 
      ? 'Termin erfolgreich aktualisiert!' 
      : 'Termin erfolgreich erstellt!';
    toastType.value = 'success';
  } catch (error) {
    console.error('Error saving appointment:', error);
    showToast.value = true;
    toastMessage.value = 'Fehler beim Speichern des Termins!';
    toastType.value = 'error';
  } finally {
    isLoading.value = false;
  }
};

const handleCustomerSelect = (customer) => {
  appointmentData.value.kundeId = customer.id;
  appointmentData.value.kunde = customer;
};

// Lifecycle hooks
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
      dogIds: props.initialAppointment.dogs.map(dog => dog.id) || []
    };
  } else {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    appointmentData.value.date_ankunft = `${day}-${month}-${year}`;
  }

  if (appointmentData.value.kundeId) {
    selectedCustomerDogs.value = dogs.value.filter(dog => dog.downer.id === appointmentData.value.kundeId);
  }
  initialLoad.value = false;
});

// Watchers
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
], validateDates, { deep: true });

watch(() => appointmentData.value.date_abfahrt, (newDateAbfahrt) => {
  if (!newDateAbfahrt) {
    appointmentData.value.time_abfahrt = '';
  } else if (!appointmentData.value.time_abfahrt) {
    appointmentData.value.time_abfahrt = '17:00:00';
  }
});
</script>

<template>
  <div class="p-4 bg-white rounded-lg shadow-md">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Ankunft Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateInput 
          v-model="appointmentData.date_ankunft" 
          label="Ankunfts-Datum"
          placeholder="TT-MM-JJJJ"
          required
          :max-date="!initialLoad ? appointmentData.date_abfahrt : null"
          :error="validationErrors.dateError"
        />
        <TimeInput 
          v-model="appointmentData.time_ankunft" 
          placeholder="HH:mm"
          required
          :max-time="!initialLoad && isSameDay ? appointmentData.time_abfahrt : null"
          :error="validationErrors.timeError"
        />
      </div>

      <!-- Abfahrt Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateInput 
          v-model="appointmentData.date_abfahrt" 
          label="Abfahrts-Datum"
          placeholder="TT-MM-JJJJ"
          :min-date="!initialLoad ? appointmentData.date_ankunft : null"
          :error="validationErrors.dateError"
        />
        <TimeInput 
          v-model="appointmentData.time_abfahrt" 
          placeholder="HH:mm"
          :min-time="!initialLoad && isSameDay ? appointmentData.time_ankunft : null"
          :error="validationErrors.timeError"
        />
      </div>

      <!-- Error messages -->
      <div v-if="validationErrors.dateError" class="text-red-500 text-sm -mt-2">
        {{ validationErrors.dateError }}
      </div>
      <div v-if="validationErrors.timeError" class="text-red-500 text-sm -mt-2">
        {{ validationErrors.timeError }}
      </div>

      <!-- Customer Search -->
      <CustomerSearch 
        :customers="customers" 
        :initial-customer="appointmentData.kunde"
        @select-customer="handleCustomerSelect"
        :disabled="!!props.initialAppointment"
      />

      <!-- Dog Selection -->
      <DogSelection 
        v-if="appointmentData.kundeId"
        :dogs="selectedCustomerDogs" 
        :selected-dog-ids="appointmentData.dogIds" 
        @update:selected-dog-ids="appointmentData.dogIds = $event" 
      />

      <!-- Anmerkung Section -->
      <AnmerkungInput v-model="appointmentData.anmerkung" />

      <!-- Bezahlt Toggle -->
      <BezahltToggle v-model="appointmentData.bezahlt" />

      <!-- Submit Button -->
      <button 
        type="submit" 
        class="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
        :disabled="isLoading"
      >
        <span v-if="isLoading">Speichern...</span>
        <span v-else>Speichern</span>
      </button>
    </form>

    <!-- Toast Component -->
    <Toast
      v-if="showToast"
      :message="toastMessage"
      :type="toastType"
      @close="showToast = false"
    />
  </div>
</template>