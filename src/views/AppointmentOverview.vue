<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import AppointmentSearchBar from '@/components/appointmentOverview/AppointmentSearchBar.vue';
import AppointmentItem from '@/components/appointmentOverview/AppointmentItem.vue';
import Pagination from '@/components/customerOverview/Pagination.vue';
import AddAppointmentOverlay from '@/components/appointmentOverview/AddAppointmentOverlay.vue';
import EditAppointmentOverlay from '@/components/appointmentOverview/EditAppointmentOverlay.vue';
import Toast from '@/components/Toast.vue';
import { fetchAppointments, fetchCustomers, fetchDogs } from '@/services/dataService';
import axios from 'axios';

const appointments = ref([]);
const customers = ref([]);
const dogs = ref([]);
const searchQuery = ref('');
const searchProperty = ref('date'); // Default to 'date'
const currentPage = ref(1);
const appointmentsPerPage = 10;
const showOverlay = ref(false);
const showEditOverlay = ref(false);
const showToast = ref(false);
const toastMessage = ref('');
const selectedAppointment = ref(null);
const fetchInterval = 3 * 60 * 1000; // 3 minutes in milliseconds

const route = useRoute();

const fetchAppointmentsData = async () => {
  const cachedAppointments = localStorage.getItem('appointments');
  const lastFetchTimeAppointments = localStorage.getItem('appointments_lastFetchTime');
  const now = Date.now();

  if (cachedAppointments && lastFetchTimeAppointments && (now - lastFetchTimeAppointments < fetchInterval)) {
    appointments.value = JSON.parse(cachedAppointments);
  } else {
    try {
      const fetchedAppointments = await fetchAppointments();
      appointments.value = fetchedAppointments;
      localStorage.setItem('appointments', JSON.stringify(appointments.value));
      localStorage.setItem('appointments_lastFetchTime', now.toString());
    } catch (error) {
      console.error('Fehler beim Abrufen der Termine:', error);
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

  const cachedDogs = localStorage.getItem('dogs');
  const lastFetchTimeDogs = localStorage.getItem('dogs_lastFetchTime');

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
};

const addAppointment = (newAppointment) => {
  console.log('addAppointment - Received Appointment:', newAppointment);

  // Add the new appointment optimistically
  const allDogs = JSON.parse(localStorage.getItem('dogs')) || [];
  newAppointment.dogs = allDogs.filter(dog => newAppointment.dogIds.includes(dog.id));
  appointments.value.push(newAppointment);

  // Update local storage immediately
  localStorage.setItem('appointments', JSON.stringify(appointments.value));

  toastMessage.value = 'Termin erfolgreich hinzugefügt!';
  showToast.value = true;

  // Update pagination
  const totalPages = Math.ceil(appointments.value.length / appointmentsPerPage);
  if (currentPage.value > totalPages) {
    currentPage.value = totalPages;
  }
};

const rollbackAppointment = (failedAppointment) => {
  console.log('Rolling back appointment:', failedAppointment);

  // Remove the failed appointment from the UI
  appointments.value = appointments.value.filter(a => a !== failedAppointment);

  // Update local storage
  localStorage.setItem('appointments', JSON.stringify(appointments.value));

  toastMessage.value = 'Fehler beim Erstellen des Termins. Änderungen wurden zurückgesetzt.';
  showToast.value = true;
};

const handleAppointmentDeleted = async (deletedAppointment) => {
  const originalAppointments = [...appointments.value];
  appointments.value = appointments.value.filter(a => a.id !== deletedAppointment.id);
  localStorage.setItem('appointments', JSON.stringify(appointments.value));
  toastMessage.value = 'Termin erfolgreich gelöscht!';
  showToast.value = true;

  const totalPages = Math.ceil(appointments.value.length / appointmentsPerPage);
  if (currentPage.value > totalPages) {
    currentPage.value = totalPages;
  }

  try {
    await axios.delete(`/api/appointment/DeleteAppointment/${deletedAppointment.id}`);
  } catch (error) {
    console.error('Fehler beim Löschen des Termins:', error);
    appointments.value = originalAppointments;
    localStorage.setItem('appointments', JSON.stringify(appointments.value));
    toastMessage.value = 'Fehler beim Löschen des Termins!';
    showToast.value = true;
  }
};

const handleUpdateAppointment = (updatedAppointment) => {
  // Optimistically update the appointment
  const index = appointments.value.findIndex(a => a.id === updatedAppointment.id);
  if (index !== -1) {
    appointments.value = [
      ...appointments.value.slice(0, index),
      updatedAppointment,
      ...appointments.value.slice(index + 1)
    ];
    localStorage.setItem('appointments', JSON.stringify(appointments.value));
    toastMessage.value = 'Termin erfolgreich aktualisiert!';
    showToast.value = true;
  }
  showEditOverlay.value = false; // Close the overlay
};

const handleCloseOverlay = () => {
  console.log('Overlay closed'); // Debugging
  showEditOverlay.value = false;
};

const handleUploadSuccess = (message) => {
  toastMessage.value = message;
  showToast.value = true;
};

const closeToast = () => {
  showToast.value = false;
};

const editAppointment = (appointment) => {
  selectedAppointment.value = appointment;
  showEditOverlay.value = true; // Open the overlay
};

onMounted(() => {
  fetchAppointmentsData();
});

watch([searchQuery, searchProperty], () => {
  currentPage.value = 1;
});

watch(route, () => {
  const ownerId = route.query.ownerId;
  if (ownerId) {
    searchQuery.value = ownerId;
    searchProperty.value = 'ownerId';
  }
}, { immediate: true });

const filteredAppointments = computed(() => {
  if (!searchQuery.value) {
    return appointments.value;
  }
  return appointments.value.filter(appointment => {
    if (searchProperty.value === 'all') {
      return (
        appointment.date_ankunft.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        (appointment.kunde && appointment.kunde.firstName.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
        (appointment.kunde && appointment.kunde.lastName.toLowerCase().includes(searchQuery.value.toLowerCase()))
      );
    } else if (searchProperty.value === 'ownerId') {
      return String(appointment.kundeId) === searchQuery.value;
    } else if (searchProperty.value === 'id') {
      return String(appointment.id) === searchQuery.value;
    } else {
      return String(appointment[searchProperty.value]).toLowerCase().includes(searchQuery.value.toLowerCase());
    }
  });
});

const paginatedAppointments = computed(() => {
  const start = (currentPage.value - 1) * appointmentsPerPage;
  const end = start + appointmentsPerPage;
  return filteredAppointments.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredAppointments.value.length / appointmentsPerPage);
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
    <h1 class="text-2xl md:text-4xl font-bold mb-4">Terminübersicht</h1>
    <AppointmentSearchBar
      v-model:searchQuery="searchQuery"
      v-model:searchProperty="searchProperty"
      :showAddButton="true"
      @showOverlay="showOverlay = true"
    />
    <ul class="space-y-2">
      <li v-for="appointment in paginatedAppointments" :key="appointment.id" class="mb-2">
        <AppointmentItem :appointment="appointment" actionType="delete" @appointmentDeleted="handleAppointmentDeleted" @appointmentUpdated="handleUpdateAppointment" @editAppointment="editAppointment" />
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
    <AddAppointmentOverlay
        v-if="showOverlay"
        :customers="customers"
        :dogs="dogs"
        @closeOverlay="showOverlay = false"
        @addAppointment="addAppointment"
        @rollbackAppointment="rollbackAppointment"
        @show-toast="handleUploadSuccess"
      />
    <EditAppointmentOverlay v-if="showEditOverlay" :appointment="selectedAppointment" @closeOverlay="showEditOverlay = false" @updateAppointment="handleUpdateAppointment" />
    <Toast v-if="showToast" :message="toastMessage" @close="closeToast" />
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}
</style>