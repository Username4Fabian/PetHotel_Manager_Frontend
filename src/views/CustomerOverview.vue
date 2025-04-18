<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CustomerSearchBar from '@/components/customerOverview/CustomerSearchBar.vue';
import CustomerItem from '@/components/customerOverview/CustomerItem.vue';
import Pagination from '@/components/customerOverview/Pagination.vue';
import AddCustomerOverlay from '@/components/customerOverview/AddCustomerOverlay.vue';
import EditCustomerOverlay from '@/components/customerOverview/EditCustomerOverlay.vue';
import Toast from '@/components/Toast.vue';
import { fetchCustomers, fetchDogs } from '@/services/dataService';
import axios from 'axios';

const customers = ref([]);
const dogs = ref([]);
const searchQuery = ref('');
const searchProperty = ref('lastName'); // Default to 'lastName'
const currentPage = ref(1);
const customersPerPage = 10;
const showOverlay = ref(false);
const showEditOverlay = ref(false);
const showToast = ref(false);
const toastMessage = ref('');
const fetchInterval = 3 * 60 * 1000; // 3 minutes in milliseconds

const route = useRoute();
const router = useRouter();

const fetchCustomersData = async () => {
  const cachedCustomers = localStorage.getItem('customers');
  const lastFetchTime = localStorage.getItem('lastFetchTime');
  const now = Date.now();

  if (cachedCustomers && lastFetchTime && (now - lastFetchTime < fetchInterval)) {
    customers.value = JSON.parse(cachedCustomers);
  } else {
    try {
      const fetchedCustomers = await fetchCustomers();
      customers.value = fetchedCustomers;
      localStorage.setItem('customers', JSON.stringify(customers.value));
      localStorage.setItem('lastFetchTime', now.toString());
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

const addCustomer = (newCustomer) => {
  customers.value.push(newCustomer);
  localStorage.setItem('customers', JSON.stringify(customers.value));
  toastMessage.value = 'Kunde erfolgreich hinzugefügt!';
  showToast.value = true;
};

const handleCustomerDeleted = async (deletedCustomer) => {
  const originalCustomers = [...customers.value];
  customers.value = customers.value.filter(c => c.id !== deletedCustomer.id);
  localStorage.setItem('customers', JSON.stringify(customers.value));
  toastMessage.value = 'Kunde erfolgreich gelöscht!';
  showToast.value = true;

  const totalPages = Math.ceil(customers.value.length / customersPerPage);
  if (currentPage.value > totalPages) {
    currentPage.value = totalPages;
  }

  try {
    await axios.delete(`/api/kunde/DeleteKunde/${deletedCustomer.id}`);
  } catch (error) {
    console.error('Fehler beim Löschen des Kunden:', error);
    customers.value = originalCustomers;
    localStorage.setItem('customers', JSON.stringify(customers.value));
    toastMessage.value = 'Fehler beim Löschen des Kunden!';
    showToast.value = true;
  }
};

const handleUpdateCustomer = async (updatedCustomer) => {
  const originalCustomers = [...customers.value];
  const index = customers.value.findIndex(c => c.id === updatedCustomer.id);
  if (index !== -1) {
    customers.value[index] = updatedCustomer;
    localStorage.setItem('customers', JSON.stringify(customers.value));
    toastMessage.value = 'Kunde erfolgreich aktualisiert!';
    showToast.value = true;
  }

  try {
    await axios.post('/api/kunde/UpdateKunde', updatedCustomer);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Kunden:', error);
    customers.value = originalCustomers;
    localStorage.setItem('customers', JSON.stringify(customers.value));
    toastMessage.value = 'Fehler beim Aktualisieren des Kunden!';
    showToast.value = true;
  }
};

const closeToast = () => {
  showToast.value = false;
};

const viewCustomerDogs = (customerId) => {
  router.push({ name: 'DogOverview', query: { ownerId: customerId } });
};

onMounted(() => {
  fetchCustomersData();
});

watch([searchQuery, searchProperty], () => {
  currentPage.value = 1;
});

watch(route, () => {
  const ownerId = route.query.ownerId;
  if (ownerId) {
    searchQuery.value = ownerId;
    searchProperty.value = 'id';
  }
}, { immediate: true });

const filteredCustomers = computed(() => {
  if (!searchQuery.value) {
    return customers.value;
  }
  return customers.value.filter(customer => {
    if (searchProperty.value === 'all') {
      return (
        customer.firstName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        customer.lastName.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    } else if (searchProperty.value === 'id') {
      return String(customer.id) === searchQuery.value;
    } else if (searchProperty.value === 'dogName') {
      // Check if any of the dogs match the search query and belong to the customer
      return dogs.value.some(dog =>
        dog.downer.id === customer.id &&
        dog.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    } else {
      return String(customer[searchProperty.value]).toLowerCase().includes(searchQuery.value.toLowerCase());
    }
  });
});

const paginatedCustomers = computed(() => {
  const start = (currentPage.value - 1) * customersPerPage;
  const end = start + customersPerPage;
  return filteredCustomers.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredCustomers.value.length / customersPerPage);
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
    <h1 class="text-xl md:text-4xl font-bold mb-4 text-center md:text-left">Kundenübersicht</h1>
    <CustomerSearchBar
      v-model:searchQuery="searchQuery"
      v-model:searchProperty="searchProperty"
      :showAddButton="true"
      @showOverlay="showOverlay = true"
    />
    <ul class="space-y-2">
      <li
        v-for="customer in paginatedCustomers"
        :key="customer.id"
        class="mb-2"
      >
        <CustomerItem
          :customer="customer"
          :dogs="dogs"
          actionType="delete"
          @customerDeleted="handleCustomerDeleted"
          @customerUpdated="handleUpdateCustomer"
          @viewCustomerDogs="viewCustomerDogs"
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
    <AddCustomerOverlay
      v-if="showOverlay"
      @closeOverlay="showOverlay = false"
      @addCustomer="addCustomer"
      @show-toast="handleUploadSuccess"
    />
    <EditCustomerOverlay
      v-if="showEditOverlay"
      :customer="selectedCustomer"
      @closeOverlay="showEditOverlay = false"
      @updateCustomer="handleUpdateCustomer"
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