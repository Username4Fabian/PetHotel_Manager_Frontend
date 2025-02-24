<script setup>
  import { ref } from 'vue';
  
  const emit = defineEmits(['imageChange']);
  
  const imageFile = ref(null);
  const imagePreview = ref(null);
  const showCamera = ref(false);
  const videoRef = ref(null);
  const canvasRef = ref(null);
  
  const handleImageChange = (file) => {
    if (file) {
      imageFile.value = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.value = e.target.result;
      };
      reader.readAsDataURL(file);
      emit('imageChange', file);
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
    emit('imageChange', null);
  };
  
  const startCamera = async () => {
  showCamera.value = true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true
    });
    videoRef.value.srcObject = stream;
    videoRef.value.play();
    console.log('videoRef:', videoRef.value);
  } catch (error) {
    console.error('Error accessing camera:', error);
    showCamera.value = false;
    alert('Unable to access camera. Please check your device settings.');
  }
};

const capturePhoto = () => {
  console.log('capturePhoto called');
  console.log('videoRef:', videoRef.value);
  console.log('canvasRef:', canvasRef.value);
  const context = canvasRef.value.getContext('2d');
  const width = 1280;
  const height = 720;
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
    <div class="relative">
      <label class="block text-sm font-medium text-gray-700 mb-1">Bild hochladen:</label>
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
            <p class="mt-1 text-sm text-gray-600">Hier klicken um ein Bild hochzuladen</p>
            <p class="text-xs text-gray-500">PNG, JPG, GIF bis zu 10MB</p>
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
        Foto jetzt aufnehmen
      </button>
      <div v-if="showCamera" class="mt-4 relative">
        <video ref="videoRef" class="w-full rounded"></video>
        <button
          @click="capturePhoto"
          type="button"
          class="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white border-4 border-gray-300 rounded-full flex items-center justify-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v.01M12 19v.01M5 12h.01M19 12h.01M16.24 7.76l-.01-.01M7.76 16.24l-.01-.01M16.24 16.24l-.01-.01M7.76 7.76l-.01-.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
          </svg>
        </button>
        <canvas ref="canvasRef" class="hidden"></canvas>
      </div>
    </div>
  </template>