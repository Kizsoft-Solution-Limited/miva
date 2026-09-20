import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useRoleStore } from '@/stores/role'

vi.mock('@/api/auth', () => ({
  login: vi.fn(async () => ({
    userId: 'u1',
    email: 'inv@example.com',
    role: 'investor' as const,
    expiresAt: new Date().toISOString(),
    hasOrbioKey: false,
    walletAddress: null,
  })),
  register: vi.fn(async () => ({
    userId: 'u2',
    email: 'f@example.com',
    role: 'founder' as const,
    expiresAt: new Date().toISOString(),
    hasOrbioKey: false,
    walletAddress: null,
  })),
  logout: vi.fn(async () => undefined),
  fetchMe: vi.fn(),
  setOrbioKey: vi.fn(async () => ({ hasOrbioKey: true })),
  clearOrbioKey: vi.fn(async () => ({ hasOrbioKey: false })),
  setWallet: vi.fn(async () => ({
    walletAddress: '0xAa07A0e9209e16aC99708C3EC70159c6eF3128A3',
  })),
  clearWallet: vi.fn(async () => ({ walletAddress: null })),
  fetchOrbioBalance: vi.fn(async () => ({
    available: '12.34',
    used: '1.00',
    currency: 'USD',
  })),
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

  it('saves and clears an Orbio key', async () => {
    const store = useRoleStore()
    store.role = 'founder'
    store.email = 'f@example.com'
    await store.saveOrbioKey('sk-orbio-abcdef123456')
    expect(store.hasOrbioKey).toBe(true)
    await store.removeOrbioKey()
    expect(store.hasOrbioKey).toBe(false)
  })

  it('saves and clears a payout wallet', async () => {
    const store = useRoleStore()
    store.role = 'founder'
    store.email = 'f@example.com'
    await store.saveWallet('0xAa07A0e9209e16aC99708C3EC70159c6eF3128A3')
    expect(store.walletAddress).toBe(
      '0xAa07A0e9209e16aC99708C3EC70159c6eF3128A3',
    )
    await store.removeWallet()
    expect(store.walletAddress).toBeNull()
  })
})
