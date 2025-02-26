<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { fetchCustomers } from '@/services/dataService';
import PersonalInfoForm from './KundenForm/PersonalInfoForm.vue';
import AddressForm from './KundenForm/AddressForm.vue';
import ContactInfoForm from './KundenForm/ContactInfoForm.vue';
import AdditionalInfoForm from './KundenForm/AdditionalInfoForm.vue';
import '@/assets/styles/forms.css';

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      anrede: 'Keine Angabe',
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
      noMWST: false,
    }),
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
});

const kundenData = ref({ ...props.initialData });

const customers = ref([]);

const emits = defineEmits(['show-toast', 'addCustomer', 'updateCustomer', 'closeOverlay']);

const fetchInitialData = async () => {
  customers.value = await fetchCustomers();
};

onMounted(async () => {
  await fetchInitialData();
});

watch(
  () => props.initialData,
  (newData) => {
    kundenData.value = { ...newData };
    // Ensure the date is in the correct format (dd-MM-yyyy)
    if (kundenData.value.geburtsdatum) {
      const date = new Date(kundenData.value.geburtsdatum);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const year = date.getFullYear();
      kundenData.value.geburtsdatum = `${day}-${month}-${year}`;
    }
  },
  { immediate: true }
);

const handleSubmit = async () => {
  if (!kundenData.value.lastName) {
    alert('Nachname wird benötigt');
    return;
  }

  // Set default birthdate to current date if not provided
  if (!kundenData.value.geburtsdatum) {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = today.getFullYear();
    kundenData.value.geburtsdatum = `${day}-${month}-${year}`;
  }

  // Convert date format from dd-MM-yyyy to yyyy-MM-dd for the backend
  const [day, month, year] = kundenData.value.geburtsdatum.split('-');
  const formattedDate = `${year}-${month}-${day}`;
  kundenData.value.geburtsdatum = formattedDate;

  // Optimistic UI Update
  let originalCustomer = null;
  if (props.isEdit) {
    originalCustomer = { ...kundenData.value };
    const index = customers.value.findIndex(c => c.id === kundenData.value.id);
    if (index !== -1) {
      customers.value[index] = { ...kundenData.value };
    }
  } else {
    const newCustomer = { ...kundenData.value, id: Date.now() }; // Temporary ID for optimistic update
    customers.value.push(newCustomer);
  }

  try {
    const response = await axios.post('/api/kunde/UpdateKunde', kundenData.value);
    if (props.isEdit) {
      emits('updateCustomer', response.data);
      emits('show-toast', 'Kunde erfolgreich aktualisiert!');
    } else {
      emits('addCustomer', response.data);
      emits('show-toast', 'Kunde erfolgreich erstellt!');
    }
    // Update local storage
    const existingCustomers = JSON.parse(localStorage.getItem('customers')) || [];
    const updatedLocalStorage = [...existingCustomers, response.data]; // Append the new customer
    localStorage.setItem('customers', JSON.stringify(updatedLocalStorage));
    emits('closeOverlay');
  } catch (error) {
    console.error('Error creating/updating Kunde:', error);
    // Revert optimistic UI update
    if (props.isEdit && originalCustomer) {
      const index = customers.value.findIndex(c => c.id === originalCustomer.id);
      if (index !== -1) {
        customers.value[index] = originalCustomer;
      }
    } else {
      customers.value.pop();
    }
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
      <button type="submit" class="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
        {{ isEdit ? 'Aktualisieren' : 'Speichern' }}
      </button>
    </form>
  </div>
</template>