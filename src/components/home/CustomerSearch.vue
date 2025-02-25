<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  customers: Array,
});

const emit = defineEmits(['selectCustomer']);

const searchQuery = ref('');
const showDropdown = ref(false);

const filteredCustomers = computed(() => {
  if (!searchQuery.value) return [];
  return props.customers.filter(customer =>
    customer.lastName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    customer.firstName.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const selectCustomer = (customer) => {
  emit('selectCustomer', customer);
  searchQuery.value = `${customer.firstName} ${customer.lastName}`;
  showDropdown.value = false;
};
</script>

<template>
  <div class="relative">
    <input
      v-model="searchQuery"
      @focus="showDropdown = true"
      @input="showDropdown = true"
      type="text"
      class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      required
    />
    <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
      Besitzer suchen
    </label>
    <ul v-if="showDropdown && filteredCustomers.length" class="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-40 overflow-y-auto">
      <li
        v-for="customer in filteredCustomers"
        :key="customer.id"
        @click="selectCustomer(customer)"
        class="px-4 py-2 cursor-pointer hover:bg-gray-200"
      >
        {{ customer.firstName }} {{ customer.lastName }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* Floating Label Animation */
.relative input:focus + label,
.relative input:not(:placeholder-shown) + label {
  top: -0.5rem;
  left: 0.75rem;
  font-size: 0.75rem;
  color: #3b82f6; /* Blue-500 */
  background-color: white;
  padding: 0 0.25rem;
}
</style>