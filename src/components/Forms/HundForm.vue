<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const dogData = ref({
  name: '',
  rasse: '',
  passNr: '',
  chipNr: '',
  ownerId: null,
  geschlecht: '',
});

const customers = ref([]);
const searchQuery = ref('');
const showDropdown = ref(false);
const imageFile = ref(null);
const imagePreview = ref(null); // For image preview
const showCamera = ref(false);
const videoRef = ref(null);
const canvasRef = ref(null);

const fetchCustomers = async () => {
  try {
    const response = await axios.get('/api/kunde/GetAllKunden');
    customers.value = response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
  }
};

onMounted(() => {
  fetchCustomers();
});

const filteredCustomers = computed(() => {
  if (!searchQuery.value) return [];
  return customers.value.filter(customer =>
    customer.lastName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    customer.firstName.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const selectCustomer = (customer) => {
  dogData.value.ownerId = customer.id;
  searchQuery.value = `${customer.firstName} ${customer.lastName}`;
  showDropdown.value = false;
};

const handleImageChange = (file) => {
  if (file) {
    imageFile.value = file;

    // Create a URL for the image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const handleFileInputChange = (event) => {
  const file = event.target.files[0];
  handleImageChange(file);
};

const handleDrop = (event) => {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  handleImageChange(file);
};

const handleDragOver = (event) => {
  event.preventDefault();
};

const removeImage = () => {
  imageFile.value = null;
  imagePreview.value = null;
};

const handleSubmit = async () => {
  if (!dogData.value.name) {
    alert('Name is required');
    return;
  }

  try {
    const response = await axios.post('/api/dog/saveDog', dogData.value, {
      params: { ownerId: dogData.value.ownerId },
    });
    console.log('Dog created:', response.data);

    if (imageFile.value) {
      const formData = new FormData();
      formData.append('dogId', response.data.dogId);
      formData.append('image', imageFile.value);

      await axios.post('/api/dog/uploadImage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Image uploaded successfully');
    }
  } catch (error) {
    console.error('Error creating dog or uploading image:', error);
  }
};

const startCamera = async () => {
  showCamera.value = true;
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  videoRef.value.srcObject = stream;
  videoRef.value.play();
};

const capturePhoto = () => {
  const context = canvasRef.value.getContext('2d');
  
  // Set canvas dimensions to higher resolution
  const width = 1280; // Desired width
  const height = 720; // Desired height
  canvasRef.value.width = width;
  canvasRef.value.height = height;

  context.drawImage(videoRef.value, 0, 0, width, height);
  canvasRef.value.toBlob((blob) => {
    const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
    handleImageChange(file);
    showCamera.value = false;
    const stream = videoRef.value.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
  });
};
</script>

<template>
  <div class="p-4 bg-white rounded shadow-md">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input v-model="dogData.name" type="text" placeholder="Name" class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        <input v-model="dogData.rasse" type="text" placeholder="Rasse" class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input
          v-model="dogData.passNr"
          type="text"
          placeholder="PassNr"
          class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keydown.enter.prevent="$event.target.nextElementSibling.focus()"
        />
        <input v-model="dogData.chipNr" type="text" placeholder="ChipNr" class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select v-model="dogData.geschlecht" class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="" disabled>Geschlecht</option>
          <option value="männlich">Männlich</option>
          <option value="weiblich">Weiblich</option>
        </select>
        <div class="relative">
          <input
            v-model="searchQuery"
            @focus="showDropdown = true"
            @input="showDropdown = true"
            type="text"
            placeholder="Search Owner"
            class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <ul v-if="showDropdown && filteredCustomers.length" class="absolute z-10 w-full bg-white border rounded shadow-md mt-1">
            <li
              v-for="customer in filteredCustomers"
              :key="customer.id"
              @click="selectCustomer(customer)"
              class="px-4 py-2 cursor-pointer hover:bg-gray-200"
            >
              {{ customer.firstName }} {{ customer.lastName }}
            </li>
          </ul>
        </div>
      <!-- File Upload Field -->
      <div class="col-span-full relative">
        <label class="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
        <div
          @drop="handleDrop"
          @dragover="handleDragOver"
          class="flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors relative">
          <input type="file" @change="handleFileInputChange" class="hidden" accept="image/*" id="file-upload" />
          <label for="file-upload" class="text-center">
            <template v-if="!imagePreview">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
              </svg>
              <p class="mt-1 text-sm text-gray-600">Click to upload or drag and drop</p>
              <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </template>
            <template v-else>
              <div class="relative">
                <img :src="imagePreview" alt="Image Preview" class="w-40 h-32 object-cover rounded" />
              </div>
            </template>
          </label>
        </div>
        <button
          v-if="imagePreview"
          @click="removeImage"
          type="button"
          class="absolute top-7 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
          ×
        </button>
        <button
          @click="startCamera"
          type="button"
          class="mt-2 w-full px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">
          Take Photo
        </button>
        <div v-if="showCamera" class="mt-4">
          <video ref="videoRef" class="w-full rounded"></video>
          <button
            @click="capturePhoto"
            type="button"
            class="mt-2 w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Capture Photo
          </button>
          <canvas ref="canvasRef" class="hidden"></canvas>
        </div>
      </div>
      </div>
      <button type="submit" class="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
        Speichern
      </button>
    </form>
  </div>
</template>