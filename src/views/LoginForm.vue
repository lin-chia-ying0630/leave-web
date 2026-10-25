<script setup lang="ts">
/**
 * LoginForm.vue → authApi.ts → http.ts
 * 用 v-model 綁定帳號
 * 用 v-model 綁定密碼
 * 使用 <form @submit.prevent="...">
 * 呼叫 authApi.ts 的登入函式
 * 顯示 loading 與錯誤訊息
 * 登入成功後導向請假列表
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { login as loginApi } from '@/api/authApi'
import type { LoginRequest } from '@/types/auth'

const router = useRouter()

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function login() {
  loading.value = true
  errorMessage.value = ''

  const requestData: LoginRequest = {
    username: username.value,
    password: password.value,
  }

  try {
    await loginApi(requestData)
    await router.push({ name: 'leave-list' })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '登入失敗，請稍後再試'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <div class="login-panel">
      <h1>請假系統</h1>
      <form class="login-form" @submit.prevent="login">
        <input
          class="form-control"
          id="username"
          type="text"
          v-model="username"
          placeholder="帳號"
          :disabled="loading"
          required
        />
        <input
          class="form-control"
          id="password"
          type="password"
          v-model="password"
          placeholder="密碼"
          :disabled="loading"
          required
        />

        <button class="primary-button" type="submit" :disabled="loading">
          {{ loading ? '登入中…' : '登入' }}
        </button>
      </form>

      <p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>
    </div>
  </main>
</template>
