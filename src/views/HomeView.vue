<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import TerminForm from '@/components/Forms/TerminForm.vue';
import KundenForm from '@/components/Forms/KundenForm.vue';
import HundForm from '@/components/Forms/HundForm.vue';

const showForm = ref(false);
const formType = ref('');
const formContainer = ref(null);

const handleButtonClick = (type) => {
  formType.value = type;
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
};

</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
    <div class="space-y-4 transition-all duration-500 mb-4" :class="{'translate-x-[-50%]': showForm}">
      <button @click="handleButtonClick('termin')" class="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700">
        Neuen Termin anlegen
      </button>
      <button @click="handleButtonClick('hund')" class="w-full px-4 py-2 text-white bg-yellow-500 rounded hover:bg-yellow-700">
        Neuen Hund anlegen
      </button>
      <button @click="handleButtonClick('kunden')" class="w-full px-4 py-2 text-white bg-green-500 rounded hover:bg-green-700">
        Neuen Kunden anlegen
      </button>
    </div>
    <div v-if="showForm" ref="formContainer" class="relative w-full max-w-lg p-4 bg-white rounded shadow-lg transition-all duration-500 form-container">
      <button @click="closeForm" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-4xl">
        &times;
      </button>
      <h2 class="text-xl font-bold mb-4">
        {{ formType === 'termin' ? 'Neuen Termin anlegen' : formType === 'hund' ? 'Neuen Hund anlegen' : 'Neuen Kunden anlegen' }}
      </h2>
      <component :is="formType === 'termin' ? TerminForm : formType === 'hund' ? HundForm : KundenForm" />
    </div>
  </div>
</template>