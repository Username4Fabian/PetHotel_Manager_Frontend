<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { fetchCustomers } from '@/services/dataService';
import PersonalInfoForm from './KundenForm/PersonalInfoForm.vue';
import AddressForm from './KundenForm/AddressForm.vue';
import ContactInfoForm from './KundenForm/ContactInfoForm.vue';
import AdditionalInfoForm from './KundenForm/AdditionalInfoForm.vue';
import '@/assets/styles/forms.css';

const kundenData = ref({
  anrede: 'Keine Angabe', // Default to "Keine Angabe"
  firstName: '',
  lastName: '',
  straße: '',
  plz: '',
  ort: '',
  telefonnummer: '',
  email: '',
  ausweisnr: '',
  geburtsdatum: '',
  geburtsort: '',
  sprache: 'Deutsch',
  agbsAkzeptiert: false,
  noMWST: false
});

const customers = ref([]);

const emits = defineEmits(['show-toast']);

const fetchInitialData = async () => {
  customers.value = await fetchCustomers();
};

onMounted(async () => {
  await fetchInitialData();
});

const handleSubmit = async () => {
  if (!kundenData.value.lastName) {
    alert('Nachname is required');
    return;
  }

  // Convert date format from dd-MM-yyyy to yyyy-MM-dd
  const [day, month, year] = kundenData.value.geburtsdatum.split('-');
  const formattedDate = `${year}-${month}-${day}`;
  kundenData.value.geburtsdatum = formattedDate;

  // Optimistic UI Update
  const newCustomer = { ...kundenData.value };
  customers.value.push(newCustomer);

  // Emit toast notification immediately
  emits('show-toast', 'Kunde erfolgreich erstellt!');

  // Close the form overlay immediately
  const closeFormEvent = new CustomEvent('close-form');
  window.dispatchEvent(closeFormEvent);

  try {
    const response = await axios.post('/api/kunde/CreateNewKunde', kundenData.value);
    console.log('Kunde created:', response.data);

    // Replace the optimistic update with the actual response data in the customers array
    const updatedCustomers = customers.value.map(customer =>
      customer.email === newCustomer.email ? response.data : customer
    );
    customers.value = updatedCustomers;

    // Append the new customer to the existing list in local storage
    const existingCustomers = JSON.parse(localStorage.getItem('customers')) || [];
    const updatedLocalStorage = [...existingCustomers, response.data]; // Append the new customer
    localStorage.setItem('customers', JSON.stringify(updatedLocalStorage));
  } catch (error) {
    console.error('Error creating Kunde:', error);

    // Revert optimistic UI update
    const revertedCustomers = customers.value.filter(customer => customer.email !== newCustomer.email);
    customers.value = revertedCustomers;

    // Revert local storage to the previous state
    const existingCustomers = JSON.parse(localStorage.getItem('customers')) || [];
    const revertedLocalStorage = existingCustomers.filter(customer => customer.email !== newCustomer.email);
    localStorage.setItem('customers', JSON.stringify(revertedLocalStorage));
  }
};

const updateKundenData = (key, value) => {
  kundenData.value[key] = value;
};
</script>

<template>
  <div class="p-4 bg-white rounded shadow-md">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Personal Information -->
      <PersonalInfoForm
        :kundenData="kundenData"
        @update:kundenData="updateKundenData"
      />

      <!-- Address -->
      <AddressForm
        :kundenData="kundenData"
        @update:kundenData="updateKundenData"
      />

      <!-- Contact Information -->
      <ContactInfoForm
        :kundenData="kundenData"
        @update:kundenData="updateKundenData"
      />

      <!-- Additional Information -->
      <AdditionalInfoForm
        :kundenData="kundenData"
        @update:kundenData="updateKundenData"
      />

      <!-- Submit Button -->
      <button type="submit" class="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
        Speichern
      </button>
    </form>
  </div>
</template>