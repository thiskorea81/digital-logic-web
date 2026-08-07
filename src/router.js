import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import MaterialView from './views/MaterialView.vue'
import QuizView from './views/QuizView.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/materials/:standardId', name: 'material', component: MaterialView, props: true },
  { path: '/quiz/:standardId', name: 'quiz', component: QuizView, props: true },
]

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})
