import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/dashboard/Dashboard.vue'
import CategoriesList from '@/views/categories/CategoriesList.vue'
import ExpensesList from '@/views/expenses/ExpensesList.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
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
