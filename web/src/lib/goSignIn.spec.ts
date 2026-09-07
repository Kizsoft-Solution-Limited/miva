import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { goSignIn, safeLoginNext } from '@/lib/goSignIn'
import { useRoleStore } from '@/stores/role'

vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  fetchMe: vi.fn(),
  logout: vi.fn(async () => undefined),
}))

describe('safeLoginNext', () => {
  it('allows founder and investor paths only', () => {
    expect(safeLoginNext('/founder')).toBe('/founder')
    expect(safeLoginNext('/investor/abc')).toBe('/investor/abc')
    expect(safeLoginNext('https://evil.test')).toBeNull()
    expect(safeLoginNext('//evil.test')).toBeNull()
    expect(safeLoginNext('/login')).toBeNull()
  })
})

describe('goSignIn', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('signs out then opens login with next', async () => {
    const store = useRoleStore()
    store.role = 'founder'
    store.email = 'f@example.com'
    store.hydrated = true
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div />' } },
        { path: '/login', component: { template: '<div />' } },
        { path: '/investor/:id', component: { template: '<div />' } },
      ],
    })
    await router.push('/')
    await router.isReady()
    const signOut = vi.spyOn(store, 'signOut')
    await goSignIn(router, 'Switch', '/investor/abc')
    expect(signOut).toHaveBeenCalled()
    expect(router.currentRoute.value.fullPath).toBe('/login?next=%2Finvestor%2Fabc')
  })
})
