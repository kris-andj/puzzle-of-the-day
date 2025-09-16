import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import ProfilePage from '../views/ProfilePage.vue'
import LeaderboardPage from '../views/AeaderboardPage.vue'
import AdminPanel from '../views/AdminPanel.vue'
import ArchivePage from '../views/ArchivePage.vue'
import PuzzlePage from '../views/PuzzlePage.vue'

const routes = [
  { path: '/', name: 'HomePage', component: HomePage },
  { path: '/login', name: 'LoginPage', component: LoginPage },
  { path: '/register', name: 'RegisterPage', component: RegisterPage },
  { path: '/profile', name: 'ProfilePage', component: ProfilePage, meta: { requiresAuth: true } },
  { path: '/leaderboard', name: 'LeaderboardPage', component: LeaderboardPage },
  { path: '/admin', name: 'AdminPanel', component: AdminPanel, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/archive', name: 'ArchivePage', component: ArchivePage },
  { path: '/puzzle/:id', name: 'PuzzlePage', component: PuzzlePage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.meta.requiresAdmin && user.role !== 'admin') {
    next('/')
  } else if (to.path === '/profile' && user.role === 'admin') {
    next('/admin')
  } else {
    next()
  }
})

export default router
