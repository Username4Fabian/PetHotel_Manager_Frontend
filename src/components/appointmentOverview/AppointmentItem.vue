<script setup>
import { ref } from 'vue';

const props = defineProps({
  appointment: {
    type: Object,
    required: true,
    default: () => ({
      date: '',
      customer: '',
      dogs: [],
      notes: '',
      paid: false,
    }),
  },
  actionType: {
    type: String,
    default: 'delete',
  },
});

const emits = defineEmits(['appointmentDeleted', 'appointmentUpdated', 'editAppointment']);

const showDetails = ref(false);

const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};

const confirmDeleteAppointment = () => {
  const confirmationMessage = `Sind Sie sicher, dass Sie den Termin am ${props.appointment.date} löschen möchten?\n\nDiese Aktion kann nicht rückgängig gemacht werden.`;
  if (window.confirm(confirmationMessage)) {
    emits('appointmentDeleted', props.appointment);
  }
};

const handleUpdateAppointment = (updatedAppointment) => {
  emits('appointmentUpdated', updatedAppointment);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(hours, minutes);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>

<template>
  <div
    class="p-4 bg-white shadow-md rounded-lg transition-all duration-300 hover:shadow-lg cursor-pointer"
    @click="toggleDetails">
    <!-- Main Info Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div class="flex flex-col mb-4 md:mb-0">
        <h2 class="text-lg md:text-xl font-semibold text-gray-800">
          {{ appointment.kunde?.firstName }} {{ appointment.kunde?.lastName }}
        </h2>
        <p class="text-sm text-gray-600">
          <strong>Hunde: </strong>
          <span v-if="appointment.dogs.length">
            {{ appointment.dogs.map(dog => dog.name).join(', ') }}
          </span>
          <span v-else>---</span>
        </p>
        <p class="text-sm text-gray-600">
          <strong>Ankunft: </strong> {{ formatDate(appointment.date_ankunft) }} {{ formatTime(appointment.time_ankunft) }}
        </p>
        <p class="text-sm text-gray-600">
          <strong>Abfahrt: </strong> {{ formatDate(appointment.date_abfahrt) }} {{ formatTime(appointment.time_abfahrt) }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-4 mt-4 md:mt-0 justify-end w-full md:w-auto">
        <button
          @click.stop="emits('editAppointment', appointment)"
          class="text-gray-500 hover:text-red-600 transition-colors duration-200 text-3xl md:text-3xl hover:cursor-pointer p-2 rounded-full">
          <i class="fas fa-edit"></i>
        </button>
        <button
          v-if="actionType === 'delete'"
          @click.stop="confirmDeleteAppointment"
          class="text-gray-500 hover:text-red-600 transition-colors duration-200 text-3xl md:text-3xl hover:cursor-pointer p-2 rounded-full">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    </div>

    <!-- Arrow indicator for expand/collapse -->
    <div class="flex justify-center mt-2">
      <i
        class="fas text-gray-500 transition-transform duration-300"
        :class="showDetails ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
    </div>

    <!-- Details Section -->
    <div v-if="showDetails" class="text-gray-700 mt-4 space-y-2">
      <h3 class="text-lg font-semibold text-gray-800">Weitere Informationen</h3>
      <p class="text-sm text-gray-600"><strong>Notizen: </strong> {{ appointment.anmerkung || '---' }}</p>
      <p class="text-sm text-gray-600"><strong>Bezahlt: </strong> {{ appointment.bezahlt ? 'Ja' : 'Nein' }}</p>
    </div>
  </div>
</template>