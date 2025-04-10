<script setup>
import CustomerSearch from './CustomerSearch.vue';
import BreedSearch from './BreedSearch.vue';

defineProps({
  dogData: {
    type: Object,
    required: true,
  },
  customers: {
    type: Array,
    required: true,
  },
  breeds: {
    type: Array,
    required: true,
  },
  showOwnerField: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:dogData']);

const updateField = (key, value) => {
  emit('update:dogData', key, value);
};


// Handle breed updates from BreedSearch
const handleBreedUpdate = (value) => {
  updateField('rasse', value); // Update the rasse field in dogData
};
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold text-gray-700 mb-4">Hund Informationen</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Name Field -->
      <div class="relative">
        <input
          :value="dogData.name"
          @input="updateField('name', $event.target.value)"
          type="text"
          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 peer"
          required
        />
        <label
          class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500"
        >
          Name
        </label>
      </div>

      <!-- Breed Field -->
      <div class="relative">
        <BreedSearch
          :selectedBreed="dogData.rasse"
          @update:modelValue="handleBreedUpdate"
        />
      </div>

      <!-- Impfpass Nummer Field -->
      <div class="relative">
        <input
          :value="dogData.passNr"
          @input="updateField('passNr', $event.target.value)"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 peer"
        />
        <label
          class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500"
        >
          Impfpass Nummer
        </label>
      </div>

      <!-- Chip Nummer Field -->
      <div class="relative">
        <input
          :value="dogData.chipNr"
          @input="updateField('chipNr', $event.target.value)"
          type="text"
          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 peer"
        />
        <label
          class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500"
        >
          Chip Nummer
        </label>
      </div>

      <!-- Geschlecht Field -->
      <div :class="{'md:col-span-2': !showOwnerField}" class="relative md:col-span-2">
        <select
          :value="dogData.geschlecht"
          @change="updateField('geschlecht', $event.target.value)"
          class="w-full px-3 py-2 border rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 peer"
        >
          <option value="männlich">Männlich</option>
          <option value="weiblich">Weiblich</option>
        </select>
        <label
          class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500"
        >
          Geschlecht
        </label>
      </div>

      <!-- Owner Field -->
      <div v-if="showOwnerField" class="relative md:col-span-2">
        <CustomerSearch
          :customers="customers"
          @selectCustomer="(customer) => updateField('ownerId', customer.id)"
        />
      </div>

      <!-- Tierart Field -->
      <div class="relative md:col-span-2">
        <select
          :value="dogData.tierart || 'Hund'"
          @change="updateField('tierart', $event.target.value)"
          class="w-full px-3 py-2 border rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 peer"
        >
          <option value="Hund">Hund</option>
          <option value="Katze">Katze</option>
          <option value="Käfigtier">Käfigtier</option>
        </select>
        <label
          class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500"
        >
          Tierart
        </label>
      </div>
      <!-- Medikamente Field -->
      <div class="relative md:col-span-2">
        <input
          :value="dogData.medikamente"
          @input="updateField('medikamente', $event.target.value)"
          type="text"
          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 peer"
        />
        <label
          class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500"
        >
          Medikamente
        </label>
      </div>
    </div>
  </div>
</template>