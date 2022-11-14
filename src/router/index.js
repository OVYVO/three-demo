import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('@/views/case1/index.vue')},
  { path: '/case2', component: () => import('@/views/case2/index.vue')},
  { path: '/case3', component: () => import('@/views/case3/index.vue')},
  { path: '/case4', component: () => import('@/views/case4/index.vue')},
  { path: '/case5', component: () => import('@/views/case5/index.vue')}
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes, 
})
