<script setup>
import { ref, computed, watch } from 'vue';
import '@/assets/styles/forms.css';

const props = defineProps({
  customers: Array,
  initialCustomer: Object,
});

const emit = defineEmits(['selectCustomer']);

const searchQuery = ref('');
const showDropdown = ref(false);

// Watch for changes in initialCustomer and set searchQuery accordingly
watch(
  () => props.initialCustomer,
  (newCustomer) => {
    if (newCustomer) {
      console.log('Initial customer set:', newCustomer);
      const trimmedFirstName = newCustomer.firstName ? newCustomer.firstName.trim() : '';
      const trimmedLastName = newCustomer.lastName ? newCustomer.lastName.trim() : '';
      searchQuery.value = trimmedFirstName ? `${trimmedFirstName} ${trimmedLastName}` : trimmedLastName;
      console.log('Emitting selectCustomer event:', newCustomer);
      emit('selectCustomer', newCustomer); // Emit the selectCustomer event
    }
  },
  { immediate: true }
);

const filteredCustomers = computed(() => {
  if (!searchQuery.value) return [];
  return props.customers.filter(customer => {
    if (!customer || !customer.id || !customer.lastName) return false;
    const searchValue = searchQuery.value.toLowerCase().trim();
    const customerName = customer.firstName 
      ? `${customer.firstName.trim()} ${customer.lastName.trim()}`.toLowerCase()
      : customer.lastName.trim().toLowerCase();
    return (
      customer.id.toString().includes(searchValue) ||
      customerName.includes(searchValue)
    );
  });
});

const selectCustomer = (customer) => {
  console.log('Customer selected:', customer);
  const trimmedFirstName = customer.firstName ? customer.firstName.trim() : '';
  const trimmedLastName = customer.lastName ? customer.lastName.trim() : '';
  emit('selectCustomer', customer);
  searchQuery.value = trimmedFirstName ? `${trimmedFirstName} ${trimmedLastName}` : trimmedLastName;
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
        {{customer.id}} | {{ customer.firstName ? customer.firstName.trim() + ' ' : '' }}{{ customer.lastName.trim() }}
      </li>
    </ul>
  </div>
</template>