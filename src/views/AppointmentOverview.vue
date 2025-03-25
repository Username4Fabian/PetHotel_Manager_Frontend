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
const searchProperty = ref('date_ankunft'); // Default to Ankunft
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
  const allDogs = JSON.parse(localStorage.getItem('dogs')) || [];
  newAppointment.dogs = allDogs.filter(dog => newAppointment.dogIds.includes(dog.id));
  appointments.value.push(newAppointment);
  localStorage.setItem('appointments', JSON.stringify(appointments.value));
  toastMessage.value = 'Termin erfolgreich hinzugefügt!';
  showToast.value = true;

  const totalPages = Math.ceil(appointments.value.length / appointmentsPerPage);
  if (currentPage.value > totalPages) {
    currentPage.value = totalPages;
  }
};

const rollbackAppointment = (failedAppointment) => {
  appointments.value = appointments.value.filter(a => a !== failedAppointment);
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
  showEditOverlay.value = false;
};

const handleCloseOverlay = () => {
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
  showEditOverlay.value = true;
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
    const query = searchQuery.value.trim();

    switch (searchProperty.value) {
      case 'customerName':
        const fullName = `${appointment.kunde?.firstName || ''} ${appointment.kunde?.lastName || ''}`.toLowerCase();
        return fullName.includes(query.toLowerCase());

      case 'date_ankunft':
      case 'date_abfahrt':
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

        // Normalize query by replacing all separators with dots
        const normalizedQuery = query.replace(/[\/\-]/g, '.');
        
        // Split into parts and filter out empty strings
        const queryParts = normalizedQuery.split('.').filter(part => part !== '');
        
        // Determine what parts we're searching for
        if (queryParts.length === 0) return false;
        
        // Case 1: Single number - could be day, month, or year
        if (queryParts.length === 1) {
          const num = queryParts[0].padStart(queryParts[0].length === 4 ? 4 : 2, '0');
          
          // Check if it matches day, month, or year
          return day === num || 
                 month === num || 
                 year === num || 
                 year.endsWith(num);
        }
        
        // Case 2: Two numbers - could be day.month or month.year
        if (queryParts.length === 2) {
          const part1 = queryParts[0].padStart(2, '0');
          const part2 = queryParts[1].padStart(2, '0');
          
          // Check day.month
          if (day === part1 && month === part2) return true;
          
          // Check month.year (if part2 is 4 digits)
          if (queryParts[1].length === 4) {
            return month === part1 && year === queryParts[1];
          }
          
          // Check month.year (if part2 is 2 digits)
          return month === part1 && year.endsWith(part2);
        }
        
        // Case 3: Full date (3 parts)
        if (queryParts.length >= 3) {
          const queryDay = queryParts[0].padStart(2, '0');
          const queryMonth = queryParts[1].padStart(2, '0');
          let queryYear = queryParts[2];
          
          // Handle 2-digit year
          if (queryYear.length === 2) {
            queryYear = `20${queryYear}`; // Assuming 21st century
          }
          
          return day === queryDay && 
                 month === queryMonth && 
                 year === queryYear;
        }
        
        return false;

      case 'bezahlt':
        return (query.toLowerCase() === 'ja' && appointment.bezahlt) || 
               (query.toLowerCase() === 'nein' && !appointment.bezahlt);

      case 'id':
        return String(appointment.id) === query;

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
    <h1 class="text-2xl md:text-4xl font-bold mb-4">Terminübersicht</h1>
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
      @closeOverlay="showOverlay = false"
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
    <Toast 
      v-if="showToast" 
      :message="toastMessage" 
      @close="closeToast" 
    />
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}
</style>