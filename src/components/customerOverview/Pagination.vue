<script setup>
import { computed, ref, onMounted } from 'vue';

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
  }, 15000); // Hide the message after 10 seconds
});
</script>

<template>
  <div class="flex flex-wrap justify-between items-center mt-4 space-y-0">
    <!-- First and Previous Buttons -->
    <div class="flex space-x-2 items-center">
      <!-- First Button -->
      <button
        @click="$emit('firstPage')"
        :disabled="currentPage === 1 || totalPages <= 1"
        class="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50 cursor-pointer">
        <i class="fas fa-angle-double-left"></i>
      </button>

      <!-- Previous Button -->
      <button
        @click="$emit('prevPage')"
        :disabled="currentPage === 1 || totalPages <= 1"
        class="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50 cursor-pointer">
        <i class="fas fa-angle-left"></i>
      </button>
    </div>

    <!-- Page Indicator -->
    <span class="text-center text-sm md:text-base mx-6">
      Seite {{ displayPage }} von {{ displayTotalPages }}
    </span>

    <!-- Next and Last Buttons -->
    <div class="flex space-x-2 items-center">
      <!-- Next Button -->
      <button
        @click="$emit('nextPage')"
        :disabled="currentPage === totalPages || totalPages <= 1"
        class="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50 cursor-pointer">
        <i class="fas fa-angle-right"></i>
      </button>

      <!-- Last Button -->
      <button
        @click="$emit('lastPage')"
        :disabled="currentPage === totalPages || totalPages <= 1"
        class="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50 cursor-pointer">
        <i class="fas fa-angle-double-right"></i>
      </button>
    </div>
  </div>
</template>