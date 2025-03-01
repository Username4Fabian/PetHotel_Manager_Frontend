<script setup>
import { ref, computed, watch } from 'vue';
import { defineProps, defineEmits } from 'vue';
import EditCustomerOverlay from './EditCustomerOverlay.vue';

const props = defineProps({
  customer: Object,
  dogs: Array,
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

const confirmDeleteCustomer = () => {
  const confirmationMessage = `Sind Sie sicher, dass Sie den Kunden: ${props.customer.firstName} ${props.customer.lastName} löschen möchten?\n\nAlle dem Kunden angehörige Hunde und Termine werden ebenfalls gelöscht.\n\nDiese Aktion kann nicht rückgängig gemacht werden.`;
  if (window.confirm(confirmationMessage)) {
    emits('customerDeleted', props.customer);
  }
};

const handleUpdateCustomer = (updatedCustomer) => {
  emits('customerUpdated', updatedCustomer);
  showEditOverlay.value = false;
};

const customerDogs = ref([]);

const updateCustomerDogs = () => {
  customerDogs.value = props.dogs.filter(dog => dog.downer && dog.downer.id === props.customer.id);
};

// Watch for changes in the dogs prop to update customerDogs
watch(() => props.dogs, updateCustomerDogs, { immediate: true });
</script>

<template>
  <div class="p-4 bg-white shadow-md rounded-lg transition-all duration-300 hover:shadow-lg cursor-pointer" @click="toggleDetails">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-xl font-semibold text-gray-800">{{ customer.firstName }} {{ customer.lastName }}</h2>
        <p class="text-sm text-gray-600"><strong>Kundennummer: </strong> {{ customer.id || '---' }}</p>
        <p class="text-sm text-gray-600"><strong>Telefonnummer: </strong> {{ customer.telefonnummer || '---' }}</p>
        <p class="text-sm text-gray-600"><strong>E-Mail: </strong> {{ customer.email || '---' }}</p>
        <p class="text-sm text-gray-600"><strong>Haustiere: </strong>
          <span v-if="customerDogs.length">
            <span v-for="dog in customerDogs" :key="dog.id" class="mr-2">{{ dog.name }}</span>
          </span>
          <span v-else>---</span>
        </p>
      </div>
      <div class="flex space-x-2">
        <button
          @click.stop="showEditOverlay = true"
          class="text-gray-500 hover:text-blue-600 transition-colors duration-200 text-3xl hover:cursor-pointer mr-10">
          <i class="fas fa-edit"></i>
        </button>
        <button
          v-if="actionType === 'delete'"
          @click.stop="confirmDeleteCustomer"
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