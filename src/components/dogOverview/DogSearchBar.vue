<script setup>
import { defineEmits, ref, watch } from 'vue';

const props = defineProps({
  searchQuery: String,
  searchProperty: {
    type: String,
    default: 'name',
  },
  showAddButton: {
    type: Boolean,
    default: true,
  },
  tierarten: {
    type: Array,
    default: () => ['Hund', 'Katze', 'Käfigtier'], // Default Tierarten
  },
});

const emits = defineEmits(['update:searchQuery', 'update:searchProperty', 'showOverlay']);

const selectedTierart = ref(props.searchQuery); // For Tierart dropdown

// Watch for changes in searchProperty and reset searchQuery if necessary
watch(
  () => props.searchProperty,
  (newProperty) => {
    if (newProperty !== 'tierart') {
      emits('update:searchQuery', ''); // Clear searchQuery if not searching by Tierart
    }
  }
);

const clearSearch = () => {
  emits('update:searchQuery', '');
};
</script>

<template>
  <div class="flex flex-col md:flex-row items-center mb-4 space-y-2 md:space-y-0 md:space-x-2">
    <!-- Search Input or Tierart Dropdown -->
    <div class="relative w-full">
      <template v-if="searchProperty === 'tierart'">
        <select
          v-model="selectedTierart"
          @change="$emit('update:searchQuery', selectedTierart)"
          class="p-2 border border-gray-300 rounded w-full"
        >
          <option value="">Alle Tierarten</option>
          <option v-for="tierart in tierarten" :key="tierart" :value="tierart">
            {{ tierart }}
          </option>
        </select>
      </template>
      <template v-else>
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
      </template>
    </div>

    <!-- Search Property Dropdown -->
    <select
      :value="searchProperty"
      @change="$emit('update:searchProperty', $event.target.value)"
      class="p-2 border border-gray-300 rounded w-full md:w-auto"
    >
      <option value="name">Name</option>
      <option value="rasse">Rasse</option>
      <option value="id">Hundennummer</option>
      <option value="ownerId">Kundennummer</option>
      <option value="ownerName">Kundenname</option>
      <option value="chipNr">Chipnummer</option>
      <option value="tierart">Tierart</option> <!-- New option -->
    </select>

    <!-- Add Dog Button -->
    <button
      v-if="showAddButton"
      @click="$emit('showOverlay')"
      class="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded w-full md:w-auto"
    >
      Hund hinzufügen
    </button>
  </div>
</template>