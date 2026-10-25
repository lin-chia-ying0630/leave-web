<script setup lang="ts">
import { leaveStatuses, statusLabels, type LeaveRequest, type LeaveStatus } from '@/types/leave'

defineProps<{
  leaves: LeaveRequest[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  updateStatus: [id: number, status: LeaveStatus]
  delete: [id: number]
}>()

function onStatusChange(id: number, event: Event) {
  emit('updateStatus', id, (event.target as HTMLSelectElement).value as LeaveStatus)
}
</script>

<template>
  <div class="table-wrapper">
    <table class="leave-table">
      <thead>
        <tr>
          <th>申請人</th>
          <th>假別</th>
          <th>開始日</th>
          <th>結束日</th>
          <th>原因</th>
          <th>狀態</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="leave in leaves" :key="leave.id">
          <td>{{ leave.applicant }}</td>
          <td>{{ leave.leaveType }}</td>
          <td>{{ leave.startDate }}</td>
          <td>{{ leave.endDate }}</td>
          <td>{{ leave.reason }}</td>
          <td>
            <select
              class="status-select"
              :value="leave.status"
              :disabled="disabled"
              :aria-label="`更新 ${leave.applicant} 的狀態`"
              @change="onStatusChange(leave.id, $event)"
            >
              <option v-for="status in leaveStatuses" :key="status" :value="status">
                {{ statusLabels[status] }}
              </option>
            </select>
          </td>
          <td>
            <button
              class="danger-button"
              type="button"
              :disabled="disabled"
              @click="emit('delete', leave.id)"
            >
              刪除
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
