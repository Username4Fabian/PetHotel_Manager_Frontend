<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import '@/assets/styles/forms.css';

const props = defineProps({
  selectedBreed: String, // Pass the selected breed for editing
});

const emit = defineEmits(['update:modelValue']);

const searchQuery = ref(props.selectedBreed || ''); // Initialize with the selected breed
const showDropdown = ref(false);
const breeds = ref([]);

const fetchBreeds = async () => {
  const fetchInterval = 2 * 60 * 1000; // 2 minutes in milliseconds
  const cachedBreeds = localStorage.getItem('breeds');
  const lastFetchTimeBreeds = localStorage.getItem('breeds_lastFetchTime');
  const now = Date.now();

  if (cachedBreeds && lastFetchTimeBreeds && (now - lastFetchTimeBreeds < fetchInterval)) {
    breeds.value = JSON.parse(cachedBreeds);
  } else {
    try {
      const response = await axios.get('/api/dog/GetAllBreeds');
      breeds.value = response.data.map(breed => ({ breed }));
      localStorage.setItem('breeds', JSON.stringify(breeds.value));
      localStorage.setItem('breeds_lastFetchTime', now.toString());
    } catch (error) {
      console.error('Error fetching breeds:', error);
    }
  }
};

const filteredBreeds = computed(() => {
  if (!searchQuery.value) return breeds.value;
  return breeds.value.filter(({ breed }) =>
    breed.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const selectBreed = async (breed) => {
  emit('update:modelValue', breed);
  searchQuery.value = breed; // Set the search query to the selected breed
  showDropdown.value = false;

  // Check if the breed exists in the list, if not, add it to the list and update local storage
  if (!breeds.value.some(b => b.breed === breed)) {
    breeds.value.push({ breed: breed }); // Ensure the breed property is correctly set
    localStorage.setItem('breeds', JSON.stringify(breeds.value));

    // Save the new breed to the database
    try {
      await axios.post('/api/dog/AddBreed', { breed });
    } catch (error) {
      console.error('Error saving breed to the database:', error);
    }
  }
};

// Emit the custom breed value whenever the input changes
const handleInput = (event) => {
  const value = event.target.value;
  searchQuery.value = value;
  emit('update:modelValue', value); // Emit the custom breed value
};

// Watch for changes in the selected breed and update the search query
watch(
  () => props.selectedBreed,
  (newBreed) => {
    searchQuery.value = newBreed || '';
  }
);

onMounted(() => {
  fetchBreeds();
});
</script>

<template>
  <div class="relative">
    <input
      :value="searchQuery"
      @input="handleInput"
      @focus="showDropdown = true"
      @blur="showDropdown = false"
      type="text"
      class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      required
    />
    <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
      Rasse
    </label>
    <ul v-if="showDropdown && filteredBreeds.length" class="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-40 overflow-y-auto">
      <li
        v-for="{ breed } in filteredBreeds"
        :key="breed"
        @mousedown.prevent="selectBreed(breed)"
        class="px-4 py-2 cursor-pointer hover:bg-gray-200">
        {{ breed }}
      </li>
    </ul>
  </div>
</template>