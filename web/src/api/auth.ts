import { http } from './http'

export type AuthRole = 'founder' | 'investor'

export interface AuthSessionResponse {
  userId: string
  email: string
  role: AuthRole
  expiresAt: string
  hasOrbioKey?: boolean
  walletAddress?: string | null
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

export async function fetchMe(): Promise<AuthSessionResponse> {
  const { data } = await http.get<AuthSessionResponse>('/auth/me')
  return data
}

export async function setOrbioKey(apiKey: string): Promise<{ hasOrbioKey: boolean }> {
  const { data } = await http.put<{ hasOrbioKey: boolean }>('/auth/orbio-key', {
    apiKey,
  })
  return data
}

export async function clearOrbioKey(): Promise<{ hasOrbioKey: boolean }> {
  const { data } = await http.delete<{ hasOrbioKey: boolean }>('/auth/orbio-key')
  return data
}

export async function setWallet(
  address: string,
): Promise<{ walletAddress: string }> {
  const { data } = await http.put<{ walletAddress: string }>('/auth/wallet', {
    address,
  })
  return data
}

export async function clearWallet(): Promise<{ walletAddress: null }> {
  const { data } = await http.delete<{ walletAddress: null }>('/auth/wallet')
  return data
}
