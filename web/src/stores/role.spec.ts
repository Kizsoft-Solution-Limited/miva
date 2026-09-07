import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useRoleStore } from '@/stores/role'

vi.mock('@/api/auth', () => ({
  login: vi.fn(async (role: 'founder' | 'investor') => ({
    role,
    token: `tok-${role}`,
    expiresAt: new Date().toISOString(),
  })),
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

  it('signs in as investor via login', async () => {
    const store = useRoleStore()
    await store.setRole('investor')
    expect(store.isInvestor).toBe(true)
    expect(store.isFounder).toBe(false)
    expect(store.isSignedIn).toBe(true)
    expect(localStorage.getItem('miva.authToken')).toBe('tok-investor')
  })

  it('ignores stale role without token', () => {
    localStorage.setItem('miva.demoRole', 'founder')
    setActivePinia(createPinia())
    const store = useRoleStore()
    expect(store.isFounder).toBe(false)
    expect(localStorage.getItem('miva.demoRole')).toBeNull()
  })
})
