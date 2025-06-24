import { createRouter, createWebHistory } from 'vue-router'
import MapView from '../views/MapView.vue'
import AdminLogin from '../views/AdminLogin.vue'
import AdminPanel from '../views/AdminPanel.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/map'
    },
    {
      path: '/map',
      name: 'map',
      component: MapView
    },
    {
      path: '/admin-login',
      name: 'admin-login',
      component: AdminLogin
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminPanel
    }
  ]
})

export default router 