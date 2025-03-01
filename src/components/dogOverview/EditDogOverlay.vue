<script setup>
import { ref, watch } from 'vue';
import HundForm from '@/components/home/Forms/HundForm.vue';
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  dog: Object,
});

const emits = defineEmits(['closeOverlay', 'updateDog', 'show-toast']);
const showOverlay = ref(true);
const localDog = ref({ ...props.dog });

watch(
  () => props.dog,
  (newDog) => {
    console.log('Updating localDog:', newDog); // Debugging
    localDog.value = { ...newDog };
  },
  { immediate: true, deep: true }
);

const closeOverlay = () => {
  console.log('Closing overlay'); // Debugging
  showOverlay.value = false;
  emits('closeOverlay'); // Emit the closeOverlay event
};

const updateDog = (updatedDog) => {
  console.log('Updating dog in EditDogOverlay:', updatedDog); // Debugging
  localDog.value = { ...updatedDog }; // Update localDog immediately
  emits('updateDog', updatedDog);
  closeOverlay(); // Close the overlay after updating
};

const handleUploadSuccess = () => {
  emits('show-toast', 'Hund erfolgreich hochgeladen!');
  closeOverlay();
};
</script>

<template>
  <div v-if="showOverlay" class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
    <div class="relative w-full max-w-lg p-4 bg-white rounded shadow-lg max-h-full overflow-y-auto">
      <button @click="closeOverlay" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-4xl hover:cursor-pointer hover:scale-102">
        &times;
      </button>
      <h2 class="text-xl font-bold mb-4">Hund bearbeiten</h2>
      <HundForm :initialData="localDog" :isEdit="true" @updateDog="updateDog" @show-toast="handleUploadSuccess" />
    </div>
  </div>
</template>