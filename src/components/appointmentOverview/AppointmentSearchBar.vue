<script setup>
import { computed } from 'vue';

const props = defineProps({
  searchQuery: String,
  searchProperty: {
    type: String,
    default: 'date_ankunft',
  },
  showAddButton: {
    type: Boolean,
    default: true,
  },
});

const emits = defineEmits(['update:searchQuery', 'update:searchProperty', 'showOverlay']);

const clearSearch = () => {
  emits('update:searchQuery', '');
};

// Dynamically set placeholder text based on the selected search property
const placeholderText = computed(() => {
  switch (props.searchProperty) {
    case 'date_ankunft':
    case 'date_abfahrt':
      return 'z.B. 17 (Tag) oder 03 (Monat) oder 2025 (Jahr) oder 17.03.2025';
    case 'dogName':
      return 'Hundename suchen...';
    case 'kundennummer':
      return 'Kundennummer suchen...';
    default:
      return 'Termin suchen...';
  }
});
</script>

<template>
  <div class="flex items-center mb-4">
    <div class="relative w-full">
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
          :placeholder="placeholderText"
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

    <select
      :value="searchProperty"
      @change="$emit('update:searchProperty', $event.target.value)"
      class="ml-2 p-2 border border-gray-300 rounded"
      style="height: 40px; width: 150px;"
    >
      <option value="customerName">Kundenname</option>
      <option value="kundennummer">Kundennummer</option>
      <option value="dogName">Hundename</option>
      <option value="id">Terminnummer</option>
      <option value="date_ankunft">Ankunft</option>
      <option value="date_abfahrt">Abfahrt</option>
      <option value="bezahlt">Bezahlt</option>
    </select>

    <button
      v-if="showAddButton"
      @click="$emit('showOverlay')"
      class="ml-2 px-4 py-0.5 bg-blue-500 hover:bg-blue-700 text-white rounded self-stretch hover:cursor-pointer hover:scale-102"
    >
      Termin hinzufügen
    </button>
  </div>
</template>