<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  message: String,
  duration: {
    type: Number,
    default: 4500 // default duration is 4.5 seconds
  }
});

const emits = defineEmits(['close']);

const isVisible = ref(true);

const closeToast = () => {
  isVisible.value = false;
};

onMounted(() => {
  setTimeout(() => {
    isVisible.value = false;
  }, props.duration);
});

watch(isVisible, (newVal) => {
  if (!newVal) {
    emits('close');
  }
});
</script>

<template>
  <div v-if="isVisible" @click="closeToast" :style="{ animationDuration: props.duration + 'ms' }" class="toast fixed top-4 right-4 bg-green-500 text-white p-4 rounded shadow-lg z-50 text-lg md:text-2xl lg:text-3xl max-w-xs md:max-w-sm lg:max-w-md break-words text-center cursor-pointer">
    {{ message }}
  </div>
</template>

<style scoped>
@keyframes popSlideIn {
  0% {
    transform: translateX(100%) scale(0.5);
    opacity: 0;
  }
  60% {
    transform: translateX(0) scale(1.1);
    opacity: 1;
  }
  80% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateX(0) scale(1);
    opacity: 0;
  }
}

.toast {
  animation: popSlideIn 1s cubic-bezier(0.68, -0.55, 0.27, 1.55), fadeOut 1s linear forwards;
}

@keyframes fadeOut {
  0% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>