<script setup>
import { ref, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const menuItems = ref([
  { name: 'Startseite', link: '/' },
  { name: 'Kalender', link: '/calendar' },
  { name: 'Kundenübersicht', link: '/customer-overview' },
  { name: 'Hundeübersicht', link: '/dog-overview' },
  { name: 'Terminübersicht', link: '/appointment-overview' },
  { name: 'Login', link: '/login' }
]);

const isMenuOpen = ref(false);

const router = useRouter();
const route = useRoute();

// Close mobile menu when route changes
watch(
  () => route.path,
  () => {
    isMenuOpen.value = false;
  }
);

// Computed property to highlight the active route
const activeLink = computed(() => route.path);
</script>

<template>
  <nav class="bg-gray-800 p-4">
    <div class="container mx-auto flex justify-between items-center">
      <router-link to="/" class="text-white text-lg font-bold">Tierhotel Manager</router-link>

      <ul class="hidden md:flex space-x-6">
        <li v-for="item in menuItems" :key="item.name">
          <router-link
            :to="item.link"
            class="text-white hover:text-gray-400 transition-colors duration-200"
            :class="{ 'font-bold': activeLink === item.link }"
          >
            {{ item.name }}
          </router-link>
        </li>
      </ul>

      <div class="md:hidden">
        <button
          @click="isMenuOpen = !isMenuOpen"
          class="text-white focus:outline-none"
          aria-label="Toggle Menu"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu (Dropdown) -->
    <transition
      name="slide-fade"
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div v-if="isMenuOpen" class="md:hidden mt-2">
        <ul class="flex flex-col space-y-2">
          <li v-for="item in menuItems" :key="item.name">
            <router-link
              :to="item.link"
              class="text-white hover:text-gray-400 block px-4 py-2 transition-colors duration-200"
              :class="{ 'font-bold': activeLink === item.link }"
            >
              {{ item.name }}
            </router-link>
          </li>
        </ul>
      </div>
    </transition>
  </nav>
</template>

<style scoped>
/* Custom transition for mobile menu */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>