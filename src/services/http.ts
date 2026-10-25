import axios, { type AxiosError } from 'axios'

interface ApiErrorResponse {
  message?: string
}

const http = axios.create({
  baseURL: '/api',
  timeout: 10_000,
  withCredentials: true,   // 沒有這行，瀏覽器不會存也不會帶 Cookie
})

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const message =
      error.response?.data?.message ??
      (error.code === 'ECONNABORTED' ? '請求逾時' : '無法連線到伺服器')

    return Promise.reject(new Error(message))
  },
)

export default http
