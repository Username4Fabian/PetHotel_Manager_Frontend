<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { fetchCustomers } from '@/services/dataService';
import DateInput from './HundForm/DateInput.vue';

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
</script>

<template>
  <div class="p-4 bg-white rounded shadow-md">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Personal Information -->
      <div>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Persönliche Informationen</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="relative">
            <select v-model="kundenData.anrede" class="w-full px-3 py-2 border rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Herr">Herr</option>
              <option value="Frau">Frau</option>
              <option value="Keine Angabe">Keine Angabe</option>
            </select>
            <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
              Anrede
            </label>
          </div>
          <div class="relative">
            <input v-model="kundenData.firstName" type="text" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
              Vorname
            </label>
          </div>
          <div class="relative">
            <input v-model="kundenData.lastName" type="text" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
              Nachname
            </label>
          </div>
          <div class="relative">
            <DateInput v-model="kundenData.geburtsdatum" placeholder="TT-MM-JJJJ" label="Geburtsdatum"/>
          </div>
          <div class="relative">
            <input v-model="kundenData.geburtsort" type="text" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
              Geburtsort
            </label>
          </div>
          <div class="relative">
            <input v-model="kundenData.ausweisnr" type="text" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
              Ausweisnummer
            </label>
          </div>
        </div>
      </div>

      <!-- Address -->
      <div>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Adresse</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="relative">
            <input v-model="kundenData.straße" type="text" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
              Straße
            </label>
          </div>
          <div class="relative">
            <input v-model="kundenData.plz" type="text" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" @input="kundenData.plz = kundenData.plz.replace(/\D/g, '')" />
            <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
              PLZ
            </label>
          </div>
        </div>
        <div class="relative mt-3">
            <input v-model="kundenData.ort" type="text" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
              Ort
            </label>
          </div>
      </div>

      <!-- Contact Information -->
      <div>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Kontaktinformationen</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="relative">
            <input v-model="kundenData.telefonnummer" type="text" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
              Telefonnummer
            </label>
          </div>
          <div class="relative">
            <input v-model="kundenData.email" type="email" class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
              Email
            </label>
          </div>
        </div>
      </div>

      <!-- Additional Information -->
      <div>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Zusätzliche Informationen</h3>
        <div class="space-y-3">
          <div class="relative">
            <select v-model="kundenData.sprache" class="w-full px-3 py-2 border rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Deutsch">Deutsch</option>
              <option value="Englisch">Englisch</option>
              <option value="Französisch">Französisch</option>
              <option value="Spanisch">Spanisch</option>
              <option value="Andere">Andere</option>
            </select>
            <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
              Sprache
            </label>
          </div>
          <div class="flex items-center space-x-4">
            <button
              type="button"
              @click="kundenData.agbsAkzeptiert = !kundenData.agbsAkzeptiert"
              :class="{
                'bg-blue-500 text-white': kundenData.agbsAkzeptiert,
                'bg-gray-100 hover:bg-gray-200': !kundenData.agbsAkzeptiert
              }"
              class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              AGBs akzeptiert
            </button>
            <button
              type="button"
              @click="kundenData.noMWST = !kundenData.noMWST"
              :class="{
                'bg-blue-500 text-white': kundenData.noMWST,
                'bg-gray-100 hover:bg-gray-200': !kundenData.noMWST
              }"
              class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              Keine MWST
            </button>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <button type="submit" class="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
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

/* Select Dropdown Styling */
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  padding-right: 1.5rem;
  background-position: right 0.5rem center; 
  background-repeat: no-repeat;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3E%3Cpath fill='%23999' d='M2 0L0 2h4zm0 5L0 3h4z'/%3E%3C/svg%3E"); 
  background-size: 0.75rem;
}
</style>