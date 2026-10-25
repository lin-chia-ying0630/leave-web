export const leaveStatuses = ['PENDING', 'APPROVED', 'REJECTED'] as const

export type LeaveStatus = (typeof leaveStatuses)[number]

export interface LeaveRequest {
  id: number
  applicant: string
  leaveType: string
  startDate: string
  endDate: string
  reason: string
  status: LeaveStatus
}

export interface CreateLeaveRequest {
  applicant: string
  leaveType: string
  startDate: string
  endDate: string
  reason: string
}

export interface UpdateLeaveStatusRequest {
  status: LeaveStatus
}

export interface ApiResponse<T> {
  data: T
  code: string | null
  message: string | null
}
export const statusLabels: Record<LeaveStatus, string> = {
  PENDING: '待審',
  APPROVED: '核准',
  REJECTED: '駁回',
}
