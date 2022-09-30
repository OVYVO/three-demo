import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('@/views/case1/index.vue')},
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes, 
})
