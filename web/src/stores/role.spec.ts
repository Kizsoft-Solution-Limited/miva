import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useRoleStore } from '@/stores/role'

vi.mock('@/api/auth', () => ({
  login: vi.fn(async () => ({
    userId: 'u1',
    email: 'inv@example.com',
    role: 'investor' as const,
    expiresAt: new Date().toISOString(),
  })),
  register: vi.fn(async () => ({
    userId: 'u2',
    email: 'f@example.com',
    role: 'founder' as const,
    expiresAt: new Date().toISOString(),
  })),
  logout: vi.fn(async () => undefined),
  fetchMe: vi.fn(),
}))

describe('useRoleStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('defaults signed out', () => {
    const store = useRoleStore()
    expect(store.role).toBeNull()
    expect(store.isSignedIn).toBe(false)
    expect(store.isFounder).toBe(false)
  })

  it('signs in with email and password', async () => {
    const store = useRoleStore()
    await store.signIn({ email: 'inv@example.com', password: 'password1' })
    expect(store.isInvestor).toBe(true)
    expect(store.email).toBe('inv@example.com')
  })

  it('registers a founder account', async () => {
    const store = useRoleStore()
    await store.signUp({
      email: 'f@example.com',
      password: 'password1',
      role: 'founder',
    })
    expect(store.isFounder).toBe(true)
  })
})
