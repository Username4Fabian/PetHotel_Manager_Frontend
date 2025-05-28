<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
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
const searchProperty = ref('customerName');
const currentPage = ref(1);
const appointmentsPerPage = 10;
const showOverlay = ref(false);
const showEditOverlay = ref(false);
const selectedAppointment = ref(null);
const fetchInterval = 3 * 60 * 1000; // 3 minutes in milliseconds

const route = useRoute();
const router = useRouter();

const showToast = ref(false);
const toastMessage = ref('');

// --- Helper: LocalStorage fetch/set ---
const getCached = (key, lastKey) => {
  const now = Date.now();
  const cached = localStorage.getItem(key);
  const lastFetch = localStorage.getItem(lastKey);
  if (cached && lastFetch && (now - lastFetch < fetchInterval)) {
    return JSON.parse(cached);
  }
  return null;
};
const setCached = (key, lastKey, value) => {
  localStorage.setItem(key, JSON.stringify(value));
  localStorage.setItem(lastKey, Date.now().toString());
};

// --- Data Fetching with Caching ---
const fetchAppointmentsData = async () => {
  // Appointments
  let cached = getCached('appointments', 'appointments_lastFetchTime');
  if (cached) {
    appointments.value = cached;
  } else {
    try {
      const fetched = await fetchAppointments();
      appointments.value = fetched;
      setCached('appointments', 'appointments_lastFetchTime', fetched);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toastMessage.value = 'Fehler beim Laden der Termine!';
      showToast.value = true;
    }
  }
  // Customers
  cached = getCached('customers', 'customers_lastFetchTime');
  if (cached) {
    customers.value = cached;
  } else {
    try {
      const fetched = await fetchCustomers();
      customers.value = fetched;
      setCached('customers', 'customers_lastFetchTime', fetched);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toastMessage.value = 'Fehler beim Laden der Kunden!';
      showToast.value = true;
    }
  }
  // Dogs
  cached = getCached('dogs', 'dogs_lastFetchTime');
  if (cached) {
    dogs.value = cached;
  } else {
    try {
      const fetched = await fetchDogs();
      dogs.value = fetched;
      setCached('dogs', 'dogs_lastFetchTime', fetched);
    } catch (error) {
      console.error('Error fetching dogs:', error);
      toastMessage.value = 'Fehler beim Laden der Hunde!';
      showToast.value = true;
    }
  }
};

// --- Appointment CRUD ---
const addAppointment = (newAppointment) => {
  // Use reactive dogs state, not localStorage
  newAppointment.dogs = dogs.value.filter(dog => newAppointment.dogIds.includes(dog.id));
  appointments.value.push(newAppointment);
  setCached('appointments', 'appointments_lastFetchTime', appointments.value);
  toastMessage.value = 'Termin erfolgreich erstellt!';
  showToast.value = true;

  // Adjust current page if the total number of pages changes
  const totalPages = Math.ceil(appointments.value.length / appointmentsPerPage);
  if (currentPage.value > totalPages) {
    currentPage.value = totalPages;
  }
};

const rollbackAppointment = (failedAppointment) => {
  appointments.value = appointments.value.filter(a => a !== failedAppointment);
  setCached('appointments', 'appointments_lastFetchTime', appointments.value);
  toastMessage.value = 'Error beim Erstellen des Termins! Bitte erneut versuchen.';
  showToast.value = true;
};

const handleAppointmentDeleted = async (deletedAppointment) => {
  const originalAppointments = [...appointments.value];
  appointments.value = appointments.value.filter(a => a.appointment_nr !== deletedAppointment.appointment_nr);
  setCached('appointments', 'appointments_lastFetchTime', appointments.value);
  toastMessage.value = 'Termin erfolgreich gelöscht!';
  showToast.value = true;

  // Adjust current page if the total number of pages changes
  const totalPages = Math.ceil(appointments.value.length / appointmentsPerPage);
  if (currentPage.value > totalPages) {
    currentPage.value = totalPages;
  }

  try {
    await axios.delete(`/api/appointment/DeleteAppointment/${deletedAppointment.appointment_nr}`);
  } catch (error) {
    console.error('Error deleting appointment:', error);
    appointments.value = originalAppointments;
    setCached('appointments', 'appointments_lastFetchTime', appointments.value);
    toastMessage.value = 'Error deleting appointment!';
    showToast.value = true;
  }
};

const handleUpdateAppointment = (updatedAppointment) => {
  if (updatedAppointment) {
    const index = appointments.value.findIndex(a => a.id === updatedAppointment.id);
    if (index !== -1) {
      appointments.value = [
        ...appointments.value.slice(0, index),
        updatedAppointment,
        ...appointments.value.slice(index + 1)
      ];
      setCached('appointments', 'appointments_lastFetchTime', appointments.value);
      toastMessage.value = 'Termin erfolgreich aktualisiert!';
      showToast.value = true;
    }
  } else {
    toastMessage.value = 'Fehler beim Aktualisieren des Termins!';
    showToast.value = true;
  }
  showEditOverlay.value = false;
};

// --- Overlay/Toast Handlers ---
const handleCloseOverlay = async (messageOrShouldRefresh = false) => {
  showOverlay.value = false;
  if (typeof messageOrShouldRefresh === 'string') {
    toastMessage.value = messageOrShouldRefresh;
    showToast.value = true;
    await fetchAppointmentsData();
  } else if (messageOrShouldRefresh === true) {
    await fetchAppointmentsData();
  }
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
  showEditOverlay.value = true;
};

