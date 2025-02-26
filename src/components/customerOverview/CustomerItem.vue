<script setup>
import { ref } from 'vue';
import { defineProps, defineEmits } from 'vue';
import axios from 'axios';
import EditCustomerOverlay from './EditCustomerOverlay.vue';

const props = defineProps({
  customer: Object,
  actionType: {
    type: String,
    default: 'delete' // 'delete' or 'return'
  }
});

const emits = defineEmits(['customerDeleted', 'customerUpdated']);

const showDetails = ref(false);
const showEditOverlay = ref(false);

const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};

const deleteCustomer = async () => {
  const confirmationMessage = `Sind Sie sicher, dass Sie den Kunden: ${props.customer.firstName} ${props.customer.lastName} löschen möchten?\n\nAlle dem Kunden angehörige Hunde werden ebenfalls gelöscht.\n\nDiese Aktion kann nicht rückgängig gemacht werden.`;
  if (window.confirm(confirmationMessage)) {
    try {
      await axios.delete(`/api/kunde/DeleteKunde/${props.customer.id}`);
      emits('customerDeleted', props.customer);
    } catch (error) {
      console.error('Fehler beim Löschen des Kunden:', error);
    }
  }
};

const handleUpdateCustomer = (updatedCustomer) => {
  emits('customerUpdated', updatedCustomer);
  showEditOverlay.value = false;
};
</script>

<template>
  <div class="p-4 bg-white shadow-md rounded-lg transition-all duration-300 hover:shadow-lg cursor-pointer" @click="toggleDetails">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-xl font-semibold text-gray-800">{{ customer.firstName }} {{ customer.lastName }}</h2>
        <p class="text-sm text-gray-600"><strong>Kundennummer: </strong> {{ customer.id || '---' }}</p>
        <p class="text-sm text-gray-600"><strong>Telefonnummer: </strong> {{ customer.telefonnummer || '---' }}</p>
        <p class="text-sm text-gray-600"><strong>E-Mail: </strong> {{ customer.email || '---' }}</p>
      </div>
      <div class="flex space-x-2">
        <button
          @click.stop="showEditOverlay = true"
          class="text-gray-500 hover:text-blue-600 transition-colors duration-200 text-3xl hover:cursor-pointer mr-10">
          <i class="fas fa-edit"></i>
        </button>
        <button
          v-if="actionType === 'delete'"
          @click.stop="deleteCustomer"
          class="text-gray-500 hover:text-red-600 transition-colors duration-200 text-3xl hover:cursor-pointer mr-5">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    </div>

    <!-- Arrow indicator for expand/collapse -->
    <div class="flex justify-center mt-2">
      <i
        class="fas text-gray-500 transition-transform duration-300"
        :class="showDetails ? 'fa-chevron-up' : 'fa-chevron-down'">
    </i>
    </div>

    <!-- Details section -->
    <div v-if="showDetails" class="text-gray-700 mt-4 space-y-2">
      <h3 class="text-lg font-semibold text-gray-800">Adresse</h3>
      <p class="text-sm text-gray-600"><strong>Straße: </strong> {{ customer.straße || '---' }}</p>
      <p class="text-sm text-gray-600"><strong>PLZ: </strong> {{ customer.plz || '---' }}</p>
      <p class="text-sm text-gray-600"><strong>Ort: </strong> {{ customer.ort || '---' }}</p>

      <h3 class="text-lg font-semibold text-gray-800 mt-4">Persönliche Informationen</h3>
      <p class="text-sm text-gray-600"><strong>Anrede: </strong> {{ customer.anrede || '---' }}</p>
      <p class="text-sm text-gray-600"><strong>Ausweisnummer: </strong> {{ customer.ausweisnr || '---' }}</p>
      <p class="text-sm text-gray-600"><strong>Geburtsdatum: </strong> {{ customer.geburtsdatum ? new Date(customer.geburtsdatum).toLocaleDateString() : '---' }}</p>
      <p class="text-sm text-gray-600"><strong>Geburtsort: </strong> {{ customer.geburtsort || '---' }}</p>
      <p class="text-sm text-gray-600"><strong>Sprache:</strong> {{ customer.sprache || '---' }}</p>

      <h3 class="text-lg font-semibold text-gray-800 mt-4">Sonstiges</h3>
      <p class="text-sm text-gray-600"><strong>AGBs Akzeptiert:</strong> {{ customer.agbsAkzeptiert ? 'Ja' : 'Nein' }}</p>
      <p class="text-sm text-gray-600"><strong>Keine MWST:</strong> {{ customer.noMWST ? 'Ja' : 'Nein' }}</p>
    </div>
    <EditCustomerOverlay v-if="showEditOverlay" :customer="customer" @closeOverlay="showEditOverlay = false" @updateCustomer="handleUpdateCustomer" />
  </div>
</template>