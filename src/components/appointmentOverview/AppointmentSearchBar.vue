<script setup>

const props = defineProps({
  searchQuery: String,
  searchProperty: {
    type: String,
    default: 'date'
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
  <div class="flex items-center mb-4">
    <div class="relative w-full">
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
    </div>
    <select
      :value="searchProperty"
      @change="$emit('update:searchProperty', $event.target.value)"
      class="ml-2 p-2 border border-gray-300 rounded"
      style="height: 40px; width: 120px;">
      <option value="date">Datum</option>
      <option value="customer">Kunde</option>
      <option value="id">Terminnummer</option>
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