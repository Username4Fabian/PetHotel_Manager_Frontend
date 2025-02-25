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
    <h3 class="text-lg font-semibold text-gray-700 mb-2">Adresse</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div class="relative">
        <input
          :value="kundenData.straße"
          @input="updateField('straße', $event.target.value)"
          type="text"
          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
          Straße
        </label>
      </div>
      <div class="relative">
        <input
          :value="kundenData.plz"
          @input="updateField('plz', $event.target.value.replace(/\D/g, ''))"
          type="text"
          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
          PLZ
        </label>
      </div>
    </div>
    <div class="relative mt-3">
      <input
        :value="kundenData.ort"
        @input="updateField('ort', $event.target.value)"
        type="text"
        class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
        Ort
      </label>
    </div>
  </div>
</template>