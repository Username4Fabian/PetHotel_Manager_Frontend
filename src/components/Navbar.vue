<script setup>
import { ref } from 'vue';

const menuItems = ref([
  { name: 'Startseite', link: '/' },
  { name: 'Kalender', link: '/calendar' },
  { name: 'Kundenübersicht', link: '/overview' },
  { name: 'Hunde-Datenbank', link: '/dog-view' },
  { name: 'Login', link: '/login' }
]);
</script>

<template>
  <nav class="bg-gray-800 p-4">
    <div class="container mx-auto flex justify-between items-center">
      <div class="text-white text-2xl font-bold">
        <a href="/">Tierhotel Manager</a>
      </div>
      <ul class="flex space-x-4">
        <li v-for="item in menuItems" :key="item.name">
          <a :href="item.link" class="text-white hover:text-gray-400">{{ item.name }}</a>
        </li>
      </ul>
    </div>
  </nav>
</template>