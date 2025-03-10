<script setup>
import CustomerSearch from './CustomerSearch.vue';
import BreedSearch from './BreedSearch.vue'; // Import the new BreedSearch component

defineProps({
  dogData: {
    type: Object,
    required: true,
  },
  customers: {
    type: Array,
    required: true,
  },
  showOwnerField: {
    type: Boolean,
    default: true,
  },
  dogs: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['update:dogData']);

const updateField = (key, value) => {
  emit('update:dogData', key, value);
};
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold text-gray-700 mb-2">Hund Informationen</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div class="relative">
        <input
          :value="dogData.name"
          @input="updateField('name', $event.target.value)"
          type="text"
          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
          Name
        </label>
      </div>
      <div class="relative">
        <!-- BreedSearch Component -->
        <BreedSearch
          :dogs="dogs"
          :selectedBreed="dogData.rasse" 
          @selectBreed="(breed) => updateField('rasse', breed)"
        />
      </div>
      <div class="relative">
        <input
          :value="dogData.passNr"
          @input="updateField('passNr', $event.target.value)"
          type="text"
          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
          Impfpass Nummer
        </label>
      </div>
      <div class="relative">
        <input
          :value="dogData.chipNr"
          @input="updateField('chipNr', $event.target.value)"
          type="text"
          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
          Chip Nummer
        </label>
      </div>
      <div :class="{'col-span-2': !showOwnerField}" class="relative">
        <select
          :value="dogData.geschlecht"
          @change="updateField('geschlecht', $event.target.value)"
          class="w-full px-3 py-2 border rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="männlich">Männlich</option>
          <option value="weiblich">Weiblich</option>
        </select>
        <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
          Geschlecht
        </label>
      </div>
      <div v-if="showOwnerField" class="relative">
        <CustomerSearch
          :customers="customers"
          @selectCustomer="(customer) => updateField('ownerId', customer.id)"
        />
      </div>
    </div>
  </div>
</template>