// --- Lifecycle ---
onMounted(() => {
  fetchAppointmentsData();

  if (route.query.success) {
    toastMessage.value = route.query.success;
    showToast.value = true;
    router.replace({ query: { ...route.query, success: undefined } });
  }
});

// --- Watchers ---
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

// --- Filtering & Pagination ---
const filteredAppointments = computed(() => {
  if (!searchQuery.value) return appointments.value;

  const query = searchQuery.value.trim().toLowerCase();

  return appointments.value.filter(appointment => {
    switch (searchProperty.value) {
      case 'customerName': {
        const firstName = appointment.kunde?.firstName?.toLowerCase() || '';
        const lastName = appointment.kunde?.lastName?.toLowerCase() || '';
        const fullName = `${firstName} ${lastName}`;
        const reverseName = `${lastName} ${firstName}`;
        const queryParts = query.split(/\s+/).filter(part => part.length > 0);

        return (
          fullName === query ||
          reverseName === query ||
          lastName === query ||
          (queryParts.length > 1 && queryParts.every(part =>
            firstName.includes(part) ||
            lastName.includes(part))) ||
          (queryParts.length === 1 && (
            firstName.includes(query) ||
            lastName.includes(query)
          ))
        );
      }
      case 'date_ankunft':
      case 'date_abfahrt': {
        const dateString = searchProperty.value === 'date_ankunft'
          ? appointment.date_ankunft
          : appointment.date_abfahrt;

        const appointmentDate = new Date(dateString);
        if (isNaN(appointmentDate.getTime())) return false;

        const day = String(appointmentDate.getUTCDate()).padStart(2, '0');
        const month = String(appointmentDate.getUTCMonth() + 1).padStart(2, '0');
        const year = String(appointmentDate.getUTCFullYear());
        const normalizedQuery = query.replace(/[\/\-]/g, '.');
        const queryParts = normalizedQuery.split('.').filter(part => part !== '');

        if (queryParts.length === 0) return false;

        if (queryParts.length === 1) {
          const num = queryParts[0].padStart(queryParts[0].length === 4 ? 4 : 2, '0');
          return day === num || month === num || year === num || year.endsWith(num);
        }

        if (queryParts.length === 2) {
          const part1 = queryParts[0].padStart(2, '0');
          const part2 = queryParts[1].padStart(2, '0');
          if (day === part1 && month === part2) return true;
          if (queryParts[1].length === 4) {
            return month === part1 && year === queryParts[1];
          }
          return month === part1 && year.endsWith(part2);
        }

        if (queryParts.length >= 3) {
          const queryDay = queryParts[0].padStart(2, '0');
          const queryMonth = queryParts[1].padStart(2, '0');
          let queryYear = queryParts[2];
          if (queryYear.length === 2) queryYear = `20${queryYear}`;
          return day === queryDay && month === queryMonth && year === queryYear;
        }

        return false;
      }
      case 'dogName':
        return appointment.dogs?.some(dog =>
          dog.name.toLowerCase().includes(query)
        );
      case 'kundennummer':
        return appointment.dogs?.some(dog =>
          String(dog.downer?.id) === query
        );
      case 'id':
        return String(appointment.id) === query;
      case 'bezahlt':
        return (query === 'ja' && appointment.bezahlt) ||
               (query === 'nein' && !appointment.bezahlt);
      default:
        return false;
    }
  });
});

const removeAppointment = (appointment) => {
  appointments.value = appointments.value.filter(
    a => a.id !== appointment.id && a.appointment_nr !== appointment.appointment_nr
  );
  setCached('appointments', 'appointments_lastFetchTime', appointments.value);
};

const paginatedAppointments = computed(() => {
  const start = (currentPage.value - 1) * appointmentsPerPage;
  const end = start + appointmentsPerPage;
  return filteredAppointments.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredAppointments.value.length / appointmentsPerPage));

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};
const firstPage = () => { currentPage.value = 1; };
const lastPage = () => { currentPage.value = totalPages.value; };
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-xl md:text-4xl font-bold mb-4 text-center md:text-left">Terminübersicht</h1>
    <AppointmentSearchBar
      v-model:searchQuery="searchQuery"
      v-model:searchProperty="searchProperty"
      :showAddButton="true"
      @showOverlay="showOverlay = true"
    />
    <ul class="space-y-2">
      <li v-for="appointment in paginatedAppointments" :key="appointment.id" class="mb-2">
        <AppointmentItem
          :appointment="appointment"
          actionType="delete"
          @appointmentDeleted="handleAppointmentDeleted"
          @appointmentUpdated="handleUpdateAppointment"
          @editAppointment="editAppointment"
        />
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
      @closeOverlay="handleCloseOverlay"
      @closeAssignRooms="fetchAppointmentsData"
      @addAppointment="addAppointment"
      @rollbackAppointment="rollbackAppointment"
      @show-toast="handleUploadSuccess"
      @removeAppointment="removeAppointment"
    />
    <EditAppointmentOverlay
      v-if="showEditOverlay"
      :appointment="selectedAppointment"
      :customers="customers"
      :dogs="dogs"
      @closeOverlay="showEditOverlay = false"
      @updateAppointment="handleUpdateAppointment"
      @show-toast="handleUploadSuccess"
    />
    <Toast v-if="showToast" :message="toastMessage" @close="closeToast" />
  </div>
</template>

<style scoped>
.container {
  max-width: 100%;
}
</style>