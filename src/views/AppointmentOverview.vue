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

const fetchAppointmentsData = async () => {
  const now = Date.now();

  // Fetch appointments with caching
  const cachedAppointments = localStorage.getItem('appointments');
  const lastFetchTimeAppointments = localStorage.getItem('appointments_lastFetchTime');
  if (cachedAppointments && lastFetchTimeAppointments && (now - lastFetchTimeAppointments < fetchInterval)) {
    appointments.value = JSON.parse(cachedAppointments);
  } else {
    try {
      const fetchedAppointments = await fetchAppointments();
      appointments.value = fetchedAppointments;
      localStorage.setItem('appointments', JSON.stringify(appointments.value));
      localStorage.setItem('appointments_lastFetchTime', now.toString());
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  }

  // Fetch customers with caching
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
      console.error('Error fetching customers:', error);
    }
  }

  // Fetch dogs with caching
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
      console.error('Error fetching dogs:', error);
    }
  }
};

const addAppointment = (newAppointment) => {
  const allDogs = JSON.parse(localStorage.getItem('dogs')) || [];
  newAppointment.dogs = allDogs.filter(dog => newAppointment.dogIds.includes(dog.id));
  appointments.value.push(newAppointment);
  localStorage.setItem('appointments', JSON.stringify(appointments.value));
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
  localStorage.setItem('appointments', JSON.stringify(appointments.value));
  toastMessage.value = 'Error beim Erstellen des Termins! Bitte erneut versuchen.';
  showToast.value = true;
};

const handleAppointmentDeleted = async (deletedAppointment) => {
  const originalAppointments = [...appointments.value];
  appointments.value = appointments.value.filter(a => a.appointment_nr !== deletedAppointment.appointment_nr);
  localStorage.setItem('appointments', JSON.stringify(appointments.value));
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
    localStorage.setItem('appointments', JSON.stringify(appointments.value));
    toastMessage.value = 'Error deleting appointment!';
    showToast.value = true;
  }
};

const handleUpdateAppointment = (updatedAppointment) => {
  const index = appointments.value.findIndex(a => a.id === updatedAppointment.id);
  if (index !== -1) {
    appointments.value = [
      ...appointments.value.slice(0, index),
      updatedAppointment,
      ...appointments.value.slice(index + 1)
    ];
    localStorage.setItem('appointments', JSON.stringify(appointments.value));
    toastMessage.value = 'Appointment successfully updated!';
    showToast.value = true;
  }
  showEditOverlay.value = false;
};

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

onMounted(() => {
  fetchAppointmentsData();

  if (route.query.success) {
    toastMessage.value = route.query.success;
    showToast.value = true;

    router.replace({ query: { ...route.query, success: undefined } });
  }
});

// Reset to the first page when search query or property changes
watch([searchQuery, searchProperty], () => {
  currentPage.value = 1;
});

// Handle route changes to pre-fill search query
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
    const query = searchQuery.value.trim().toLowerCase();

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
        if (isNaN(appointmentDate.getTime())) {
          console.error('Invalid date:', dateString);
          return false;
        }

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
          if (queryYear.length === 2) {
            queryYear = `20${queryYear}`;
          }
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
    />
    <EditAppointmentOverlay
      v-if="showEditOverlay"
      :appointment="selectedAppointment"
      @closeOverlay="showEditOverlay = false"
      @updateAppointment="handleUpdateAppointment"
    />
    <Toast v-if="showToast" :message="toastMessage" @close="closeToast" />
  </div>
</template>

<style scoped>
.container {
  max-width: 100%;
}
</style>