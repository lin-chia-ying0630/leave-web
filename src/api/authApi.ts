
/**
 * - 定義登入、登出、取得目前使用者的 API 呼叫
 * - 不放畫面狀態或 Router 邏輯
 */

import http from '@/services/http'
import type { ApiResponse, LoginRequest, LoginResponse,MeResponse } from '@/types/auth'
import axios from 'axios'

/** 統一拆開 ApiResponse：code 有值就丟錯，否則回傳 data */
function unwrap<T>(result: ApiResponse<T>): T {
  if (result.code != null) {
    throw new Error(result.message ?? result.code)
  }
  return result.data
}

/** axios 遇到 401 等錯誤會直接 throw，這裡把後端的 message 撈出來 */
function toError(error: unknown, fallback: string): Error {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as ApiResponse<unknown> | undefined)?.message
    return new Error(message ?? fallback)
  }
  return error instanceof Error ? error : new Error(fallback)
}

/**
 * 登入
 * @param request 帳號與密碼
 * @returns Promise<LoginResponse>
 */
export async function login(request: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await http.post<ApiResponse<LoginResponse>>('/auth/login', request)
    return unwrap(response.data)
  } catch (error) {
    throw toError(error, '登入失敗，請稍後再試')
  }
}

/** 登出：後端會清掉 Cookie */
export async function logout(): Promise<void> {
  try {
    await http.post<ApiResponse<null>>('/auth/logout')
  } catch (error) {
    throw toError(error, '登出失敗，請稍後再試')
  }
}

/** 取得目前登入者；沒有登入時後端回 401，這裡會 throw */
export async function getMe(): Promise<MeResponse> {
  try {
    const response = await http.get<ApiResponse<MeResponse>>('/auth/me')
    return unwrap(response.data)
  } catch (error) {
    throw toError(error, '尚未登入')
  }
}
