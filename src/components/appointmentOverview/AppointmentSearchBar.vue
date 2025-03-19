<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  searchQuery: String,
  searchProperty: {
    type: String,
    default: 'date',
  },
  showAddButton: {
    type: Boolean,
    default: true,
  },
});

const emits = defineEmits(['update:searchQuery', 'update:searchProperty', 'showOverlay', 'update:dateSearchType']);

const dateSearchType = ref('datum'); // Default to 'datum'

const clearSearch = () => {
  emits('update:searchQuery', '');
};

// Watch for changes in searchProperty and reset searchQuery
watch(() => props.searchProperty, () => {
  emits('update:searchQuery', '');
});

// Emit the dateSearchType when it changes
watch(dateSearchType, (newValue) => {
  emits('update:dateSearchType', newValue);
});
</script>

<template>
  <div class="flex items-center mb-4">
    <div class="relative w-full">
      <!-- Show input or dropdown based on searchProperty -->
      <template v-if="searchProperty === 'bezahlt'">
        <select
          :value="searchQuery"
          @change="$emit('update:searchQuery', $event.target.value)"
          class="p-2 border border-gray-300 rounded w-full"
        >
          <option value="">Bezahlt (Alle)</option>
          <option value="ja">Ja</option>
          <option value="nein">Nein</option>
        </select>
      </template>
      <template v-else>
        <input
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          type="text"
          placeholder="Termin suchen..."
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

    <!-- New dropdown for date search type (only shown for Ankunft/Abfahrt) -->
    <select
      v-if="searchProperty === 'date_ankunft' || searchProperty === 'date_abfahrt'"
      v-model="dateSearchType"
      class="ml-2 p-2 border border-gray-300 rounded"
      style="height: 40px; width: 120px;"
    >
      <option value="datum">Datum</option>
      <option value="tag">Tag</option>
      <option value="monat">Monat</option>
      <option value="jahr">Jahr</option>
    </select>

    <!-- Existing dropdown for search property -->
    <select
      :value="searchProperty"
      @change="$emit('update:searchProperty', $event.target.value)"
      class="ml-2 p-2 border border-gray-300 rounded"
      style="height: 40px; width: 150px;"
    >
      <option value="customerName">Kundenname</option>
      <option value="date_ankunft">Ankunft</option>
      <option value="date_abfahrt">Abfahrt</option>
      <option value="bezahlt">Bezahlt</option>
      <option value="id">Terminnummer</option>
    </select>

    <!-- Add appointment button -->
    <button
      v-if="showAddButton"
      @click="$emit('showOverlay')"
      class="ml-2 px-4 py-0.5 bg-blue-500 hover:bg-blue-700 text-white rounded self-stretch hover:cursor-pointer hover:scale-102"
    >
      Termin hinzufügen
    </button>
  </div>
</template>