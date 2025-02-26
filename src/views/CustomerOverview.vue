<template>
    <div class="container mx-auto p-4">
      <h1 class="text-2xl md:text-4xl font-bold mb-4">Kundenübersicht</h1>
      <CustomerSearchBar
        v-model:searchQuery="searchQuery"
        v-model:searchProperty="searchProperty"
        :showAddButton="true"
        @showOverlay="showOverlay = true"
      />
      <ul class="space-y-2">
        <li v-for="customer in paginatedCustomers" :key="customer.id" class="mb-2">
          <CustomerItem :customer="customer" actionType="delete" @customerDeleted="handleCustomerDeleted" @customerUpdated="handleUpdateCustomer" />
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
      <AddCustomerOverlay v-if="showOverlay" @closeOverlay="showOverlay = false" @addCustomer="addCustomer" @show-toast="handleUploadSuccess" />
      <EditCustomerOverlay v-if="showEditOverlay" :customer="selectedCustomer" @closeOverlay="showEditOverlay = false" @updateCustomer="handleUpdateCustomer" @show-toast="handleUploadSuccess" />
      <Toast v-if="showToast" :message="toastMessage" @close="closeToast" />
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import CustomerSearchBar from '@/components/customerOverview/CustomerSearchBar.vue';
  import CustomerItem from '@/components/customerOverview/CustomerItem.vue';
  import Pagination from '@/components/customerOverview/Pagination.vue';
  import AddCustomerOverlay from '@/components/customerOverview/AddCustomerOverlay.vue';
  import EditCustomerOverlay from '@/components/customerOverview/EditCustomerOverlay.vue';
  import Toast from '@/components/Toast.vue';
  import { fetchCustomers } from '@/services/dataService';
  
  const customers = ref([]);
  const searchQuery = ref('');
  const searchProperty = ref('lastName'); // Default to 'lastName'
  const currentPage = ref(1);
  const customersPerPage = 15;
  const showOverlay = ref(false);
  const showEditOverlay = ref(false);
  const showToast = ref(false);
  const toastMessage = ref('');
  const fetchInterval = 3 * 60 * 1000; // 3 minutes in milliseconds
  
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
  };
  
  const addCustomer = (newCustomer) => {
    customers.value.push(newCustomer);
    localStorage.setItem('customers', JSON.stringify(customers.value));
    toastMessage.value = 'Kunde erfolgreich hinzugefügt!';
    showToast.value = true;
  };
  
  const handleCustomerDeleted = (deletedCustomer) => {
    customers.value = customers.value.filter(c => c.id !== deletedCustomer.id);
    localStorage.setItem('customers', JSON.stringify(customers.value));
    toastMessage.value = 'Kunde erfolgreich gelöscht!';
    showToast.value = true;
  
    const totalPages = Math.ceil(customers.value.length / customersPerPage);
    if (currentPage.value > totalPages) {
      currentPage.value = totalPages;
    }
  };
  
  const handleUploadSuccess = () => {
    fetchCustomersData();
    toastMessage.value = 'Kunden erfolgreich hochgeladen!';
    showToast.value = true;
  };
  
  const handleUpdateCustomer = (updatedCustomer) => {
    const index = customers.value.findIndex(c => c.id === updatedCustomer.id);
    if (index !== -1) {
      customers.value[index] = updatedCustomer;
      localStorage.setItem('customers', JSON.stringify(customers.value));
      toastMessage.value = 'Kunde erfolgreich aktualisiert!';
      showToast.value = true;
    }
  };
  
  const closeToast = () => {
    showToast.value = false;
  };
  
  onMounted(() => {
    fetchCustomersData();
  });
  
  watch([searchQuery, searchProperty], () => {
    currentPage.value = 1;
  });
  
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
  
  <style scoped>
  .container {
    max-width: 100%;
  }
  </style>