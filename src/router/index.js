import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('../views/Calendar.vue'),
    },
    {
      path: '/customer-overview',
      name: 'customer-overview',
      component: () => import('../views/CustomerOverview.vue'),
    },
    {
      path: '/dog-overview',
      name: 'dog-overview',
      component: () => import('../views/DogOverview.vue'),
    },
    {
      path: '/appointment-overview',
      name: 'appointment-overview',
      component: () => import('../views/AppointmentOverview.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
    }
  ],
})

export default router
