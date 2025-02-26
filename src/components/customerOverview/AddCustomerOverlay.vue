<script setup>
import { ref } from 'vue';
import KundenForm from '@/components/home/Forms/KundenForm.vue';
import { defineEmits } from 'vue';

const emits = defineEmits(['closeOverlay', 'addCustomer', 'show-toast']);
const showOverlay = ref(true);

const closeOverlay = () => {
  showOverlay.value = false;
  emits('closeOverlay');
};

const addCustomer = (newCustomer) => {
  emits('addCustomer', newCustomer);
  closeOverlay();
};

const handleUploadSuccess = () => {
  emits('show-toast', 'Kunden erfolgreich hochgeladen!');
  closeOverlay();
};
</script>

<template>
  <div v-if="showOverlay" class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
    <div class="relative w-full max-w-lg p-4 bg-white rounded shadow-lg max-h-full overflow-y-auto">
      <button @click="closeOverlay" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-4xl hover:cursor-pointer hover:scale-102">
        &times;
      </button>
      <h2 class="text-xl font-bold mb-4">Neuen Kunden anlegen</h2>
      <KundenForm @addCustomer="addCustomer" @show-toast="handleUploadSuccess" />
    </div>
  </div>
</template>