import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('@/views/case1/index.vue')},
  { path: '/case2', component: () => import('@/views/case2/index.vue')},
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes, 
})
