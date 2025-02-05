<script setup>
import { ref } from 'vue';
import axios from 'axios';

const kundenData = ref({
  anrede: '',
  firstName: '',
  lastName: '',
  straße: '',
  plz: '',
  ort: '',
  telefonnummer: '',
  email: '',
  ausweisnr: '',
  geburtsdatum: '',
  geburtsort: '',
  sprache: 'Deutsch',
  agbsAkzeptiert: false,
  noMWST: false
});

const handleSubmit = async () => {
  if (!kundenData.value.lastName) {
    alert('Nachname is required');
    return;
  }

  try {
    const response = await axios.post('/api/kunde/CreateNewKunde', kundenData.value);
    console.log('Kunde created:', response.data);
  } catch (error) {
    console.error('Error creating Kunde:', error);
  }
};
</script>

<template>
  <div class="p-4 bg-white rounded shadow-md">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select v-model="kundenData.anrede" class="w-full px-4 py-2 border rounded">
          <option value="" disabled>Anrede</option>
          <option value="Herr">Herr</option>
          <option value="Frau">Frau</option>
          <option value="Keine Angabe">Keine Angabe</option>
        </select>
        <input v-model="kundenData.firstName" type="text" placeholder="Vorname" class="w-full px-4 py-2 border rounded" />
        <input v-model="kundenData.lastName" type="text" placeholder="Nachname" class="w-full px-4 py-2 border rounded" required />
        <input v-model="kundenData.straße" type="text" placeholder="Straße" class="w-full px-4 py-2 border rounded" />
        <input v-model="kundenData.plz" type="text" placeholder="PLZ" class="w-full px-4 py-2 border rounded" @input="kundenData.plz = kundenData.plz.replace(/\D/g, '')" />
        <input v-model="kundenData.ort" type="text" placeholder="Ort" class="w-full px-4 py-2 border rounded" />
        <input v-model="kundenData.telefonnummer" type="text" placeholder="Telefonnummer" class="w-full px-4 py-2 border rounded" @input="kundenData.telefonnummer = kundenData.telefonnummer.replace(/\s/g, '').replace('+', '0')" />
        <input v-model="kundenData.email" type="email" placeholder="Email" class="w-full px-4 py-2 border rounded" />
        <input v-model="kundenData.ausweisnr" type="text" placeholder="Ausweisnummer" class="w-full px-4 py-2 border rounded" />
        <input v-model="kundenData.geburtsdatum" type="date" placeholder="Geburtsdatum" class="w-full px-4 py-2 border rounded" />
        <input v-model="kundenData.geburtsort" type="text" placeholder="Geburtsort" class="w-full px-4 py-2 border rounded" />
        <div class="relative">
          <select v-model="kundenData.sprache" class="w-full px-4 py-2 border rounded">
            <option value="" disabled>Sprache</option>
            <option value="Deutsch">Deutsch</option>
            <option value="Englisch">Englisch</option>
            <option value="Französisch">Französisch</option>
            <option value="Spanisch">Spanisch</option>
            <option value="Andere">Andere</option>
          </select>
          <input v-if="kundenData.sprache === 'Andere'" v-model="kundenData.sprache" type="text" placeholder="Sprache" class="w-full px-4 py-2 border rounded mt-2" />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <label class="flex items-center">
          <input v-model="kundenData.agbsAkzeptiert" type="checkbox" class="mr-2" />
          AGBs akzeptiert
        </label>
        <label class="flex items-center">
          <input v-model="kundenData.noMWST" type="checkbox" class="mr-2" />
          Keine MWST
        </label>
      </div>
      <button type="submit" class="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700">
        Speichern
      </button>
    </form>
  </div>
</template>