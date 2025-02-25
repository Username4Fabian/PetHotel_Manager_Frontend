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
    <h3 class="text-lg font-semibold text-gray-700 mb-2">Zusätzliche Informationen</h3>
    <div class="space-y-3">
      <div class="relative">
        <select
          :value="kundenData.sprache"
          @change="updateField('sprache', $event.target.value)"
          class="w-full px-3 py-2 border rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Deutsch">Deutsch</option>
          <option value="Englisch">Englisch</option>
          <option value="Französisch">Französisch</option>
          <option value="Spanisch">Spanisch</option>
          <option value="Andere">Andere</option>
        </select>
        <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
          Sprache
        </label>
      </div>
      <div class="flex items-center space-x-4">
        <button
          type="button"
          @click="updateField('agbsAkzeptiert', !kundenData.agbsAkzeptiert)"
          :class="{
            'bg-blue-500 text-white': kundenData.agbsAkzeptiert,
            'bg-gray-100 hover:bg-gray-200': !kundenData.agbsAkzeptiert
          }"
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          AGBs akzeptiert
        </button>
        <button
          type="button"
          @click="updateField('noMWST', !kundenData.noMWST)"
          :class="{
            'bg-blue-500 text-white': kundenData.noMWST,
            'bg-gray-100 hover:bg-gray-200': !kundenData.noMWST
          }"
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Keine MWST
        </button>
      </div>
    </div>
  </div>
</template>