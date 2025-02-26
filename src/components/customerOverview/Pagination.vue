<script setup>
import { defineProps, defineEmits, computed, ref, onMounted } from 'vue';

const props = defineProps({
  currentPage: Number,
  totalPages: Number
});

const emits = defineEmits(['prevPage', 'nextPage', 'firstPage', 'lastPage']);

const displayPage = computed(() => {
  return props.currentPage === 0 ? 1 : props.currentPage;
});

const displayTotalPages = computed(() => {
  return props.totalPages === 0 ? 1 : props.totalPages;
});

const showLoadingMessage = ref(true);

onMounted(() => {
  setTimeout(() => {
    showLoadingMessage.value = false;
  }, 10000); // Hide the message after 10 seconds
});
</script>

<template>
  <div>
    <div v-if="totalPages === 0" class="text-center text-gray-500 mb-4">
      Keine Einträge gefunden (•́︵•̀)
      <div v-if="showLoadingMessage" class="text-center text-gray-500 mb-4">
        Mit etwas Glück laden sie gerade...
      </div>
    </div>
    <div class="flex flex-col md:flex-row justify-between items-center mt-4 space-y-4 md:space-y-0">
      <div class="flex space-x-2">
        <button @click="$emit('firstPage')" :disabled="currentPage === 1 || totalPages <= 1" class="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50 hover:cursor-pointer hover:scale-102">Erste</button>
        <button @click="$emit('prevPage')" :disabled="currentPage === 1 || totalPages <= 1" class="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50 hover:cursor-pointer hover:scale-102">Vorherige</button>
      </div>
      <span class="text-center">Seite {{ displayPage }} von {{ displayTotalPages }}</span>
      <div class="flex space-x-2">
        <button @click="$emit('nextPage')" :disabled="currentPage === totalPages || totalPages <= 1" class="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50 hover:cursor-pointer hover:scale-102">Nächste</button>
        <button @click="$emit('lastPage')" :disabled="currentPage === totalPages || totalPages <= 1" class="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50 hover:cursor-pointer hover:scale-102">Letzte</button>
      </div>
    </div>
  </div>
</template>