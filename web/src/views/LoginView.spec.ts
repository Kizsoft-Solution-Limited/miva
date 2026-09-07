import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import LoginView from '@/views/LoginView.vue'

vi.mock('@/api/auth', () => ({
  login: vi.fn(async (role: 'founder' | 'investor') => ({
    role,
    token: `tok-${role}`,
    expiresAt: new Date().toISOString(),
  })),
  fetchMe: vi.fn(),
}))

describe('LoginView', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('offers Founder and Investor sign-in with AppBack', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/login', component: LoginView },
        { path: '/founder', component: { template: '<div />' } },
        { path: '/investor', component: { template: '<div />' } },
        { path: '/', component: { template: '<div />' } },
      ],
    })
    await router.push('/login')
    await router.isReady()
    const wrapper = mount(LoginView, { global: { plugins: [router, pinia] } })
    expect(wrapper.text()).toContain('Sign in')
    expect(wrapper.text()).toContain('Founder')
    expect(wrapper.text()).toContain('Investor')
    expect(wrapper.find('.app-back').exists()).toBe(true)
    expect(wrapper.text()).toContain('Home')
  })
})
