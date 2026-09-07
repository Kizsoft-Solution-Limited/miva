import { http } from './http'

export type AuthRole = 'founder' | 'investor'

export interface AuthSessionResponse {
  userId: string
  email: string
  role: AuthRole
  expiresAt: string
}

export async function register(input: {
  email: string
  password: string
  role: AuthRole
}): Promise<AuthSessionResponse> {
  const { data } = await http.post<AuthSessionResponse>('/auth/register', input)
  return data
}

export async function login(input: {
  email: string
  password: string
}): Promise<AuthSessionResponse> {
  const { data } = await http.post<AuthSessionResponse>('/auth/login', input)
  return data
}

export async function logout(): Promise<void> {
  await http.post('/auth/logout')
}

export async function fetchMe(): Promise<{
  userId: string
  email: string
  role: AuthRole
  expiresAt: string
}> {
  const { data } = await http.get('/auth/me')
  return data
}
