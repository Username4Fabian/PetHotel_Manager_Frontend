<script setup>
import { ref, computed, watch } from 'vue';
import '@/assets/styles/forms.css';

const props = defineProps({
  dogs: Array, // Pass the list of dogs as a prop
  selectedBreed: String, // Pass the selected breed for editing
});

const emit = defineEmits(['selectBreed']);

const searchQuery = ref(props.selectedBreed || ''); // Initialize with the selected breed
const showDropdown = ref(false);

// Compute breeds sorted by quantity
const sortedBreeds = computed(() => {
  const breedCounts = {};
  props.dogs.forEach(dog => {
    if (dog.rasse) {
      breedCounts[dog.rasse] = (breedCounts[dog.rasse] || 0) + 1;
    }
  });

  // Convert to an array of { breed, count } objects
  const breedsArray = Object.keys(breedCounts).map(breed => ({
    breed,
    count: breedCounts[breed],
  }));

  // Sort by count in descending order
  breedsArray.sort((a, b) => b.count - a.count);

  return breedsArray;
});

const filteredBreeds = computed(() => {
  if (!searchQuery.value) return sortedBreeds.value;
  return sortedBreeds.value.filter(({ breed }) =>
    breed.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const selectBreed = (breed) => {
  emit('selectBreed', breed);
  searchQuery.value = breed; // Set the search query to the selected breed
  showDropdown.value = false;
};

// Watch for changes in the selected breed and update the search query
watch(
  () => props.selectedBreed,
  (newBreed) => {
    searchQuery.value = newBreed || '';
  }
);

// Watch for changes in the dogs array to update the dropdown
watch(
  () => props.dogs,
  () => {
    // Force re-computation of sortedBreeds and filteredBreeds
  },
  { deep: true }
);

// Allow the user to enter a new breed if it doesn't exist
const handleInputBlur = () => {
  if (searchQuery.value && !sortedBreeds.value.some(({ breed }) => breed === searchQuery.value)) {
    emit('selectBreed', searchQuery.value);
  }
};
</script>

<template>
  <div class="relative">
    <input
      v-model="searchQuery"
      @focus="showDropdown = true"
      @input="showDropdown = true"
      @blur="handleInputBlur"
      type="text"
      class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      required
    />
    <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
      Rasse
    </label>
    <ul v-if="showDropdown && filteredBreeds.length" class="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-40 overflow-y-auto">
      <li
        v-for="{ breed, count } in filteredBreeds"
        :key="breed"
        @click="selectBreed(breed)"
        class="px-4 py-2 cursor-pointer hover:bg-gray-200">
        {{ count }} | {{ breed }} 
      </li>
    </ul>
  </div>
</template>