import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createLeave, deleteLeave, getLeaves, updateLeaveStatus } from '@/api/leaveApi'
import type { LeaveRequest } from '@/types/leave'
import LeaveListView from '@/views/LeaveListView.vue'

vi.mock('@/api/leaveApi', () => ({
  getLeaves: vi.fn<typeof getLeaves>(),
  createLeave: vi.fn<typeof createLeave>(),
  updateLeaveStatus: vi.fn<typeof updateLeaveStatus>(),
  deleteLeave: vi.fn<typeof deleteLeave>(),
}))

const pendingLeave: LeaveRequest = {
  id: 1,
  applicant: '王小明',
  leaveType: '特休',
  startDate: '2026-10-01',
  endDate: '2026-10-02',
  reason: '家庭旅遊',
  status: 'PENDING',
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getLeaves).mockResolvedValue([pendingLeave])
  vi.mocked(createLeave).mockResolvedValue(pendingLeave)
  vi.mocked(updateLeaveStatus).mockResolvedValue({ ...pendingLeave, status: 'APPROVED' })
  vi.mocked(deleteLeave).mockResolvedValue()
})

describe('LeaveListView', () => {
  it('透過 leaveApi 載入資料並顯示中文狀態', async () => {
    const wrapper = mount(LeaveListView)
    await flushPromises()

    expect(getLeaves).toHaveBeenCalledWith(undefined)
    expect(wrapper.text()).toContain('王小明')
    expect(wrapper.text()).toContain('待審')
  })

  it('篩選後重新整理仍保留相同查詢條件', async () => {
    const wrapper = mount(LeaveListView)
    await flushPromises()

    await wrapper.get('#status-filter').setValue('APPROVED')
    await flushPromises()
    expect(getLeaves).toHaveBeenLastCalledWith('APPROVED')

    vi.mocked(getLeaves).mockClear()
    await wrapper.get('.page-heading button').trigger('click')
    await flushPromises()
    expect(getLeaves).toHaveBeenCalledWith('APPROVED')
  })

  it('新增、更新狀態與刪除後都重新載入清單', async () => {
    const wrapper = mount(LeaveListView)
    await flushPromises()

    const inputs = wrapper.findAll('.leave-form input')
    await inputs[0]!.setValue('測試人員')
    await inputs[1]!.setValue('特休')
    await inputs[2]!.setValue('2026-10-10')
    await inputs[3]!.setValue('2026-10-11')
    await inputs[4]!.setValue('整合測試')
    await wrapper.get('.leave-form').trigger('submit')
    await flushPromises()

    expect(createLeave).toHaveBeenCalledWith({
      applicant: '測試人員',
      leaveType: '特休',
      startDate: '2026-10-10',
      endDate: '2026-10-11',
      reason: '整合測試',
    })

    await wrapper.get('.status-select').setValue('APPROVED')
    await flushPromises()
    expect(updateLeaveStatus).toHaveBeenCalledWith(1, { status: 'APPROVED' })

    await wrapper.get('.danger-button').trigger('click')
    await flushPromises()
    expect(deleteLeave).toHaveBeenCalledWith(1)
    expect(getLeaves).toHaveBeenCalledTimes(4)
  })
})
