import { createRouter, createWebHistory } from 'vue-router'
import LeaveListView from '@/views/LeaveListView.vue'
import LoginForm from '@/views/LoginForm.vue'
import { getMe } from '@/api/authApi'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/leave',
      name: 'leave-list',
      component: LeaveListView,
      meta: { requiresAuth: true }, // ← 加這行
    },
    {
      path: '/',
      name: 'login',
      component: LoginForm,
    },
  ],
})
router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true

  try {
    await getMe() // 沒丟錯 = 已登入
    return true
  } catch {
    return { name: 'login' }
  }
})

export default router
