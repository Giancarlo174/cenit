import { createRouter, createWebHistory } from 'vue-router'
import CategoriesList from '@/views/categories/CategoriesList.vue'
import ExpensesList from '@/views/expenses/ExpensesList.vue'

const routes = [
  {
    path: '/',
    redirect: '/expenses'
  },
  {
    path: '/categories',
    name: 'CategoriesList',
    component: CategoriesList
  },
  {
    path: '/expenses',
    name: 'ExpensesList',
    component: ExpensesList
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
