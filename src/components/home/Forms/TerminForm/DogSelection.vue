<script setup>
import { computed } from 'vue';

const props = defineProps({
  dogs: Array,
  selectedDogIds: Array,
});

const emit = defineEmits(['update:selectedDogIds']);

const toggleDogSelection = (dogId) => {
  const updatedDogIds = props.selectedDogIds.includes(dogId)
    ? props.selectedDogIds.filter(id => id !== dogId)
    : [...props.selectedDogIds, dogId];
  emit('update:selectedDogIds', updatedDogIds);
};
</script>

<template>
  <div>
    <label class="block text-sm font-medium text-gray-500 mb-2">Hunde auswählen</label>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
      <div
        v-for="dog in dogs"
        :key="dog.id"
        @click="toggleDogSelection(dog.id)"
        :class="{
          'bg-blue-500 text-white': selectedDogIds.includes(dog.id),
          'bg-gray-100 hover:bg-gray-200': !selectedDogIds.includes(dog.id)
        }"
        class="p-2 rounded cursor-pointer text-center transition-all duration-200"
      >
        {{ dog.name }}
      </div>
    </div>
  </div>
</template>