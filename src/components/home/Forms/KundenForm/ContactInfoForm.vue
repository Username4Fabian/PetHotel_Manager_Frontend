<script setup>
defineProps({
  kundenData: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:kundenData']);

const updateField = (key, value) => {
  emit('update:kundenData', key, value);
};
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold text-gray-700 mb-2">Kontaktinformationen</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div class="relative">
        <input
          :value="kundenData.telefonnummer"
          @input="updateField('telefonnummer', $event.target.value)"
          type="text"
          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
          Telefonnummer
        </label>
      </div>
      <div class="relative">
        <input
          :value="kundenData.email"
          @input="updateField('email', $event.target.value)"
          type="email"
          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
          Email
        </label>
      </div>
    </div>
  </div>
</template>