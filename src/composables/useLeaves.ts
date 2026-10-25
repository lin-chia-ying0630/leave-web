import { ref } from 'vue'
import {
  createLeave as createLeaveApi,
  deleteLeave as deleteLeaveApi,
  getLeaves,
  updateLeaveStatus as updateLeaveStatusApi,
} from '@/api/leaveApi'
import type { CreateLeaveRequest, LeaveRequest, LeaveStatus } from '../types/leave'

export function useLeaves() {
  const leaves = ref<LeaveRequest[]>([])
  const loading = ref<boolean>(true)
  const errorMessage = ref<string | null>(null)

  async function fetchLeaves(status?: LeaveStatus) {
    loading.value = true
    errorMessage.value = null

    try {
      leaves.value = await getLeaves(status)
    } catch (error) {
      leaves.value = []
      errorMessage.value = error instanceof Error ? error.message : '無法取得請假資料'
    } finally {
      loading.value = false
    }
  }

  async function createLeave(request: CreateLeaveRequest, status?: LeaveStatus) {
    await mutateAndRefresh(() => createLeaveApi(request), status)
  }

  async function updateLeaveStatus(id: number, nextStatus: LeaveStatus, status?: LeaveStatus) {
    await mutateAndRefresh(() => updateLeaveStatusApi(id, { status: nextStatus }), status)
  }

  async function deleteLeave(id: number, status?: LeaveStatus) {
    await mutateAndRefresh(() => deleteLeaveApi(id), status)
  }

  async function mutateAndRefresh(action: () => Promise<unknown>, status?: LeaveStatus) {
    loading.value = true
    errorMessage.value = null

    try {
      await action()
      leaves.value = await getLeaves(status)
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '請假資料操作失敗'
    } finally {
      loading.value = false
    }
  }

  return { leaves, loading, errorMessage, fetchLeaves, createLeave, updateLeaveStatus, deleteLeave }
}
