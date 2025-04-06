<script setup>
import { ref, onMounted } from 'vue';
import TerminForm from '@/components/home/Forms/TerminForm.vue';
import KundenForm from '@/components/home/Forms/KundenForm.vue';
import HundForm from '@/components/home/Forms/HundForm.vue';
import Toast from '@/components/Toast.vue';

const showForm = ref(false);
const formType = ref('');
const backgroundImageUrl = ref('https://tierhotelmanager.b-cdn.net/tierhotel-manager/Page_Images/MainBg-2.svg');
const showToast = ref(false);
const toastMessage = ref('');

const handleButtonClick = (type) => {
  formType.value = type;
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
};

const handleSuccess = (message) => {
  toastMessage.value = message;
  showToast.value = true;
};

const closeToast = () => {
  showToast.value = false;
};

const addAppointment = (newAppointment) => {
  console.log('Appointment added:', newAppointment);

  // Retrieve all dogs from localStorage
  const allDogs = JSON.parse(localStorage.getItem('dogs')) || [];

  // Populate the dogs array based on dogIds
  newAppointment.dogs = allDogs.filter(dog => newAppointment.dogIds?.includes(dog.id)) || [];

  // Retrieve existing appointments from localStorage
  const existingAppointments = JSON.parse(localStorage.getItem('appointments')) || [];

  // Add the new appointment to the list
  existingAppointments.push(newAppointment);

  // Save the updated list back to localStorage
  localStorage.setItem('appointments', JSON.stringify(existingAppointments));

  handleSuccess('Termin erfolgreich hinzugefügt!');
  closeForm(); // Close the form after adding the appointment
};

onMounted(async () => {
  // Preload background image
  try {
    const response = await fetch(backgroundImageUrl.value);
    if (!response.ok) {
      console.error('Failed to preload background image:', response.statusText);
    }
  } catch (error) {
    console.error('Error preloading background image:', error);
  }
});
</script>

<template>
  <div class="relative flex flex-col items-center justify-center min-h-screen p-4 bg-cover bg-center" :style="{ backgroundImage: `url(${backgroundImageUrl})` }">
    <div class="absolute inset-0 bg-white bg-opacity-50 rounded-2xl w-11/12 md:w-11/20 h-5/6 md:h-5/9 m-auto"></div>
    <div class="relative z-10 flex flex-col items-center justify-center w-full h-full space-y-4 p-4 md:p-40">
      <h1 class="text-5xl md:text-7xl text-center md:mt-0 -mt-30 mb-15 md:mb-25 font-pacifico bg-gradient-to-r from-lime-900 to-emerald-700 bg-clip-text text-transparent drop-shadow-2xl">
        Willkommen <br> 
        <span class="text-3xl md:text-5xl">zum Tierhotel Manager</span>
      </h1>
      <div class="space-y-4 mb-4 w-full flex flex-col items-center">
        <button @click="handleButtonClick('termin')" class="w-full max-w-xs md:max-w-md lg:max-w-lg p-2 md:p-4 bg-blue-500 hover:bg-blue-600 text-white text-lg md:text-xl lg:text-2xl rounded hover:scale-102 hover:cursor-pointer">
          Neuen Termin anlegen
        </button>
        <button @click="handleButtonClick('hund')" class="w-full max-w-xs md:max-w-md lg:max-w-lg p-2 md:p-4 bg-yellow-500 hover:bg-yellow-600 text-white text-lg md:text-xl lg:text-2xl rounded hover:scale-102 hover:cursor-pointer">
          Neuen Hund anlegen
        </button>
        <button @click="handleButtonClick('kunden')" class="w-full max-w-xs md:max-w-md lg:max-w-lg p-2 md:p-4 bg-green-500 hover:bg-green-600 text-white text-lg md:text-xl lg:text-2xl rounded hover:scale-102 hover:cursor-pointer">
          Neuen Kunden anlegen
        </button>
      </div>

      <div v-if="showForm" class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
        <div class="relative w-full max-w-lg p-4 bg-white rounded shadow-lg max-h-full overflow-y-auto">
          <button @click="closeForm" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-4xl hover:cursor-pointer hover:scale-102">
            &times;
          </button>
          <h2 class="text-xl font-bold mb-4">
            {{ formType === 'termin' ? 'Neuen Termin anlegen' : formType === 'hund' ? 'Neuen Hund anlegen' : 'Neuen Kunden anlegen' }}
          </h2>
          <component 
            :is="formType === 'termin' ? TerminForm : formType === 'hund' ? HundForm : KundenForm" 
            @addAppointment="addAppointment" 
            @show-toast="handleSuccess" 
            @closeOverlay="closeForm" 
          />
        </div>
      </div>
    </div>
    <Toast v-if="showToast" :message="toastMessage" @close="closeToast" />
  </div>
</template>

<style scoped>
.bg-cover {
  background-size: cover;
}
.bg-center {
  background-position: center;
}
.absolute {
  position: absolute;
}
.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
.bg-opacity-50 {
  background-color: rgba(255, 255, 255, 0.5);
}
</style>