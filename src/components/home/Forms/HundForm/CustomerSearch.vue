<script setup>
import { ref, computed } from 'vue';
import '@/assets/styles/forms.css';

const props = defineProps({
  customers: Array,
});

const emit = defineEmits(['selectCustomer']);

const searchQuery = ref('');
const showDropdown = ref(false);

const filteredCustomers = computed(() => {
  if (!searchQuery.value) return [];
  return props.customers.filter(customer => {
    if (!customer || !customer.id || !customer.lastName) return false;
    const searchValue = searchQuery.value.toLowerCase();
    return (
      customer.id.toString().includes(searchValue) ||
      customer.lastName.toLowerCase().includes(searchValue) ||
      (customer.firstName && customer.firstName.toLowerCase().includes(searchValue))
    );
  });
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
        class="px-4 py-2 cursor-pointer hover:bg-gray-200">
        {{customer.id}} | {{ customer.firstName }} {{ customer.lastName }}
      </li>
    </ul>
  </div>
</template>