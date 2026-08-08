import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import MaterialView from './views/MaterialView.vue'
import QuizView from './views/QuizView.vue'
import PrintView from './views/PrintView.vue'
import SettingsView from './views/SettingsView.vue'
import DashboardView from './views/DashboardView.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/materials/:standardId', name: 'material', component: MaterialView, props: true },
  { path: '/quiz/:standardId', name: 'quiz', component: QuizView, props: true },
  { path: '/print', name: 'print', component: PrintView },
  { path: '/settings', name: 'settings', component: SettingsView },
  { path: '/dashboard', name: 'dashboard', component: DashboardView },
]

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})
