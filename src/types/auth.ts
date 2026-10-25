//public record LoginRequest(String username, String password)
//LoginRequest：username、password
export interface LoginRequest {
  username: string
  password: string
}
//LoginResponse：success、message
export interface LoginResponse {
  success: boolean
  message: string | null
}
//MeResponse:username
export interface MeResponse {
  username: string
}
//ApiResponse<T>：data、code、message
export interface ApiResponse<T> {
  data: T
  code: string | null
  message: string | null
}
