<script setup>
import { defineEmits } from 'vue';

const props = defineProps({
  searchQuery: String,
  searchProperty: {
    type: String,
    default: 'name'
  },
  showAddButton: {
    type: Boolean,
    default: true
  }
});

const emits = defineEmits(['update:searchQuery', 'update:searchProperty', 'showOverlay']);

const clearSearch = () => {
  emits('update:searchQuery', '');
};
</script>

<template>
  <div class="flex flex-col md:flex-row items-center mb-4 space-y-2 md:space-y-0 md:space-x-2">
    <div class="relative w-full">
      <input
        :value="searchQuery"
        @input="$emit('update:searchQuery', $event.target.value)"
        type="text"
        placeholder="Hund suchen..."
        class="p-2 border border-gray-300 rounded w-full"
      />
      <button
        v-if="searchQuery"
        @click="clearSearch"
        class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-3xl"
      >
        &times;
      </button>
    </div>
    <select
      :value="searchProperty"
      @change="$emit('update:searchProperty', $event.target.value)"
      class="p-2 border border-gray-300 rounded w-full md:w-auto"
    >
      <option value="name">Name</option>
      <option value="rasse">Rasse</option>
      <option value="id">Hundennummer</option>
      <option value="ownerId">Kundennummer</option>
      <option value="ownerName">Kundenname</option> <!-- New option -->
      <option value="chipNr">Chipnummer</option> <!-- New option -->
    </select>
    <button
      v-if="showAddButton"
      @click="$emit('showOverlay')"
      class="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded w-full md:w-auto"
    >
      Hund hinzufügen
    </button>
  </div>
</template>