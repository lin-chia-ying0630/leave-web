<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import LeaveTable from '@/components/LeaveTable.vue'
import { useLeaves } from '@/composables/useLeaves'
import {
  leaveStatuses,
  statusLabels,
  type CreateLeaveRequest,
  type LeaveStatus,
} from '@/types/leave'

import { useRouter } from 'vue-router'
import { logout } from '@/api/authApi'

const router = useRouter()
const { leaves, loading, errorMessage, fetchLeaves, createLeave, updateLeaveStatus, deleteLeave } =
  useLeaves()

const selectedStatus = ref<LeaveStatus | ''>('')
const newLeave = reactive<CreateLeaveRequest>({
  applicant: '',
  leaveType: '',
  startDate: '',
  endDate: '',
  reason: '',
})

function onFilterChange() {
  fetchLeaves(selectedStatus.value || undefined)
}
async function handleLogout() {
  await logout()
  await router.push({ name: 'login' })
}

async function onCreate() {
  await createLeave({ ...newLeave }, selectedStatus.value || undefined)

  if (!errorMessage.value) {
    Object.assign(newLeave, {
      applicant: '',
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
    })
  }
}

function onUpdateStatus(id: number, status: LeaveStatus) {
  updateLeaveStatus(id, status, selectedStatus.value || undefined)
}

function onDelete(id: number) {
  deleteLeave(id, selectedStatus.value || undefined)
}

onMounted(() => {
  fetchLeaves()
})
</script>

<template>
  <main class="leave-page">
    <div class="page-heading">
      <h1>請假系統</h1>
      <label for="status-filter">狀態</label>
      <select id="status-filter" v-model="selectedStatus" @change="onFilterChange">
        <option value="">全部狀態</option>
        <option v-for="status in leaveStatuses" :key="status" :value="status">
          {{ statusLabels[status] }}
        </option>
      </select>
      <button class="primary-button" type="button" :disabled="loading" @click="onFilterChange">
        {{ loading ? '載入中…' : '重新整理' }}
      </button>
      <button type="button" @click="handleLogout">登出</button>

    </div>

    <section class="leave-form-section" aria-labelledby="create-leave-title">
      <h2 id="create-leave-title">新增請假單</h2>
      <form class="leave-form" @submit.prevent="onCreate">
        <label>
          申請人
          <input v-model="newLeave.applicant" class="form-control" required />
        </label>
        <label>
          假別
          <input v-model="newLeave.leaveType" class="form-control" required />
        </label>
        <label>
          開始日
          <input v-model="newLeave.startDate" class="form-control" type="date" required />
        </label>
        <label>
          結束日
          <input v-model="newLeave.endDate" class="form-control" type="date" required />
        </label>
        <label class="leave-form-reason">
          原因
          <input v-model="newLeave.reason" class="form-control" required />
        </label>
        <button class="primary-button" type="submit" :disabled="loading">
          {{ loading ? '處理中…' : '新增' }}
        </button>
      </form>
    </section>

    <p v-if="loading">正在取得請假資料…</p>
    <p v-else-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>
    <p v-else-if="leaves.length === 0">目前沒有請假資料。</p>
    <LeaveTable
      v-else
      :leaves="leaves"
      :disabled="loading"
      @update-status="onUpdateStatus"
      @delete="onDelete"
    />
  </main>
</template>
