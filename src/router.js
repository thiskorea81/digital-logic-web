import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import MaterialView from './views/MaterialView.vue'
import QuizHome from './views/QuizHome.vue'
import QuestionList from './views/QuestionList.vue'
import QuestionSolve from './views/QuestionSolve.vue'
import WrongNotes from './views/WrongNotes.vue'
import PrintView from './views/PrintView.vue'
import SettingsView from './views/SettingsView.vue'
import DashboardView from './views/DashboardView.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/materials/:standardId', name: 'material', component: MaterialView, props: true },
  { path: '/quiz', name: 'quiz-home', component: QuizHome },
  { path: '/quiz/:unitNo', name: 'quiz', component: QuestionList, props: true },
  { path: '/quiz/:unitNo/q/:qid', name: 'question', component: QuestionSolve, props: true },
  { path: '/wrong', name: 'wrong', component: WrongNotes },
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
