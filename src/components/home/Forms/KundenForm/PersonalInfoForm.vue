<script setup>
import DateInput from '../TerminForm/DateInput.vue';

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
    <h3 class="text-lg font-semibold text-gray-700 mb-2">Persönliche Informationen</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div class="relative">
        <select
          :value="kundenData.anrede"
          @change="updateField('anrede', $event.target.value)"
          class="w-full px-3 py-2 border rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Herr">Herr</option>
          <option value="Frau">Frau</option>
          <option value="Keine Angabe">Keine Angabe</option>
        </select>
        <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
          Anrede
        </label>
      </div>
      <div class="relative">
        <input
          :value="kundenData.firstName"
          @input="updateField('firstName', $event.target.value)"
          type="text"
          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
          Vorname
        </label>
      </div>
      <div class="relative">
        <input
          :value="kundenData.lastName"
          @input="updateField('lastName', $event.target.value)"
          type="text"
          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
          Nachname
        </label>
      </div>
      <div class="relative">
        <DateInput
          v-model="kundenData.geburtsdatum"
          placeholder="TT-MM-JJJJ"
          label="Geburtsdatum"
        />
      </div>
      <div class="relative">
        <input
          :value="kundenData.geburtsort"
          @input="updateField('geburtsort', $event.target.value)"
          type="text"
          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
          Geburtsort
        </label>
      </div>
      <div class="relative">
        <input
          :value="kundenData.ausweisnr"
          @input="updateField('ausweisnr', $event.target.value)"
          type="text"
          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label class="absolute left-3 top-2 text-sm text-gray-500 transition-all duration-200 pointer-events-none">
          Ausweisnummer
        </label>
      </div>
    </div>
  </div>
</template>