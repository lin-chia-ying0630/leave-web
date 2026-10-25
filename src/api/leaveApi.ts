import http from '@/services/http'
import type {
  ApiResponse,
  CreateLeaveRequest,
  LeaveRequest,
  LeaveStatus,
  UpdateLeaveStatusRequest,
} from '@/types/leave'

/**
 * leaveApi.ts 的 getLeaves 改成接受篩選參數
 * @param status 篩選請假狀態，若為 undefined 則不篩選
 * @returns Promise<LeaveRequest[]>，回傳請假單陣列
 */

export async function getLeaves(status?: LeaveStatus): Promise<LeaveRequest[]> {
  const response = await http.get<ApiResponse<LeaveRequest[]>>('/leaves', {
    params: status ? { status } : undefined,
  })

  const result = response.data

  if (result.code !== null) {
    throw new Error(result.message ?? result.code)
  }

  return result.data
}

export async function createLeave(request: CreateLeaveRequest): Promise<LeaveRequest> {
  const response = await http.post<ApiResponse<LeaveRequest>>('/leaves', request)
  return unwrap(response.data)
}

export async function updateLeaveStatus(
  id: number,
  request: UpdateLeaveStatusRequest,
): Promise<LeaveRequest> {
  const response = await http.put<ApiResponse<LeaveRequest>>(`/leaves/${id}/status`, request)
  return unwrap(response.data)
}

export async function deleteLeave(id: number): Promise<void> {
  const response = await http.delete<ApiResponse<null>>(`/leaves/${id}`)
  unwrap(response.data)
}

function unwrap<T>(result: ApiResponse<T>): T {
  if (result.code !== null) {
    throw new Error(result.message ?? result.code)
  }

  return result.data
}
