import { http } from './http'

export type DemoRole = 'founder' | 'investor'

export interface AuthSessionResponse {
  role: DemoRole
  token: string
  expiresAt: string
}

/** Demo passwords — same defaults as API .env.example */
export const DEMO_PASSWORDS: Record<DemoRole, string> = {
  founder: 'founder',
  investor: 'investor',
}

export async function login(
  role: DemoRole,
  password = DEMO_PASSWORDS[role],
): Promise<AuthSessionResponse> {
  const { data } = await http.post<AuthSessionResponse>('/auth/login', {
    role,
    password,
  })
  return data
}

export async function fetchMe(): Promise<{ role: DemoRole; expiresAt: string }> {
  const { data } = await http.get<{ role: DemoRole; expiresAt: string }>('/auth/me')
  return data
}
